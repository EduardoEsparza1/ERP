import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { FormaPago } from '../entities/FormaPago';
import { MetodoPago } from '../entities/MetodoPago';
import { UsoCFDI } from '../entities/UsoCFDI';
import { Moneda } from '../entities/Moneda';
import { RegimenFiscal } from '../entities/RegimenFiscal';
import { ClaveUnidad } from '../entities/ClaveUnidad';
import { ObjetoImpuesto } from '../entities/ObjetoImpuesto';
import { TipoImpuesto } from '../entities/TipoImpuesto';
import { TipoFactor } from '../entities/TipoFactor';
import { Cliente } from '../entities/Cliente';
import { Empresa } from '../entities/Empresa';

/**
 * Controller para todos los catálogos SAT CFDI 4.0
 */
export class CatalogosController {
  // Formas de Pago
  async obtenerFormasPago(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(FormaPago);
      const formasPago = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ formasPago });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener formas de pago',
      });
    }
  }

  // Métodos de Pago
  async obtenerMetodosPago(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(MetodoPago);
      const metodosPago = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ metodosPago });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener métodos de pago',
      });
    }
  }

  // Usos CFDI
  async obtenerUsosCFDI(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(UsoCFDI);
      const usosCFDI = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ usosCFDI });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener usos CFDI',
      });
    }
  }

  // Monedas
  async obtenerMonedas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(Moneda);
      const monedas = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ monedas });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener monedas',
      });
    }
  }

  // Regímenes Fiscales
  async obtenerRegimenesFiscales(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(RegimenFiscal);
      const regimenesFiscales = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ regimenesFiscales });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener regímenes fiscales',
      });
    }
  }

  // Claves de Unidad
  async obtenerClavesUnidad(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ClaveUnidad);
      const clavesUnidad = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ clavesUnidad });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener claves de unidad',
      });
    }
  }

  // Objetos de Impuesto
  async obtenerObjetosImpuesto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ObjetoImpuesto);
      const objetosImpuesto = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ objetosImpuesto });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener objetos de impuesto',
      });
    }
  }

  // Tipos de Impuesto
  async obtenerTiposImpuesto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(TipoImpuesto);
      const tiposImpuesto = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ tiposImpuesto });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener tipos de impuesto',
      });
    }
  }

  // Tipos de Factor
  async obtenerTiposFactor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(TipoFactor);
      const tiposFactor = await repository.find({
        where: { activo: true },
        order: { clave: 'ASC' },
      });
      res.json({ tiposFactor });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener tipos de factor',
      });
    }
  }

  // Obtener todos los catálogos en una sola llamada
  async obtenerTodosCatalogos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [
        formasPago,
        metodosPago,
        usosCFDI,
        monedas,
        regimenesFiscales,
        clavesUnidad,
        objetosImpuesto,
        tiposImpuesto,
        tiposFactor,
      ] = await Promise.all([
        AppDataSource.getRepository(FormaPago).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(MetodoPago).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(UsoCFDI).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(Moneda).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(RegimenFiscal).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(ClaveUnidad).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(ObjetoImpuesto).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(TipoImpuesto).find({ where: { activo: true }, order: { clave: 'ASC' } }),
        AppDataSource.getRepository(TipoFactor).find({ where: { activo: true }, order: { clave: 'ASC' } }),
      ]);

      res.json({
        catalogos: {
          formasPago,
          metodosPago,
          usosCFDI,
          monedas,
          regimenesFiscales,
          clavesUnidad,
          objetosImpuesto,
          tiposImpuesto,
          tiposFactor,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener catálogos',
      });
    }
  }

  // Obtener lista de clientes
  async obtenerClientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(Cliente);
      const clientes = await repository.find({
        where: { activo: true },
        order: { razonSocial: 'ASC' },
        select: ['id', 'rfc', 'razonSocial', 'nombreComercial'],
      });
      res.json({ clientes });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener clientes',
      });
    }
  }

  // Obtener lista de empresas
  async obtenerEmpresas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(Empresa);
      const empresas = await repository.find({
        where: { activo: true },
        order: { razonSocial: 'ASC' },
      });
      res.json({ empresas });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener empresas',
      });
    }
  }
}
