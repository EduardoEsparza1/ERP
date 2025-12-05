import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Factura } from './Factura';
import { RegimenFiscal } from './RegimenFiscal';

/**
 * Entidad Cliente/Receptor - Actualizada para CFDI 4.0
 */
@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  // Datos Fiscales (OBLIGATORIOS)
  @Column({ length: 13, unique: true })
  rfc: string;

  @Column({ length: 200 })
  razonSocial: string;

  @Column({ length: 200, nullable: true })
  nombreComercial: string;

  // Régimen Fiscal del Receptor (OBLIGATORIO CFDI 4.0)
  @Column({ length: 3, default: '612' })
  regimenFiscalClave: string;

  @ManyToOne(() => RegimenFiscal)
  @JoinColumn({ name: 'regimenFiscalClave' })
  regimenFiscal: RegimenFiscal;

  // Domicilio Fiscal (OBLIGATORIO CFDI 4.0)
  @Column({ length: 5, default: '00000' })
  codigoPostal: string; // Código postal del domicilio fiscal

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

  @Column({ length: 50, default: 'México', nullable: true })
  pais: string;

  // Datos de Contacto
  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 20, nullable: true })
  celular: string;

  // Datos Administrativos
  @Column({ type: 'int', default: 0, nullable: true })
  diasCredito: number; // Días de crédito para facturación

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, nullable: true })
  limiteCredito: number;

  @Column({ length: 100, nullable: true })
  contactoPrincipal: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  // Estado
  @Column({ type: 'bit', default: true })
  activo: boolean;

  // Relaciones
  @OneToMany(() => Factura, factura => factura.cliente)
  facturas: Factura[];

  // Auditoría
  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
}
