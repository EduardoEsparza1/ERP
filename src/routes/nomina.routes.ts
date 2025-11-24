import { Router } from 'express';
import { NominaController } from '../controllers/nomina.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const nominaController = new NominaController();

router.get('/', authMiddleware, (req, res) => nominaController.obtenerNominas(req, res));
router.get('/:id', authMiddleware, (req, res) => nominaController.obtenerNomina(req, res));
router.post('/', authMiddleware, (req, res) => nominaController.crearNomina(req, res));
router.put('/:id', authMiddleware, (req, res) => nominaController.actualizarNomina(req, res));
router.delete('/:id', authMiddleware, (req, res) => nominaController.eliminarNomina(req, res));

export default router;





