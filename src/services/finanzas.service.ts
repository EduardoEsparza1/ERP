import { AppDataSource } from '../config/database';
import { Finanza } from '../entities/Finanza';
import { User } from '../entities/User';

export class FinanzasService {
  private finanzaRepository = AppDataSource.getRepository(Finanza);
  private userRepository = AppDataSource.getRepository(User);

  async crearFinanza(
    concepto: string,
    monto: number,
    tipo: 'ingreso' | 'gasto',
    categoria: string,
    fecha: Date,
    descripcion: string,
    userId: number
  ): Promise<Finanza> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const finanza = this.finanzaRepository.create({
      concepto,
      monto,
      tipo,
      categoria,
      fecha,
      descripcion,
      usuarioCreacion: user,
    });

    return await this.finanzaRepository.save(finanza);
  }

  async obtenerFinanzas(): Promise<Finanza[]> {
    return await this.finanzaRepository.find({
      relations: ['usuarioCreacion'],
      order: { fecha: 'DESC' },
    });
  }

  async obtenerFinanzaPorId(id: number): Promise<Finanza | null> {
    return await this.finanzaRepository.findOne({
      where: { id },
      relations: ['usuarioCreacion'],
    });
  }

  async obtenerResumen(): Promise<{
    totalIngresos: number;
    totalGastos: number;
    balance: number;
  }> {
    const finanzas = await this.finanzaRepository.find();
    
    const totalIngresos = finanzas
      .filter((f: Finanza) => f.tipo === 'ingreso')
      .reduce((sum: number, f: Finanza) => sum + Number(f.monto), 0);

    const totalGastos = finanzas
      .filter((f: Finanza) => f.tipo === 'gasto')
      .reduce((sum: number, f: Finanza) => sum + Number(f.monto), 0);

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
    };
  }

  async actualizarFinanza(id: number, datos: Partial<Finanza>): Promise<Finanza> {
    const finanza = await this.finanzaRepository.findOne({ where: { id } });

    if (!finanza) {
      throw new Error('Finanza no encontrada');
    }

    Object.assign(finanza, datos);
    return await this.finanzaRepository.save(finanza);
  }

  async eliminarFinanza(id: number): Promise<void> {
    const result = await this.finanzaRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Finanza no encontrada');
    }
  }
}

