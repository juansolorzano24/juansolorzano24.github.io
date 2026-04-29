
```markdown
# GeoAnalytics Web | Visor Geográfico Avanzado

GeoAnalytics Web es una aplicación de visualización y análisis espacial de alto rendimiento basada en tecnologías web modernas. Este geovisor ha sido diseñado para profesionales de los Sistemas de Información Geográfica (SIG), geociencias y ciencia de datos que requieren una herramienta ligera pero potente para la exploración de datos vectoriales, análisis estadístico y gestión de información territorial en tiempo real.

![Licencia](https://img.shields.io/badge/Licencia-MIT-green)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## 🚀 Características Principales

### 🗺️ Visualización e Interacción
- **Múltiples Mapas Base:** Alternancia entre Esri Imagery, OSM Light y Carto Dark.
- **Sincronización Bidireccional:** Interacción fluida entre el mapa y la tabla de atributos; al seleccionar una entidad en el mapa, se resalta en la tabla y viceversa con auto-scroll.
- **Popups Profesionales:** Ventanas emergentes con diseño limpio, tablas de atributos iteradas dinámicamente y botones de acción rápida (Zoom a la entidad, Copiar JSON).
- **Modo Oscuro/Claro:** Interfaz adaptativa que ajusta tanto los colores de la UI (Glassmorphism) como el mapa base para reducir la fatiga visual.

### 📊 Análisis y Datos
- **Dashboard Interactivo:** Generación automática de KPIs (Total de entidades, cantidad de atributos) y gráficos estadísticos dinámicos (Doughnut / Bar Charts) mediante **Chart.js**, detectando automáticamente variables categóricas.
- **Tabla de Atributos Pro:** Soporte para filtrado en tiempo real, búsqueda avanzada y selección de registros vinculados a la geometría.
- **Buscador Geocodificador:** Integración con la API de Nominatim (OpenStreetMap) orientada a Colombia para búsqueda de direcciones con autocompletado y soporte nativo para búsqueda por coordenadas decimales (Lat, Lon).

### 🛠️ Herramientas GIS Espaciales
- **Carga Local Multi-formato (Drag & Drop):** Ingesta *Client-Side* de archivos **GeoJSON, KML, GPX** y **Shapefile (comprimido en .zip)**.
- **Geometría y Medición Avanzada:** Herramientas para crear geometrías (puntos, líneas, polígonos) con cálculo automático y preciso de áreas geodésicas (m²) y longitudes (m).
- **Exportación de Datos Espaciales:** - Descarga de atributos en **CSV** (Codificación UTF-8 con BOM para compatibilidad total con Excel).
  - Exportación de capas vectoriales a **Shapefile (.zip)** directamente desde el navegador, saltando restricciones de red mediante Blobs.
  - Captura de pantalla del lienzo del mapa (bypass CORS) en formato **PNG** de alta calidad.

## 🛠️ Stack Tecnológico

El proyecto está construido bajo el paradigma de **Vanilla JavaScript**, priorizando el rendimiento, la modularidad y la ausencia de frameworks pesados:

- **Motor de Mapas:** [Leaflet.js](https://leafletjs.com/)
- **Interfaz de Usuario:** HTML5, CSS3 (CSS Variables, Flexbox/Grid), FontAwesome 6.
- **Visualización de Datos:** [Chart.js](https://www.chartjs.org/)
- **Procesamiento Espacial en Navegador:** - `shpjs` (Lectura y parseo de Shapefiles en formato .zip).
  - `shp-write` (Escritura y empaquetado de Shapefiles).
  - `togeojson` (Conversión de XML/KML/GPX a GeoJSON).
- **Utilidades:** SweetAlert2 (Notificaciones asíncronas), html2canvas (Renderizado DOM a Canvas).

## 📂 Estructura del Proyecto

```text
├── index.html          # Estructura principal, UI modular y carga de librerías CDN
├── styles.css          # Estilos avanzados, diseño responsive y variables de modo oscuro
├── scripts.js          # Lógica central (Estado, Controladores GIS, Listeners, Exportación)
└── data/               # Directorio para capas estáticas iniciales (ej. comunas.json)
```

## ⚙️ Instalación y Uso Local

Al ser una arquitectura estrictamente *Frontend*, no requiere compilación ni dependencias de Node.js.

1. **Clonar el Repositorio:** Descarga los archivos en tu entorno local.
2. **Servidor Local:** Debido a las políticas de seguridad de los navegadores (CORS) para la lectura de archivos locales y exportación de Canvas, se requiere un servidor local ligero:
   - En **VS Code**: Utiliza la extensión *Live Server*.
   - En **Python**: Ejecuta `python -m http.server 8000` en la raíz del proyecto.
3. **Ejecución:** Abre tu navegador en `http://localhost:8000`.

## 👨‍💻 Autor

**Juan David Solorzano Vanegas**
*Geólogo | Especialista en Sistemas de Información Geográfica (SIG)*
*Maestría en Ciencia de Datos y Analítica - Universidad Pontificia Bolivariana (UPB)*

---
*Desarrollado para la optimización de flujos de trabajo espaciales y la integración de herramientas web de código abierto en la gestión territorial.*
```
