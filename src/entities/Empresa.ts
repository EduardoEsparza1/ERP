import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RegimenFiscal } from './RegimenFiscal';

/**
 * Entidad Empresa/Emisor
 * Representa la empresa que emite los CFDI
 */
@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  // Datos fiscales obligatorios
  @Column({ length: 13, unique: true })
  rfc: string;

  @Column({ length: 200 })
  razonSocial: string;

  @Column({ length: 200, nullable: true })
  nombreComercial: string;

  // Régimen Fiscal
  @Column({ length: 3 })
  regimenFiscalClave: string;

  @ManyToOne(() => RegimenFiscal)
  @JoinColumn({ name: 'regimenFiscalClave' })
  regimenFiscal: RegimenFiscal;

  // Domicilio Fiscal
  @Column({ length: 5 })
  codigoPostal: string; // Lugar de expedición

  @Column({ length: 200, nullable: true })
  calle: string;

  @Column({ length: 20, nullable: true })
  numeroExterior: string;

  @Column({ length: 20, nullable: true })
  numeroInterior: string;

  @Column({ length: 100, nullable: true })
  colonia: string;

  @Column({ length: 100, nullable: true })
  municipio: string;

  @Column({ length: 100, nullable: true })
  estado: string;

  @Column({ length: 50, nullable: true })
  pais: string;

  // Contacto
  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 500, nullable: true })
  sitioWeb: string;

  // Logotipo
  @Column({ type: 'varchar', length: 'MAX', nullable: true })
  logo: string; // Base64 o URL

  // Estado
  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
