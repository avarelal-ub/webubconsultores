# Diagnóstico UB: envío del PDF por correo

El test vive en `index.html` (vista `#diagnostico`). Muestra el resultado en pantalla al instante.
Para enviar el PDF por correo, la página llama a una **app web de Google Apps Script** (esta carpeta).

## Qué hace cada archivo

| Archivo | Para qué sirve |
|---|---|
| `diagnostico/datos.json` | **Única fuente** de preguntas, bandas, textos y recomendaciones. Es lo único que se edita. |
| `diagnostico/build.py` | Copia `datos.json` a `index.html` y a `apps-script/Datos.gs`. |
| `apps-script/Datos.gs` | Generado. No editar a mano. |
| `apps-script/Codigo.gs` | Recibe las respuestas, recalcula el puntaje, envía los correos (al prospecto y al equipo de UB) y guarda el lead en una hoja. |
| `apps-script/Pdf.gs` | Genera el PDF sobre la hoja membretada de UB (copia el Google Doc "UB_Hoja Membretada General", escribe el diagnóstico y lo exporta). Si falla, `Codigo.gs` envía un PDF de respaldo sin membrete. |

Si cambias una pregunta o una recomendación: edita `datos.json`, corre `python3 diagnostico/build.py`,
pega de nuevo `Datos.gs` en Apps Script y vuelve a implementar.

## Instalación (una sola vez, con la cuenta que enviará los correos)

1. En <https://script.google.com> crea un proyecto nuevo.
2. Crea cuatro archivos de script y pega el contenido de `Datos.gs`, `Codigo.gs`, `Pdf.gs` y `Reporte.gs` (sin tocarlos). `Datos.gs` debe quedar **primero** en la lista de archivos.
3. En `Codigo.gs`, revisa `CONFIG`: `REPLY_TO`, `CORREO_INTERNO`, `URL_AGENDA` y `PLANTILLA_DOC_ID` (el Google Doc de la hoja membretada; la cuenta que implementa el script debe poder abrirlo).
4. Ejecuta `configurar()` una vez y acepta los permisos (Hojas, Drive, Documentos y Gmail). Crea la hoja "UB Mini Diagnóstico - Resultados".
5. Ejecuta `probarCalculo()` (ver registros) y `probarPdfEnDrive()`: guarda un PDF de prueba en tu Drive para **revisar el diseño con el membrete** (el registro muestra su enlace). `probarPdf()` te lo manda por correo.
6. **Implementar → Nueva implementación → Aplicación web**: ejecutar como **Yo**, acceso **Cualquier persona**.
7. Copia la URL que termina en `/exec` y pégala en `index.html`, en la constante `ENDPOINT` (busca `var ENDPOINT = '';`).
8. Sube el cambio a GitHub. Haz una prueba real con tu correo.

Cada vez que cambies `Codigo.gs` o `Datos.gs` debes crear una **nueva versión** de la implementación; la URL se mantiene.

## PDF con la hoja membretada

El PDF se genera copiando el Google Doc de la hoja membretada, así que el logo, la línea, la marca de agua y el pie
salen igual que en la hoja de UB, en todas las páginas. El texto usa Montserrat 10 pt (como la plantilla) y márgenes de
108 pt arriba, 98 abajo y 60 a los lados, medidos para no pisar el logo ni el pie. La copia temporal se manda a la papelera
después de cada envío. Si cambias el membrete, edita ese mismo Doc; si cambias sus medidas, ajusta `PDF.MARGEN` en `Pdf.gs`.

## Reporte interno para el equipo de UB

`Reporte.gs` genera, para cada diagnóstico, un PDF de uso interno sobre la misma hoja membretada y lo adjunta al aviso
"Nuevo lead" que llega a `CORREO_INTERNO`. Incluye: ficha de contacto, **lectura rápida** de lo que necesitaría la empresa,
resultados por sistema, perfil de quien respondió, sus respuestas abiertas y las 20 preguntas con la opción elegida y su
valoración (Sólido, Parcial o Ausente). La lectura rápida se arma con reglas simples y los textos de `datos.json`
(`lecturaRapida`); son hipótesis de trabajo para validar en el Diagnóstico Profundo. Si el PDF falla, el aviso se envía
igual, sin adjunto, y el error queda en la hoja "Log". El prospecto sigue recibiendo su propio PDF, sin cambios.

## Citas del libro

Cada recomendación de `datos.json` lleva un campo `libro` (`ref`, `pag`, `cita`) con un pasaje textual de
*Tu mayor desafío* (LID Editorial, 2026) y su página impresa. Las 20 citas se verificaron palabra por palabra contra el PDF
del libro. Si cambias una, conserva el texto exacto del libro y la página. Los enlaces de Amazon y los videos y podcasts
(`libros`, `recursos`) también están en `datos.json`.

## Notas

- Los correos salen desde la cuenta de Google que implementa el script (límite de Gmail: ~100 correos al día con cuenta gratuita, ~1,500 con Workspace).
- El puntaje se recalcula en el servidor; la página solo manda los índices de las opciones elegidas.
- Un mismo correo no puede pedir otro envío en 10 minutos, y un campo oculto descarta bots.
- Los datos de contacto son datos personales. El sitio incluye una página de **Aviso de privacidad** (`#privacidad`), enlazada desde la casilla de aceptación del test y desde el pie. Es un texto base: conviene que lo revise el área legal de UB (razón social, finalidades, plazos y el correo de contacto).
