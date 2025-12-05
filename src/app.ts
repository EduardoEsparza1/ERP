import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import nominaRoutes from './routes/nomina.routes';
import finanzasRoutes from './routes/finanzas.routes';
import clienteRoutes from './routes/cliente.routes';
import facturaRoutes from './routes/factura.routes';
import catalogoSATRoutes from './routes/catalogoSAT.routes';
import catalogosRoutes from './routes/catalogos.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/nomina', nominaRoutes);
app.use('/api/finanzas', finanzasRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/catalogo-sat', catalogoSATRoutes);
app.use('/api/catalogos', catalogosRoutes);

// Ruta de prueba
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Servidor funcionando correctamente', status: 'OK' });
});

// Manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Servir index.html para todas las rutas no-API (SPA) - debe ir al final
app.get('*', (req: Request, res: Response) => {
  // Solo servir index.html si no es una ruta de API
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// Inicializar servidor
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

