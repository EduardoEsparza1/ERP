import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_RegimenFiscal
 * Régimen fiscal del contribuyente
 */
@Entity('cat_regimen_fiscal')
export class RegimenFiscal {
  @PrimaryColumn({ length: 3 })
  clave: string; // 601, 603, 605, 606, 612, 621, 626, etc.

  @Column({ length: 200 })
  descripcion: string; // General de Ley Personas Morales, Personas Físicas con Actividades Empresariales, etc.

  @Column({ type: 'bit', default: true })
  aplicaFisica: boolean;

  @Column({ type: 'bit', default: true })
  aplicaMoral: boolean;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
