import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Nomina } from '../entities/Nomina';
import { Finanza } from '../entities/Finanza';
import { Cliente } from '../entities/Cliente';
import { Factura } from '../entities/Factura';
import { ConceptoFactura } from '../entities/ConceptoFactura';
import { CatalogoSAT } from '../entities/CatalogoSAT';
import { ImpuestoConcepto } from '../entities/ImpuestoConcepto';
import { Empresa } from '../entities/Empresa';
import { FormaPago } from '../entities/FormaPago';
import { MetodoPago } from '../entities/MetodoPago';
import { UsoCFDI } from '../entities/UsoCFDI';
import { Moneda } from '../entities/Moneda';
import { RegimenFiscal } from '../entities/RegimenFiscal';
import { ClaveUnidad } from '../entities/ClaveUnidad';
import { ObjetoImpuesto } from '../entities/ObjetoImpuesto';
import { TipoImpuesto } from '../entities/TipoImpuesto';
import { TipoFactor } from '../entities/TipoFactor';
import * as catalogosSAT from '../seeds/catalogosSAT.seed';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuración para manejar host e instancia
const dbHost = process.env.DB_HOST || 'localhost';
const hostParts = dbHost.split('\\');
const server = hostParts[0];
const instance = hostParts[1];

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as 'sqlite' | 'postgres' | 'mssql',
  database: process.env.DB_DATABASE || './database.sqlite',
  host: server,
  port: instance ? undefined : parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: true, // En producción usar migraciones
  logging: process.env.NODE_ENV === 'development',
  entities: [
    // Entidades de usuarios y sistema
    User,
    Nomina,
    Finanza,
    // Entidades CFDI principales
    Empresa,
    Cliente,
    Factura,
    ConceptoFactura,
    ImpuestoConcepto,
    CatalogoSAT,
    // Catálogos SAT CFDI 4.0
    FormaPago,
    MetodoPago,
    UsoCFDI,
    Moneda,
    RegimenFiscal,
    ClaveUnidad,
    ObjetoImpuesto,
    TipoImpuesto,
    TipoFactor,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  extra: {
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
      ...(instance && { instanceName: instance }),
    },
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
      console.log('Usuario administrador creado (admin/admin123)');
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
      console.log('Catálogo SAT inicializado');
    }

    // Cargar catálogos SAT CFDI 4.0
    await cargarCatalogosSAT();

  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

async function cargarCatalogosSAT(): Promise<void> {
  console.log('🔄 Cargando catálogos SAT CFDI 4.0...');

  // Formas de Pago
  const formaPagoRepo = AppDataSource.getRepository(FormaPago);
  const countFormasPago = await formaPagoRepo.count();
  if (countFormasPago === 0) {
    for (const fp of catalogosSAT.formasPago) {
      await formaPagoRepo.save(formaPagoRepo.create(fp));
    }
    console.log(`✅ ${catalogosSAT.formasPago.length} formas de pago cargadas`);
  }

  // Métodos de Pago
  const metodoPagoRepo = AppDataSource.getRepository(MetodoPago);
  const countMetodosPago = await metodoPagoRepo.count();
  if (countMetodosPago === 0) {
    for (const mp of catalogosSAT.metodosPago) {
      await metodoPagoRepo.save(metodoPagoRepo.create(mp));
    }
    console.log(`✅ ${catalogosSAT.metodosPago.length} métodos de pago cargados`);
  }

  // Usos CFDI
  const usoCFDIRepo = AppDataSource.getRepository(UsoCFDI);
  const countUsos = await usoCFDIRepo.count();
  if (countUsos === 0) {
    for (const uso of catalogosSAT.usosCFDI) {
      await usoCFDIRepo.save(usoCFDIRepo.create(uso));
    }
    console.log(`✅ ${catalogosSAT.usosCFDI.length} usos CFDI cargados`);
  }

  // Monedas
  const monedaRepo = AppDataSource.getRepository(Moneda);
  const countMonedas = await monedaRepo.count();
  if (countMonedas === 0) {
    for (const moneda of catalogosSAT.monedas) {
      await monedaRepo.save(monedaRepo.create(moneda));
    }
    console.log(`✅ ${catalogosSAT.monedas.length} monedas cargadas`);
  }

  // Regímenes Fiscales
  const regimenRepo = AppDataSource.getRepository(RegimenFiscal);
  const countRegimenes = await regimenRepo.count();
  if (countRegimenes === 0) {
    for (const regimen of catalogosSAT.regimenesFiscales) {
      await regimenRepo.save(regimenRepo.create(regimen));
    }
    console.log(`✅ ${catalogosSAT.regimenesFiscales.length} regímenes fiscales cargados`);
  }

  // Claves de Unidad
  const claveUnidadRepo = AppDataSource.getRepository(ClaveUnidad);
  const countUnidades = await claveUnidadRepo.count();
  if (countUnidades === 0) {
    for (const unidad of catalogosSAT.clavesUnidad) {
      await claveUnidadRepo.save(claveUnidadRepo.create(unidad));
    }
    console.log(`✅ ${catalogosSAT.clavesUnidad.length} claves de unidad cargadas`);
  }

  // Objetos de Impuesto
  const objetoImpuestoRepo = AppDataSource.getRepository(ObjetoImpuesto);
  const countObjetos = await objetoImpuestoRepo.count();
  if (countObjetos === 0) {
    for (const objeto of catalogosSAT.objetosImpuesto) {
      await objetoImpuestoRepo.save(objetoImpuestoRepo.create(objeto));
    }
    console.log(`✅ ${catalogosSAT.objetosImpuesto.length} objetos de impuesto cargados`);
  }

  // Tipos de Impuesto
  const tipoImpuestoRepo = AppDataSource.getRepository(TipoImpuesto);
  const countTipos = await tipoImpuestoRepo.count();
  if (countTipos === 0) {
    for (const tipo of catalogosSAT.tiposImpuesto) {
      await tipoImpuestoRepo.save(tipoImpuestoRepo.create(tipo));
    }
    console.log(`✅ ${catalogosSAT.tiposImpuesto.length} tipos de impuesto cargados`);
  }

  // Tipos de Factor
  const tipoFactorRepo = AppDataSource.getRepository(TipoFactor);
  const countFactores = await tipoFactorRepo.count();
  if (countFactores === 0) {
    for (const factor of catalogosSAT.tiposFactor) {
      await tipoFactorRepo.save(tipoFactorRepo.create(factor));
    }
    console.log(`✅ ${catalogosSAT.tiposFactor.length} tipos de factor cargados`);
  }

  console.log('✅ Catálogos SAT CFDI 4.0 cargados correctamente');
}

