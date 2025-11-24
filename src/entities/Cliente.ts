import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Factura } from './Factura';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  rfc!: string;

  @Column()
  razonSocial!: string;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ nullable: true })
  telefono!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Factura, factura => factura.cliente)
  facturas!: Factura[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}





