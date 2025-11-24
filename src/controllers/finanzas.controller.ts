import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FinanzasService } from '../services/finanzas.service';

const finanzasService = new FinanzasService();

export class FinanzasController {
  async crearFinanza(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { concepto, monto, tipo, categoria, fecha, descripcion } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      if (!concepto || !monto || !tipo || !categoria || !fecha) {
        res.status(400).json({
          message: 'Campos requeridos: concepto, monto, tipo, categoria, fecha',
        });
        return;
      }

      const finanza = await finanzasService.crearFinanza(
        concepto,
        parseFloat(monto),
        tipo,
        categoria,
        new Date(fecha),
        descripcion || '',
        userId
      );

      res.status(201).json({ message: 'Finanza creada exitosamente', finanza });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear finanza',
      });
    }
  }

  async obtenerFinanzas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const finanzas = await finanzasService.obtenerFinanzas();
      res.json({ finanzas });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener finanzas',
      });
    }
  }

  async obtenerResumen(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resumen = await finanzasService.obtenerResumen();
      res.json({ resumen });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener resumen',
      });
    }
  }

  async obtenerFinanza(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const finanza = await finanzasService.obtenerFinanzaPorId(id);

      if (!finanza) {
        res.status(404).json({ message: 'Finanza no encontrada' });
        return;
      }

      res.json({ finanza });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener finanza',
      });
    }
  }

  async actualizarFinanza(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const datos = req.body;

      if (datos.fecha) {
        datos.fecha = new Date(datos.fecha);
      }

      const finanza = await finanzasService.actualizarFinanza(id, datos);
      res.json({ message: 'Finanza actualizada exitosamente', finanza });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar finanza',
      });
    }
  }

  async eliminarFinanza(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await finanzasService.eliminarFinanza(id);
      res.json({ message: 'Finanza eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar finanza',
      });
    }
  }
}





