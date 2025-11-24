import { AppDataSource } from '../config/database';
import { Nomina } from '../entities/Nomina';
import { User } from '../entities/User';

export class NominaService {
  private nominaRepository = AppDataSource.getRepository(Nomina);
  private userRepository = AppDataSource.getRepository(User);

  async crearNomina(
    empleadoNombre: string,
    salario: number,
    deducciones: number,
    bonificaciones: number,
    periodo: string,
    userId: number
  ): Promise<Nomina> {
    const total = salario - deducciones + bonificaciones;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const nomina = this.nominaRepository.create({
      empleadoNombre,
      salario,
      deducciones,
      bonificaciones,
      total,
      periodo,
      estado: 'pendiente',
      usuarioCreacion: user,
    });

    return await this.nominaRepository.save(nomina);
  }

  async obtenerNominas(): Promise<Nomina[]> {
    return await this.nominaRepository.find({
      relations: ['usuarioCreacion'],
      order: { createdAt: 'DESC' },
    });
  }

  async obtenerNominaPorId(id: number): Promise<Nomina | null> {
    return await this.nominaRepository.findOne({
      where: { id },
      relations: ['usuarioCreacion'],
    });
  }

  async actualizarNomina(id: number, datos: Partial<Nomina>): Promise<Nomina> {
    const nomina = await this.nominaRepository.findOne({ where: { id } });

    if (!nomina) {
      throw new Error('Nómina no encontrada');
    }

    if (datos.salario || datos.deducciones || datos.bonificaciones) {
      const salario = datos.salario ?? nomina.salario;
      const deducciones = datos.deducciones ?? nomina.deducciones;
      const bonificaciones = datos.bonificaciones ?? nomina.bonificaciones;
      datos.total = salario - deducciones + bonificaciones;
    }

    Object.assign(nomina, datos);
    return await this.nominaRepository.save(nomina);
  }

  async eliminarNomina(id: number): Promise<void> {
    const result = await this.nominaRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Nómina no encontrada');
    }
  }
}





