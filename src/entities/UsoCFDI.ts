import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Catálogo SAT c_UsoCFDI
 * Define el uso que el receptor le dará al CFDI
 */
@Entity('cat_uso_cfdi')
export class UsoCFDI {
  @PrimaryColumn({ length: 4 })
  clave: string; // G01, G02, G03, etc.

  @Column({ length: 200 })
  descripcion: string; // Adquisición de mercancías, Devoluciones, etc.

  @Column({ type: 'bit', default: true })
  aplicaFisica: boolean; // Si aplica para personas físicas

  @Column({ type: 'bit', default: true })
  aplicaMoral: boolean; // Si aplica para personas morales

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;
}
