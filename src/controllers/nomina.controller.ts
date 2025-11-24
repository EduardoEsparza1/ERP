import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NominaService } from '../services/nomina.service';

const nominaService = new NominaService();

export class NominaController {
  async crearNomina(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { empleadoNombre, salario, deducciones, bonificaciones, periodo } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      if (!empleadoNombre || !salario || !periodo) {
        res.status(400).json({ message: 'Campos requeridos: empleadoNombre, salario, periodo' });
        return;
      }

      const nomina = await nominaService.crearNomina(
        empleadoNombre,
        parseFloat(salario),
        parseFloat(deducciones || 0),
        parseFloat(bonificaciones || 0),
        periodo,
        userId
      );

      res.status(201).json({ message: 'Nómina creada exitosamente', nomina });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear nómina',
      });
    }
  }

  async obtenerNominas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const nominas = await nominaService.obtenerNominas();
      res.json({ nominas });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener nóminas',
      });
    }
  }

  async obtenerNomina(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const nomina = await nominaService.obtenerNominaPorId(id);

      if (!nomina) {
        res.status(404).json({ message: 'Nómina no encontrada' });
        return;
      }

      res.json({ nomina });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener nómina',
      });
    }
  }

  async actualizarNomina(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const datos = req.body;

      const nomina = await nominaService.actualizarNomina(id, datos);
      res.json({ message: 'Nómina actualizada exitosamente', nomina });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar nómina',
      });
    }
  }

  async eliminarNomina(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await nominaService.eliminarNomina(id);
      res.json({ message: 'Nómina eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar nómina',
      });
    }
  }
}





