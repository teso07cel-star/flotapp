"use server";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import { cookies } from "next/headers";
import prisma from "./prisma";

// El RPI (Relying Party ID) debe ser tu dominio en producción y 'localhost' en dev
const rpName = "Flotapp Drivers";
const rpID = process.env.NODE_ENV === "production" ? "flotapp-vf7e.vercel.app" : "localhost";
const origin = process.env.NODE_ENV === "production" ? `https://${rpID}` : `http://${rpID}:3000`;

/**
 * =====================================
 * REGISTRO (Vincular Huella a Chofer)
 * =====================================
 */
export async function getRegistrationOptions(choferId) {
  try {
    const chofer = await prisma.chofer.findUnique({ where: { id: parseInt(choferId) } });
    if (!chofer) return { success: false, error: "Chofer no encontrado" };

    const userID = chofer.id.toString(); // Usado como ID de usuario interno
    const userName = chofer.nombre;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(userID),
      userName,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "required", // Requerido para passkeys (Discoverable Credentials)
        userVerification: "preferred",
      },
    });

    // Guardar el challenge en una cookie segura y temporal (5 minutos)
    const cookieStore = await cookies();
    cookieStore.set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
    });
    cookieStore.set("webauthn_chofer", userID, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
    });

    return { success: true, options };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function verifyRegistration(response) {
  try {
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("webauthn_challenge")?.value;
    const choferIdStr = cookieStore.get("webauthn_chofer")?.value;

    if (!expectedChallenge || !choferIdStr) {
      return { success: false, error: "Se agotó el tiempo o falta desafío." };
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID } = registrationInfo;
      
      // Guardar la credencial en la base de datos para ese chofer
      await prisma.chofer.update({
        where: { id: parseInt(choferIdStr) },
        data: {
          // credentialID es Uint8Array, lo transformamos a base64 o hex para string
          passkeyId: Buffer.from(credentialID).toString('base64'),
          passkeyPubKey: Buffer.from(credentialPublicKey)
        }
      });

      // Limpiar cookies de registro
      cookieStore.delete("webauthn_challenge");
      cookieStore.delete("webauthn_chofer");

      // Iniciar sesión automáticamente (set cookie de autenticación de chofer)
      cookieStore.set("flotapp_driver_session", choferIdStr, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 año recordado
      });

      return { success: true };
    }

    return { success: false, error: "Verificación criptográfica fallida" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * =====================================
 * LOGIN (Usar Huella Existente)
 * =====================================
 */
export async function getAuthenticationOptions() {
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
    });

    const cookieStore = await cookies();
    cookieStore.set("webauthn_auth_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300,
    });

    return { success: true, options };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function verifyAuthentication(response) {
  try {
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;

    if (!expectedChallenge) {
      return { success: false, error: "Challenge expirado o no encontrado" };
    }

    // Buscamos el chofer que tiene este passkeyId en la BDD
    const pIdBase64 = response.id; // Usually base64url encoded
    
    // Necesitamos buscar el chofer por passkeyId
    // La BDD guarda el passkeyId en base64 estandar, mientras que la API del browser puede devolver base64url.
    // Convertmos el ID del cliente a un buffer y de vuelta a base64 para emparejar.
    const clientCredentialBuffer = Buffer.from(pIdBase64, 'base64');
    const matchedPasskeyId = clientCredentialBuffer.toString('base64');

    const chofer = await prisma.chofer.findUnique({
      where: { passkeyId: matchedPasskeyId }
    });

    if (!chofer || !chofer.passkeyPubKey) {
      return { success: false, error: "Huella no registrada en el sistema" };
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: new Uint8Array(chofer.passkeyPubKey),
        credentialID: new Uint8Array(clientCredentialBuffer),
      },
    });

    if (verification.verified) {
      cookieStore.delete("webauthn_auth_challenge");
      
      // Auto Login
      cookieStore.set("flotapp_driver_session", chofer.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });

      return { success: true, choferId: chofer.id };
    }
    
    return { success: false, error: "Verificación de huella falló" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * =====================================
 * CERRAR SESIÓN CHOFER
 * =====================================
 */
export async function logoutDriver() {
  const cookieStore = await cookies();
  cookieStore.delete("flotapp_driver_session");
  return { success: true };
}
