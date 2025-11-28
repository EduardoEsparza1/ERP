import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_TipoFactor
 * Factor del impuesto (Tasa, Cuota, Exento)
 */
@Entity('cat_tipo_factor')
export class TipoFactor {
  @PrimaryColumn({ length: 10 })
  clave: string; // Tasa, Cuota, Exento

  @Column({ length: 100 })
  descripcion: string;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
