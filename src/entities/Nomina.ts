import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('nominas')
export class Nomina {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  empleadoNombre!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salario!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deducciones!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  bonificaciones!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column()
  periodo!: string; // Ejemplo: "2024-01"

  @Column({ default: 'pendiente' })
  estado!: string; // pendiente, procesada, pagada

  @ManyToOne(() => User)
  usuarioCreacion!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}





