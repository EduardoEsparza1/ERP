import { Router } from 'express';
import { FinanzasController } from '../controllers/finanzas.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const finanzasController = new FinanzasController();

router.get('/', authMiddleware, (req, res) => finanzasController.obtenerFinanzas(req, res));
router.get('/resumen', authMiddleware, (req, res) => finanzasController.obtenerResumen(req, res));
router.get('/:id', authMiddleware, (req, res) => finanzasController.obtenerFinanza(req, res));
router.post('/', authMiddleware, (req, res) => finanzasController.crearFinanza(req, res));
router.put('/:id', authMiddleware, (req, res) => finanzasController.actualizarFinanza(req, res));
router.delete('/:id', authMiddleware, (req, res) => finanzasController.eliminarFinanza(req, res));

export default router;





