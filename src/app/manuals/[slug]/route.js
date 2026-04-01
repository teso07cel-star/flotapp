import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { slug } = await params;
  
  // Mapeo selectivo para seguridad
  const manuals = {
    'rutina': 'rutina.html',
    'induccion': 'induccion.html',
    'beneficios': 'beneficios.html',
    'guia': 'guia_maestra.html'
  };

  const fileName = manuals[slug];

  if (!fileName) {
    return new Response('Manual no encontrado', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'src/lib/manual_sources', fileName);

  try {
    const html = fs.readFileSync(filePath, 'utf8');
    return new Response(html, {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error) {
    console.error('Error sirviendo manual:', error);
    return new Response('Error interno al cargar manual', { status: 500 });
  }
}
