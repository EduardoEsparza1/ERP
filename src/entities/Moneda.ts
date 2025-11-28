import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_Moneda
 * Catálogo de monedas del SAT
 */
@Entity('cat_moneda')
export class Moneda {
  @PrimaryColumn({ length: 3 })
  clave: string; // MXN, USD, EUR, etc.

  @Column({ length: 100 })
  descripcion: string; // Peso Mexicano, Dólar americano, etc.

  @Column({ type: 'int', nullable: true })
  decimales: number; // Número de decimales permitidos

  @Column({ type: 'int', nullable: true })
  porcentajeVariacion: number; // Porcentaje de variación

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
