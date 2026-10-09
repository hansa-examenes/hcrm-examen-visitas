// Datos de prueba. No modificar: los scripts de evaluación dependen de estos vendedores.
// Se ejecuta solo cuando el volumen de Mongo está vacío (primera vez o después de `npm run db:reset`).
const db = db.getSiblingDB('examen_visitas');

db.vendedores.createIndex({ codigo: 1 }, { unique: true });
db.vendedores.insertMany([
  { codigo: 'V001', nombre: 'Ana Rojas', zona: 'Norte', activo: true },
  { codigo: 'V002', nombre: 'Carlos Mendoza', zona: 'Sur', activo: true },
  { codigo: 'V003', nombre: 'Lucía Vargas', zona: 'Centro', activo: true },
  { codigo: 'V009', nombre: 'Pedro Inactivo', zona: 'Norte', activo: false },
]);
