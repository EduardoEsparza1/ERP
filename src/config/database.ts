import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Nomina } from '../entities/Nomina';
import { Finanza } from '../entities/Finanza';
import { Cliente } from '../entities/Cliente';
import { Factura } from '../entities/Factura';
import { ConceptoFactura } from '../entities/ConceptoFactura';
import { CatalogoSAT } from '../entities/CatalogoSAT';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'sqlite' | 'postgres' | 'mssql',
  database: process.env.DB_DATABASE || './database.sqlite',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: true, // En producción usar migraciones
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Nomina, Finanza, Cliente, Factura, ConceptoFactura, CatalogoSAT],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Para Azure SQL
    trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true', // Para desarrollo local
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada correctamente');
    
    // Crear usuario por defecto si no existe
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newUser = userRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@sistema.com',
        nombre: 'Administrador',
      });
      await userRepository.save(newUser);
      console.log('✅ Usuario administrador creado (admin/admin123)');
    }

    // Inicializar catálogo SAT con códigos comunes
    const catalogoRepository = AppDataSource.getRepository(CatalogoSAT);
    const catalogoCount = await catalogoRepository.count();
    
    if (catalogoCount === 0) {
      const codigosSAT = [
        { clave: '01010101', descripcion: 'No existe en el catálogo', categoria: 'Producto', activo: true },
        { clave: '84111506', descripcion: 'Servicios de contabilidad, auditoría y servicios relacionados', categoria: 'Servicio', activo: true },
        { clave: '84111507', descripcion: 'Servicios de consultoría en administración', categoria: 'Servicio', activo: true },
        { clave: '84111511', descripcion: 'Servicios de consultoría en administración financiera', categoria: 'Servicio', activo: true },
        { clave: '84111512', descripcion: 'Servicios de consultoría en administración de tecnología de la información', categoria: 'Servicio', activo: true },
        { clave: '84111513', descripcion: 'Servicios de consultoría en administración de proyectos', categoria: 'Servicio', activo: true },
        { clave: '84111516', descripcion: 'Servicios de consultoría en administración de riesgos', categoria: 'Servicio', activo: true },
        { clave: '80141600', descripcion: 'Servicios de desarrollo de software', categoria: 'Servicio', activo: true },
        { clave: '80141601', descripcion: 'Servicios de programación de software', categoria: 'Servicio', activo: true },
        { clave: '80141602', descripcion: 'Servicios de diseño de software', categoria: 'Servicio', activo: true },
        { clave: '80141603', descripcion: 'Servicios de pruebas de software', categoria: 'Servicio', activo: true },
        { clave: '80141604', descripcion: 'Servicios de mantenimiento de software', categoria: 'Servicio', activo: true },
        { clave: '80141605', descripcion: 'Servicios de consultoría en software', categoria: 'Servicio', activo: true },
        { clave: '80141607', descripcion: 'Servicios de capacitación en software', categoria: 'Servicio', activo: true },
        { clave: '80141608', descripcion: 'Servicios de soporte técnico de software', categoria: 'Servicio', activo: true },
        { clave: '80141610', descripcion: 'Servicios de migración de software', categoria: 'Servicio', activo: true },
        { clave: '80141611', descripcion: 'Servicios de integración de software', categoria: 'Servicio', activo: true },
        { clave: '80141612', descripcion: 'Servicios de personalización de software', categoria: 'Servicio', activo: true },
        { clave: '80141613', descripcion: 'Servicios de implementación de software', categoria: 'Servicio', activo: true },
        { clave: '80141617', descripcion: 'Servicios de seguridad de software', categoria: 'Servicio', activo: true },
        { clave: '84111508', descripcion: 'Servicios de consultoría en administración de recursos humanos', categoria: 'Servicio', activo: true },
        { clave: '84111510', descripcion: 'Servicios de consultoría en administración de ventas', categoria: 'Servicio', activo: true },
        { clave: '84111514', descripcion: 'Servicios de consultoría en administración de calidad', categoria: 'Servicio', activo: true },
        { clave: '84111520', descripcion: 'Servicios de consultoría en administración de cadena de suministro', categoria: 'Servicio', activo: true },
        { clave: '84111528', descripcion: 'Servicios de consultoría en administración de transformación digital', categoria: 'Servicio', activo: true },
        { clave: '84111530', descripcion: 'Servicios de consultoría en administración de datos', categoria: 'Servicio', activo: true },
        { clave: '84111532', descripcion: 'Servicios de consultoría en administración de inteligencia de negocio', categoria: 'Servicio', activo: true },
        { clave: '84111533', descripcion: 'Servicios de consultoría en administración de automatización', categoria: 'Servicio', activo: true },
        { clave: '84111545', descripcion: 'Servicios de consultoría en administración de inteligencia artificial', categoria: 'Servicio', activo: true },
        { clave: '84111549', descripcion: 'Servicios de consultoría en administración de ciberseguridad', categoria: 'Servicio', activo: true },
      ];

      for (const codigo of codigosSAT) {
        const existe = await catalogoRepository.findOne({ where: { clave: codigo.clave } });
        if (!existe) {
          await catalogoRepository.save(catalogoRepository.create(codigo));
        }
      }
      console.log('✅ Catálogo SAT inicializado');
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

