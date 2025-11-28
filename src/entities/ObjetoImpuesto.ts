import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_ObjetoImp (Objeto de Impuesto)
 * NUEVO en CFDI 4.0 - Obligatorio
 */
@Entity('cat_objeto_impuesto')
export class ObjetoImpuesto {
  @PrimaryColumn({ length: 2 })
  clave: string; // 01, 02, 03, 04

  @Column({ length: 200 })
  descripcion: string;
  // 01 - No objeto de impuesto
  // 02 - Sí objeto de impuesto
  // 03 - Sí objeto del impuesto y no obligado al desglose
  // 04 - Sí objeto del impuesto y no causa impuesto

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
