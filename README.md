Este es un archivo `README.md` estructurado de manera profesional, diseñado para resaltar tanto las capacidades técnicas como el valor analítico de tu geovisor.

---

```markdown
# GeoAnalytics Web | Visor Geográfico Avanzado

GeoAnalytics Web es una aplicación de visualización y análisis espacial de alto rendimiento basada en tecnologías web modernas. Este geovisor ha sido diseñado para profesionales de GIS, geólogos y científicos de datos que requieren una herramienta ligera pero potente para la exploración de datos vectoriales, análisis estadístico y gestión de información geográfica en tiempo real.

![Licencia](https://img.shields.io/badge/Licencia-MIT-green)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## 🚀 Características Principales

### 🗺️ Visualización e Interacción
- **Múltiples Mapas Base:** Alternancia entre Esri Imagery, OSM Light y Carto Dark.
- **Sincronización Bidireccional:** Interacción fluida entre el mapa y la tabla de atributos; al seleccionar una entidad en el mapa, se resalta en la tabla y viceversa.
- **Popups Profesionales:** Ventanas emergentes con diseño limpio, tablas de atributos dinámicas y botones de acción rápida (Zoom, Copiar JSON).
- **Modo Oscuro/Claro:** Interfaz adaptativa que ajusta tanto los colores de la UI como el mapa base para reducir la fatiga visual.

### 📊 Análisis y Datos
- **Dashboard Interactivo:** Generación automática de KPIs (Total de entidades, cantidad de atributos) y gráficos estadísticos dinámicos mediante **Chart.js**.
- **Tabla de Atributos Pro:** Soporte para filtrado en tiempo real, búsqueda avanzada y resaltado de selección.
- **Buscador Inteligente:** Integración con la API de Nominatim para búsqueda de direcciones y soporte nativo para coordenadas decimales.

### 🛠️ Herramientas GIS
- **Carga Local Multi-formato:** Soporte para arrastrar y soltar (Drag & Drop) archivos **GeoJSON, KML, GPX** y **Shapefile (comprimido en .zip)**.
- **Dibujo y Medición:** Herramientas para crear geometrías (puntos, líneas, polígonos) con cálculo automático de áreas geodésicas y longitudes.
- **Exportación Avanzada:** - Descarga de datos en **CSV** (optimizado para Excel).
  - Exportación de capas a **Shapefile (.zip)** directamente desde el navegador.
  - Captura de pantalla del mapa en formato **PNG**.

## 🛠️ Stack Tecnológico

El proyecto está construido bajo el paradigma de **Vanilla JavaScript**, priorizando el rendimiento y la ausencia de dependencias pesadas:

- **Motor de Mapas:** [Leaflet.js](https://leafletjs.com/)
- **Interfaz de Usuario:** HTML5, CSS3 (Arquitectura Glassmorphism), FontAwesome 6.
- **Gráficos:** [Chart.js](https://www.chartjs.org/)
- **Procesamiento Espacial:** - `shpjs` (Lectura de SHP).
  - `shp-write` (Escritura de SHP).
  - `togeojson` (Conversión KML/GPX).
- **Utilidades:** SweetAlert2 (Notificaciones), html2canvas (Captura de imagen).

## 📂 Estructura del Proyecto

```text
├── index.html          # Estructura principal y carga de librerías
├── styles.css          # Estilos avanzados, variables y modo oscuro
├── scripts.js          # Lógica central, eventos GIS y gestión de estado
└── data/               # Carpeta opcional para capas estáticas iniciales (comunas.json)
```

## ⚙️ Instalación y Uso

1. **Clonar o Descargar:** Descarga los archivos del repositorio en tu máquina local.
2. **Servidor Local:** Debido a las políticas de seguridad de los navegadores (CORS) para archivos JSON locales, se recomienda abrir el proyecto usando un servidor local.
   - Si usas VS Code, utiliza la extensión **Live Server**.
   - O usa Python: `python -m http.server 8000`.
3. **Acceso:** Abre tu navegador en `http://localhost:8000`.

## 📖 Guía de Usuario Rápida

1. **Cargar Datos:** Ve a la pestaña **"Carga Local"**, arrastra un archivo `.zip` que contenga un Shapefile o un archivo `.geojson`.
2. **Consultar:** Haz clic en cualquier polígono del mapa para ver su información en la tabla inferior y el popup.
3. **Analizar:** Cambia a la pestaña **"Dashboard"** para ver la distribución estadística de los atributos de la capa activa.
4. **Buscar:** Escribe una dirección o coordenadas (ej. `6.24, -75.58`) en la barra superior y presiona Enter.

---
Desarrollado con ❤️ para la comunidad académica y profesional de Geociencias y Datos.
```

### Consejos adicionales para tu README:
* **Capturas de pantalla:** Te recomiendo añadir una carpeta llamada `img/` y poner un par de capturas de pantalla de tu geovisor (el mapa, el modo oscuro y el dashboard). Luego las referencias en el markdown como `![Screenshot](img/screenshot.png)`.
* **Sección de Créditos:** Si este proyecto es parte de tu tesis de Maestría en la UPB, podrías añadir una sección final mencionando la institución.
