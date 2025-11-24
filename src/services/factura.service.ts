import { AppDataSource } from '../config/database';
import { Factura, EstadoFactura, EstadoPago } from '../entities/Factura';
import { ConceptoFactura } from '../entities/ConceptoFactura';
import { Cliente } from '../entities/Cliente';
import { User } from '../entities/User';
import { CatalogoSAT } from '../entities/CatalogoSAT';
import { v4 as uuidv4 } from 'uuid';

export interface ConceptoFacturaDTO {
  claveProductoServicio: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  tieneImpuesto: boolean;
  tipoImpuesto?: string;
  tasaImpuesto?: number;
  unidadMedida?: string;
}

export class FacturaService {
  private facturaRepository = AppDataSource.getRepository(Factura);
  private conceptoRepository = AppDataSource.getRepository(ConceptoFactura);
  private clienteRepository = AppDataSource.getRepository(Cliente);
  private userRepository = AppDataSource.getRepository(User);
  private catalogoRepository = AppDataSource.getRepository(CatalogoSAT);

  async generarFolio(serie: string): Promise<string> {
    // Obtener el último folio de la serie
    const ultimaFactura = await this.facturaRepository
      .createQueryBuilder('factura')
      .where('factura.serie = :serie', { serie })
      .orderBy('CAST(factura.folio AS INTEGER)', 'DESC')
      .getOne();

    if (!ultimaFactura) {
      return '000001';
    }

    // Convertir el folio a número y sumar 1
    const ultimoFolio = parseInt(ultimaFactura.folio);
    const nuevoFolio = isNaN(ultimoFolio) ? 1 : ultimoFolio + 1;
    return nuevoFolio.toString().padStart(6, '0');
  }

  async crearFactura(
    clienteId: number,
    serie: string,
    fechaEmision: Date,
    fechaVencimiento: Date,
    conceptos: ConceptoFacturaDTO[],
    observaciones: string,
    userId: number
  ): Promise<Factura> {
    if (!conceptos || conceptos.length === 0) {
      throw new Error('Debe agregar al menos un concepto');
    }

    const cliente = await this.clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Generar folio automáticamente
    const folio = await this.generarFolio(serie);

    // Calcular subtotal, IVA y total basado en los conceptos
    let subtotal = 0;
    let totalIva = 0;

    const conceptosEntities: ConceptoFactura[] = [];

    for (const conceptoDTO of conceptos) {
      // Validar que el código SAT existe
      const catalogoSAT = await this.catalogoRepository.findOne({
        where: { clave: conceptoDTO.claveProductoServicio },
      });

      if (!catalogoSAT) {
        throw new Error(`Código SAT ${conceptoDTO.claveProductoServicio} no encontrado en el catálogo`);
      }

      const importe = conceptoDTO.cantidad * conceptoDTO.precioUnitario;
      subtotal += importe;

      let importeImpuesto = 0;
      if (conceptoDTO.tieneImpuesto && conceptoDTO.tasaImpuesto) {
        importeImpuesto = importe * (conceptoDTO.tasaImpuesto / 100);
        totalIva += importeImpuesto;
      }

      const concepto = this.conceptoRepository.create({
        catalogoSAT,
        claveProductoServicio: conceptoDTO.claveProductoServicio,
        descripcion: conceptoDTO.descripcion,
        cantidad: conceptoDTO.cantidad,
        precioUnitario: conceptoDTO.precioUnitario,
        importe,
        tieneImpuesto: conceptoDTO.tieneImpuesto,
        tipoImpuesto: conceptoDTO.tipoImpuesto || '002', // 002 = IVA
        tasaImpuesto: conceptoDTO.tasaImpuesto || 0,
        importeImpuesto,
        unidadMedida: conceptoDTO.unidadMedida || 'H87', // H87 = Pieza
      });

      conceptosEntities.push(concepto);
    }

    const total = subtotal + totalIva;

    const factura = this.facturaRepository.create({
      folio,
      serie,
      cliente,
      fechaEmision,
      fechaVencimiento,
      subtotal,
      iva: totalIva,
      total,
      observaciones,
      estadoFactura: EstadoFactura.BORRADOR,
      estadoPago: EstadoPago.PENDIENTE,
      saldoPendiente: total,
      montoPagado: 0,
      usuarioCreacion: user,
      conceptos: conceptosEntities,
    });

    return await this.facturaRepository.save(factura);
  }

  async timbrarFactura(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['cliente', 'conceptos', 'conceptos.catalogoSAT'],
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estadoFactura === EstadoFactura.TIMBRADA) {
      throw new Error('La factura ya está timbrada');
    }

    if (factura.estadoFactura === EstadoFactura.CANCELADA) {
      throw new Error('No se puede timbrar una factura cancelada');
    }

    if (!factura.conceptos || factura.conceptos.length === 0) {
      throw new Error('La factura debe tener al menos un concepto para timbrar');
    }

    // Generar UUID para el timbrado (simulado)
    const uuid = uuidv4().toUpperCase();
    const fechaTimbrado = new Date();

    // Generar XML simulado del CFDI con múltiples conceptos
    const xml = this.generarXMLSimulado(factura, uuid, fechaTimbrado);

    factura.uuid = uuid;
    factura.xml = xml;
    factura.fechaTimbrado = fechaTimbrado;
    factura.estadoFactura = EstadoFactura.TIMBRADA;

    return await this.facturaRepository.save(factura);
  }

  private generarXMLSimulado(factura: Factura, uuid: string, fechaTimbrado: Date): string {
    // Generar XML del CFDI con múltiples conceptos
    const conceptosXML = factura.conceptos
      .map(
        (concepto) => `
    <cfdi:Concepto 
      ClaveProdServ="${concepto.claveProductoServicio}" 
      NoIdentificacion="${concepto.claveProductoServicio}"
      Cantidad="${concepto.cantidad}" 
      ClaveUnidad="${concepto.unidadMedida || 'H87'}"
      Unidad="${concepto.unidadMedida || 'Pieza'}"
      Descripcion="${concepto.descripcion}" 
      ValorUnitario="${concepto.precioUnitario}" 
      Importe="${concepto.importe}">
      ${concepto.tieneImpuesto && concepto.importeImpuesto > 0
        ? `
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado 
            Base="${concepto.importe}" 
            Impuesto="${concepto.tipoImpuesto || '002'}" 
            TipoFactor="Tasa" 
            TasaOCuota="${(concepto.tasaImpuesto || 0) / 100}" 
            Importe="${concepto.importeImpuesto}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>`
        : ''
      }
    </cfdi:Concepto>`
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  Version="4.0" 
  Serie="${factura.serie}" 
  Folio="${factura.folio}" 
  Fecha="${fechaTimbrado.toISOString()}" 
  SubTotal="${factura.subtotal}" 
  Total="${factura.total}" 
  Moneda="MXN"
  TipoCambio="1"
  TipoDeComprobante="I"
  MetodoPago="PUE"
  FormaPago="03"
  CondicionesDePago="Contado"
  LugarExpedicion="01234"
  UUID="${uuid}">
  <cfdi:Emisor Rfc="ABC123456789" Nombre="Mi Empresa" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${factura.cliente.rfc}" Nombre="${factura.cliente.razonSocial}" UsoCFDI="G01"/>
  <cfdi:Conceptos>${conceptosXML}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${factura.iva}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${factura.subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.16" Importe="${factura.iva}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
</cfdi:Comprobante>`;
  }

  async obtenerFacturas(filtros?: {
    clienteId?: number;
    estadoFactura?: EstadoFactura;
    estadoPago?: EstadoPago;
    fechaInicio?: Date;
    fechaFin?: Date;
  }): Promise<Factura[]> {
    const queryBuilder = this.facturaRepository
      .createQueryBuilder('factura')
      .leftJoinAndSelect('factura.cliente', 'cliente')
      .leftJoinAndSelect('factura.usuarioCreacion', 'usuario')
      .leftJoinAndSelect('factura.conceptos', 'conceptos')
      .leftJoinAndSelect('conceptos.catalogoSAT', 'catalogoSAT');

    if (filtros?.clienteId) {
      queryBuilder.where('factura.cliente.id = :clienteId', { clienteId: filtros.clienteId });
    }

    if (filtros?.estadoFactura) {
      queryBuilder.andWhere('factura.estadoFactura = :estadoFactura', {
        estadoFactura: filtros.estadoFactura,
      });
    }

    if (filtros?.estadoPago) {
      queryBuilder.andWhere('factura.estadoPago = :estadoPago', { estadoPago: filtros.estadoPago });
    }

    if (filtros?.fechaInicio) {
      queryBuilder.andWhere('factura.fechaEmision >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      });
    }

    if (filtros?.fechaFin) {
      queryBuilder.andWhere('factura.fechaEmision <= :fechaFin', { fechaFin: filtros.fechaFin });
    }

    return await queryBuilder.orderBy('factura.fechaEmision', 'DESC').getMany();
  }

  async obtenerFacturaPorId(id: number): Promise<Factura | null> {
    return await this.facturaRepository.findOne({
      where: { id },
      relations: ['cliente', 'usuarioCreacion', 'conceptos', 'conceptos.catalogoSAT'],
    });
  }

  async actualizarFactura(id: number, datos: Partial<Factura> & { conceptos?: ConceptoFacturaDTO[] }): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id },
      relations: ['conceptos'],
    });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estadoFactura === EstadoFactura.TIMBRADA) {
      throw new Error('No se puede modificar una factura timbrada');
    }

    // Si se actualizan los conceptos, recalcular totales
    if (datos.conceptos) {
      // Eliminar conceptos existentes
      await this.conceptoRepository.delete({ factura: { id: factura.id } });

      // Calcular nuevos totales
      let subtotal = 0;
      let totalIva = 0;

      const conceptosEntities: ConceptoFactura[] = [];

      for (const conceptoDTO of datos.conceptos) {
        const catalogoSAT = await this.catalogoRepository.findOne({
          where: { clave: conceptoDTO.claveProductoServicio },
        });

        if (!catalogoSAT) {
          throw new Error(`Código SAT ${conceptoDTO.claveProductoServicio} no encontrado`);
        }

        const importe = conceptoDTO.cantidad * conceptoDTO.precioUnitario;
        subtotal += importe;

        let importeImpuesto = 0;
        if (conceptoDTO.tieneImpuesto && conceptoDTO.tasaImpuesto) {
          importeImpuesto = importe * (conceptoDTO.tasaImpuesto / 100);
          totalIva += importeImpuesto;
        }

        const concepto = this.conceptoRepository.create({
          factura,
          catalogoSAT,
          claveProductoServicio: conceptoDTO.claveProductoServicio,
          descripcion: conceptoDTO.descripcion,
          cantidad: conceptoDTO.cantidad,
          precioUnitario: conceptoDTO.precioUnitario,
          importe,
          tieneImpuesto: conceptoDTO.tieneImpuesto,
          tipoImpuesto: conceptoDTO.tipoImpuesto || '002',
          tasaImpuesto: conceptoDTO.tasaImpuesto || 0,
          importeImpuesto,
          unidadMedida: conceptoDTO.unidadMedida || 'H87',
        });

        conceptosEntities.push(concepto);
      }

      datos.subtotal = subtotal;
      datos.iva = totalIva;
      datos.total = subtotal + totalIva;
      datos.saldoPendiente = datos.total - factura.montoPagado;

      factura.conceptos = conceptosEntities;
    } else if (datos.subtotal !== undefined || datos.iva !== undefined) {
      // Recalcular total si cambian subtotal o iva manualmente
      const subtotal = datos.subtotal ?? factura.subtotal;
      const iva = datos.iva ?? factura.iva;
      datos.total = subtotal + iva;
      datos.saldoPendiente = datos.total - factura.montoPagado;
    }

    // Eliminar conceptos del objeto datos antes de asignar
    const { conceptos, ...datosFactura } = datos;
    Object.assign(factura, datosFactura);

    const facturaGuardada = await this.facturaRepository.save(factura);
    
    // Guardar conceptos si se actualizaron
    if (datos.conceptos) {
      for (const concepto of factura.conceptos) {
        await this.conceptoRepository.save(concepto);
      }
    }

    return await this.obtenerFacturaPorId(facturaGuardada.id) as Factura;
  }

  async registrarPago(id: number, monto: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({ where: { id } });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    const nuevoMontoPagado = factura.montoPagado + monto;
    const nuevoSaldoPendiente = factura.total - nuevoMontoPagado;

    if (nuevoMontoPagado > factura.total) {
      throw new Error('El monto a pagar excede el total de la factura');
    }

    factura.montoPagado = nuevoMontoPagado;
    factura.saldoPendiente = nuevoSaldoPendiente;

    // Actualizar estado de pago
    if (nuevoSaldoPendiente <= 0) {
      factura.estadoPago = EstadoPago.PAGADA;
    } else if (nuevoMontoPagado > 0) {
      factura.estadoPago = EstadoPago.PARCIAL;
    }

    return await this.facturaRepository.save(factura);
  }

  async cancelarFactura(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({ where: { id } });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estadoFactura === EstadoFactura.CANCELADA) {
      throw new Error('La factura ya está cancelada');
    }

    factura.estadoFactura = EstadoFactura.CANCELADA;
    return await this.facturaRepository.save(factura);
  }

  async eliminarFactura(id: number): Promise<void> {
    const factura = await this.facturaRepository.findOne({ where: { id } });

    if (!factura) {
      throw new Error('Factura no encontrada');
    }

    if (factura.estadoFactura === EstadoFactura.TIMBRADA) {
      throw new Error('No se puede eliminar una factura timbrada');
    }

    await this.facturaRepository.delete(id);
  }

  async obtenerCartera(): Promise<{
    totalPorCobrar: number;
    totalVencido: number;
    totalVigente: number;
    facturasVencidas: Factura[];
    facturasVigentes: Factura[];
    porCliente: Array<{
      cliente: Cliente;
      total: number;
      facturas: Factura[];
    }>;
  }> {
    const facturas = await this.facturaRepository.find({
      where: { estadoPago: EstadoPago.PENDIENTE },
      relations: ['cliente'],
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const facturasVencidas = facturas.filter((f) => {
      const fechaVenc = new Date(f.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);
      return fechaVenc < hoy;
    });

    const facturasVigentes = facturas.filter((f) => {
      const fechaVenc = new Date(f.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);
      return fechaVenc >= hoy;
    });

    const totalPorCobrar = facturas.reduce((sum, f) => sum + Number(f.saldoPendiente), 0);
    const totalVencido = facturasVencidas.reduce((sum, f) => sum + Number(f.saldoPendiente), 0);
    const totalVigente = facturasVigentes.reduce((sum, f) => sum + Number(f.saldoPendiente), 0);

    // Agrupar por cliente
    const porClienteMap = new Map<number, { cliente: Cliente; facturas: Factura[] }>();

    facturas.forEach((factura) => {
      const clienteId = factura.cliente.id;
      if (!porClienteMap.has(clienteId)) {
        porClienteMap.set(clienteId, {
          cliente: factura.cliente,
          facturas: [],
        });
      }
      porClienteMap.get(clienteId)!.facturas.push(factura);
    });

    const porCliente = Array.from(porClienteMap.values()).map((item) => ({
      cliente: item.cliente,
      total: item.facturas.reduce((sum, f) => sum + Number(f.saldoPendiente), 0),
      facturas: item.facturas,
    }));

    return {
      totalPorCobrar,
      totalVencido,
      totalVigente,
      facturasVencidas,
      facturasVigentes,
      porCliente: porCliente.sort((a, b) => b.total - a.total),
    };
  }

  async obtenerKPIs(): Promise<{
    totalFacturado: number;
    totalPorCobrar: number;
    totalCobrado: number;
    facturasTimbradas: number;
    facturasPendientes: number;
    facturasPagadas: number;
    promedioTicket: number;
    facturasPorMes: Array<{ mes: string; total: number; cantidad: number }>;
  }> {
    const facturas = await this.facturaRepository.find({
      relations: ['cliente'],
    });

    const totalFacturado = facturas.reduce((sum, f) => sum + Number(f.total), 0);
    const totalPorCobrar = facturas
      .filter((f) => f.estadoPago !== EstadoPago.PAGADA)
      .reduce((sum, f) => sum + Number(f.saldoPendiente), 0);
    const totalCobrado = facturas.reduce((sum, f) => sum + Number(f.montoPagado), 0);

    const facturasTimbradas = facturas.filter((f) => f.estadoFactura === EstadoFactura.TIMBRADA).length;
    const facturasPendientes = facturas.filter((f) => f.estadoPago === EstadoPago.PENDIENTE).length;
    const facturasPagadas = facturas.filter((f) => f.estadoPago === EstadoPago.PAGADA).length;

    const promedioTicket = facturas.length > 0 ? totalFacturado / facturas.length : 0;

    // Agrupar por mes
    const facturasPorMesMap = new Map<string, { total: number; cantidad: number }>();

    facturas.forEach((factura) => {
      const fecha = new Date(factura.fechaEmision);
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!facturasPorMesMap.has(mes)) {
        facturasPorMesMap.set(mes, { total: 0, cantidad: 0 });
      }

      const mesData = facturasPorMesMap.get(mes)!;
      mesData.total += Number(factura.total);
      mesData.cantidad += 1;
    });

    const facturasPorMes = Array.from(facturasPorMesMap.entries())
      .map(([mes, data]) => ({
        mes,
        total: data.total,
        cantidad: data.cantidad,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      totalFacturado,
      totalPorCobrar,
      totalCobrado,
      facturasTimbradas,
      facturasPendientes,
      facturasPagadas,
      promedioTicket,
      facturasPorMes,
    };
  }
}
