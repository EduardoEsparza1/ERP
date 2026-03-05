import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClienteService } from '../services/cliente.service';

const clienteService = new ClienteService();

export class ClienteController {
  private validarRFC(rfc: string): boolean {
    const rfcRegex = /^([A-Z&\u00D1]{3,4})\d{6}([A-Z\d]{3})$/i;
    return rfcRegex.test(rfc);
  }

  private validarCodigoPostal(codigoPostal: string): boolean {
    return /^\d{5}$/.test(codigoPostal);
  }

  async crearCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        rfc,
        razonSocial,
        regimenFiscalClave,
        codigoPostal,
        nombreComercial,
        calle,
        numeroExterior,
        numeroInterior,
        colonia,
        municipio,
        estado,
        pais,
        telefono,
        celular,
        email,
        diasCredito,
        limiteCredito,
        contactoPrincipal,
        notas,
      } = req.body;

      if (!rfc || !razonSocial || !regimenFiscalClave || !codigoPostal) {
        res.status(400).json({
          message: 'Campos requeridos: rfc, razonSocial, regimenFiscalClave, codigoPostal',
        });
        return;
      }

      if (!this.validarRFC(rfc)) {
        res.status(400).json({ message: 'RFC inválido' });
        return;
      }

      if (!this.validarCodigoPostal(codigoPostal)) {
        res.status(400).json({ message: 'Código postal inválido. Debe tener 5 dígitos' });
        return;
      }

      const cliente = await clienteService.crearCliente({
        rfc,
        razonSocial,
        regimenFiscalClave,
        codigoPostal,
        nombreComercial,
        calle,
        numeroExterior,
        numeroInterior,
        colonia,
        municipio,
        estado,
        pais,
        telefono,
        email,
        celular,
        diasCredito,
        limiteCredito,
        contactoPrincipal,
        notas,
      });

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

      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'ID de cliente inválido' });
        return;
      }

      if (datos.rfc && !this.validarRFC(datos.rfc)) {
        res.status(400).json({ message: 'RFC inválido' });
        return;
      }

      if (datos.codigoPostal && !this.validarCodigoPostal(datos.codigoPostal)) {
        res.status(400).json({ message: 'Código postal inválido. Debe tener 5 dígitos' });
        return;
      }

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

      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'ID de cliente inválido' });
        return;
      }

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

      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'ID de cliente inválido' });
        return;
      }

      const cliente = await clienteService.desactivarCliente(id);
      res.json({ message: 'Cliente desactivado exitosamente', cliente });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al desactivar cliente',
      });
    }
  }
}





