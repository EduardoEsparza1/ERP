import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ConceptoFactura } from './ConceptoFactura';

/**
 * Tabla de Impuestos por Concepto
 * Permite múltiples impuestos trasladados y retenidos por concepto
 * Cumple con CFDI 4.0
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
