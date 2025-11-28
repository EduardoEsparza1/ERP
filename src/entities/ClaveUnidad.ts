import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_ClaveUnidad
 * Unidades de medida del SAT
 */
@Entity('cat_clave_unidad')
export class ClaveUnidad {
  @PrimaryColumn({ length: 10 })
  clave: string; // H87, E48, ACT, KGM, etc.

  @Column({ length: 200 })
  nombre: string; // Pieza, Unidad de servicio, Kilogramo, etc.

  @Column({ length: 500, nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  simbolo: string; // pza, kg, m, etc.

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
