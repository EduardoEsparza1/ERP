import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const clienteController = new ClienteController();

router.get('/', authMiddleware, (req, res) => clienteController.obtenerClientes(req, res));
router.get('/:id', authMiddleware, (req, res) => clienteController.obtenerCliente(req, res));
router.post('/', authMiddleware, (req, res) => clienteController.crearCliente(req, res));
router.put('/:id', authMiddleware, (req, res) => clienteController.actualizarCliente(req, res));
router.delete('/:id', authMiddleware, (req, res) => clienteController.eliminarCliente(req, res));
router.patch('/:id/desactivar', authMiddleware, (req, res) => clienteController.desactivarCliente(req, res));

export default router;





