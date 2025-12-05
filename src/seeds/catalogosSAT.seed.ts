/**
 * Seeds para Catálogos SAT CFDI 4.0
 * Fuente: Anexo 20 - Guía de llenado de los comprobantes fiscales digitales por Internet
 */

export const formasPago = [
  { clave: '01', descripcion: 'Efectivo', activo: true },
  { clave: '02', descripcion: 'Cheque nominativo', activo: true },
  { clave: '03', descripcion: 'Transferencia electrónica de fondos', activo: true },
  { clave: '04', descripcion: 'Tarjeta de crédito', activo: true },
  { clave: '05', descripcion: 'Monedero electrónico', activo: true },
  { clave: '06', descripcion: 'Dinero electrónico', activo: true },
  { clave: '08', descripcion: 'Vales de despensa', activo: true },
  { clave: '12', descripcion: 'Dación en pago', activo: true },
  { clave: '13', descripcion: 'Pago por subrogación', activo: true },
  { clave: '14', descripcion: 'Pago por consignación', activo: true },
  { clave: '15', descripcion: 'Condonación', activo: true },
  { clave: '17', descripcion: 'Compensación', activo: true },
  { clave: '23', descripcion: 'Novación', activo: true },
  { clave: '24', descripcion: 'Confusión', activo: true },
  { clave: '25', descripcion: 'Remisión de deuda', activo: true },
  { clave: '26', descripcion: 'Prescripción o caducidad', activo: true },
  { clave: '27', descripcion: 'A satisfacción del acreedor', activo: true },
  { clave: '28', descripcion: 'Tarjeta de débito', activo: true },
  { clave: '29', descripcion: 'Tarjeta de servicios', activo: true },
  { clave: '30', descripcion: 'Aplicación de anticipos', activo: true },
  { clave: '31', descripcion: 'Intermediario pagos', activo: true },
  { clave: '99', descripcion: 'Por definir', activo: true },
];

export const metodosPago = [
  { clave: 'PUE', descripcion: 'Pago en una sola exhibición', activo: true },
  { clave: 'PPD', descripcion: 'Pago en parcialidades o diferido', activo: true },
];

export const usosCFDI = [
  { clave: 'G01', descripcion: 'Adquisición de mercancías', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'G03', descripcion: 'Gastos en general', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I01', descripcion: 'Construcciones', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I02', descripcion: 'Mobiliario y equipo de oficina por inversiones', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I03', descripcion: 'Equipo de transporte', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I04', descripcion: 'Equipo de cómputo y accesorios', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I05', descripcion: 'Dados, troqueles, moldes, matrices y herramental', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I06', descripcion: 'Comunicaciones telefónicas', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I07', descripcion: 'Comunicaciones satelitales', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'I08', descripcion: 'Otra maquinaria y equipo', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'D01', descripcion: 'Honorarios médicos, dentales y gastos hospitalarios', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D02', descripcion: 'Gastos médicos por incapacidad o discapacidad', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D03', descripcion: 'Gastos funerales', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D04', descripcion: 'Donativos', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D05', descripcion: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D06', descripcion: 'Aportaciones voluntarias al SAR', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D07', descripcion: 'Primas por seguros de gastos médicos', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D08', descripcion: 'Gastos de transportación escolar obligatoria', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D09', descripcion: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'D10', descripcion: 'Pagos por servicios educativos (colegiaturas)', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: 'S01', descripcion: 'Sin efectos fiscales', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'CP01', descripcion: 'Pagos', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: 'CN01', descripcion: 'Nómina', aplicaFisica: true, aplicaMoral: true, activo: true },
];

export const monedas = [
  { clave: 'MXN', descripcion: 'Peso Mexicano', decimales: 2, porcentajeVariacion: 0, activo: true },
  { clave: 'USD', descripcion: 'Dólar americano', decimales: 2, porcentajeVariacion: 10, activo: true },
  { clave: 'EUR', descripcion: 'Euro', decimales: 2, porcentajeVariacion: 10, activo: true },
  { clave: 'GBP', descripcion: 'Libra Esterlina', decimales: 2, porcentajeVariacion: 10, activo: true },
  { clave: 'JPY', descripcion: 'Yen', decimales: 2, porcentajeVariacion: 10, activo: true },
  { clave: 'CAD', descripcion: 'Dólar Canadiense', decimales: 2, porcentajeVariacion: 10, activo: true },
  { clave: 'XXX', descripcion: 'Los códigos asignados para las transacciones en que intervenga ninguna moneda', decimales: 0, porcentajeVariacion: 0, activo: true },
];

export const regimenesFiscales = [
  { clave: '601', descripcion: 'General de Ley Personas Morales', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '603', descripcion: 'Personas Morales con Fines no Lucrativos', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '606', descripcion: 'Arrendamiento', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '607', descripcion: 'Régimen de Enajenación o Adquisición de Bienes', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '608', descripcion: 'Demás ingresos', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '610', descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México', aplicaFisica: true, aplicaMoral: true, activo: true },
  { clave: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '614', descripcion: 'Ingresos por intereses', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '615', descripcion: 'Régimen de los ingresos por obtención de premios', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '616', descripcion: 'Sin obligaciones fiscales', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '620', descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '621', descripcion: 'Incorporación Fiscal', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '622', descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '623', descripcion: 'Opcional para Grupos de Sociedades', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '624', descripcion: 'Coordinados', aplicaFisica: false, aplicaMoral: true, activo: true },
  { clave: '625', descripcion: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', aplicaFisica: true, aplicaMoral: false, activo: true },
  { clave: '626', descripcion: 'Régimen Simplificado de Confianza', aplicaFisica: true, aplicaMoral: true, activo: true },
];

export const clavesUnidad = [
  { clave: 'H87', nombre: 'Pieza', descripcion: 'Unidad de venta', simbolo: 'Pza', activo: true },
  { clave: 'E48', nombre: 'Unidad de servicio', descripcion: 'Unidad de servicio', simbolo: 'Serv', activo: true },
  { clave: 'ACT', nombre: 'Actividad', descripcion: 'Actividad', simbolo: 'Act', activo: true },
  { clave: 'KGM', nombre: 'Kilogramo', descripcion: 'Kilogramo', simbolo: 'kg', activo: true },
  { clave: 'GRM', nombre: 'Gramo', descripcion: 'Gramo', simbolo: 'g', activo: true },
  { clave: 'MTR', nombre: 'Metro', descripcion: 'Metro', simbolo: 'm', activo: true },
  { clave: 'LTR', nombre: 'Litro', descripcion: 'Litro', simbolo: 'l', activo: true },
  { clave: 'MTK', nombre: 'Metro cuadrado', descripcion: 'Metro cuadrado', simbolo: 'm²', activo: true },
  { clave: 'MTQ', nombre: 'Metro cúbico', descripcion: 'Metro cúbico', simbolo: 'm³', activo: true },
  { clave: 'HUR', nombre: 'Hora', descripcion: 'Hora', simbolo: 'h', activo: true },
  { clave: 'TNE', nombre: 'Tonelada', descripcion: 'Tonelada métrica', simbolo: 't', activo: true },
  { clave: 'XBX', nombre: 'Caja', descripcion: 'Caja', simbolo: 'Caja', activo: true },
  { clave: 'XPK', nombre: 'Paquete', descripcion: 'Paquete', simbolo: 'Paq', activo: true },
  { clave: 'SET', nombre: 'Conjunto', descripcion: 'Conjunto', simbolo: 'Set', activo: true },
  { clave: 'DAY', nombre: 'Día', descripcion: 'Día', simbolo: 'día', activo: true },
  { clave: 'MON', nombre: 'Mes', descripcion: 'Mes', simbolo: 'mes', activo: true },
  { clave: 'ANN', nombre: 'Año', descripcion: 'Año', simbolo: 'año', activo: true },
];

export const objetosImpuesto = [
  { clave: '01', descripcion: 'No objeto de impuesto', activo: true },
  { clave: '02', descripcion: 'Sí objeto de impuesto', activo: true },
  { clave: '03', descripcion: 'Sí objeto del impuesto y no obligado al desglose', activo: true },
  { clave: '04', descripcion: 'Sí objeto del impuesto y no causa impuesto', activo: true },
];

export const tiposImpuesto = [
  { clave: '001', descripcion: 'ISR', retencion: true, traslado: false, activo: true },
  { clave: '002', descripcion: 'IVA', retencion: true, traslado: true, activo: true },
  { clave: '003', descripcion: 'IEPS', retencion: true, traslado: true, activo: true },
];

export const tiposFactor = [
  { clave: 'Tasa', descripcion: 'Tasa', activo: true },
  { clave: 'Cuota', descripcion: 'Cuota', activo: true },
  { clave: 'Exento', descripcion: 'Exento', activo: true },
];
