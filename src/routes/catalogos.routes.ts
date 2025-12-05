import { Router } from 'express';
import { CatalogosController } from '../controllers/catalogos.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const catalogosController = new CatalogosController();

// Rutas individuales para cada catálogo
router.get('/formas-pago', authMiddleware, (req, res) => catalogosController.obtenerFormasPago(req, res));
router.get('/metodos-pago', authMiddleware, (req, res) => catalogosController.obtenerMetodosPago(req, res));
router.get('/usos-cfdi', authMiddleware, (req, res) => catalogosController.obtenerUsosCFDI(req, res));
router.get('/monedas', authMiddleware, (req, res) => catalogosController.obtenerMonedas(req, res));
router.get('/regimenes-fiscales', authMiddleware, (req, res) => catalogosController.obtenerRegimenesFiscales(req, res));
router.get('/claves-unidad', authMiddleware, (req, res) => catalogosController.obtenerClavesUnidad(req, res));
router.get('/objetos-impuesto', authMiddleware, (req, res) => catalogosController.obtenerObjetosImpuesto(req, res));
router.get('/tipos-impuesto', authMiddleware, (req, res) => catalogosController.obtenerTiposImpuesto(req, res));
router.get('/tipos-factor', authMiddleware, (req, res) => catalogosController.obtenerTiposFactor(req, res));

// Ruta para obtener todos los catálogos en una sola llamada
router.get('/todos', authMiddleware, (req, res) => catalogosController.obtenerTodosCatalogos(req, res));

// Rutas para clientes y empresas
router.get('/clientes', authMiddleware, (req, res) => catalogosController.obtenerClientes(req, res));
router.get('/empresas', authMiddleware, (req, res) => catalogosController.obtenerEmpresas(req, res));

export default router;
