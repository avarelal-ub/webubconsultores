/**
 * PDF DEL DIAGNÓSTICO CON LA HOJA MEMBRETADA DE UB
 * ---------------------------------------------------------------------------
 * Copia el Google Doc "UB_Hoja Membretada General" (CONFIG.PLANTILLA_DOC_ID),
 * escribe el diagnóstico encima y lo exporta a PDF. Así el logo, la línea, la
 * marca de agua y el pie salen exactamente como en la hoja membretada de UB.
 *
 * Si algo falla (permisos, plantilla movida, etc.) se usa el PDF de respaldo
 * (construirPdfHtml_ en Codigo.gs) para que el prospecto reciba su diagnóstico
 * de todos modos, y el error queda registrado en la hoja "Log".
 *
 * Medidas del membrete (puntos, hoja carta 612 x 792): el logo llega hasta y=74
 * y la línea turquesa está en y=88; el pie empieza en y=709; el texto del
 * membrete ocupa de x=59 a x=553. Por eso los márgenes del contenido son
 * 108 arriba, 98 abajo y 60 a los lados (ancho útil: 492).
 */

const PDF = {
  FUENTE: 'Montserrat',
  TEXTO: '#434343',
  AZUL: '#06536B',
  LIMA: '#CBDC2F',
  GRIS: '#F3F5F6',
  RIEL: '#E3E6E8',
  ANCHO: 492,
  MARGEN: { arriba: 108, abajo: 98, lados: 60 }
};

const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function fechaEs_(fecha) {
  const f = Utilities.formatDate(fecha, 'America/Mexico_City', 'd|M|yyyy').split('|');
  return f[0] + ' de ' + MESES_ES[parseInt(f[1], 10) - 1] + ' de ' + f[2];
}

/** Devuelve el PDF (Blob) del diagnóstico. Nunca lanza: si falla la plantilla, usa el diseño de respaldo. */
function generarPdf_(lead, res) {
  const nombre = 'Diagnostico UB - ' + lead.empresa.replace(/[^\w\- áéíóúñÁÉÍÓÚÑ]/g, '');
  try {
    return pdfDesdePlantilla_(lead, res, nombre);
  } catch (err) {
    registrarError_(null, 'PDF con membrete falló, se envió el de respaldo: ' + err.message);
    return Utilities.newBlob(construirPdfHtml_(lead, res), 'text/html', 'diagnostico.html')
      .getAs('application/pdf').setName(nombre + '.pdf');
  }
}

function pdfDesdePlantilla_(lead, res, nombre) {
  const copia = DriveApp.getFileById(CONFIG.PLANTILLA_DOC_ID).makeCopy('TEMPORAL ' + nombre);
  try {
    const doc = DocumentApp.openById(copia.getId());
    llenarDoc_(doc.getBody(), lead, res);
    doc.saveAndClose();
    return copia.getAs('application/pdf').setName(nombre + '.pdf');
  } finally {
    copia.setTrashed(true);
  }
}

// ---------------------------------------------------------------------------
// Contenido
// ---------------------------------------------------------------------------
function llenarDoc_(body, lead, res) {
  body.setMarginTop(PDF.MARGEN.arriba);
  body.setMarginBottom(PDF.MARGEN.abajo);
  body.setMarginLeft(PDF.MARGEN.lados);
  body.setMarginRight(PDF.MARGEN.lados);
  // No se vacía el cuerpo de la plantilla: su párrafo vacío inicial se conserva (por si el membrete está anclado ahí) y se hace diminuto.
  estilo_(body.getParagraphs()[0], { size: 1, despues: 0, interlineado: 1 });

  const g = res.Global;

  // --- Portada del resultado ---
  parrafo_(body, 'DIAGNÓSTICO DE INSTITUCIONALIZACIÓN', { size: 8, bold: true, color: PDF.AZUL, despues: 4 });
  parrafo_(body, lead.empresa, { size: 22, bold: true, color: PDF.AZUL, despues: 2, interlineado: 1.1 });
  parrafo_(body, lead.nombre + ' · ' + lead.puesto + ' · ' + fechaEs_(new Date()), { size: 9, despues: 4 });
  // Enlace discreto arriba para agendar sin tener que llegar al final del reporte.
  const arriba = parrafo_(body, 'Revisa estos resultados con un consultor de UB: Agenda tu sesión →', { size: 9, color: PDF.AZUL, despues: 14 });
  const ini = arriba.getText().indexOf('Agenda tu sesión');
  arriba.editAsText().setBold(ini, arriba.getText().length - 1, true);
  arriba.editAsText().setLinkUrl(ini, arriba.getText().length - 1, CONFIG.URL_AGENDA);

  const caja = cajaEn_(body, PDF.GRIS, 14);
  estilo_(primerParrafo_(caja, 'RESULTADO GLOBAL'), { size: 8, bold: true, despues: 2 });
  if (g.pct === null) {
    estilo_(caja.appendParagraph('No evaluable'), { size: 20, bold: true, despues: 4 });
  } else {
    estilo_(caja.appendParagraph(g.pct + '%'), { size: 34, bold: true, color: '#12181D', despues: 4, interlineado: 1.1 });
    chip_(caja.appendParagraph(' ' + g.banda.etiqueta + ' '), g.banda, { despues: 8 });
    estilo_(caja.appendParagraph(g.banda.lectura), { size: 10, despues: 0 });
  }
  espacio_(body, 10);

  // --- Resumen por sistema ---
  SISTEMAS.forEach(function (s) {
    const r = res[s];
    const desc = DX.sistemas.filter(function (x) { return x.clave === s; })[0].descripcion;
    const fila = body.appendTable([['', '']]);
    fila.setBorderWidth(0);
    fila.setColumnWidth(0, PDF.ANCHO - 90);
    fila.setColumnWidth(1, 90);
    const c0 = fila.getRow(0).getCell(0), c1 = fila.getRow(0).getCell(1);
    [c0, c1].forEach(function (c) { c.setPaddingLeft(0); c.setPaddingRight(0); c.setPaddingTop(4); c.setPaddingBottom(2); });
    estilo_(primerParrafo_(c0, 'Sistema ' + s), { size: 12, bold: true, color: PDF.AZUL, despues: 1 });
    estilo_(c0.appendParagraph(desc), { size: 8, despues: 0 });
    estilo_(primerParrafo_(c1, r.pct === null ? 'N/E' : r.pct + '%'), { size: 18, bold: true, color: '#12181D', align: DocumentApp.HorizontalAlignment.RIGHT, despues: 0 });
    if (r.pct !== null) {
      barra_(body, r.pct, r.banda.color);
      chip_(parrafo_(body, ' ' + r.banda.etiqueta + ' ', {}), r.banda, { antes: 5, despues: 3 });
      parrafo_(body, resumenDe_(s, r.banda), { size: 9, despues: 10 });
    } else {
      parrafo_(body, 'Las respuestas indican que este sistema no aplica en la etapa actual de la empresa.', { size: 9, antes: 4, despues: 10 });
    }
  });

  parrafo_(body, 'Los colores siguen el semáforo institucional UB que Alfonso Urrea describe en ' + DX.libroCita +
    ' (' + DX.semaforo.ref + ', p. ' + DX.semaforo.pag + ').', { size: 8, italic: true, despues: 0 });

  // --- Recomendaciones por sistema ---
  body.appendPageBreak();
  titulo_(body, 'Recomendaciones por sistema');
  parrafo_(body, 'Cada recomendación incluye el pasaje del libro ' + DX.libroCita + ', de Alfonso Urrea Martín, donde puedes profundizar.', { size: 9, despues: 6 });

  SISTEMAS.forEach(function (s) {
    const r = res[s];
    parrafo_(body, 'Sistema ' + s, { size: 13, bold: true, color: PDF.AZUL, antes: 12, despues: 4 });
    if (r.pct === null) {
      parrafo_(body, 'Este sistema no aplica en la etapa actual de la empresa.', { size: 9 });
      return;
    }
    const items = r.pendientes.slice().sort(function (a, b) { return a.pts - b.pts; });
    if (items.length === 0) {
      parrafo_(body, 'Sin acciones pendientes en este sistema. Mantén vivas las prácticas actuales y revísalas con periodicidad.', { size: 10 });
    }
    items.forEach(function (it) {
      const etiqueta = it.pts === 0 ? 'PRIORIDAD ALTA' : 'POR FORMALIZAR';
      const p = parrafo_(body, etiqueta + '   ' + it.rec, { size: 10, antes: 6, despues: 3 });
      const t = p.editAsText();
      t.setBold(0, etiqueta.length - 1, true);
      t.setFontSize(0, etiqueta.length - 1, 7);
      t.setForegroundColor(0, etiqueta.length - 1, it.pts === 0 ? '#B93A32' : '#8A6D00');
      notaLibroDoc_(body, it.libro);
    });
    parrafo_(body, 'Para leer en ' + DX.libroCita + ': ' + DX.lecturas[s].map(function (l) {
      return l.ref + ' (p. ' + l.pag + ')';
    }).join(' · '), { size: 8, italic: true, antes: 6, despues: 4 });
  });

  // --- Para profundizar ---
  titulo_(body, 'Para profundizar');
  parrafo_(body, 'Las recomendaciones de este reporte se basan en ' + DX.libroCita + ', de Alfonso Urrea Martín.', { size: 10, despues: 6 });
  DX.libros.forEach(function (l) {
    const p = parrafo_(body, l.titulo + ' (' + l.anio + ')', { size: 10, bold: true, despues: 0 });
    parrafo_(body, l.nota, { size: 9, despues: 0 });
    enlace_(body, l.url, 'Ver en Amazon', 8);
  });
  parrafo_(body, 'Videos y podcasts', { size: 10, bold: true, color: PDF.AZUL, antes: 10, despues: 3 });
  DX.recursos.forEach(function (r) {
    enlace_(body, r.url, r.titulo + ' (' + r.anio + ')', 9);
  });

  // --- Siguiente paso ---
  espacio_(body, 12);
  const cta = cajaEn_(body, PDF.AZUL, 14);
  estilo_(primerParrafo_(cta, 'Siguiente paso: Diagnóstico Profundo'), { size: 11, bold: true, color: '#FFFFFF', despues: 4 });
  estilo_(cta.appendParagraph('Este resultado es un pre-diagnóstico basado únicamente en tus respuestas. Un Diagnóstico Profundo con ' + CONFIG.FIRMA +
    ' permite contrastar estos hallazgos con la mirada de la familia y del equipo directivo, y construir un plan de acción a la medida de ' + conPunto_(lead.empresa)),
    { size: 9, color: '#FFFFFF', despues: 6 });
  const pa = estilo_(cta.appendParagraph('Agenda tu sesión →'), { size: 10, bold: true, color: PDF.LIMA, despues: 0 });
  pa.editAsText().setLinkUrl(CONFIG.URL_AGENDA);
  parrafo_(body, 'Pre-diagnóstico generado automáticamente a partir de las respuestas proporcionadas. No sustituye una evaluación profesional.',
    { size: 7, color: '#888888', antes: 10, despues: 0 });
}

// ---------------------------------------------------------------------------
// Piezas de diseño
// ---------------------------------------------------------------------------
function estilo_(p, o) {
  o = o || {};
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.setFontFamily(PDF.FUENTE);
  p.setFontSize(o.size || 10);
  p.setBold(!!o.bold);
  p.setItalic(!!o.italic);
  p.setForegroundColor(o.color || PDF.TEXTO);
  p.setAlignment(o.align || DocumentApp.HorizontalAlignment.LEFT);
  p.setSpacingBefore(o.antes || 0);
  p.setSpacingAfter(o.despues === undefined ? 6 : o.despues);
  p.setLineSpacing(o.interlineado || 1.2);
  p.setIndentStart(0);
  p.setIndentFirstLine(0);
  return p;
}

function parrafo_(cont, texto, o) {
  return estilo_(cont.appendParagraph(texto), o);
}

function titulo_(body, texto) {
  const p = parrafo_(body, texto, { size: 16, bold: true, color: PDF.AZUL, antes: 18, despues: 4 });
  return p;
}

/** Párrafo vacío de la altura indicada, para separar tablas del contenido siguiente. */
function espacio_(body, alto) {
  return parrafo_(body, '', { size: alto, despues: 0, interlineado: 1 });
}

/** Tabla de una sola celda con fondo de color: sirve como caja. Devuelve la celda. */
function cajaEn_(body, fondo, relleno) {
  const t = body.appendTable([['']]);
  t.setBorderWidth(0);
  t.setColumnWidth(0, PDF.ANCHO);
  const c = t.getRow(0).getCell(0);
  c.setBackgroundColor(fondo);
  c.setPaddingTop(relleno);
  c.setPaddingBottom(relleno);
  c.setPaddingLeft(relleno);
  c.setPaddingRight(relleno);
  return c;
}

/** La celda recién creada trae un párrafo vacío: se reutiliza para el primer texto. */
function primerParrafo_(celda, texto) {
  const p = celda.getChild(0).asParagraph();
  p.setText(texto);
  return p;
}

/** Etiqueta de color (banda) sobre el texto de un párrafo. */
function chip_(p, banda, o) {
  estilo_(p, { size: 8, bold: true, color: banda.texto, despues: o.despues, antes: o.antes });
  const t = p.editAsText();
  const fin = p.getText().length - 1;
  t.setBackgroundColor(0, fin, banda.color);
  return p;
}

/** Barra de avance: tabla de una fila con dos celdas cuyo ancho es proporcional al porcentaje. */
function barra_(body, pct, color) {
  const t = body.appendTable([['', '']]);
  t.setBorderWidth(0);
  const a = Math.max(2, Math.round(PDF.ANCHO * pct / 100));
  const b = Math.max(2, PDF.ANCHO - a);
  t.setColumnWidth(0, a);
  t.setColumnWidth(1, b);
  [[0, color], [1, PDF.RIEL]].forEach(function (par) {
    const c = t.getRow(0).getCell(par[0]);
    c.setBackgroundColor(par[1]);
    c.setPaddingTop(3);
    c.setPaddingBottom(3);
    c.setPaddingLeft(0);
    c.setPaddingRight(0);
    estilo_(c.getChild(0).asParagraph(), { size: 2, despues: 0, interlineado: 1 });
  });
}

/** Cita textual del libro con capítulo y página, en una caja gris. */
function notaLibroDoc_(body, l) {
  const c = cajaEn_(body, PDF.GRIS, 6);
  const h = primerParrafo_(c, 'EN EL LIBRO ' + DX.libroCita.toUpperCase() + ' · ' + l.ref + ', p. ' + l.pag);
  estilo_(h, { size: 7, bold: true, color: PDF.AZUL, despues: 2 });
  estilo_(c.appendParagraph('«' + l.cita + '»'), { size: 8, italic: true, despues: 0 });
  espacio_(body, 4);
}

/** Línea con un enlace clicable. */
function enlace_(body, url, texto, size) {
  const p = parrafo_(body, texto, { size: size, color: PDF.AZUL, despues: 3 });
  p.editAsText().setLinkUrl(url);
  return p;
}
