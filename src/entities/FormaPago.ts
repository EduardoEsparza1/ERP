import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_FormaPago
 * Define las formas de pago autorizadas por el SAT
 */
@Entity('cat_forma_pago')
export class FormaPago {
  @PrimaryColumn({ length: 2 })
  clave: string; // 01, 02, 03, etc.

  @Column({ length: 100 })
  descripcion: string; // Efectivo, Cheque, Transferencia, etc.

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
