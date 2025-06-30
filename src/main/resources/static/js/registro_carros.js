// registro_carros.js

function checkAuth() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        window.location.href = '/login.html';
        return null;
    }
    return token;
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function mostrarUsuarioAutenticado() {
    const token = checkAuth();
    if (!token) return;
    const payload = parseJwt(token);
    const div = document.getElementById('usuario-autenticado');
    if (payload) {
        div.innerHTML = `<b>Usuario:</b> ${payload.sub || payload.email || ''}`;
    }
}

let paginaActual = 0;
let totalPaginas = 1;
const TAMANO_PAGINA = 30;

async function cargarRegistros(pagina = 0) {
    const token = checkAuth();
    try {
        const response = await fetch(`/api/v1/registro-carros?page=${pagina}&size=${TAMANO_PAGINA}` , {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error('No se pudo cargar el listado');
        const pageData = await response.json();
        mostrarTablaRegistros(pageData.content);
        paginaActual = pageData.number;
        totalPaginas = pageData.totalPages;
        actualizarPaginacion();
    } catch (error) {
        document.getElementById('tabla-registro-carros').innerHTML = `<tr><td colspan="11" style="color:red">${error.message}</td></tr>`;
    }
}

function actualizarPaginacion() {
    const info = document.getElementById('paginacion-info');
    info.textContent = `Página ${paginaActual + 1} de ${totalPaginas}`;
    document.getElementById('btn-prev-page').disabled = paginaActual === 0;
    document.getElementById('btn-next-page').disabled = paginaActual >= totalPaginas - 1;
}

// Renderiza la tabla de registros de carros con select de estado y color
function mostrarTablaRegistros(registros) {
    // Eliminar sort: el orden lo define el backend paginado
    let html = `<thead>
        <tr>
            <th>ID</th><th>Docente</th><th>RUT</th><th>Carro</th><th>Equipos</th><th>Sala</th><th>Fecha</th><th>Entrega</th><th>Devolución</th><th>Responsable</th><th>Estado</th><th>Acción</th>
        </tr>
    </thead>
    <tbody>`;
    registros.forEach(reg => {
        // Formatear horas a hh:mm
        function soloHora(str) {
            if (!str) return '';
            let t = str.split('T')[1] || str;
            return t.substring(0,5);
        }
        // Formatear fecha a mm:dd
        function soloMesDia(str) {
            if (!str) return '';
            let d = new Date(str);
            let mes = (d.getMonth() + 1).toString().padStart(2, '0');
            let dia = d.getDate().toString().padStart(2, '0');
            return mes + ':' + dia;
        }
        if (reg.estadoPrestamo === 'ENTREGADO') {
            html += `<tr data-id="${reg.id}">
                <td>${reg.id}</td>
                <td>${reg.nombreDocente}</td>
                <td>${reg.rutDocente}</td>
                <td>${reg.nombreCarro}</td>
                <td>${reg.cantidadEquipos}</td>
                <td>${reg.sala}</td>
                <td>${soloMesDia(reg.fechaDia)}</td>
                <td>${soloHora(reg.horaEntrega)}</td>
                <td>${soloHora(reg.horaPrestamo)}</td>
                <td>${reg.nombreResponsable}</td>
                <td><span class="badge bg-success badge-entregado">Entregado</span></td>
                <td></td>
            </tr>`;
        } else {
            html += `<tr data-id="${reg.id}">
                <td>${reg.id}</td>
                <td>${reg.nombreDocente}</td>
                <td>${reg.rutDocente}</td>
                <td>${reg.nombreCarro}</td>
                <td>${reg.cantidadEquipos}</td>
                <td>${reg.sala}</td>
                <td>${soloMesDia(reg.fechaDia)}</td>
                <td>${soloHora(reg.horaEntrega)}</td>
                <td>${soloHora(reg.horaPrestamo)}</td>
                <td>${reg.nombreResponsable}</td>
                <td>
                    <select class="form-select form-select-sm estado-prestamo-select" data-id="${reg.id}" data-estado="${reg.estadoPrestamo}">
                        <option value="PRESTADO" ${reg.estadoPrestamo === 'PRESTADO' ? 'selected' : ''}>Prestado</option>
                        <option value="ENTREGADO" ${reg.estadoPrestamo === 'ENTREGADO' ? 'selected' : ''}>Entregado</option>
                    </select>
                </td>
                <td><button class="btn btn-primary btn-sm btn-guardar-estado" data-id="${reg.id}">Guardar</button></td>
            </tr>`;
        }
    });
    html += '</tbody>';
    document.getElementById('tabla-registro-carros').innerHTML = html;
    // Asignar color después de renderizar
    document.querySelectorAll('.estado-prestamo-select').forEach(select => {
        if (select.getAttribute('data-estado') === 'PRESTADO') {
            select.classList.add('select-prestado');
        } else if (select.getAttribute('data-estado') === 'ENTREGADO') {
            select.classList.add('select-entregado');
        }
    });
    agregarEventosCambioEstado();
}

function agregarEventosCambioEstado() {
    document.querySelectorAll('.btn-guardar-estado').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const select = document.querySelector(`select[data-id='${id}']`);
            const nuevoEstado = select.value;
            const token = checkAuth();
            this.disabled = true;
            this.textContent = 'Guardando...';
            try {
                const response = await fetch(`/api/v1/registro-carros/${id}/estado`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(nuevoEstado)
                });
                if (response.ok) {
                    // Si el nuevo estado es ENTREGADO, eliminar el select y el botón
                    if (nuevoEstado === 'ENTREGADO') {
                        const tr = this.closest('tr');
                        tr.querySelector('td:nth-child(11)').innerHTML = '<span class="badge bg-success badge-entregado">Entregado</span>';
                        tr.querySelector('td:nth-child(12)').innerHTML = '';
                    } else {
                        // Cambia el color del select según el nuevo estado
                        select.classList.remove('select-prestado', 'select-entregado');
                        if (nuevoEstado === 'PRESTADO') {
                            select.classList.add('select-prestado');
                        } else if (nuevoEstado === 'ENTREGADO') {
                            select.classList.add('select-entregado');
                        }
                        mostrarExito(this.closest('tr'), 'Estado actualizado');
                    }
                } else {
                    const errorText = await response.text();
                    mostrarError(this.closest('tr'), 'Error: ' + errorText);
                }
            } catch (e) {
                mostrarError(this.closest('tr'), 'Error de red: ' + e.message);
            } finally {
                this.disabled = false;
                this.textContent = 'Guardar';
            }
        });
    });
    // Cambia el color dinámicamente al cambiar el select
    document.querySelectorAll('.estado-prestamo-select').forEach(select => {
        select.addEventListener('change', function() {
            this.classList.remove('select-prestado', 'select-entregado');
            if (this.value === 'PRESTADO') {
                this.classList.add('select-prestado');
            } else if (this.value === 'ENTREGADO') {
                this.classList.add('select-entregado');
            }
        });
    });
}

function mostrarExito(tr, mensaje) {
    let msg = tr.querySelector('.estado-msg');
    if (!msg) {
        msg = document.createElement('span');
        msg.className = 'estado-msg text-success ms-2';
        tr.querySelector('td:last-child').appendChild(msg);
    }
    msg.textContent = mensaje;
    msg.style.display = 'inline';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

function mostrarError(tr, mensaje) {
    let msg = tr.querySelector('.estado-msg');
    if (!msg) {
        msg = document.createElement('span');
        msg.className = 'estado-msg text-danger ms-2';
        tr.querySelector('td:last-child').appendChild(msg);
    }
    msg.textContent = mensaje;
    msg.style.display = 'inline';
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    mostrarUsuarioAutenticado();
    cargarRegistros();
    setTimeout(function() {
        var logoutBtn = document.getElementById('dropdown-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('jwt');
                window.location.href = '/login.html';
            });
        }
    }, 200);
    document.getElementById('btn-prev-page').addEventListener('click', function() {
        if (paginaActual > 0) cargarRegistros(paginaActual - 1);
    });
    document.getElementById('btn-next-page').addEventListener('click', function() {
        if (paginaActual < totalPaginas - 1) cargarRegistros(paginaActual + 1);
    });
});
