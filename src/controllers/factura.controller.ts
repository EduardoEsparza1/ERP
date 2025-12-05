import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FacturaService } from '../services/factura.service';
import { EstadoFactura, EstadoPago } from '../entities/Factura';

const facturaService = new FacturaService();

export class FacturaController {
  async crearFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        empresaId,
        clienteId,
        serie,
        lugarExpedicion,
        metodoPagoClave,
        usoCFDIClave,
        fechaEmision,
        fechaVencimiento,
        conceptos,
        observaciones,
        formaPagoClave,
        monedaClave,
        exportacion,
      } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      // Validar campos obligatorios CFDI 4.0
      if (!empresaId || !clienteId || !serie || !lugarExpedicion || !metodoPagoClave || !usoCFDIClave || !fechaEmision || !conceptos || !Array.isArray(conceptos) || conceptos.length === 0) {
        res.status(400).json({
          message: 'Campos obligatorios CFDI 4.0: empresaId, clienteId, serie, lugarExpedicion, metodoPagoClave, usoCFDIClave, fechaEmision, conceptos (array)',
        });
        return;
      }

      // Validar cada concepto (CFDI 4.0)
      for (const concepto of conceptos) {
        if (!concepto.claveProductoServicio || !concepto.descripcion || !concepto.cantidad || !concepto.valorUnitario || !concepto.claveUnidad || !concepto.objetoImpuestoClave) {
          res.status(400).json({
            message: 'Cada concepto CFDI 4.0 debe tener: claveProductoServicio, descripcion, cantidad, valorUnitario, claveUnidad, objetoImpuestoClave',
          });
          return;
        }
      }

      const factura = await facturaService.crearFactura(
        empresaId,
        clienteId,
        serie,
        lugarExpedicion,
        metodoPagoClave,
        usoCFDIClave,
        new Date(fechaEmision),
        fechaVencimiento ? new Date(fechaVencimiento) : null,
        conceptos,
        observaciones || '',
        userId,
        formaPagoClave,
        monedaClave || 'MXN',
        exportacion || '01'
      );

      res.status(201).json({ message: 'Factura creada exitosamente', factura });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear factura',
      });
    }
  }

  async timbrarFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const factura = await facturaService.timbrarFactura(id);
      res.json({ message: 'Factura timbrada exitosamente', factura });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al timbrar factura',
      });
    }
  }

  async obtenerFacturas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filtros: any = {};

      if (req.query.clienteId) {
        filtros.clienteId = parseInt(req.query.clienteId as string);
      }

      if (req.query.estadoFactura) {
        filtros.estadoFactura = req.query.estadoFactura as EstadoFactura;
      }

      if (req.query.estadoPago) {
        filtros.estadoPago = req.query.estadoPago as EstadoPago;
      }

      if (req.query.fechaInicio) {
        filtros.fechaInicio = new Date(req.query.fechaInicio as string);
      }

      if (req.query.fechaFin) {
        filtros.fechaFin = new Date(req.query.fechaFin as string);
      }

      const facturas = await facturaService.obtenerFacturas(filtros);
      res.json({ facturas });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener facturas',
      });
    }
  }

  async obtenerFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const factura = await facturaService.obtenerFacturaPorId(id);

      if (!factura) {
        res.status(404).json({ message: 'Factura no encontrada' });
        return;
      }

      res.json({ factura });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener factura',
      });
    }
  }

  async actualizarFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const datos = req.body;

      if (datos.fechaEmision) {
        datos.fechaEmision = new Date(datos.fechaEmision);
      }

      if (datos.fechaVencimiento) {
        datos.fechaVencimiento = new Date(datos.fechaVencimiento);
      }

      // Si se actualizan los conceptos, validarlos
      if (datos.conceptos && Array.isArray(datos.conceptos)) {
        for (const concepto of datos.conceptos) {
          if (!concepto.claveProductoServicio || !concepto.descripcion || !concepto.cantidad || !concepto.precioUnitario) {
            res.status(400).json({
              message: 'Cada concepto debe tener: claveProductoServicio, descripcion, cantidad, precioUnitario',
            });
            return;
          }
        }
      }

      const factura = await facturaService.actualizarFactura(id, datos);
      res.json({ message: 'Factura actualizada exitosamente', factura });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar factura',
      });
    }
  }

  async registrarPago(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { monto } = req.body;

      if (!monto || monto <= 0) {
        res.status(400).json({ message: 'El monto debe ser mayor a 0' });
        return;
      }

      const factura = await facturaService.registrarPago(id, parseFloat(monto));
      res.json({ message: 'Pago registrado exitosamente', factura });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al registrar pago',
      });
    }
  }

  async cancelarFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const factura = await facturaService.cancelarFactura(id);
      res.json({ message: 'Factura cancelada exitosamente', factura });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al cancelar factura',
      });
    }
  }

  async eliminarFactura(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await facturaService.eliminarFactura(id);
      res.json({ message: 'Factura eliminada exitosamente' });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar factura',
      });
    }
  }

  async obtenerCartera(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cartera = await facturaService.obtenerCartera();
      res.json({ cartera });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener cartera',
      });
    }
  }

  async obtenerKPIs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const kpis = await facturaService.obtenerKPIs();
      res.json({ kpis });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener KPIs',
      });
    }
  }
}

