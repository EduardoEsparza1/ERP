import { AppDataSource } from '../config/database';
import { CatalogoSAT } from '../entities/CatalogoSAT';

export class CatalogoSATService {
  private catalogoRepository = AppDataSource.getRepository(CatalogoSAT);

  async obtenerCatalogo(activos?: boolean): Promise<CatalogoSAT[]> {
    const where: any = {};
    if (activos !== undefined) {
      where.activo = activos;
    }
    return await this.catalogoRepository.find({
      where,
      order: { descripcion: 'ASC' },
    });
  }

  async buscarPorClave(clave: string): Promise<CatalogoSAT | null> {
    return await this.catalogoRepository.findOne({ where: { clave } });
  }

  async buscarPorDescripcion(termino: string): Promise<CatalogoSAT[]> {
    return await this.catalogoRepository
      .createQueryBuilder('catalogo')
      .where('catalogo.descripcion LIKE :termino', { termino: `%${termino}%` })
      .andWhere('catalogo.activo = :activo', { activo: true })
      .orderBy('catalogo.descripcion', 'ASC')
      .getMany();
  }
}





