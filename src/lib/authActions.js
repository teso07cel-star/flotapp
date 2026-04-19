"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Operación Pureza v5.0.0: Módulo de Autenticación Ligero
 * Este archivo no tiene dependencias con Prisma para evitar crashes en el Layout.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("flotapp_admin_auth");
  redirect("/");
}
