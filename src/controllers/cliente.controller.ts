import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClienteService } from '../services/cliente.service';

const clienteService = new ClienteService();

export class ClienteController {
  async crearCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre, rfc, razonSocial, direccion, telefono, email } = req.body;

      if (!nombre || !rfc || !razonSocial) {
        res.status(400).json({ message: 'Campos requeridos: nombre, rfc, razonSocial' });
        return;
      }

      const cliente = await clienteService.crearCliente(
        nombre,
        rfc,
        razonSocial,
        direccion,
        telefono,
        email
      );

      res.status(201).json({ message: 'Cliente creado exitosamente', cliente });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear cliente',
      });
    }
  }

  async obtenerClientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activos = req.query.activos === 'true' ? true : req.query.activos === 'false' ? false : undefined;
      const clientes = await clienteService.obtenerClientes(activos);
      res.json({ clientes });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener clientes',
      });
    }
  }

  async obtenerCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const cliente = await clienteService.obtenerClientePorId(id);

      if (!cliente) {
        res.status(404).json({ message: 'Cliente no encontrado' });
        return;
      }

      res.json({ cliente });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener cliente',
      });
    }
  }

  async actualizarCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const datos = req.body;

      const cliente = await clienteService.actualizarCliente(id, datos);
      res.json({ message: 'Cliente actualizado exitosamente', cliente });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar cliente',
      });
    }
  }

  async eliminarCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await clienteService.eliminarCliente(id);
      res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar cliente',
      });
    }
  }

  async desactivarCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const cliente = await clienteService.desactivarCliente(id);
      res.json({ message: 'Cliente desactivado exitosamente', cliente });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al desactivar cliente',
      });
    }
  }
}





