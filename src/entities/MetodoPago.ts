import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_MetodoPago
 * PUE (Pago en Una sola Exhibición) o PPD (Pago en Parcialidades o Diferido)
 */
@Entity('cat_metodo_pago')
export class MetodoPago {
  @PrimaryColumn({ length: 3 })
  clave: string; // PUE, PPD

  @Column({ length: 100 })
  descripcion: string;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
