import { Router } from 'express';
import { CatalogoSATController } from '../controllers/catalogoSAT.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const catalogoController = new CatalogoSATController();

router.get('/', authMiddleware, (req, res) => catalogoController.obtenerCatalogo(req, res));
router.get('/buscar', authMiddleware, (req, res) => catalogoController.buscarPorDescripcion(req, res));

export default router;





