import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.util';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }

  async register(username: string, password: string, email: string, nombre: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error('El usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      nombre,
    });

    await this.userRepository.save(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }

  async getUserById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return null;
  }
}





