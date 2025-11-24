// Variables globales
let currentSection = 'nomina';
const API_URL = 'http://localhost:3000/api';

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario ya está logueado
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard();
    }

    // Event listener para el formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Event listeners para el menú lateral
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Event listener para cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Event listener para toggle del sidebar en móvil
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Cargar datos al cambiar de sección
    loadSectionData();

    // Listener para recalcular IVA cuando cambie el porcentaje
    const ivaPorcentajeInput = document.getElementById('facturaIvaPorcentaje');
    if (ivaPorcentajeInput) {
        ivaPorcentajeInput.addEventListener('input', calcularTotalFactura);
    }

    // Validación en tiempo real para campos del formulario de cliente
    const clienteRFC = document.getElementById('clienteRFC');
    if (clienteRFC) {
        // Convertir a mayúsculas mientras se escribe
        clienteRFC.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
        
        clienteRFC.addEventListener('blur', function() {
            validarRFC(this);
        });
    }

    const clienteEmail = document.getElementById('clienteEmail');
    if (clienteEmail) {
        clienteEmail.addEventListener('blur', function() {
            validarEmail(this);
        });
    }

    const clienteTelefono = document.getElementById('clienteTelefono');
    if (clienteTelefono) {
        // Limpiar cualquier carácter no numérico mientras se escribe
        clienteTelefono.addEventListener('input', function(e) {
            const valor = this.value.replace(/[^0-9]/g, '');
            if (this.value !== valor) {
                this.value = valor;
            }
            validarTelefono(this);
        });

        // Prevenir que se ingresen letras y otros caracteres no numéricos
        clienteTelefono.addEventListener('keydown', function(e) {
            // Permitir teclas de control (backspace, delete, tab, escape, enter, etc.)
            const teclasPermitidas = [
                8,   // Backspace
                9,   // Tab
                13,  // Enter
                27,  // Escape
                46,  // Delete
                35,  // End
                36,  // Home
                37,  // Left arrow
                38,  // Up arrow
                39,  // Right arrow
                40,  // Down arrow
                45,  // Insert
            ];

            // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if ((e.ctrlKey || e.metaKey) && (e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88)) {
                return true;
            }

            // Si es una tecla permitida, dejar pasar
            if (teclasPermitidas.indexOf(e.keyCode) !== -1) {
                return true;
            }

            // Si es un número (0-9) en el teclado principal o numérico, dejar pasar
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                return true;
            }

            // Bloquear cualquier otra tecla
            e.preventDefault();
            return false;
        });

        clienteTelefono.addEventListener('blur', function() {
            validarTelefono(this);
        });

        // Prevenir pegar texto no numérico
        clienteTelefono.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numeros = paste.replace(/[^0-9]/g, '');
            if (numeros) {
                this.value = numeros;
                validarTelefono(this);
            }
        });

        // Validación adicional en caso de que algo se escape
        clienteTelefono.addEventListener('keyup', function() {
            const valor = this.value.replace(/[^0-9]/g, '');
            if (this.value !== valor) {
                this.value = valor;
            }
        });
    }
});

// Función para hacer peticiones autenticadas
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            handleLogout();
            throw new Error('Sesión expirada');
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

// Función para manejar el login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Por favor, complete todos los campos');
        return;
    }

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showDashboard();
    } catch (error) {
        alert(error.message || 'Error al iniciar sesión');
    }
}

// Función para mostrar el dashboard
function showDashboard() {
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const currentUser = document.getElementById('currentUser');

    loginPage.classList.add('d-none');
    dashboardPage.classList.remove('d-none');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser) {
        currentUser.textContent = user.nombre || user.username || 'Usuario';
    }

    switchSection('nomina');
    loadSectionData();
}

// Función para cambiar de sección
function switchSection(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.add('d-none'));

    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === section) {
            item.classList.add('active');
        }
    });

    currentSection = section;
    loadSectionData();
}

// Función para cargar datos de la sección actual
async function loadSectionData() {
    try {
        if (currentSection === 'nomina') {
            const data = await apiRequest('/nomina');
            console.log('Nóminas:', data.nominas);
        } else if (currentSection === 'finanzas') {
            const data = await apiRequest('/finanzas');
            const resumen = await apiRequest('/finanzas/resumen');
            console.log('Finanzas:', data.finanzas);
            console.log('Resumen:', resumen.resumen);
        } else if (currentSection === 'clientes') {
            await cargarClientes();
        } else if (currentSection === 'facturas') {
            await cargarFacturas();
        } else if (currentSection === 'cartera') {
            await cargarCartera();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Función para cerrar sesión
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    dashboardPage.classList.add('d-none');
    loginPage.classList.remove('d-none');
    
    document.getElementById('loginForm').reset();
}

// Función para toggle del sidebar en móvil
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

// ==================== CLIENTES ====================

async function cargarClientes() {
    try {
        const data = await apiRequest('/clientes');
        const tbody = document.getElementById('clientesBody');
        
        if (data.clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay clientes registrados</td></tr>';
            return;
        }

        tbody.innerHTML = data.clientes.map(cliente => `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.rfc}</td>
                <td>${cliente.razonSocial}</td>
                <td>${cliente.email || '-'}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>
                    <span class="badge ${cliente.activo ? 'bg-success' : 'bg-secondary'}">
                        ${cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarCliente(${cliente.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${cliente.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('clientesBody').innerHTML = 
            `<tr><td colspan="7" class="text-center text-danger">Error al cargar clientes: ${error.message}</td></tr>`;
    }
}

function mostrarModalCliente(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
    const form = document.getElementById('formCliente');
    const title = document.getElementById('modalClienteTitle');
    
    form.reset();
    document.getElementById('clienteId').value = '';
    
    if (id) {
        title.textContent = 'Editar Cliente';
        cargarClienteParaEditar(id);
    } else {
        title.textContent = 'Nuevo Cliente';
    }
    
    modal.show();
}

async function cargarClienteParaEditar(id) {
    try {
        const data = await apiRequest(`/clientes/${id}`);
        const cliente = data.cliente;
        
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteRFC').value = cliente.rfc;
        document.getElementById('clienteRazonSocial').value = cliente.razonSocial;
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteEmail').value = cliente.email || '';
    } catch (error) {
        alert('Error al cargar cliente: ' + error.message);
    }
}

// ==================== VALIDACIONES ====================

function validarCampoRequerido(input) {
    if (input.value.trim() === '') {
        input.setCustomValidity('Este campo es requerido');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    } else {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        if (input.checkValidity()) {
            input.classList.add('is-valid');
        }
    }
}

function validarRFC(input) {
    const rfc = input.value.trim().toUpperCase();
    const rfcError = document.getElementById('rfcError');
    
    // Limpiar espacios y convertir a mayúsculas
    input.value = rfc;
    
    if (rfc === '') {
        input.setCustomValidity('El RFC es requerido');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (rfcError) rfcError.textContent = 'El RFC es requerido';
        return false;
    }

    // Validar RFC mexicano (12-13 caracteres) o extranjero/genérico (12 caracteres)
    // RFC mexicano: ABC123456789 o ABC123456789A (12-13 caracteres)
    // RFC extranjero/genérico: XEXX010101000 (12 caracteres, siempre empieza con X)
    
    let esValido = false;
    let mensajeError = '';

    if (rfc.length === 12) {
        // Puede ser RFC extranjero/genérico (XEXX010101000) o mexicano sin homoclave
        if (rfc.startsWith('XEXX')) {
            // RFC extranjero/genérico: XEXX + 8 dígitos
            const patronExtranjero = /^XEXX[0-9]{8}$/;
            if (patronExtranjero.test(rfc)) {
                esValido = true;
            } else {
                mensajeError = 'RFC extranjero/genérico inválido. Formato: XEXX010101000';
            }
        } else {
            // RFC mexicano sin homoclave: 3-4 letras + 6 dígitos + 3 caracteres alfanuméricos
            const patronMexicano = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
            if (patronMexicano.test(rfc)) {
                esValido = true;
            } else {
                mensajeError = 'RFC mexicano inválido. Formato: ABC123456789';
            }
        }
    } else if (rfc.length === 13) {
        // RFC mexicano de 13 caracteres puede tener dos formatos:
        // 1. 4 letras + 6 dígitos + 3 caracteres alfanuméricos (ej: PEEE990703BW5)
        // 2. 3-4 letras + 6 dígitos + 3 caracteres alfanuméricos + 1 carácter adicional (con homoclave)
        
        // Primero verificar si tiene 4 letras al inicio (formato: 4 letras + 6 dígitos + 3 alfanuméricos)
        const patronCon4Letras = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/;
        if (patronCon4Letras.test(rfc)) {
            esValido = true;
        } else {
            // Si no, verificar formato con homoclave adicional (3-4 letras + 6 dígitos + 3 alfanuméricos + 1 carácter)
            const patronConHomoclave = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}[A-Z0-9]$/;
            if (patronConHomoclave.test(rfc)) {
                esValido = true;
            } else {
                mensajeError = 'RFC mexicano inválido. Formato: ABC123456789 o PEEE990703BW5';
            }
        }
    } else {
        mensajeError = 'El RFC debe tener 12 caracteres (extranjero/genérico) o 12-13 caracteres (mexicano)';
    }

    if (esValido) {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        if (rfcError) rfcError.textContent = '';
    } else {
        input.setCustomValidity(mensajeError || 'RFC inválido');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (rfcError) rfcError.textContent = mensajeError || 'RFC inválido';
    }

    return esValido;
}

function validarEmail(input) {
    const email = input.value.trim();
    
    if (email === '') {
        // Email es opcional, así que si está vacío es válido
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
        return true;
    }

    // Patrón de validación de email
    const patronEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (patronEmail.test(email)) {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } else {
        input.setCustomValidity('Ingrese un formato de correo electrónico válido');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        return false;
    }
}

function validarTelefono(input) {
    const telefono = input.value.trim();
    
    if (telefono === '') {
        // Teléfono es opcional, así que si está vacío es válido
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
        return true;
    }

    // Solo números, entre 10 y 15 dígitos
    const patronTelefono = /^[0-9]{10,15}$/;
    
    if (patronTelefono.test(telefono)) {
        input.setCustomValidity('');
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    } else {
        input.setCustomValidity('El teléfono solo debe contener números (10-15 dígitos)');
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        return false;
    }
}

async function guardarCliente() {
    try {
        const form = document.getElementById('formCliente');
        
        // Obtener valores y validar campos requeridos
        const nombre = document.getElementById('clienteNombre').value.trim();
        const rfc = document.getElementById('clienteRFC').value.trim().toUpperCase();
        const razonSocial = document.getElementById('clienteRazonSocial').value.trim();
        const direccion = document.getElementById('clienteDireccion').value.trim();
        const telefono = document.getElementById('clienteTelefono').value.trim();
        const email = document.getElementById('clienteEmail').value.trim();

        // Validar campos requeridos
        if (!nombre || nombre.length < 2) {
            alert('El nombre es requerido y debe tener al menos 2 caracteres.');
            document.getElementById('clienteNombre').focus();
            return;
        }

        if (!rfc) {
            alert('El RFC es requerido.');
            document.getElementById('clienteRFC').focus();
            return;
        }

        if (!validarRFC(document.getElementById('clienteRFC'))) {
            document.getElementById('clienteRFC').focus();
            return;
        }

        if (!razonSocial || razonSocial.length < 3) {
            alert('La razón social es requerida y debe tener al menos 3 caracteres.');
            document.getElementById('clienteRazonSocial').focus();
            return;
        }

        // Validar email si se proporciona
        if (email && !validarEmail(document.getElementById('clienteEmail'))) {
            document.getElementById('clienteEmail').focus();
            return;
        }

        // Validar teléfono si se proporciona
        if (telefono && !validarTelefono(document.getElementById('clienteTelefono'))) {
            document.getElementById('clienteTelefono').focus();
            return;
        }

        // Si todas las validaciones pasan, proceder con el guardado
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const clienteData = {
            nombre: nombre,
            rfc: rfc,
            razonSocial: razonSocial,
            direccion: direccion || undefined,
            telefono: telefono || undefined,
            email: email || undefined,
        };

        const id = document.getElementById('clienteId').value;
        let data;

        if (id) {
            data = await apiRequest(`/clientes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(clienteData),
            });
        } else {
            data = await apiRequest('/clientes', {
                method: 'POST',
                body: JSON.stringify(clienteData),
            });
        }

        bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
        await cargarClientes();
        alert('Cliente guardado exitosamente');
    } catch (error) {
        alert('Error al guardar cliente: ' + error.message);
    }
}

async function editarCliente(id) {
    mostrarModalCliente(id);
}

async function eliminarCliente(id) {
    if (!confirm('¿Está seguro que desea eliminar este cliente?')) {
        return;
    }

    try {
        await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
        await cargarClientes();
        alert('Cliente eliminado exitosamente');
    } catch (error) {
        alert('Error al eliminar cliente: ' + error.message);
    }
}

// ==================== FACTURAS ====================

async function cargarFacturas() {
    try {
        const estadoFactura = document.getElementById('filtroEstadoFactura').value;
        const estadoPago = document.getElementById('filtroEstadoPago').value;
        
        let url = '/facturas?';
        if (estadoFactura) url += `estadoFactura=${estadoFactura}&`;
        if (estadoPago) url += `estadoPago=${estadoPago}&`;

        const data = await apiRequest(url);
        const tbody = document.getElementById('facturasBody');
        
        if (data.facturas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay facturas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = data.facturas.map(factura => {
            const fechaEmision = new Date(factura.fechaEmision).toLocaleDateString();
            const estadoFacturaBadge = {
                'borrador': 'bg-secondary',
                'timbrada': 'bg-success',
                'cancelada': 'bg-danger'
            }[factura.estadoFactura] || 'bg-secondary';
            
            const estadoPagoBadge = {
                'pendiente': 'bg-warning',
                'parcial': 'bg-info',
                'pagada': 'bg-success'
            }[factura.estadoPago] || 'bg-secondary';

            return `
                <tr>
                    <td>${factura.serie}-${factura.folio}</td>
                    <td>${factura.cliente.nombre}</td>
                    <td>${fechaEmision}</td>
                    <td>$${parseFloat(factura.total).toFixed(2)}</td>
                    <td><span class="badge ${estadoFacturaBadge}">${factura.estadoFactura}</span></td>
                    <td><span class="badge ${estadoPagoBadge}">${factura.estadoPago}</span></td>
                    <td>$${parseFloat(factura.saldoPendiente).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="verFactura(${factura.id})" title="Ver">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${factura.estadoFactura === 'borrador' ? `
                            <button class="btn btn-sm btn-success" onclick="timbrarFactura(${factura.id})" title="Timbrar">
                                <i class="bi bi-stamp"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="editarFactura(${factura.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarFactura(${factura.id})" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                        ${factura.estadoPago !== 'pagada' ? `
                            <button class="btn btn-sm btn-warning" onclick="registrarPagoFactura(${factura.id})" title="Registrar Pago">
                                <i class="bi bi-cash-coin"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        document.getElementById('facturasBody').innerHTML = 
            `<tr><td colspan="8" class="text-center text-danger">Error al cargar facturas: ${error.message}</td></tr>`;
    }
}

// Variables globales para facturas
let catalogoSAT = [];
let conceptoIndex = 0;

async function cargarCatalogoSAT() {
    try {
        const data = await apiRequest('/catalogo-sat?activos=true');
        catalogoSAT = data.catalogo;
    } catch (error) {
        console.error('Error al cargar catálogo SAT:', error);
        catalogoSAT = [];
    }
}

async function cargarClientesParaFactura() {
    try {
        const data = await apiRequest('/clientes?activos=true');
        const select = document.getElementById('facturaClienteId');
        select.innerHTML = '<option value="">Seleccione un cliente</option>';
        data.clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nombre} - ${cliente.rfc}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

function mostrarModalFactura(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('modalFactura'));
    const form = document.getElementById('formFactura');
    const title = document.getElementById('modalFacturaTitle');
    
    form.reset();
    document.getElementById('facturaId').value = '';
    document.getElementById('conceptosContainer').innerHTML = '';
    conceptoIndex = 0;
    
    // Establecer fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('facturaFechaEmision').value = hoy;
    
    // Fecha de vencimiento en 30 días
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 30);
    document.getElementById('facturaFechaVencimiento').value = vencimiento.toISOString().split('T')[0];
    
    // Limpiar folio
    document.getElementById('facturaFolio').value = '';
    
    cargarClientesParaFactura();
    cargarCatalogoSAT().then(() => {
        // Agregar primer concepto por defecto
        agregarConcepto();
    });
    
    if (id) {
        title.textContent = 'Editar Factura';
        cargarFacturaParaEditar(id);
    } else {
        title.textContent = 'Nueva Factura';
    }
    
    modal.show();
}

async function cargarFacturaParaEditar(id) {
    try {
        const data = await apiRequest(`/facturas/${id}`);
        const factura = data.factura;
        
        document.getElementById('facturaId').value = factura.id;
        document.getElementById('facturaClienteId').value = factura.cliente.id;
        document.getElementById('facturaSerie').value = factura.serie;
        document.getElementById('facturaFolio').value = factura.folio;
        document.getElementById('facturaFechaEmision').value = factura.fechaEmision.split('T')[0];
        document.getElementById('facturaFechaVencimiento').value = factura.fechaVencimiento.split('T')[0];
        document.getElementById('facturaObservaciones').value = factura.observaciones || '';
        
        // Limpiar conceptos existentes
        document.getElementById('conceptosContainer').innerHTML = '';
        conceptoIndex = 0;
        
        // Cargar conceptos
        if (factura.conceptos && factura.conceptos.length > 0) {
            factura.conceptos.forEach(concepto => {
                agregarConcepto(concepto);
            });
        } else {
            agregarConcepto();
        }
        
        calcularTotalesFactura();
    } catch (error) {
        alert('Error al cargar factura: ' + error.message);
    }
}

function agregarConcepto(conceptoData = null) {
    const template = document.getElementById('templateConcepto');
    const clone = template.content.cloneNode(true);
    const conceptoItem = clone.querySelector('.concepto-item');
    
    conceptoIndex++;
    conceptoItem.setAttribute('data-concepto-index', conceptoIndex);
    conceptoItem.querySelector('.concepto-numero').textContent = conceptoIndex;
    
    // Cargar catálogo SAT en el select
    const selectCodigoSAT = conceptoItem.querySelector('.concepto-codigo-sat');
    selectCodigoSAT.innerHTML = '<option value="">Seleccione código SAT</option>';
    catalogoSAT.forEach(item => {
        selectCodigoSAT.innerHTML += `<option value="${item.clave}">${item.clave} - ${item.descripcion}</option>`;
    });
    
    // Si hay datos del concepto, llenarlos
    if (conceptoData) {
        selectCodigoSAT.value = conceptoData.claveProductoServicio;
        conceptoItem.querySelector('.concepto-descripcion').value = conceptoData.descripcion;
        conceptoItem.querySelector('.concepto-cantidad').value = conceptoData.cantidad;
        conceptoItem.querySelector('.concepto-precio-unitario').value = conceptoData.precioUnitario;
        conceptoItem.querySelector('.concepto-importe').value = conceptoData.importe;
        conceptoItem.querySelector('.concepto-tiene-impuesto').value = conceptoData.tieneImpuesto ? 'true' : 'false';
        
        if (conceptoData.tieneImpuesto) {
            toggleImpuestoConcepto(conceptoItem.querySelector('.concepto-tiene-impuesto'));
            conceptoItem.querySelector('.concepto-tipo-impuesto').value = conceptoData.tipoImpuesto || '002';
            conceptoItem.querySelector('.concepto-tasa-impuesto').value = conceptoData.tasaImpuesto || 16;
            conceptoItem.querySelector('.concepto-importe-impuesto').value = conceptoData.importeImpuesto || 0;
        }
    }
    
    document.getElementById('conceptosContainer').appendChild(clone);
    
    // Si no hay datos, calcular el concepto nuevo
    if (!conceptoData) {
        calcularConcepto(conceptoItem.querySelector('.concepto-cantidad'));
    }
}

function eliminarConcepto(button) {
    const conceptoItem = button.closest('.concepto-item');
    conceptoItem.remove();
    actualizarNumerosConceptos();
    calcularTotalesFactura();
}

function actualizarNumerosConceptos() {
    const conceptos = document.querySelectorAll('.concepto-item');
    conceptos.forEach((item, index) => {
        item.querySelector('.concepto-numero').textContent = index + 1;
    });
}

async function actualizarDescripcionConcepto(select) {
    const clave = select.value;
    const conceptoItem = select.closest('.concepto-item');
    const descripcionInput = conceptoItem.querySelector('.concepto-descripcion');
    
    if (clave && catalogoSAT.length > 0) {
        const item = catalogoSAT.find(c => c.clave === clave);
        if (item) {
            descripcionInput.value = item.descripcion;
        }
    }
}

function toggleImpuestoConcepto(select) {
    const conceptoItem = select.closest('.concepto-item');
    const tieneImpuesto = select.value === 'true';
    const impuestoFields = conceptoItem.querySelectorAll('.concepto-impuesto-fields');
    
    impuestoFields.forEach(field => {
        field.style.display = tieneImpuesto ? 'block' : 'none';
    });
    
    if (!tieneImpuesto) {
        conceptoItem.querySelector('.concepto-importe-impuesto').value = 0;
    }
    
    calcularConcepto(select);
}

function calcularConcepto(input) {
    const conceptoItem = input.closest('.concepto-item');
    const cantidad = parseFloat(conceptoItem.querySelector('.concepto-cantidad').value) || 0;
    const precioUnitario = parseFloat(conceptoItem.querySelector('.concepto-precio-unitario').value) || 0;
    const importe = cantidad * precioUnitario;
    
    conceptoItem.querySelector('.concepto-importe').value = importe.toFixed(2);
    
    // Calcular impuesto si aplica
    const tieneImpuesto = conceptoItem.querySelector('.concepto-tiene-impuesto').value === 'true';
    let importeImpuesto = 0;
    
    if (tieneImpuesto) {
        const tasaImpuesto = parseFloat(conceptoItem.querySelector('.concepto-tasa-impuesto').value) || 0;
        importeImpuesto = importe * (tasaImpuesto / 100);
        conceptoItem.querySelector('.concepto-importe-impuesto').value = importeImpuesto.toFixed(2);
    }
    
    calcularTotalesFactura();
}

function calcularTotalesFactura() {
    let subtotal = 0;
    let totalIva = 0;
    
    document.querySelectorAll('.concepto-item').forEach(item => {
        const importe = parseFloat(item.querySelector('.concepto-importe').value) || 0;
        subtotal += importe;
        
        const tieneImpuesto = item.querySelector('.concepto-tiene-impuesto').value === 'true';
        if (tieneImpuesto) {
            const importeImpuesto = parseFloat(item.querySelector('.concepto-importe-impuesto').value) || 0;
            totalIva += importeImpuesto;
        }
    });
    
    const total = subtotal + totalIva;
    
    document.getElementById('facturaSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('facturaIva').textContent = `$${totalIva.toFixed(2)}`;
    document.getElementById('facturaTotal').textContent = `$${total.toFixed(2)}`;
}

async function guardarFactura() {
    try {
        const form = document.getElementById('formFactura');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Validar que haya al menos un concepto
        const conceptos = obtenerConceptosDelFormulario();
        if (conceptos.length === 0) {
            alert('Debe agregar al menos un concepto');
            return;
        }

        const facturaData = {
            clienteId: parseInt(document.getElementById('facturaClienteId').value),
            serie: document.getElementById('facturaSerie').value,
            fechaEmision: document.getElementById('facturaFechaEmision').value,
            fechaVencimiento: document.getElementById('facturaFechaVencimiento').value,
            conceptos: conceptos,
            observaciones: document.getElementById('facturaObservaciones').value,
        };

        const id = document.getElementById('facturaId').value;
        let data;

        if (id) {
            data = await apiRequest(`/facturas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(facturaData),
            });
        } else {
            data = await apiRequest('/facturas', {
                method: 'POST',
                body: JSON.stringify(facturaData),
            });
        }

        bootstrap.Modal.getInstance(document.getElementById('modalFactura')).hide();
        await cargarFacturas();
        alert('Factura guardada exitosamente');
    } catch (error) {
        alert('Error al guardar factura: ' + error.message);
    }
}

function obtenerConceptosDelFormulario() {
    const conceptos = [];
    
    document.querySelectorAll('.concepto-item').forEach(item => {
        const claveProductoServicio = item.querySelector('.concepto-codigo-sat').value;
        const descripcion = item.querySelector('.concepto-descripcion').value;
        const cantidad = parseFloat(item.querySelector('.concepto-cantidad').value);
        const precioUnitario = parseFloat(item.querySelector('.concepto-precio-unitario').value);
        const tieneImpuesto = item.querySelector('.concepto-tiene-impuesto').value === 'true';
        const tipoImpuesto = tieneImpuesto ? item.querySelector('.concepto-tipo-impuesto').value : undefined;
        const tasaImpuesto = tieneImpuesto ? parseFloat(item.querySelector('.concepto-tasa-impuesto').value) : undefined;
        
        if (claveProductoServicio && descripcion && cantidad && precioUnitario) {
            conceptos.push({
                claveProductoServicio,
                descripcion,
                cantidad,
                precioUnitario,
                tieneImpuesto,
                tipoImpuesto,
                tasaImpuesto,
                unidadMedida: 'H87', // Pieza por defecto
            });
        }
    });
    
    return conceptos;
}

async function timbrarFactura(id) {
    if (!confirm('¿Está seguro que desea timbrar esta factura? Una vez timbrada no se podrá modificar.')) {
        return;
    }

    try {
        await apiRequest(`/facturas/${id}/timbrar`, { method: 'POST' });
        await cargarFacturas();
        alert('Factura timbrada exitosamente');
    } catch (error) {
        alert('Error al timbrar factura: ' + error.message);
    }
}

async function editarFactura(id) {
    mostrarModalFactura(id);
}

async function eliminarFactura(id) {
    if (!confirm('¿Está seguro que desea eliminar esta factura?')) {
        return;
    }

    try {
        await apiRequest(`/facturas/${id}`, { method: 'DELETE' });
        await cargarFacturas();
        alert('Factura eliminada exitosamente');
    } catch (error) {
        alert('Error al eliminar factura: ' + error.message);
    }
}

async function registrarPagoFactura(id) {
    const monto = prompt('Ingrese el monto del pago:');
    if (!monto || parseFloat(monto) <= 0) {
        alert('Monto inválido');
        return;
    }

    try {
        await apiRequest(`/facturas/${id}/pago`, {
            method: 'POST',
            body: JSON.stringify({ monto: parseFloat(monto) }),
        });
        await cargarFacturas();
        alert('Pago registrado exitosamente');
    } catch (error) {
        alert('Error al registrar pago: ' + error.message);
    }
}

async function verFactura(id) {
    try {
        const data = await apiRequest(`/facturas/${id}`);
        const factura = data.factura;
        
        let info = `Factura: ${factura.serie}-${factura.folio}\n`;
        info += `Cliente: ${factura.cliente.nombre}\n`;
        info += `Fecha Emisión: ${new Date(factura.fechaEmision).toLocaleDateString()}\n`;
        info += `Fecha Vencimiento: ${new Date(factura.fechaVencimiento).toLocaleDateString()}\n\n`;
        info += `CONCEPTOS:\n`;
        info += `${'='.repeat(50)}\n`;
        
        if (factura.conceptos && factura.conceptos.length > 0) {
            factura.conceptos.forEach((concepto, index) => {
                info += `${index + 1}. ${concepto.descripcion}\n`;
                info += `   Código SAT: ${concepto.claveProductoServicio}\n`;
                info += `   Cantidad: ${concepto.cantidad} | Precio: $${parseFloat(concepto.precioUnitario).toFixed(2)}\n`;
                info += `   Importe: $${parseFloat(concepto.importe).toFixed(2)}\n`;
                if (concepto.tieneImpuesto) {
                    info += `   Impuesto: ${concepto.tipoImpuesto} (${concepto.tasaImpuesto}%) = $${parseFloat(concepto.importeImpuesto).toFixed(2)}\n`;
                }
                info += `\n`;
            });
        }
        
        info += `${'='.repeat(50)}\n`;
        info += `Subtotal: $${parseFloat(factura.subtotal).toFixed(2)}\n`;
        info += `IVA: $${parseFloat(factura.iva).toFixed(2)}\n`;
        info += `Total: $${parseFloat(factura.total).toFixed(2)}\n`;
        info += `Estado: ${factura.estadoFactura}\n`;
        info += `Pago: ${factura.estadoPago}\n`;
        info += `Saldo Pendiente: $${parseFloat(factura.saldoPendiente).toFixed(2)}\n`;
        if (factura.uuid) {
            info += `UUID: ${factura.uuid}\n`;
            info += `Fecha Timbrado: ${new Date(factura.fechaTimbrado).toLocaleDateString()}\n`;
        }
        
        alert(info);
    } catch (error) {
        alert('Error al obtener factura: ' + error.message);
    }
}

async function cargarKPIs() {
    try {
        const data = await apiRequest('/facturas/kpis');
        const kpis = data.kpis;
        
        const content = `
            <div class="row">
                <div class="col-md-3">
                    <div class="card text-center bg-primary text-white mb-3">
                        <div class="card-body">
                            <h4>$${parseFloat(kpis.totalFacturado).toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
                            <p class="mb-0">Total Facturado</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center bg-warning text-dark mb-3">
                        <div class="card-body">
                            <h4>$${parseFloat(kpis.totalPorCobrar).toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
                            <p class="mb-0">Por Cobrar</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center bg-success text-white mb-3">
                        <div class="card-body">
                            <h4>$${parseFloat(kpis.totalCobrado).toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
                            <p class="mb-0">Total Cobrado</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center bg-info text-white mb-3">
                        <div class="card-body">
                            <h4>$${parseFloat(kpis.promedioTicket).toLocaleString('es-MX', {minimumFractionDigits: 2})}</h4>
                            <p class="mb-0">Ticket Promedio</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3>${kpis.facturasTimbradas}</h3>
                            <p class="mb-0">Facturas Timbradas</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3>${kpis.facturasPendientes}</h3>
                            <p class="mb-0">Pendientes de Pago</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3>${kpis.facturasPagadas}</h3>
                            <p class="mb-0">Facturas Pagadas</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <h5>Facturación por Mes</h5>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Mes</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${kpis.facturasPorMes.map(mes => `
                                <tr>
                                    <td>${mes.mes}</td>
                                    <td>${mes.cantidad}</td>
                                    <td>$${parseFloat(mes.total).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('kpisContent').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('modalKPIs'));
        modal.show();
    } catch (error) {
        alert('Error al cargar KPIs: ' + error.message);
    }
}

// ==================== CARTERA ====================

async function cargarCartera() {
    try {
        const data = await apiRequest('/facturas/cartera');
        const cartera = data.cartera;
        
        // Actualizar KPIs
        document.getElementById('totalPorCobrar').textContent = 
            `$${parseFloat(cartera.totalPorCobrar).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        document.getElementById('totalVencido').textContent = 
            `$${parseFloat(cartera.totalVencido).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        document.getElementById('totalVigente').textContent = 
            `$${parseFloat(cartera.totalVigente).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        
        // Facturas vencidas
        const tbodyVencidas = document.getElementById('facturasVencidasBody');
        if (cartera.facturasVencidas.length === 0) {
            tbodyVencidas.innerHTML = '<tr><td colspan="5" class="text-center">No hay facturas vencidas</td></tr>';
        } else {
            tbodyVencidas.innerHTML = cartera.facturasVencidas.map(factura => {
                const fechaVenc = new Date(factura.fechaVencimiento);
                const hoy = new Date();
                const diasVencidos = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));
                
                return `
                    <tr>
                        <td>${factura.serie}-${factura.folio}</td>
                        <td>${factura.cliente.nombre}</td>
                        <td>${fechaVenc.toLocaleDateString()}</td>
                        <td>$${parseFloat(factura.saldoPendiente).toFixed(2)}</td>
                        <td><span class="badge bg-danger">${diasVencidos} días</span></td>
                    </tr>
                `;
            }).join('');
        }
        
        // Por cliente
        const tbodyPorCliente = document.getElementById('carteraPorClienteBody');
        if (cartera.porCliente.length === 0) {
            tbodyPorCliente.innerHTML = '<tr><td colspan="4" class="text-center">No hay cuentas por cobrar</td></tr>';
        } else {
            tbodyPorCliente.innerHTML = cartera.porCliente.map(item => `
                <tr>
                    <td>${item.cliente.nombre}</td>
                    <td>${item.cliente.rfc}</td>
                    <td>$${parseFloat(item.total).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                    <td>${item.facturas.length}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar cartera:', error);
        alert('Error al cargar cartera: ' + error.message);
    }
}

