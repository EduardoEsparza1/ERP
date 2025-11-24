import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Factura } from './Factura';
import { CatalogoSAT } from './CatalogoSAT';

@Entity('conceptos_factura')
export class ConceptoFactura {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Factura, factura => factura.conceptos, { onDelete: 'CASCADE' })
  @JoinColumn()
  factura!: Factura;

  @ManyToOne(() => CatalogoSAT)
  @JoinColumn()
  catalogoSAT!: CatalogoSAT;

  @Column()
  claveProductoServicio!: string; // Clave del catálogo SAT

  @Column()
  descripcion!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  importe!: number; // cantidad * precioUnitario

  @Column({ default: false })
  tieneImpuesto!: boolean;

  @Column({ nullable: true })
  tipoImpuesto!: string; // 002 = IVA, 003 = IEPS, etc.

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tasaImpuesto!: number; // Porcentaje del impuesto (ej: 16 para IVA)

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  importeImpuesto!: number;

  @Column({ nullable: true })
  unidadMedida!: string; // H87 = Pieza, MTR = Metro, etc.

  @CreateDateColumn()
  createdAt!: Date;
}





