/**
 * GeoAnalytics Web - Advanced Spatial Viewer
 * FIX: Funcionalidades completas + Carga Local (Shapefile, GeoJSON, KML) restaurada.
 */

const AppState = {
    layers: {},
    geoData: {},
    currentLayerKey: null,
    isDarkMode: false,
    chartInstance: null
};

// =============================
// INITIALIZATION
// =============================
const map = L.map('map', { zoomControl: false, preferCanvas: true }).setView([6.24, -75.58], 13);
L.control.zoom({ position: 'topright' }).addTo(map);

const baseMaps = {
    "OSM Light": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OSM', crossOrigin: true }),
    "Carto Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: '&copy; CARTO', crossOrigin: true }),
    "Esri Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri', crossOrigin: true })
};

baseMaps["OSM Light"].addTo(map);

const vectorGroup = L.featureGroup().addTo(map);
const drawGroup = L.featureGroup().addTo(map);
let treeControl = null;
let searchMarker = null; 

// Reset View Control
const homeExtent = L.latLngBounds([6.1, -75.7], [6.4, -75.4]);
const HomeControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.backgroundColor = 'var(--bg-panel)';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.cursor = 'pointer';
        container.title = 'Resetear Vista';
        
        const icon = L.DomUtil.create('i', 'fa-solid fa-house');
        icon.style.color = 'var(--text-primary)';
        container.appendChild(icon);
        
        container.onclick = (e) => { e.stopPropagation(); map.fitBounds(homeExtent); };
        return container;
    }
});
map.addControl(new HomeControl());

// Plugins
map.addControl(new L.Control.FullScreen({ position: 'topright' }));
new L.Control.Measure({ position: 'topleft', primaryLengthUnit: 'meters', primaryAreaUnit: 'sqmeters', activeColor: '#3498db', completedColor: '#2980b9' }).addTo(map);
new L.Control.Draw({ edit: { featureGroup: drawGroup }, draw: { polygon: true, polyline: true, rectangle: true, circle: true, marker: true, circlemarker: false } }).addTo(map);

map.on(L.Draw.Event.CREATED, function(e) {
    const layer = e.layer;
    if (e.layerType === 'polygon') layer.setStyle({ color: '#2ecc71', fillColor: '#2ecc71', fillOpacity: 0.4 });
    drawGroup.addLayer(layer);
});

map.on('mousemove', e => {
    document.getElementById('coordsDisplay').innerHTML = `Lat: ${e.latlng.lat.toFixed(5)} | Lng: ${e.latlng.lng.toFixed(5)}`;
});

// =============================
// LÓGICA DE DIBUJO Y MEDICIÓN ESPACIAL
// =============================
function formatearNumero(valor) {
    return Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 2 });
}

function agregarPopupDibujo(layer, tipo) {
    let contenido = '<div class="popup-pro-header">Detalles de Dibujo</div><div class="popup-pro-table"><table><tbody>';
    
    if (tipo === 'marker') {
        const coord = layer.getLatLng();
        contenido += `<tr><td><b>Latitud</b></td><td>${coord.lat.toFixed(5)}</td></tr>
                      <tr><td><b>Longitud</b></td><td>${coord.lng.toFixed(5)}</td></tr>`;
    } else if (tipo === 'polyline') {
        let longitud = 0;
        const latlngs = layer.getLatLngs();
        for (let i = 0; i < latlngs.length - 1; i++) {
            longitud += latlngs[i].distanceTo(latlngs[i + 1]);
        }
        contenido += `<tr><td><b>Longitud</b></td><td>${formatearNumero(longitud)} m</td></tr>`;
    } else if (tipo === 'polygon' || tipo === 'rectangle') {
        const latlngs = layer.getLatLngs()[0];
        // Calculo geodésico real usando la utilidad de Leaflet
        let area = L.GeometryUtil.geodesicArea(latlngs);
        let perimetro = 0;
        for (let i = 0; i < latlngs.length; i++) {
            let sig = (i + 1) % latlngs.length;
            perimetro += latlngs[i].distanceTo(latlngs[sig]);
        }
        contenido += `<tr><td><b>Área aprox.</b></td><td>${formatearNumero(area)} m²</td></tr>
                      <tr><td><b>Perímetro</b></td><td>${formatearNumero(perimetro)} m</td></tr>`;
    } else if (tipo === 'circle') {
        const radio = layer.getRadius();
        const area = Math.PI * Math.pow(radio, 2);
        contenido += `<tr><td><b>Radio</b></td><td>${formatearNumero(radio)} m</td></tr>
                      <tr><td><b>Área aprox.</b></td><td>${formatearNumero(area)} m²</td></tr>`;
    }
    
    contenido += '</tbody></table></div>';
    layer.bindPopup(contenido);
}

// Evento cuando se crea una nueva geometría
map.on(L.Draw.Event.CREATED, function(e) {
    const layer = e.layer;
    const tipo = e.layerType;

    // Aplicar estilos según el tipo de geometría
    if (tipo === 'polygon') layer.setStyle({ color: '#2ecc71', fillColor: '#2ecc71', fillOpacity: 0.4 });
    if (tipo === 'rectangle') layer.setStyle({ color: '#e74c3c', fillColor: '#e74c3c', fillOpacity: 0.4 });
    if (tipo === 'polyline') layer.setStyle({ color: '#f39c12' });
    if (tipo === 'circle') layer.setStyle({ color: '#9b59b6', fillColor: '#9b59b6', fillOpacity: 0.3 });

    // Calcular medidas y agregar el popup
    agregarPopupDibujo(layer, tipo);
    drawGroup.addLayer(layer);
});

// Evento para actualizar las medidas si el usuario edita el polígono después de creado
map.on('draw:edited', function(e) {
    e.layers.eachLayer(function(layer) {
        let tipo = '';
        if (layer instanceof L.Marker) tipo = 'marker';
        else if (layer instanceof L.Circle) tipo = 'circle';
        else if (layer instanceof L.Rectangle) tipo = 'rectangle';
        else if (layer instanceof L.Polygon) tipo = 'polygon';
        else if (layer instanceof L.Polyline) tipo = 'polyline';
        
        agregarPopupDibujo(layer, tipo);
    });
});
// =============================
// LAYER MANAGEMENT
// =============================
function updateLayerTree() {
    if (treeControl) map.removeControl(treeControl);
    const overlays = Object.keys(AppState.layers).map(key => ({ label: key, layer: AppState.layers[key] }));
    const baseTree = { label: '<b>Mapas Base</b>', children: Object.keys(baseMaps).map(k => ({label: k, layer: baseMaps[k]})) };
    const overlaysTree = { label: '<b>Capas Vectoriales</b>', selectAllCheckbox: true, children: overlays };
    treeControl = L.control.layers.tree(baseTree, overlaysTree, { collapsed: false }).addTo(map);
}

const capasConfig = [{ key: 'comunas', nombre: 'Comunas', url: 'data/comunas.json' }];
capasConfig.forEach(config => {
    fetch(config.url).then(res => res.json()).then(data => processGeoJSON(data, config.nombre)).catch(e => console.log("Capa inicial no encontrada"));
});

function processGeoJSON(data, layerName) {
    if(!data || !data.features) return;
    
    data.features.forEach((f, i) => { if(!f.properties) f.properties = {}; f.properties._app_id = i; });
    AppState.geoData[layerName] = data;
    
    const layer = L.geoJSON(data, {
        style: () => ({ color: AppState.isDarkMode ? '#3498db' : '#2980b9', weight: 2, fillOpacity: 0.3 }),
        onEachFeature: (feature, layer) => {
            layer.on({ click: (e) => handleFeatureClick(e, feature, layerName) });
            layer._app_id = feature.properties._app_id;
        }
    });

    AppState.layers[layerName] = layer;
    vectorGroup.addLayer(layer);
    
    updateLayerTree();
    updateLayerSelector();
    
    const selector = document.getElementById('selectorCapa');
    selector.value = layerName;
    selector.dispatchEvent(new Event('change'));
    
    if(layer.getBounds().isValid()) map.fitBounds(layer.getBounds());
}

// =============================
// MAP <-> TABLE INTERACTION
// =============================
let highlightLayer = null;
let highlightParentLayer = null;

function highlightFeatureOnMap(layer, layerName) {
    if (highlightLayer && highlightParentLayer) highlightParentLayer.resetStyle(highlightLayer);
    highlightLayer = layer;
    highlightParentLayer = AppState.layers[layerName];
    if (layer.setStyle) { layer.setStyle({ color: '#e74c3c', weight: 4, fillOpacity: 0.6 }); layer.bringToFront(); }
}

function handleFeatureClick(e, feature, layerName) {
    L.DomEvent.stopPropagation(e);
    if (AppState.currentLayerKey !== layerName) {
        document.getElementById('selectorCapa').value = layerName;
        document.getElementById('selectorCapa').dispatchEvent(new Event('change'));
    }
    highlightFeatureOnMap(e.target, layerName);
    
    let content = '<div class="popup-pro-table"><table><tbody>';
    for (const [k, v] of Object.entries(feature.properties)) {
        if(k !== '_app_id') content += `<tr><td><b>${k}</b></td><td>${v}</td></tr>`;
    }
    e.target.bindPopup(`${content}</tbody></table></div>`).openPopup();
    
    const tableRow = document.querySelector(`tr[data-id="${feature.properties._app_id}"]`);
    if (tableRow) {
        document.querySelectorAll('tbody tr').forEach(tr => tr.classList.remove('selected-row'));
        tableRow.classList.add('selected-row');
        tableRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// =============================
// TABLA DE ATRIBUTOS
// =============================
function renderTable(layerName) {
    const data = AppState.geoData[layerName];
    const container = document.getElementById('tablaContenido');
    if (!data) return;

    let fields = Object.keys(data.features[0].properties).filter(k => k !== '_app_id');
    let html = '<table><thead><tr>';
    fields.forEach(f => html += `<th>${f}</th>`);
    html += '</tr></thead><tbody>';

    data.features.forEach(feat => {
        html += `<tr data-id="${feat.properties._app_id}">`;
        fields.forEach(f => html += `<td>${feat.properties[f] !== null ? feat.properties[f] : ''}</td>`);
        html += '</tr>';
    });
    container.innerHTML = html + '</tbody></table>';
    document.getElementById('tableCount').innerText = `${data.features.length} registros`;

    container.querySelectorAll('tbody tr').forEach(tr => {
        tr.addEventListener('click', function() {
            container.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected-row'));
            this.classList.add('selected-row');
            const id = parseInt(this.getAttribute('data-id'));
            const lLayer = AppState.layers[layerName].getLayers().find(l => l._app_id === id);
            if (lLayer) {
                map.fitBounds(lLayer.getBounds(), { padding: [50, 50] });
                highlightFeatureOnMap(lLayer, layerName);
                let content = '<div class="popup-pro-table"><table><tbody>';
                for (const [k, v] of Object.entries(lLayer.feature.properties)) {
                    if(k !== '_app_id') content += `<tr><td><b>${k}</b></td><td>${v}</td></tr>`;
                }
                lLayer.bindPopup(`${content}</tbody></table></div>`).openPopup();
            }
        });
    });
}

function updateLayerSelector() {
    const sel = document.getElementById('selectorCapa');
    sel.innerHTML = '<option value="" disabled selected>Seleccione una capa</option>';
    Object.keys(AppState.layers).forEach(k => { sel.innerHTML += `<option value="${k}">${k}</option>`; });
}

document.getElementById('selectorCapa').addEventListener('change', e => {
    AppState.currentLayerKey = e.target.value;
    document.getElementById('capaStats').innerText = `Capa activa: ${AppState.currentLayerKey}`;
    renderTable(AppState.currentLayerKey);
    updateDashboard(AppState.currentLayerKey);
});

// =============================
// DASHBOARD
// =============================
function updateDashboard(layerName) {
    const data = AppState.geoData[layerName];
    if (!data || !data.features.length) return;

    const total = data.features.length;
    const fields = Object.keys(data.features[0].properties).filter(k => k !== '_app_id');
    
    document.getElementById('kpiTotal').innerText = total;
    document.getElementById('kpiCampos').innerText = fields.length;

    let chartField = null;
    let fieldCounts = {};

    for (let field of fields) {
        let counts = {};
        data.features.forEach(f => {
            let val = String(f.properties[field] || 'N/A');
            counts[val] = (counts[val] || 0) + 1;
        });
        const uniqueCount = Object.keys(counts).length;
        if (uniqueCount > 1 && uniqueCount < 15) {
            chartField = field;
            fieldCounts = counts;
            break;
        }
    }

    if (AppState.chartInstance) AppState.chartInstance.destroy();

    const ctx = document.getElementById('mainChart').getContext('2d');
    const textColor = AppState.isDarkMode ? '#fff' : '#666';
    
    if (chartField) {
        AppState.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(fieldCounts),
                datasets: [{
                    data: Object.values(fieldCounts),
                    backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#34495e']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor } }, title: { display: true, text: `Distribución por: ${chartField}`, color: textColor } } }
        });
    } else {
        AppState.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Entidades'], datasets: [{ label: 'Total', data: [total], backgroundColor: '#3498db' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor } } }, scales: { y: { ticks: { color: textColor } }, x: { ticks: { color: textColor } } } }
        });
    }
}

// =============================
// EXPORTACIÓN DE DATOS
// =============================
document.getElementById('btnExportCSV').addEventListener('click', () => {
    if (!AppState.currentLayerKey) return showToast("Seleccione una capa", "warning");
    const data = AppState.geoData[AppState.currentLayerKey];
    let fields = Object.keys(data.features[0].properties).filter(k => k !== '_app_id');
    let csv = fields.join(',') + '\n';
    
    data.features.forEach(f => {
        let row = fields.map(field => `"${String(f.properties[field] || '').replace(/"/g, '""')}"`);
        csv += row.join(',') + '\n';
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${AppState.currentLayerKey}_export.csv`;
    link.click();
    showToast("CSV Descargado", "success");
});

document.getElementById('btnExportSHP').addEventListener('click', () => {
    if (!AppState.currentLayerKey) return showToast("Seleccione una capa", "warning");
    const data = AppState.geoData[AppState.currentLayerKey];
    toggleLoader(true, "Generando Shapefile...");
    
    const cleanGeoJSON = JSON.parse(JSON.stringify(data));
    cleanGeoJSON.features.forEach(f => {
        delete f.properties._app_id;
        for (let key in f.properties) {
            if (f.properties[key] === null || f.properties[key] === undefined) f.properties[key] = "";
        }
    });

    try {
        const zipBase64 = shpwrite.zip(cleanGeoJSON, { folder: AppState.currentLayerKey });
        const link = document.createElement('a');
        link.href = 'data:application/zip;base64,' + zipBase64;
        link.download = AppState.currentLayerKey + '_shp.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Shapefile Descargado", "success");
    } catch (error) {
        console.error("Error shpwrite:", error);
        showToast("Error al exportar SHP", "error");
    } finally {
        toggleLoader(false);
    }
});

// =============================
// NUEVO BUSCADOR CON AUTOCOMPLETADO
// =============================
let searchTimeout;

document.getElementById('globalSearch').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    const suggestionsBox = document.getElementById('searchSuggestions');
    
    if (query.length < 3 || /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/.test(query)) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=co`);
            const data = await res.json();
            
            suggestionsBox.innerHTML = '';
            if(data.length > 0) {
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.innerText = item.display_name;
                    li.onclick = () => {
                        document.getElementById('globalSearch').value = item.display_name;
                        suggestionsBox.classList.add('hidden');
                        irAUbicacion(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
                    };
                    suggestionsBox.appendChild(li);
                });
                suggestionsBox.classList.remove('hidden');
            } else {
                suggestionsBox.classList.add('hidden');
            }
        } catch (err) {
            console.error("Error geocoding:", err);
        }
    }, 400);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        document.getElementById('searchSuggestions').classList.add('hidden');
    }
});

function buscarUbicacionManual() {
    const query = document.getElementById('globalSearch').value.trim();
    if (!query) return;
    
    const match = query.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (match) {
        irAUbicacion(parseFloat(match[1]), parseFloat(match[3]), `Coordenadas: ${match[1]}, ${match[3]}`);
        return;
    }
    
    const primerLi = document.querySelector('#searchSuggestions li');
    if (primerLi) primerLi.click();
}

document.getElementById('btnSearch').addEventListener('click', buscarUbicacionManual);
document.getElementById('globalSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarUbicacionManual();
});

function irAUbicacion(lat, lng, popupText) {
    map.setView([lat, lng], 16);
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>Ubicación</b><br>${popupText}`)
        .openPopup();
}

// =============================
// EXPORTAR MAPA A IMAGEN
// =============================
document.getElementById('btnExportMap').addEventListener('click', () => {
    toggleLoader(true, "Generando imagen...");
    const controls = document.querySelector('.leaflet-control-container');
    controls.style.display = 'none';

    html2canvas(document.getElementById('map'), {
        useCORS: true, 
        allowTaint: false,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mapa_exportado.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        controls.style.display = '';
        toggleLoader(false);
        showToast("Imagen descargada", "success");
    }).catch(err => {
        console.error(err);
        controls.style.display = '';
        toggleLoader(false);
        showToast("Error al exportar PNG", "error");
    });
});

// =============================
// CARGA LOCAL DE ARCHIVOS (RESTAURADA)
// =============================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const name = file.name.split('.')[0];
    toggleLoader(true, `Procesando ${file.name}...`);

    try {
        if (ext === 'zip') {
            const buffer = await file.arrayBuffer();
            const geojson = await shp(buffer);
            processGeoJSON(geojson, name);
        } else if (ext === 'geojson' || ext === 'json') {
            const text = await file.text();
            processGeoJSON(JSON.parse(text), name);
        } else if (ext === 'kml' || ext === 'gpx') {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const geojson = ext === 'kml' ? toGeoJSON.kml(xmlDoc) : toGeoJSON.gpx(xmlDoc);
            processGeoJSON(geojson, name);
        } else {
            throw new Error("Formato no soportado.");
        }
        
        // Simular clic en la pestaña "Consulta" para que el usuario vea su capa nueva
        document.querySelector('[data-target="tab-consulta"]').click();
        showToast(`Archivo ${name} procesado con éxito`, "success");

    } catch (err) {
        showToast(`Error al cargar el archivo: Verifica el formato.`, "error");
        console.error("Error en la carga:", err);
    } finally {
        toggleLoader(false);
        fileInput.value = ''; // Resetea el input para poder subir el mismo archivo si se desea
    }
}

// =============================
// UI TABS & RESIZE
// =============================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

const resizeBar = document.getElementById('resizeBar');
const app = document.getElementById('app');
const panelInferior = document.getElementById('panelInferior');
const mapDiv = document.getElementById('map');
let isResizing = false;

resizeBar.addEventListener('mousedown', (e) => {
    isResizing = true;
    e.preventDefault();
    document.body.style.cursor = 'ns-resize';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    let newMapHeight = e.clientY - app.getBoundingClientRect().top;
    if (newMapHeight < 200) newMapHeight = 200;
    if (newMapHeight > app.clientHeight - 160) newMapHeight = app.clientHeight - 160;
    mapDiv.style.height = `${newMapHeight}px`;
    panelInferior.style.height = `${app.clientHeight - newMapHeight - 6}px`; 
    map.invalidateSize();
});

document.addEventListener('mouseup', () => {
    if (isResizing) { isResizing = false; document.body.style.cursor = 'default'; map.invalidateSize(); }
});

document.getElementById('btnToggleTheme').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    AppState.isDarkMode = document.body.classList.contains('dark-mode');
    if(AppState.isDarkMode) {
        map.removeLayer(baseMaps["OSM Light"]);
        baseMaps["Carto Dark"].addTo(map);
    } else {
        map.removeLayer(baseMaps["Carto Dark"]);
        baseMaps["OSM Light"].addTo(map);
    }
});

document.getElementById('btnClearSelection').addEventListener('click', () => {
    if (highlightLayer && highlightParentLayer) highlightParentLayer.resetStyle(highlightLayer);
    document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected-row'));
    map.closePopup();
    showToast("Selección limpiada");
});

function toggleLoader(show, text="Cargando...") {
    document.getElementById('loaderText').innerText = text;
    show ? document.getElementById('loader').classList.remove('hidden') : document.getElementById('loader').classList.add('hidden');
}
function showToast(msg, icon='info') {
    Swal.fire({ toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, icon: icon, title: msg });
}