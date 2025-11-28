import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_Impuesto
 * Tipos de impuestos (IVA, ISR, IEPS, etc.)
 */
@Entity('cat_tipo_impuesto')
export class TipoImpuesto {
  @PrimaryColumn({ length: 3 })
  clave: string; // 001 (ISR), 002 (IVA), 003 (IEPS)

  @Column({ length: 100 })
  descripcion: string; // ISR, IVA, IEPS

  @Column({ type: 'bit', default: true })
  retencion: boolean; // Si es impuesto retenido

  @Column({ type: 'bit', default: true })
  traslado: boolean; // Si es impuesto trasladado

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
