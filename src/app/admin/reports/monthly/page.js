// ... arriba igual ...
export default async function MonthlyReport({ searchParams }) {
  const params = await searchParams;
  const now = new Date();
  // CAMBIO: Si no hay mes elegido, mostramos Abril (mes 3) por defecto
  const month = params.month ? parseInt(params.month) : 3; 
  const year = params.year ? parseInt(params.year) : 2026;
// ... resto igual ...
