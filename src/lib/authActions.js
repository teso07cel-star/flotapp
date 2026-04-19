"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Operación Alivio v5.1.0: Módulo de Autenticación Centralizado
 * Aislamiento total de base de datos para garantizar acceso instantáneo.
 */

export async function loginAdmin(formData) {
  const password = typeof formData === "string" ? formData : formData.get("password")?.toString();
  
  if (password === "admin123") {
    const cookieStore = await cookies();
    cookieStore.set("flotapp_admin_auth", "true", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Si viene de un formulario (JS desactivado), redirigir
    if (typeof formData !== "string") {
      redirect("/admin");
    }
    
    return { success: true };
  }
  return { success: false, error: "Contraseña incorrecta" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("flotapp_admin_auth");
  redirect("/");
}
