import { Router } from 'express';
import { FacturaController } from '../controllers/factura.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const facturaController = new FacturaController();

router.get('/', authMiddleware, (req, res) => facturaController.obtenerFacturas(req, res));
router.get('/cartera', authMiddleware, (req, res) => facturaController.obtenerCartera(req, res));
router.get('/kpis', authMiddleware, (req, res) => facturaController.obtenerKPIs(req, res));
router.get('/:id', authMiddleware, (req, res) => facturaController.obtenerFactura(req, res));
router.post('/', authMiddleware, (req, res) => facturaController.crearFactura(req, res));
router.post('/:id/timbrar', authMiddleware, (req, res) => facturaController.timbrarFactura(req, res));
router.post('/:id/pago', authMiddleware, (req, res) => facturaController.registrarPago(req, res));
router.put('/:id', authMiddleware, (req, res) => facturaController.actualizarFactura(req, res));
router.patch('/:id/cancelar', authMiddleware, (req, res) => facturaController.cancelarFactura(req, res));
router.delete('/:id', authMiddleware, (req, res) => facturaController.eliminarFactura(req, res));

export default router;





