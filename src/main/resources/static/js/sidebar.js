// sidebar.js
// Genera los enlaces de navegación en la sidebar de la plantilla index_tempate.html usando la lógica de dashboard.js

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

function getIconoSidebar(id) {
    switch (id) {
        case 'enlace-inicio': return 'bi-house-fill';
        case 'enlace-dashboard': return 'bi-speedometer2';
        case 'enlace-gestion-roles': return 'bi-shield-lock-fill';
        case 'enlace-registro-carros': return 'bi-journal-text';
        case 'enlace-solicitud-carro': return 'bi-box-arrow-in-right';
        case 'enlace-lista-carros': return 'bi-list-ul';
        default: return 'bi-dot';
    }
}

function generarEnlacesSidebar() {
    const enlaces = [
        { id: 'enlace-inicio', href: '/index.html', texto: 'Inicio', mostrar: p => !!p },
        { id: 'enlace-dashboard', href: '/dashboard.html', texto: 'Dashboard', mostrar: p => p && (p.rolId === 1) },
        { id: 'enlace-gestion-roles', href: '/gestion_roles.html', texto: 'Gestión de Roles', mostrar: p => p && (p.rolId === 1) },
        { id: 'enlace-lista-carros', href: '/lista_carros.html', texto: 'Lista de Carros', mostrar: p => p && (p.rolId === 1) },
        { id: 'enlace-registro-carros', href: '/registro_carros.html', texto: 'Registro de Carros', mostrar: p => p && (p.rolId === 1 || p.rolId === 2 || p.rolId === 3) },
        { id: 'enlace-solicitud-carro', href: '/solicitud_carro.html', texto: 'Solicitud de Carro', mostrar: p => p && (p.rolId === 1 || p.rolId === 2 || p.rolId === 3) },
    ];
    const token = checkAuth();
    if (!token) return;
    const payload = parseJwt(token);
    const contenedor = document.getElementById('sidebar-links');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    let enlacesVisibles = enlaces.filter(e => e.mostrar(payload));
    enlacesVisibles.forEach(enlace => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = enlace.href;
        a.id = enlace.id;
        // Agregar icono
        const icon = document.createElement('i');
        icon.className = getIconoSidebar(enlace.id) + ' me-2';
        a.appendChild(icon);
        a.appendChild(document.createTextNode(enlace.texto));
        li.appendChild(a);
        contenedor.appendChild(li);
    });
    // Botón de cerrar sesión
    const liSesion = document.createElement('li');
    liSesion.className = 'nav-item mt-auto';
    const btnCerrar = document.createElement('button');
    btnCerrar.id = 'btn-cerrar-sesion';
    btnCerrar.className = 'btn btn-danger w-100';
    btnCerrar.textContent = 'Cerrar sesión';
    btnCerrar.onclick = function() {
        localStorage.removeItem('jwt');
        window.location.href = '/login.html';
    };
    liSesion.appendChild(btnCerrar);
    contenedor.appendChild(liSesion);
}

document.addEventListener('DOMContentLoaded', function() {
    generarEnlacesSidebar();
    // Ocultar el enlace de Dashboard en el sidebar si estamos en dashboard.html
    if (window.location.pathname.endsWith('/dashboard.html')) {
        setTimeout(function() {
            var enlaceDashboard = document.getElementById('enlace-dashboard');
            if (enlaceDashboard && enlaceDashboard.parentNode) {
                enlaceDashboard.parentNode.remove();
            }
        }, 100);
    }
    // Ocultar el enlace de Trámite Menores en el sidebar si existe (para tramite_menores.html)
    if (window.location.pathname.endsWith('/tramite_menores.html')) {
        setTimeout(function() {
            var enlaceMenores = document.getElementById('enlace-menores');
            if (enlaceMenores) enlaceMenores.style.display = 'none';
        }, 200);
    }
    if (window.location.pathname.endsWith('/validacion_mascotas.html')) {
        setTimeout(function() {
            var enlaceValidacionMascotas = document.getElementById('enlace-validacion-mascotas');
            if (enlaceValidacionMascotas) enlaceValidacionMascotas.style.display = 'none';
        }, 200);
    }
    if (window.location.pathname.endsWith('/validacion_menores.html')) {
        setTimeout(function() {
            var enlaceValidacionMenores = document.getElementById('enlace-validacion-menores');
            if (enlaceValidacionMenores) enlaceValidacionMenores.style.display = 'none';
        }, 200);
    }
    if (window.location.pathname.endsWith('/validacion_vehiculos.html')) {
        setTimeout(function() {
            var enlaceValidacionVehiculos = document.getElementById('enlace-validacion-vehiculos');
            if (enlaceValidacionVehiculos) enlaceValidacionVehiculos.style.display = 'none';
        }, 200);
    }
});