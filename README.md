🌍 Geovisor Medellín 

Geovisor web interactivo desarrollado con Leaflet.js para la visualización, análisis y exploración de datos espaciales en la ciudad de Medellín. Este visor integra herramientas avanzadas de consulta, análisis, carga de datos y visualización geográfica en una sola interfaz moderna.

🚀 Características Principales
Visualización de datos geoespaciales en formato GeoJSON
Gestión de múltiples capas vectoriales
Herramientas de dibujo y medición (distancias, áreas)
Tabla de atributos interactiva con filtrado
Dashboard dinámico con métricas y gráficos
Carga de archivos locales (GeoJSON, KML, GPX, Shapefile)
Exportación de datos (CSV y Shapefile)
Exportación del mapa como imagen (PNG)
Búsqueda geográfica (coordenadas o texto)
Modo oscuro / claro
Mini mapa y control de pantalla completa
🧱 Estructura del Proyecto
geovisor-medellin/
│
├── index.html
├── styles.css
├── scripts.js
├── data/
│   └── comunas.json
🗺️ Tecnologías Utilizadas
Leaflet.js
Leaflet Draw
Leaflet Measure
Chart.js
SweetAlert2
shp.js
shp-write
html2canvas
⚙️ Funcionalidades Técnicas
🔹 Visualización de capas

El sistema permite cargar y visualizar capas vectoriales dinámicamente mediante archivos GeoJSON.

const capasConfig = [
  { key: 'comunas', nombre: 'Comunas', url: 'data/comunas.json' }
];
🔹 Herramientas de dibujo y análisis

El visor permite crear geometrías directamente sobre el mapa (puntos, líneas, polígonos, rectángulos y círculos). Cada geometría calcula automáticamente área, perímetro y longitud.

🔹 Tabla de atributos

Visualización tabular de entidades con filtrado en tiempo real, selección de registros y exportación a CSV o SHP.

🔹 Dashboard

Visualización de KPIs como número total de entidades, cantidad de atributos y gráficos dinámicos generados con Chart.js.

🔹 Carga de datos locales

Permite cargar archivos directamente en el visor mediante drag & drop.

Formatos soportados:

.geojson
.json
.kml
.gpx
.zip (Shapefile)
🔹 Exportaciones

Exportación del mapa como imagen PNG y exportación de datos en formatos CSV y Shapefile.

🧭 Controles del Mapa
Zoom personalizado
Botón de "Home" (reset de vista)
Pantalla completa
Mini mapa
Coordenadas en tiempo real
🔍 Búsqueda

Permite buscar coordenadas (lat, lon) y ubicaciones (según implementación).

🌗 Modo Oscuro

Cambio dinámico entre tema claro y oscuro.

🧪 Estado del Proyecto

✔ Funcional
✔ Escalable
✔ Modular

Mejoras futuras:

Zoom automático desde tabla de atributos
Integración con servicios WMS/WFS
Persistencia de capas cargadas
Optimización para grandes volúmenes de datos
📦 Instalación y Uso
Clonar repositorio:
git clone https://github.com/tu-usuario/geovisor-medellin.git
Ingresar al proyecto:
cd geovisor-medellin
Ejecutar en servidor local:
npx serve
Abrir en navegador:
http://localhost:3000
📌 Recomendaciones
Ejecutar en servidor local para evitar problemas de CORS
Usar archivos .zip válidos para shapefiles
Mantener la estructura de carpetas
👨‍💻 Autor

Proyecto desarrollado para análisis geoespacial y visualización SIG.

📄 Licencia

Uso académico y profesional. Libre para modificación y adaptación.
