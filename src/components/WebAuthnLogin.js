"use client";

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRegistrationOptions, verifyRegistration, getAuthenticationOptions, verifyAuthentication } from '@/lib/webauthn';

export default function WebAuthnLogin({ choferes }) {
  const [selectedChofer, setSelectedChofer] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setStatus("Analizando rostro / Face ID...");
    try {
      // 1. Get options from server
      const optRes = await getAuthenticationOptions();
      if (!optRes.success) throw new Error(optRes.error);

      // 2. Ask device for fingerprint
      const authResp = await startAuthentication(optRes.options);

      // 3. Verify with server
      setStatus("Verificando...");
      const verifyRes = await verifyAuthentication(authResp);
      if (verifyRes.success) {
        setStatus("¡Identidad Confirmada!");
        router.push("/driver/vehicle"); // Próximo paso
      } else {
        throw new Error(verifyRes.error);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "No pudimos validar tu rostro. Intenta de nuevo.");
      setStatus("");
    }
  };

  const handleRegister = async () => {
    if (!selectedChofer) {
       setError("Por favor, selecciona tu nombre de la lista.");
       return;
    }
    setError("");
    setStatus("Iniciando validación facial...");
    try {
      // 1. Get options from server
      const optRes = await getRegistrationOptions(selectedChofer);
      if (!optRes.success) throw new Error(optRes.error);

      // 2. Ask device to create passkey
      const regResp = await startRegistration(optRes.options);

      // 3. Verify with server
      setStatus("Guardando credencial...");
      const verifyRes = await verifyRegistration(regResp);
      if (verifyRes.success) {
        setStatus("¡Dispositivo vinculado con éxito!");
        router.push("/driver/vehicle"); // Próximo paso
      } else {
        throw new Error(verifyRes.error);
      }
    } catch (err) {
      console.error(err);
      setError("Cancelado o falló: " + (err.message || "Error desconocido"));
      setStatus("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* Botón Principal Login */}
      <button 
        onClick={handleLogin}
        className="w-full relative overflow-hidden group bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 border border-blue-400/20 active:scale-95 transition-all text-center"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner backdrop-blur-md border border-white/20">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Toca para Ingresar</h2>
        <p className="text-blue-200 text-sm font-medium mt-2">Usa Reconocimiento Facial</p>
      </button>

      {/* Mensajes de Status */}
      {status && (
        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 font-bold uppercase tracking-widest text-xs animate-pulse">
          {status}
        </div>
      )}
      {error && (
        <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-bold uppercase tracking-widest text-xs">
          {error}
        </div>
      )}

      {/* Registro de Dispositivo */}
      <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-[2rem] shadow-inner">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">¿Celular Nuevo?</h3>
        <select 
          className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white text-base mb-4 outline-none focus:border-blue-500 transition-colors"
          value={selectedChofer}
          onChange={(e) => setSelectedChofer(e.target.value)}
        >
          <option value="" disabled>1. Selecciona tu Nombre</option>
          {choferes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <button 
          onClick={handleRegister}
          disabled={!selectedChofer}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
        >
          2. Vincular este Celular
        </button>
      </div>

    </div>
  );
}
