// =============================
// MAPA INICIAL
// =============================
var map = L.map('map').setView([6.24, -75.58], 13);

// =============================
// MAPAS BASE
// =============================
var baseLayers = {
    imagery: L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Tiles &copy; Esri'
        }
    ),
    dark: L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }
    )
};

// Capa base inicial
baseLayers.imagery.addTo(map);

// =============================
// CONFIGURACIÓN DE CAPAS GEOGRÁFICAS
// Agrega nuevas capas aquí
// =============================
var capasConfig = [
    { key: 'comunas', nombre: 'Comunas', url: 'data/comunas.json' },
    { key: 'municipios', nombre: 'Municipios', url: 'data/Municipios.json' },
    { key: 'Departamentos', nombre: 'Departamentos', url: 'data/Departamentos.geojson' }
];

// Almacenes generales
var capasGeoJSON = {};   // guarda los datos GeoJSON
var capasLeaflet = {};   // guarda las capas Leaflet

// Grupo padre para capas geográficas
var grupoCapasGeograficas = L.layerGroup().addTo(map);

// =============================
// POPUP DESDE ATRIBUTOS
// =============================
function popupDesdeAtributos(feature) {
    if (!feature.properties) return 'Sin atributos';

    var html = '';
    for (var campo in feature.properties) {
        html += '<b>' + campo + ':</b> ' + feature.properties[campo] + '<br>';
    }
    return html || 'Sin atributos';
}

// =============================
// CARGAR CAPA GEOJSON
// =============================
function cargarCapa(config) {
    fetch(config.url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            capasGeoJSON[config.key] = data;

            var layer = L.geoJSON(data, {
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(popupDesdeAtributos(feature));
                }
            });

            capasLeaflet[config.key] = layer;
            grupoCapasGeograficas.addLayer(layer);

            actualizarTreeControl();
        })
        .catch(function(error) {
            console.error('Error al cargar ' + config.url + ':', error);
        });
}

// =============================
// SELECTOR DE CAPAS PARA TABLA / DASHBOARD
// =============================
function poblarSelectorCapas() {
    var selector = document.getElementById('selectorCapa');
    selector.innerHTML = '';

    capasConfig.forEach(function(capa) {
        var option = document.createElement('option');
        option.value = capa.key;
        option.textContent = capa.nombre;
        selector.appendChild(option);
    });
}

function obtenerCapaSeleccionada() {
    var key = document.getElementById('selectorCapa').value;
    var config = capasConfig.find(function(c) { return c.key === key; });

    if (!config || !capasGeoJSON[key]) return null;

    return {
        key: key,
        data: capasGeoJSON[key],
        titulo: config.nombre
    };
}

// =============================
// CONTROL DE CAPAS AGRUPADO
// Requiere Leaflet.Control.Layers.Tree
// =============================
var treeControl = null;

function actualizarTreeControl() {
    if (treeControl) {
        treeControl.remove();
    }

    var baseTree = {
        label: '<b>Mapa base</b>',
        selectAllCheckbox: true,
        children: [
            { label: 'Imagery', layer: baseLayers.imagery },
            { label: 'Dark', layer: baseLayers.dark }
        ]
    };

    var overlaysTree = {
        label: '<b>Capas geográficas</b>',
        selectAllCheckbox: true,
        children: capasConfig
            .filter(function(capa) { return capasLeaflet[capa.key]; })
            .map(function(capa) {
                return {
                    label: capa.nombre,
                    layer: capasLeaflet[capa.key]
                };
            })
    };

    treeControl = L.control.layers.tree(baseTree, overlaysTree, {
        collapsed: false
    }).addTo(map);
}

// =============================
// TABLA DE ATRIBUTOS
// =============================
function mostrarTablaAtributos(geojson, titulo) {
    var contenedor = document.getElementById('tablaContenido');

    if (!geojson || !geojson.features || geojson.features.length === 0) {
        contenedor.innerHTML = '<p>No hay datos para mostrar.</p>';
        return;
    }

    if (!geojson.features[0].properties) {
        contenedor.innerHTML = '<p>No hay atributos disponibles.</p>';
        return;
    }

    var campos = Object.keys(geojson.features[0].properties);

    var html = '<h3>Tabla de atributos - ' + titulo + '</h3>';
    html += '<table><thead><tr>';

    campos.forEach(function(campo) {
        html += '<th>' + campo + '</th>';
    });

    html += '</tr></thead><tbody>';

    geojson.features.forEach(function(feature) {
        html += '<tr>';
        campos.forEach(function(campo) {
            var valor = '';
            if (feature.properties && feature.properties[campo] !== null && feature.properties[campo] !== undefined) {
                valor = feature.properties[campo];
            }
            html += '<td>' + valor + '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
}

// =============================
// DASHBOARD
// =============================
function mostrarDashboard(geojson, titulo) {
    var contenedor = document.getElementById('dashboardContenido');

    if (!geojson || !geojson.features || geojson.features.length === 0) {
        contenedor.innerHTML = '<p>No hay datos para resumir.</p>';
        return;
    }

    var totalRegistros = geojson.features.length;
    var totalCampos = geojson.features[0].properties
        ? Object.keys(geojson.features[0].properties).length
        : 0;

    var html = '<h3>Dashboard básico - ' + titulo + '</h3>';
    html += '<p><b>Total de registros:</b> ' + totalRegistros + '</p>';
    html += '<p><b>Total de campos:</b> ' + totalCampos + '</p>';

    contenedor.innerHTML = html;
}

// =============================
// ABRIR PANEL GRANDE
// =============================
function expandirPanel(idPanel) {
    var panel = document.getElementById(idPanel);
    var contenedor = document.getElementById('panelInferior');
    var panelConsulta = document.getElementById('panelConsulta');

    var left = panelConsulta.offsetLeft + panelConsulta.offsetWidth + 20;
    var top = 10;
    var width = contenedor.clientWidth - left - 10;
    var height = contenedor.clientHeight - 20;

    if (width < 250) width = 250;
    if (height < 140) height = 140;

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.width = width + 'px';
    panel.style.height = height + 'px';
}

// =============================
// MOSTRAR / OCULTAR DASHBOARD Y TABLA
// =============================
function toggleDashboard() {
    var panel = document.getElementById('dashboard');
    var capa = obtenerCapaSeleccionada();

    if (panel.style.display === 'none' || panel.style.display === '') {
        expandirPanel('dashboard');

        if (capa && capa.data) {
            mostrarDashboard(capa.data, capa.titulo);
        } else {
            document.getElementById('dashboardContenido').innerHTML = '<p>No hay datos cargados para esa capa.</p>';
        }

        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function toggleTabla() {
    var panel = document.getElementById('tablaAtributos');
    var capa = obtenerCapaSeleccionada();

    if (panel.style.display === 'none' || panel.style.display === '') {
        expandirPanel('tablaAtributos');

        if (capa && capa.data) {
            mostrarTablaAtributos(capa.data, capa.titulo);
        } else {
            document.getElementById('tablaContenido').innerHTML = '<p>No hay datos cargados para esa capa.</p>';
        }

        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// =============================
// ACTUALIZAR TABLA / DASHBOARD
// CUANDO CAMBIA LA CAPA
// =============================
document.getElementById('selectorCapa').addEventListener('change', function() {
    var capa = obtenerCapaSeleccionada();

    var panelDashboard = document.getElementById('dashboard');
    if (panelDashboard.style.display !== 'none' && capa && capa.data) {
        mostrarDashboard(capa.data, capa.titulo);
    }

    var panelTabla = document.getElementById('tablaAtributos');
    if (panelTabla.style.display !== 'none' && capa && capa.data) {
        mostrarTablaAtributos(capa.data, capa.titulo);
    }
});

// =============================
// HACER MOVIBLE DENTRO DEL CONTENEDOR
// =============================
function hacerMovibleDentroDeContenedor(idPanel, selectorHeader, idContenedor) {
    var panel = document.getElementById(idPanel);
    var header = panel.querySelector(selectorHeader);
    var contenedor = document.getElementById(idContenedor);

    var offsetX = 0, offsetY = 0, moviendo = false;

    header.addEventListener('mousedown', function(e) {
        moviendo = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!moviendo) return;

        var rect = contenedor.getBoundingClientRect();
        var left = e.clientX - rect.left - offsetX;
        var top = e.clientY - rect.top - offsetY;

        var maxLeft = contenedor.clientWidth - panel.offsetWidth;
        var maxTop = contenedor.clientHeight - panel.offsetHeight;

        if (left < 0) left = 0;
        if (top < 0) top = 0;
        if (left > maxLeft) left = maxLeft;
        if (top > maxTop) top = maxTop;

        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
    });

    document.addEventListener('mouseup', function() {
        moviendo = false;
    });
}

// =============================
// REDIMENSIONAR VENTANAS
// =============================
function hacerVentanaRedimensionable(id) {
    var ventana = document.getElementById(id);
    var handle = ventana.querySelector('.resize-handle');
    var contenedor = document.getElementById('panelInferior');

    var redimensionando = false;
    var startY = 0;
    var startHeight = 0;

    handle.addEventListener('mousedown', function(e) {
        redimensionando = true;
        startY = e.clientY;
        startHeight = parseInt(window.getComputedStyle(ventana).height, 10);
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!redimensionando) return;

        var nuevaAltura = startHeight + (e.clientY - startY);
        var maxAltura = contenedor.clientHeight - ventana.offsetTop;

        if (nuevaAltura < 120) nuevaAltura = 120;
        if (nuevaAltura > maxAltura) nuevaAltura = maxAltura;

        ventana.style.height = nuevaAltura + 'px';
    });

    document.addEventListener('mouseup', function() {
        redimensionando = false;
    });
}

// =============================
// REDIMENSIONAR MAPA Y PANEL INFERIOR
// =============================
var resizeBar = document.getElementById('resizeBar');
var app = document.getElementById('app');
var panelInferior = document.getElementById('panelInferior');
var estaRedimensionandoMapa = false;

resizeBar.addEventListener('mousedown', function(e) {
    estaRedimensionandoMapa = true;
    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (!estaRedimensionandoMapa) return;

    var appRect = app.getBoundingClientRect();
    var nuevaAlturaMapa = e.clientY - appRect.top;
    var alturaTotal = app.clientHeight;
    var alturaMinMapa = 200;
    var alturaMinPanel = 160;

    if (nuevaAlturaMapa < alturaMinMapa) nuevaAlturaMapa = alturaMinMapa;
    if (nuevaAlturaMapa > alturaTotal - alturaMinPanel - 8) {
        nuevaAlturaMapa = alturaTotal - alturaMinPanel - 8;
    }

    document.getElementById('map').style.height = nuevaAlturaMapa + 'px';
    panelInferior.style.height = (alturaTotal - nuevaAlturaMapa - 8) + 'px';

    setTimeout(function() {
        map.invalidateSize();

        if (document.getElementById('dashboard').style.display !== 'none') {
            expandirPanel('dashboard');
        }
        if (document.getElementById('tablaAtributos').style.display !== 'none') {
            expandirPanel('tablaAtributos');
        }
    }, 10);
});

document.addEventListener('mouseup', function() {
    estaRedimensionandoMapa = false;
});

// =============================
// DIBUJO Y MEDICIÓN
// =============================
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

function formatearNumero(valor) {
    return Number(valor).toLocaleString('es-CO', {
        maximumFractionDigits: 2
    });
}

function calcularLongitud(latlngs) {
    var total = 0;
    for (var i = 0; i < latlngs.length - 1; i++) {
        total += latlngs[i].distanceTo(latlngs[i + 1]);
    }
    return total;
}

function calcularPerimetro(latlngs) {
    var total = 0;
    for (var i = 0; i < latlngs.length; i++) {
        var siguiente = (i + 1) % latlngs.length;
        total += latlngs[i].distanceTo(latlngs[siguiente]);
    }
    return total;
}

function calcularAreaPoligono(latlngs) {
    var area = 0;
    var puntos = latlngs.map(function(ll) {
        return map.latLngToLayerPoint(ll);
    });

    for (var i = 0; i < puntos.length; i++) {
        var j = (i + 1) % puntos.length;
        area += puntos[i].x * puntos[j].y;
        area -= puntos[j].x * puntos[i].y;
    }

    return Math.abs(area / 2);
}

function aplicarEstilo(layer, tipo) {
    if (tipo === 'polygon') layer.setStyle({ color: 'green', fillColor: 'green', fillOpacity: 0.4 });
    if (tipo === 'rectangle') layer.setStyle({ color: 'red', fillColor: 'red', fillOpacity: 0.4 });
    if (tipo === 'polyline') layer.setStyle({ color: 'orange' });
    if (tipo === 'circle') layer.setStyle({ color: 'purple', fillColor: 'purple', fillOpacity: 0.3 });
}

function agregarPopup(layer, tipo) {
    var contenido = '';

    if (tipo === 'marker') {
        var coord = layer.getLatLng();
        contenido =
            '<b>Punto</b><br>' +
            'Latitud: ' + formatearNumero(coord.lat) + '<br>' +
            'Longitud: ' + formatearNumero(coord.lng);
    }

    if (tipo === 'polyline') {
        var longitud = calcularLongitud(layer.getLatLngs());
        contenido = '<b>Línea</b><br>Longitud: ' + formatearNumero(longitud) + ' m';
    }

    if (tipo === 'polygon' || tipo === 'rectangle') {
        var latlngs = layer.getLatLngs()[0];
        var area = calcularAreaPoligono(latlngs);
        var perimetro = calcularPerimetro(latlngs);
        contenido =
            '<b>' + (tipo === 'polygon' ? 'Polígono' : 'Rectángulo') + '</b><br>' +
            'Área aprox.: ' + formatearNumero(area) + ' px²<br>' +
            'Perímetro: ' + formatearNumero(perimetro) + ' m';
    }

    if (tipo === 'circle') {
        var radio = layer.getRadius();
        var areaCirculo = Math.PI * Math.pow(radio, 2);
        contenido =
            '<b>Círculo</b><br>' +
            'Radio: ' + formatearNumero(radio) + ' m<br>' +
            'Área: ' + formatearNumero(areaCirculo) + ' m²';
    }

    layer.bindPopup(contenido);
}

var drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
        polygon: { shapeOptions: { color: 'green', fillColor: 'green', fillOpacity: 0.4 } },
        polyline: { shapeOptions: { color: 'orange' } },
        rectangle: { shapeOptions: { color: 'red', fillColor: 'red', fillOpacity: 0.4 } },
        circle: { shapeOptions: { color: 'purple', fillColor: 'purple', fillOpacity: 0.3 } },
        marker: true,
        circlemarker: false
    }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function(e) {
    var layer = e.layer;
    var tipo = e.layerType;
    aplicarEstilo(layer, tipo);
    agregarPopup(layer, tipo);
    drawnItems.addLayer(layer);
});

map.on('draw:edited', function(e) {
    e.layers.eachLayer(function(layer) {
        var tipo = '';
        if (layer instanceof L.Marker) tipo = 'marker';
        else if (layer instanceof L.Circle) tipo = 'circle';
        else if (layer instanceof L.Rectangle) tipo = 'rectangle';
        else if (layer instanceof L.Polygon) tipo = 'polygon';
        else if (layer instanceof L.Polyline) tipo = 'polyline';

        agregarPopup(layer, tipo);
    });
});

var measureControl = new L.Control.Measure({
    position: 'topleft',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares',
    activeColor: '#db4a29',
    completedColor: '#9b2d14'
});
measureControl.addTo(map);

// =============================
// ACTIVACIÓN GENERAL
// =============================
poblarSelectorCapas();
capasConfig.forEach(cargarCapa);

hacerMovibleDentroDeContenedor('panelConsulta', '.panel-botones-header', 'panelInferior');
hacerMovibleDentroDeContenedor('dashboard', '.panel-header', 'panelInferior');
hacerMovibleDentroDeContenedor('tablaAtributos', '.panel-header', 'panelInferior');

hacerVentanaRedimensionable('dashboard');
hacerVentanaRedimensionable('tablaAtributos');