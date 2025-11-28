import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';
import { User } from './User';
import { Empresa } from './Empresa';
import { ConceptoFactura } from './ConceptoFactura';
import { FormaPago } from './FormaPago';
import { MetodoPago } from './MetodoPago';
import { UsoCFDI } from './UsoCFDI';
import { Moneda } from './Moneda';

export enum EstadoFactura {
  BORRADOR = 'borrador',
  TIMBRADA = 'timbrada',
  CANCELADA = 'cancelada',
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
}

export enum TipoComprobante {
  INGRESO = 'I',
  EGRESO = 'E',
  TRASLADO = 'T',
  NOMINA = 'N',
  PAGO = 'P',
}

/**
 * Entidad Factura - Actualizada para CFDI 4.0
 */
@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  // Serie y Folio
  @Column({ length: 10 })
  serie: string;

  @Column({ length: 20 })
  folio: string;

  // Tipo de Comprobante CFDI 4.0
  @Column({
    type: 'varchar',
    length: 1,
    default: TipoComprobante.INGRESO
  })
  tipoComprobante: TipoComprobante;

  // EMISOR (Empresa)
  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  @Column()
  empresaId: number;

  // Lugar de Expedición (OBLIGATORIO CFDI 4.0)
  @Column({ length: 5 })
  lugarExpedicion: string; // Código postal del emisor

  // RECEPTOR (Cliente)
  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  clienteId: number;

  // Fechas
  @Column({ type: 'datetime' })
  fechaEmision: Date;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: Date;

  // Forma de Pago (OBLIGATORIO cuando metodoPago != PPD)
  @Column({ length: 2, nullable: true })
  formaPagoClave: string; // 01-Efectivo, 02-Cheque, 03-Transferencia, etc.

  @ManyToOne(() => FormaPago, { nullable: true })
  @JoinColumn({ name: 'formaPagoClave' })
  formaPago: FormaPago;

  // Método de Pago (OBLIGATORIO)
  @Column({ length: 3 })
  metodoPagoClave: string; // PUE o PPD

  @ManyToOne(() => MetodoPago)
  @JoinColumn({ name: 'metodoPagoClave' })
  metodoPago: MetodoPago;

  // Uso CFDI (OBLIGATORIO)
  @Column({ length: 4 })
  usoCFDIClave: string; // G01, G02, G03, etc.

  @ManyToOne(() => UsoCFDI)
  @JoinColumn({ name: 'usoCFDIClave' })
  usoCFDI: UsoCFDI;

  // Moneda (OBLIGATORIO)
  @Column({ length: 3, default: 'MXN' })
  monedaClave: string;

  @ManyToOne(() => Moneda)
  @JoinColumn({ name: 'monedaClave' })
  moneda: Moneda;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1, nullable: true })
  tipoCambio: number; // Obligatorio si moneda != MXN

  // Exportación (NUEVO CFDI 4.0 - OBLIGATORIO)
  @Column({ length: 2, default: '01' })
  exportacion: string;
  // 01 - No aplica
  // 02 - Definitiva
  // 03 - Temporal
  // 04 - Definitiva con clave A1

  // Importes
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  total: number;

  // Conceptos
  @OneToMany(() => ConceptoFactura, concepto => concepto.factura, { cascade: true })
  conceptos: ConceptoFactura[];

  // Estado de la Factura
  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoFactura.BORRADOR,
  })
  estadoFactura: EstadoFactura;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPago.PENDIENTE,
  })
  estadoPago: EstadoPago;

  // Datos del Timbrado
  @Column({ length: 36, nullable: true, unique: true })
  uuid: string; // UUID del SAT

  @Column({ type: 'text', nullable: true })
  xml: string; // XML timbrado

  @Column({ length: 500, nullable: true })
  cadenaOriginalSAT: string;

  @Column({ type: 'text', nullable: true })
  selloDigitalCFDI: string;

  @Column({ type: 'text', nullable: true })
  selloDigitalSAT: string;

  @Column({ length: 50, nullable: true })
  noCertificadoSAT: string;

  @Column({ type: 'datetime', nullable: true })
  fechaTimbrado: Date;

  @Column({ length: 50, nullable: true })
  rfcProvCertif: string; // RFC del PAC que timbró

  // Cancelación
  @Column({ type: 'datetime', nullable: true })
  fechaCancelacion: Date;

  @Column({ type: 'text', nullable: true })
  motivoCancelacion: string;

  @Column({ length: 36, nullable: true })
  folioSustitucion: string; // UUID del CFDI que sustituye (si aplica)

  // Control de Pagos (CXC)
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  montoPagado: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  saldoPendiente: number;

  // Observaciones
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  // Auditoría
  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuarioCreacionId' })
  usuarioCreacion: User;

  @Column()
  usuarioCreacionId: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
