import { AppDataSource } from '../config/database';
import { Factura, EstadoFactura, EstadoPago } from '../entities/Factura';
import { ConceptoFactura } from '../entities/ConceptoFactura';
import { ImpuestoConcepto } from '../entities/ImpuestoConcepto';
import { Cliente } from '../entities/Cliente';
import { User } from '../entities/User';
import { CatalogoSAT } from '../entities/CatalogoSAT';
import { v4 as uuidv4 } from 'uuid';

export interface ImpuestoConceptoDTO {
  tipo: 'Trasladado' | 'Retenido';
  impuesto: string; // 001-ISR, 002-IVA, 003-IEPS
  tipoFactor: string; // Tasa, Cuota, Exento
  tasaOCuota?: number;
  base: number;
  importe: number;
}

export interface ConceptoFacturaDTO {
  claveProductoServicio: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number; // Antes: precioUnitario
  claveUnidad: string; // Antes: unidadMedida (ej: 'H87')
  objetoImpuestoClave: string; // Nuevo CFDI 4.0 ('01', '02', '03', '04')
  impuestos?: ImpuestoConceptoDTO[]; // Antes: tieneImpuesto, tipoImpuesto, tasaImpuesto
  descuento?: number;
}

export class FacturaService {
  private facturaRepository = AppDataSource.getRepository(Factura);
  private conceptoRepository = AppDataSource.getRepository(ConceptoFactura);
  private impuestoConceptoRepository = AppDataSource.getRepository(ImpuestoConcepto);
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
    empresaId: number,
    clienteId: number,
    serie: string,
    lugarExpedicion: string,
    metodoPagoClave: string,
    usoCFDIClave: string,
    fechaEmision: Date,
    fechaVencimiento: Date | null,
    conceptos: ConceptoFacturaDTO[],
    observaciones: string,
    userId: number,
    formaPagoClave?: string,
    monedaClave: string = 'MXN',
    exportacion: string = '01'
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

    // Calcular subtotal y total basado en los conceptos
    let subtotal = 0;
    let totalDescuento = 0;

    const conceptosEntities: ConceptoFactura[] = [];

    for (const conceptoDTO of conceptos) {
      // Validar que el código SAT existe
      const catalogoSAT = await this.catalogoRepository.findOne({
        where: { clave: conceptoDTO.claveProductoServicio },
      });

      if (!catalogoSAT) {
        throw new Error(`Código SAT ${conceptoDTO.claveProductoServicio} no encontrado en el catálogo`);
      }

      const importe = conceptoDTO.cantidad * conceptoDTO.valorUnitario;
      const descuento = conceptoDTO.descuento || 0;
      subtotal += importe;
      totalDescuento += descuento;

      const concepto = this.conceptoRepository.create({
        claveProductoServicio: conceptoDTO.claveProductoServicio,
        descripcion: conceptoDTO.descripcion,
        cantidad: conceptoDTO.cantidad,
        valorUnitario: conceptoDTO.valorUnitario,
        claveUnidad: conceptoDTO.claveUnidad,
        importe,
        descuento,
        objetoImpuestoClave: conceptoDTO.objetoImpuestoClave,
      });

      conceptosEntities.push(concepto);
    }

    // Calcular total con impuestos (se calculan en los conceptos)
    const total = subtotal - totalDescuento; // Los impuestos se suman después al guardar los conceptos con sus impuestos

    const factura = this.facturaRepository.create({
      folio,
      serie,
      empresaId,
      lugarExpedicion,
      clienteId,
      fechaEmision,
      fechaVencimiento: fechaVencimiento || undefined,
      formaPagoClave,
      metodoPagoClave,
      usoCFDIClave,
      monedaClave,
      exportacion,
      subtotal,
      descuento: totalDescuento,
      total,
      observaciones,
      estadoFactura: EstadoFactura.BORRADOR,
      estadoPago: EstadoPago.PENDIENTE,
      saldoPendiente: total,
      montoPagado: 0,
      usuarioCreacionId: userId,
      conceptos: conceptosEntities,
    });

    const facturaGuardada = await this.facturaRepository.save(factura);
    return facturaGuardada;
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
    // TODO: ACTUALIZAR PARA CFDI 4.0 - Esta función necesita refactorización para usar ImpuestoConcepto
    // Por ahora retorna un XML básico sin impuestos detallados
    const conceptosXML = factura.conceptos
      .map(
        (concepto) => `
    <cfdi:Concepto
      ClaveProdServ="${concepto.claveProductoServicio}"
      NoIdentificacion="${concepto.noIdentificacion || concepto.claveProductoServicio}"
      Cantidad="${concepto.cantidad}"
      ClaveUnidad="${concepto.claveUnidad}"
      Unidad="${concepto.unidadTexto || 'Pieza'}"
      Descripcion="${concepto.descripcion}"
      ValorUnitario="${concepto.valorUnitario}"
      Importe="${concepto.importe}"
      ObjetoImp="${concepto.objetoImpuestoClave}">
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
  Descuento="${factura.descuento || 0}"
  Total="${factura.total}"
  Moneda="${factura.monedaClave}"
  TipoDeComprobante="${factura.tipoComprobante}"
  MetodoPago="${factura.metodoPagoClave}"
  FormaPago="${factura.formaPagoClave || ''}"
  LugarExpedicion="${factura.lugarExpedicion}"
  Exportacion="${factura.exportacion}"
  UUID="${uuid}">
  <cfdi:Emisor Rfc="ABC123456789" Nombre="Mi Empresa" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${factura.cliente.rfc}" Nombre="${factura.cliente.razonSocial}" UsoCFDI="${factura.usoCFDIClave}" DomicilioFiscalReceptor="${factura.cliente.codigoPostal}" RegimenFiscalReceptor="${factura.cliente.regimenFiscalClave}"/>
  <cfdi:Conceptos>${conceptosXML}
  </cfdi:Conceptos>
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

  // TODO: ACTUALIZAR PARA CFDI 4.0 - Esta función necesita refactorización completa para nuevos campos
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

        const importe = conceptoDTO.cantidad * conceptoDTO.valorUnitario;
        const descuento = conceptoDTO.descuento || 0;
        subtotal += importe;
        totalIva += descuento; // Reutilizando variable para descuentos

        const concepto = this.conceptoRepository.create({
          factura,
          claveProductoServicio: conceptoDTO.claveProductoServicio,
          descripcion: conceptoDTO.descripcion,
          cantidad: conceptoDTO.cantidad,
          valorUnitario: conceptoDTO.valorUnitario,
          claveUnidad: conceptoDTO.claveUnidad,
          importe,
          descuento,
          objetoImpuestoClave: conceptoDTO.objetoImpuestoClave,
        });

        conceptosEntities.push(concepto);
      }

      datos.subtotal = subtotal;
      datos.descuento = totalIva; // totalIva reutilizada como totalDescuento
      datos.total = subtotal - totalIva;
      datos.saldoPendiente = datos.total - factura.montoPagado;

      factura.conceptos = conceptosEntities;
    } else if (datos.subtotal !== undefined || datos.descuento !== undefined) {
      // Recalcular total si cambian subtotal o descuento manualmente
      const subtotal = datos.subtotal ?? factura.subtotal;
      const descuento = datos.descuento ?? factura.descuento;
      datos.total = subtotal - descuento;
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
