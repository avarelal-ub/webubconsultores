#!/usr/bin/env python3
"""Sincroniza el contenido del diagnóstico (diagnostico/datos.json) con:
  - index.html            -> bloque entre /*DX:START*/ y /*DX:END*/
  - apps-script/Datos.gs  -> const DX = {...};

Uso (desde la raíz del repositorio):  python3 diagnostico/build.py
Edita SOLO datos.json (preguntas, bandas, recomendaciones) y vuelve a correr este script.
"""
import json
import re
from pathlib import Path

raiz = Path(__file__).resolve().parent.parent
datos = json.loads((raiz / "diagnostico" / "datos.json").read_text(encoding="utf-8"))
compacto = json.dumps(datos, ensure_ascii=False, separators=(",", ":"))
# Evita que un "</script>" dentro de un texto cierre la etiqueta en el HTML.
compacto_html = compacto.replace("</", "<\\/")

html_path = raiz / "index.html"
html = html_path.read_text(encoding="utf-8")
patron = re.compile(r"/\*DX:START\*/.*?/\*DX:END\*/", re.S)
if len(patron.findall(html)) != 1:
    raise SystemExit("index.html debe tener exactamente un bloque /*DX:START*/.../*DX:END*/")
html_path.write_text(
    patron.sub(lambda _: "/*DX:START*/" + compacto_html + "/*DX:END*/", html), encoding="utf-8"
)

gs = (
    "// ARCHIVO GENERADO por diagnostico/build.py a partir de diagnostico/datos.json. No lo edites a mano.\n"
    "const DX = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n"
)
(raiz / "apps-script" / "Datos.gs").write_text(gs, encoding="utf-8")
print("Listo: index.html y apps-script/Datos.gs actualizados.")
