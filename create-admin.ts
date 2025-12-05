import 'reflect-metadata';
import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');

    const userRepository = AppDataSource.getRepository(User);

    // Verificar si el usuario admin ya existe
    let existingAdmin = await userRepository.findOne({ where: { username: 'admin' } });

    if (existingAdmin) {
      // Resetear contraseña del usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      await userRepository.save(existingAdmin);

      console.log('✅ Contraseña de admin reseteada exitosamente');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nombre: ${existingAdmin.nombre}`);
      console.log('   Password: admin123');
    } else {
      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@erp.com',
        nombre: 'Administrador'
      });

      await userRepository.save(admin);
      console.log('✅ Usuario admin creado exitosamente');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Email: admin@erp.com');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
