import { AppDataSource } from '../config/database';
import { Cliente } from '../entities/Cliente';

export class ClienteService {
  private clienteRepository = AppDataSource.getRepository(Cliente);

  async crearCliente(
    rfc: string,
    razonSocial: string,
    regimenFiscalClave: string,
    codigoPostal: string,
    nombreComercial?: string,
    calle?: string,
    numeroExterior?: string,
    numeroInterior?: string,
    colonia?: string,
    municipio?: string,
    estado?: string,
    telefono?: string,
    email?: string
  ): Promise<Cliente> {
    const existingCliente = await this.clienteRepository.findOne({
      where: { rfc },
    });

    if (existingCliente) {
      throw new Error('Ya existe un cliente con este RFC');
    }

    const cliente = this.clienteRepository.create({
      rfc: rfc.toUpperCase(),
      razonSocial,
      nombreComercial,
      regimenFiscalClave,
      codigoPostal,
      calle,
      numeroExterior,
      numeroInterior,
      colonia,
      municipio,
      estado,
      telefono,
      email,
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
      datos.rfc = datos.rfc.toUpperCase();
      const existingCliente = await this.clienteRepository.findOne({
        where: { rfc: datos.rfc },
      });
      if (existingCliente && existingCliente.id !== id) {
        throw new Error('Ya existe otro cliente con este RFC');
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





