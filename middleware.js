import { NextResponse } from 'next/server';

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const isAuth = request.cookies.get('flotapp_admin_auth')?.value === 'true';

  // 1. Proteger todas las rutas /admin
  if (pathname.startsWith('/admin')) {
    // Si ya está autenticado y trata de ir al login, redirigir al panel
    if (pathname === '/admin/login') {
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Si NO está autenticado, forzar login
    if (!isAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
