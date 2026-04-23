"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registrado con éxito:", registration.scope);
          })
          .catch((error) => {
            console.error("Fallo al registrar SW:", error);
          });
      } else {
        // En entorno de desarrollo, desregistramos el SW para evitar que rompa el recargado
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
  }, []);

  return null;
}
