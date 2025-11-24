import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        return;
      }

      const result = await authService.login(username, password);

      res.json({
        message: 'Login exitoso',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : 'Error en el login',
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, email, nombre } = req.body;

      if (!username || !password || !email || !nombre) {
        res.status(400).json({ message: 'Todos los campos son requeridos' });
        return;
      }

      const user = await authService.register(username, password, email, nombre);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user,
      });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear usuario',
      });
    }
  }

  async getProfile(req: Request & { user?: { userId: number } }, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al obtener perfil',
      });
    }
  }
}





