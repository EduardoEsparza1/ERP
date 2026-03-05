import { AppDataSource } from '../config/database';
import { Cliente } from '../entities/Cliente';
import { RegimenFiscal } from '../entities/RegimenFiscal';
import { EstadoFactura, Factura } from '../entities/Factura';

interface CrearClienteDTO {
  rfc: string;
  razonSocial: string;
  regimenFiscalClave: string;
  codigoPostal: string;
  nombreComercial?: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  pais?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  diasCredito?: number;
  limiteCredito?: number;
  contactoPrincipal?: string;
  notas?: string;
}

export class ClienteService {
  private clienteRepository = AppDataSource.getRepository(Cliente);
  private regimenFiscalRepository = AppDataSource.getRepository(RegimenFiscal);
  private facturaRepository = AppDataSource.getRepository(Factura);

  private normalizarRFC(rfc: string): string {
    return rfc.trim().toUpperCase();
  }

  private normalizarCP(codigoPostal: string): string {
    return codigoPostal.trim();
  }

  private validarRFC(rfc: string): boolean {
    const rfcRegex = /^([A-Z&\u00D1]{3,4})\d{6}([A-Z\d]{3})$/i;
    return rfcRegex.test(rfc);
  }

  private validarCodigoPostal(codigoPostal: string): boolean {
    return /^\d{5}$/.test(codigoPostal);
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validarCreditos(diasCredito?: number, limiteCredito?: number): void {
    if (diasCredito !== undefined) {
      if (!Number.isInteger(diasCredito) || diasCredito < 0 || diasCredito > 3650) {
        throw new Error('diasCredito inválido. Debe ser un entero entre 0 y 3650');
      }
    }

    if (limiteCredito !== undefined) {
      if (Number.isNaN(Number(limiteCredito)) || Number(limiteCredito) < 0) {
        throw new Error('limiteCredito inválido. Debe ser mayor o igual a 0');
      }
    }
  }

  private hayCambioFiscal(cliente: Cliente, datos: Partial<Cliente>): boolean {
    const camposFiscales: Array<keyof Cliente> = [
      'rfc',
      'razonSocial',
      'regimenFiscalClave',
      'codigoPostal',
    ];

    return camposFiscales.some((campo) => {
      const valorNuevo = datos[campo];
      if (valorNuevo === undefined) {
        return false;
      }
      return String(valorNuevo).trim() !== String(cliente[campo] ?? '').trim();
    });
  }

  async crearCliente(data: CrearClienteDTO): Promise<Cliente> {
    const rfc = this.normalizarRFC(data.rfc);
    const codigoPostal = this.normalizarCP(data.codigoPostal);
    const regimenFiscalClave = data.regimenFiscalClave?.trim();

    if (!this.validarRFC(rfc)) {
      throw new Error('RFC inválido');
    }

    if (!this.validarCodigoPostal(codigoPostal)) {
      throw new Error('Código postal inválido. Debe tener 5 dígitos');
    }

    if (!regimenFiscalClave) {
      throw new Error('El régimen fiscal del receptor es obligatorio');
    }

    const regimenFiscal = await this.regimenFiscalRepository.findOne({
      where: { clave: regimenFiscalClave, activo: true },
    });

    if (!regimenFiscal) {
      throw new Error('Régimen fiscal inválido o inactivo');
    }

    if (data.email) {
      const emailNormalizado = data.email.trim().toLowerCase();
      if (!this.validarEmail(emailNormalizado)) {
        throw new Error('Email inválido');
      }
    }

    this.validarCreditos(data.diasCredito, data.limiteCredito);

    const existingCliente = await this.clienteRepository.findOne({
      where: { rfc },
    });

    if (existingCliente) {
      throw new Error('Ya existe un cliente con este RFC');
    }

    const cliente = this.clienteRepository.create({
      rfc,
      razonSocial: data.razonSocial.trim(),
      nombreComercial: data.nombreComercial?.trim(),
      regimenFiscalClave,
      codigoPostal,
      calle: data.calle?.trim(),
      numeroExterior: data.numeroExterior?.trim(),
      numeroInterior: data.numeroInterior?.trim(),
      colonia: data.colonia?.trim(),
      municipio: data.municipio?.trim(),
      estado: data.estado?.trim(),
      pais: data.pais?.trim(),
      telefono: data.telefono?.trim(),
      celular: data.celular?.trim(),
      email: data.email?.trim().toLowerCase(),
      diasCredito: data.diasCredito ?? 0,
      limiteCredito: data.limiteCredito ?? 0,
      contactoPrincipal: data.contactoPrincipal?.trim(),
      notas: data.notas?.trim(),
      activo: true,
    });

    return await this.clienteRepository.save(cliente);
  }

  async obtenerClientes(activos?: boolean): Promise<Cliente[]> {
    const where: any = {};
    if (activos !== undefined) {
      where.activo = activos;
    }
    return await this.clienteRepository.find({
      where,
      relations: ['facturas'],
      order: { razonSocial: 'ASC' },
    });
  }

  async obtenerClientePorId(id: number): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({
      where: { id },
      relations: ['facturas'],
    });
  }

  async obtenerClientePorRFC(rfc: string): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({
      where: { rfc: rfc.toUpperCase() },
      relations: ['facturas'],
    });
  }

  async actualizarCliente(id: number, datos: Partial<Cliente>): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    if (datos.rfc) {
      datos.rfc = this.normalizarRFC(datos.rfc);
      if (!this.validarRFC(datos.rfc)) {
        throw new Error('RFC inválido');
      }
      const existingCliente = await this.clienteRepository.findOne({
        where: { rfc: datos.rfc },
      });
      if (existingCliente && existingCliente.id !== id) {
        throw new Error('Ya existe otro cliente con este RFC');
      }
    }

    if (datos.codigoPostal) {
      datos.codigoPostal = this.normalizarCP(datos.codigoPostal);
      if (!this.validarCodigoPostal(datos.codigoPostal)) {
        throw new Error('Código postal inválido. Debe tener 5 dígitos');
      }
    }

    if (datos.regimenFiscalClave) {
      const regimenFiscal = await this.regimenFiscalRepository.findOne({
        where: { clave: datos.regimenFiscalClave, activo: true },
      });
      if (!regimenFiscal) {
        throw new Error('Régimen fiscal inválido o inactivo');
      }
    }

    if (datos.email) {
      datos.email = datos.email.trim().toLowerCase();
      if (!this.validarEmail(datos.email)) {
        throw new Error('Email inválido');
      }
    }

    this.validarCreditos(datos.diasCredito, datos.limiteCredito);

    if (this.hayCambioFiscal(cliente, datos)) {
      const facturasTimbradas = await this.facturaRepository.count({
        where: { clienteId: id, estadoFactura: EstadoFactura.TIMBRADA },
      });

      if (facturasTimbradas > 0) {
        throw new Error('No se pueden modificar datos fiscales del cliente porque tiene CFDI timbrados');
      }
    }

    Object.assign(cliente, datos);
    return await this.clienteRepository.save(cliente);
  }

  async eliminarCliente(id: number): Promise<void> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['facturas'],
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    if (cliente.facturas && cliente.facturas.length > 0) {
      throw new Error('No se puede eliminar un cliente que tiene facturas asociadas');
    }

    await this.clienteRepository.delete(id);
  }

  async desactivarCliente(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.activo = false;
    return await this.clienteRepository.save(cliente);
  }
}





