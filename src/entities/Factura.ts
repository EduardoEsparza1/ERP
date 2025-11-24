import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';
import { User } from './User';
import { ConceptoFactura } from './ConceptoFactura';

export enum EstadoFactura {
  BORRADOR = 'borrador',
  TIMBRADA = 'timbrada',
  CANCELADA = 'cancelada',
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  PAGADA = 'pagada',
}

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  folio!: string; // Se genera automáticamente

  @Column()
  serie!: string;

  @ManyToOne(() => Cliente)
  @JoinColumn()
  cliente!: Cliente;

  @Column({ type: 'date' })
  fechaEmision!: Date;

  @Column({ type: 'date' })
  fechaVencimiento!: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  iva!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column({
    type: 'simple-enum',
    enum: EstadoFactura,
    default: EstadoFactura.BORRADOR,
  })
  estadoFactura!: EstadoFactura;

  @Column({
    type: 'simple-enum',
    enum: EstadoPago,
    default: EstadoPago.PENDIENTE,
  })
  estadoPago!: EstadoPago;

  @Column({ nullable: true })
  uuid!: string; // UUID del timbrado CFDI

  @Column({ nullable: true })
  xml!: string; // XML del CFDI timbrado

  @Column({ nullable: true })
  fechaTimbrado!: Date;

  @Column({ type: 'text', nullable: true })
  observaciones!: string;

  @OneToMany(() => ConceptoFactura, concepto => concepto.factura, { cascade: true })
  conceptos!: ConceptoFactura[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montoPagado!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  saldoPendiente!: number;

  @ManyToOne(() => User)
  @JoinColumn()
  usuarioCreacion!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

