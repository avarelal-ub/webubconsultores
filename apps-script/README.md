# Diagnóstico UB: envío del PDF por correo

El test vive en `index.html` (vista `#diagnostico`). Muestra el resultado en pantalla al instante.
Para enviar el PDF por correo, la página llama a una **app web de Google Apps Script** (esta carpeta).

## Qué hace cada archivo

| Archivo | Para qué sirve |
|---|---|
| `diagnostico/datos.json` | **Única fuente** de preguntas, bandas, textos y recomendaciones. Es lo único que se edita. |
| `diagnostico/build.py` | Copia `datos.json` a `index.html` y a `apps-script/Datos.gs`. |
| `apps-script/Datos.gs` | Generado. No editar a mano. |
| `apps-script/Codigo.gs` | Recibe las respuestas, recalcula el puntaje, genera el PDF, envía los correos y guarda el lead en una hoja. |

Si cambias una pregunta o una recomendación: edita `datos.json`, corre `python3 diagnostico/build.py`,
pega de nuevo `Datos.gs` en Apps Script y vuelve a implementar.

## Instalación (una sola vez, con la cuenta que enviará los correos)

1. En <https://script.google.com> crea un proyecto nuevo.
2. Crea dos archivos de script y pega el contenido de `Datos.gs` y de `Codigo.gs` (sin tocarlos).
3. En `Codigo.gs`, revisa `CONFIG`: `REPLY_TO`, `CORREO_INTERNO` y `URL_AGENDA`.
4. Ejecuta `configurar()` una vez y acepta los permisos (crea la hoja "UB Mini Diagnóstico - Resultados").
5. Ejecuta `probarCalculo()` (ver registros) y `probarPdf()` (te manda un PDF de prueba a tu correo).
6. **Implementar → Nueva implementación → Aplicación web**: ejecutar como **Yo**, acceso **Cualquier persona**.
7. Copia la URL que termina en `/exec` y pégala en `index.html`, en la constante `ENDPOINT` (busca `var ENDPOINT = '';`).
8. Sube el cambio a GitHub. Haz una prueba real con tu correo.

Cada vez que cambies `Codigo.gs` o `Datos.gs` debes crear una **nueva versión** de la implementación; la URL se mantiene.

## Notas

- Los correos salen desde la cuenta de Google que implementa el script (límite de Gmail: ~100 correos al día con cuenta gratuita, ~1,500 con Workspace).
- El puntaje se recalcula en el servidor; la página solo manda los índices de las opciones elegidas.
- Un mismo correo no puede pedir otro envío en 10 minutos, y un campo oculto descarta bots.
- Los datos de contacto son datos personales: agrega el **aviso de privacidad** de UB y enlázalo en la casilla de aceptación del paso 1 del test.
