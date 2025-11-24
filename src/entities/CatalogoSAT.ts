import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('catalogo_sat')
export class CatalogoSAT {
  @PrimaryColumn()
  clave!: string; // Clave del producto/servicio

  @Column()
  descripcion!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ nullable: true })
  categoria!: string; // Producto o Servicio
}





