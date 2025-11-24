import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CatalogoSATService } from '../services/catalogoSAT.service';

const catalogoService = new CatalogoSATService();

export class CatalogoSATController {
  async obtenerCatalogo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const activos = req.query.activos === 'true' ? true : req.query.activos === 'false' ? false : undefined;
      const catalogo = await catalogoService.obtenerCatalogo(activos);
      res.json({ catalogo });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener catálogo',
      });
    }
  }

  async buscarPorDescripcion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const termino = req.query.termino as string;
      if (!termino) {
        res.status(400).json({ message: 'Término de búsqueda requerido' });
        return;
      }
      const catalogo = await catalogoService.buscarPorDescripcion(termino);
      res.json({ catalogo });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al buscar en catálogo',
      });
    }
  }
}





