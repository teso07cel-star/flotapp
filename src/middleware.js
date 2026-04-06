import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Proteger rutas /admin
  if (pathname.startsWith('/admin')) {
    // Excluir la página de login para evitar bucles infinitos
    if (pathname === '/admin/login') {
      const isAuth = request.cookies.get('flotapp_admin_auth')?.value === 'true';
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    const isAuth = request.cookies.get('flotapp_admin_auth')?.value === 'true';
    
    if (!isAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
