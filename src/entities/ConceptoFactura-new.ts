import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Factura } from './Factura';
import { CatalogoSAT } from './CatalogoSAT';
import { ClaveUnidad } from './ClaveUnidad';
import { ObjetoImpuesto } from './ObjetoImpuesto';

/**
 * Entidad ConceptoFactura - Actualizada para CFDI 4.0
 */
@Entity('conceptos_factura')
export class ConceptoFactura {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con Factura
  @ManyToOne(() => Factura, factura => factura.conceptos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facturaId' })
  factura: Factura;

  @Column()
  facturaId: number;

  // Clave Producto/Servicio SAT (OBLIGATORIO)
  @Column({ length: 10 })
  claveProductoServicio: string;

  @ManyToOne(() => CatalogoSAT, { nullable: true })
  @JoinColumn({ name: 'claveProductoServicio', referencedColumnName: 'clave' })
  catalogoSAT: CatalogoSAT;

  // Número de Identificación (Opcional)
  @Column({ length: 100, nullable: true })
  noIdentificacion: string; // SKU, código interno, etc.

  // Cantidad y Unidad
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  cantidad: number;

  // Clave de Unidad SAT (OBLIGATORIO CFDI 4.0)
  @Column({ length: 10 })
  claveUnidad: string;

  @ManyToOne(() => ClaveUnidad)
  @JoinColumn({ name: 'claveUnidad', referencedColumnName: 'clave' })
  unidad: ClaveUnidad;

  @Column({ length: 50, nullable: true })
  unidadTexto: string; // Descripción de la unidad (ej: "Pieza", "Kilogramo")

  // Descripción (OBLIGATORIO)
  @Column({ type: 'text' })
  descripcion: string;

  // Precio Unitario (OBLIGATORIO)
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  valorUnitario: number;

  // Importe (OBLIGATORIO)
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  importe: number; // cantidad * valorUnitario

  // Descuento (Opcional)
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  descuento: number;

  // Objeto de Impuesto (NUEVO CFDI 4.0 - OBLIGATORIO)
  @Column({ length: 2 })
  objetoImpuestoClave: string;
  // 01 - No objeto de impuesto
  // 02 - Sí objeto de impuesto
  // 03 - Sí objeto del impuesto y no obligado al desglose
  // 04 - Sí objeto del impuesto y no causa impuesto

  @ManyToOne(() => ObjetoImpuesto)
  @JoinColumn({ name: 'objetoImpuestoClave', referencedColumnName: 'clave' })
  objetoImpuesto: ObjetoImpuesto;

  // Relación con impuestos (uno a muchos)
  @OneToMany(() => ImpuestoConcepto, impuesto => impuesto.concepto, { cascade: true })
  impuestos: ImpuestoConcepto[];

  // Cuenta Predial (Opcional)
  @Column({ length: 150, nullable: true })
  cuentaPredial: string;

  // Auditoría
  @CreateDateColumn()
  fechaCreacion: Date;
}

/**
 * Tabla de Impuestos por Concepto
 * Permite múltiples impuestos trasladados y retenidos por concepto
 */
@Entity('impuestos_concepto')
export class ImpuestoConcepto {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con Concepto
  @ManyToOne(() => ConceptoFactura, concepto => concepto.impuestos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conceptoId' })
  concepto: ConceptoFactura;

  @Column()
  conceptoId: number;

  // Tipo de Impuesto (Trasladado o Retenido)
  @Column({ length: 15 })
  tipo: 'Trasladado' | 'Retenido';

  // Impuesto (001-ISR, 002-IVA, 003-IEPS)
  @Column({ length: 3 })
  impuesto: string;

  // Tipo Factor (Tasa, Cuota, Exento)
  @Column({ length: 10 })
  tipoFactor: string;

  // Tasa o Cuota
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  tasaOCuota: number; // Ej: 0.160000 para IVA 16%

  // Base
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  base: number; // Importe sobre el que se calcula el impuesto

  // Importe del Impuesto
  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  importe: number;

  @CreateDateColumn()
  fechaCreacion: Date;
}
