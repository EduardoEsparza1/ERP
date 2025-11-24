import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('finanzas')
export class Finanza {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  concepto!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto!: number;

  @Column()
  tipo!: string; // ingreso, gasto

  @Column()
  categoria!: string; // ventas, servicios, salarios, etc.

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ nullable: true })
  descripcion!: string;

  @ManyToOne(() => User)
  usuarioCreacion!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}





