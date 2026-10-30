/**
 * REPORTE INTERNO DEL PRE-DIAGNÓSTICO (para el equipo de UB)
 * ---------------------------------------------------------------------------
 * Se adjunta al aviso de "Nuevo lead". Usa la misma hoja membretada que el PDF
 * del prospecto (ver Pdf.gs) e incluye: ficha de contacto, resultados, las 20
 * respuestas una por una y lo que el prospecto escribió en sus propias palabras.
 * La lectura rápida de lo que necesitaría la empresa va en el cuerpo del correo
 * (ver avisarEquipo_ en Codigo.gs), no en el PDF.
 *
 * Si falla la generación, el aviso se envía igual, sin adjunto, y el error queda
 * en la hoja "Log".
 */

/**
 * Lectura rápida de lo que necesitaría la empresa, armada con reglas simples a
 * partir de las bandas, las respuestas y el perfil (textos en datos.json).
 * Son hipótesis de trabajo para validar en el Diagnóstico Profundo.
 */
function lecturaRapida_(lead, res) {
  const L = DX.lecturaRapida;
  const g = res.Global;
  const evaluables = SISTEMAS.filter(function (s) { return res[s].pct !== null; })
    .sort(function (a, b) { return res[a].pct - res[b].pct; });

  const titulares = [];
  if (g.pct === null) {
    titulares.push('No es posible calcular un nivel global: las respuestas indican que ningún sistema aplica todavía.');
  } else {
    titulares.push('Nivel global de institucionalización: ' + g.pct + '% (' + g.banda.etiqueta + ').');
  }
  if (evaluables.length > 1) {
    const debil = evaluables[0], fuerte = evaluables[evaluables.length - 1];
    titulares.push(res[debil].pct === res[fuerte].pct
      ? 'Los sistemas evaluados tienen un nivel similar (' + res[debil].pct + '%).'
      : 'Sistema más débil: ' + debil + ' (' + res[debil].pct + '%). Más sólido: ' + fuerte + ' (' + res[fuerte].pct + '%).');
  }

  const necesidades = evaluables.map(function (s) {
    return { sistema: s, pct: res[s].pct, texto: L.necesidades[s][DX.bandas.indexOf(res[s].banda)] };
  });

  const todas = [];
  SISTEMAS.forEach(function (s) {
    res[s].pendientes.forEach(function (p) { todas.push({ sistema: s, clave: p.clave, pts: p.pts, rec: p.rec }); });
  });
  todas.sort(function (a, b) { return (a.pts - b.pts) || (res[a.sistema].pct - res[b.sistema].pct); });
  const prioridades = todas.slice(0, 3);

  const alertas = [];
  Object.keys(L.alertas).forEach(function (clave) {
    const q = DX.preguntas.filter(function (x) { return x.clave === clave; })[0];
    if (q && puntosDe_(q, lead.respuestas[clave]) === 0) alertas.push(L.alertas[clave]);
  });

  const perfil = [];
  if (lead.perfil.PF_GENERACION && L.generacion[lead.perfil.PF_GENERACION]) perfil.push(L.generacion[lead.perfil.PF_GENERACION]);
  if (lead.perfil.PF_MOTIVO) perfil.push(L.motivo[lead.perfil.PF_MOTIVO] || L.motivo.otro);

  let siguiente;
  if (evaluables.length === 0) {
    siguiente = 'Conversar con la empresa para entender su etapa antes de proponer un diagnóstico.';
  } else if (g.pct <= DX.bandas[1].hasta) {
    siguiente = 'Proponer un Diagnóstico Profundo con foco inicial en el sistema ' + evaluables[0] + ' y revisar con la empresa las prioridades de este reporte.';
  } else {
    siguiente = 'Proponer una sesión de revisión para validar el resultado y definir cómo mantener y evaluar lo logrado.';
  }
  return { titulares: titulares, necesidades: necesidades, prioridades: prioridades, alertas: alertas, perfil: perfil, siguiente: siguiente };
}

/** Devuelve el PDF (Blob) del reporte interno, o null si no se pudo generar. Nunca lanza. */
function generarReporteInterno_(lead, res) {
  const nombre = 'Reporte interno - ' + lead.empresa.replace(/[^\w\- áéíóúñÁÉÍÓÚÑ]/g, '');
  try {
    const copia = DriveApp.getFileById(CONFIG.PLANTILLA_DOC_ID).makeCopy('TEMPORAL ' + nombre);
    try {
      const doc = DocumentApp.openById(copia.getId());
      llenarReporte_(doc.getBody(), lead, res);
      doc.saveAndClose();
      return copia.getAs('application/pdf').setName(nombre + '.pdf');
    } finally {
      copia.setTrashed(true);
    }
  } catch (err) {
    registrarError_(null, 'Reporte interno falló, el aviso se envió sin PDF: ' + err.message);
    return null;
  }
}

function llenarReporte_(body, lead, res) {
  prepararCuerpo_(body);
  const sinRespuesta = '(sin respuesta)';

  // --- Encabezado y ficha ---
  parrafo_(body, 'REPORTE DE PRE-DIAGNÓSTICO · USO INTERNO', { size: 8, bold: true, color: PDF.AZUL, despues: 4 });
  parrafo_(body, lead.empresa, { size: 22, bold: true, color: PDF.AZUL, despues: 2, interlineado: 1.1 });
  parrafo_(body, 'Recibido el ' + fechaEs_(new Date()), { size: 9, despues: 8 });
  [['Contacto', lead.nombre], ['Puesto', lead.puesto], ['Correo', lead.correo]].forEach(function (f) {
    linea_(body, f[0], f[1]);
  });

  // --- Resultados ---
  titulo_(body, 'Resultado del pre-diagnóstico');
  bloqueResultados_(body, res);

  // --- Perfil y respuestas abiertas ---
  titulo_(body, 'Perfil de quien respondió');
  const P = lead.perfil;
  linea_(body, 'Familia propietaria', P.PF_FAMILIA || sinRespuesta);
  linea_(body, 'Generación', P.PF_GENERACION || sinRespuesta);
  linea_(body, 'Años en la empresa', P.PF_ANTIGUEDAD || sinRespuesta);
  linea_(body, 'Motivo principal', P.PF_MOTIVO || sinRespuesta);
  linea_(body, 'Preocupación principal', P.PF_PREOCUPACION || sinRespuesta);

  titulo_(body, 'En sus propias palabras');
  DX.apertura.forEach(function (a) {
    parrafo_(body, a[1], { size: 9, bold: true, color: PDF.AZUL, antes: 6, despues: 1, juntoConSiguiente: true });
    const r = lead.apertura[a[0]];
    parrafo_(body, r || sinRespuesta, { size: 9, italic: true, color: r ? PDF.TEXTO : '#888888', despues: 2 });
  });

  // --- Respuestas del cuestionario ---
  titulo_(body, 'Respuestas del cuestionario');
  parrafo_(body, 'Valoración: Sólido = existe y funciona; Parcial = existe de forma informal o incompleta; Ausente = no existe. Las preguntas marcadas "No aplica" no cuentan en el cálculo.', { size: 8, italic: true, despues: 4 });
  SISTEMAS.forEach(function (s) {
    parrafo_(body, 'Sistema ' + s + (res[s].pct === null ? '' : ' · ' + res[s].pct + '%'), { size: 12, bold: true, color: PDF.AZUL, antes: 10, despues: 4, juntoConSiguiente: true });
    tablaRespuestas_(body, s, lead);
  });

  parrafo_(body, 'Documento de uso interno de ' + CONFIG.FIRMA + '. Pre-diagnóstico generado automáticamente a partir de las respuestas del prospecto; son hipótesis de trabajo que no sustituyen un Diagnóstico Profundo.',
    { size: 7, color: '#888888', antes: 14, despues: 0 });
}

// ---------------------------------------------------------------------------
// Piezas del reporte
// ---------------------------------------------------------------------------
/** "Etiqueta: valor", con la etiqueta en negritas. */
function linea_(cont, etiqueta, valor) {
  const p = parrafo_(cont, etiqueta + ': ' + valor, { size: 9, despues: 2 });
  p.editAsText().setBold(0, etiqueta.length, true);
  return p;
}

/** Tabla de las respuestas de un sistema: #, pregunta, respuesta elegida y valoración. */
function tablaRespuestas_(body, sistema, lead) {
  const colores = { 'Ausente': '#B93A32', 'Parcial': '#8A6D00', 'Sólido': '#23774A', 'No aplica': '#777777' };
  const filas = [['#', 'Pregunta', 'Respuesta elegida', 'Valoración']];
  DX.preguntas.filter(function (q) { return q.sistema === sistema; }).forEach(function (q) {
    const idx = lead.respuestas[q.clave];
    const pts = puntosDe_(q, idx);
    filas.push([q.clave, q.titulo, q.opciones[idx], pts === NA ? 'No aplica' : DX.lecturaRapida.valoracion[pts]]);
  });
  const t = body.appendTable(filas);
  t.setBorderWidth(0.5);
  t.setBorderColor('#D9DEE1');
  [36, 190, 190, 76].forEach(function (w, c) { t.setColumnWidth(c, w); });
  filas.forEach(function (fila, r) {
    fila.forEach(function (texto, c) {
      const celda = t.getRow(r).getCell(c);
      celda.setPaddingTop(4);
      celda.setPaddingBottom(4);
      celda.setPaddingLeft(5);
      celda.setPaddingRight(5);
      const encabezado = r === 0;
      celda.setBackgroundColor(encabezado ? PDF.AZUL : (r % 2 === 0 ? '#F7F8F9' : '#FFFFFF'));
      estilo_(celda.getChild(0).asParagraph(), {
        size: 8, despues: 0, interlineado: 1.15,
        bold: encabezado || c === 3 || c === 0,
        color: encabezado ? '#FFFFFF' : (c === 3 ? colores[texto] : PDF.TEXTO)
      });
    });
  });
}

/** Cuerpo HTML del aviso "Nuevo lead": ficha, resultados y lectura rápida de lo que necesitaría la empresa. */
function htmlAviso_(lead, res, L, hayReporte) {
  const g = res.Global;
  const h3 = function (t) { return '<h3 style="color:#06536B;font-size:14px;margin:20px 0 6px 0">' + esc_(t) + '</h3>'; };
  const lista = function (items) {
    return '<ul style="margin:0;padding-left:18px">' + items.map(function (t) { return '<li style="margin:0 0 6px 0">' + esc_(t) + '</li>'; }).join('') + '</ul>';
  };
  const filas = SISTEMAS.map(function (s) {
    const r = res[s];
    return '<tr><td style="padding:8px;border-bottom:1px solid #e5e5e5"><strong>Sistema ' + esc_(s) + '</strong></td>' +
      '<td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center;font-weight:bold">' + (r.pct === null ? '—' : r.pct + '%') + '</td>' +
      '<td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">' + (r.pct === null ? 'No evaluable' : insignia_(r.banda)) + '</td></tr>';
  }).join('');

  let html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:auto;color:#222;line-height:1.5">' +
    '<p style="font-size:11px;color:#06536B;font-weight:bold;letter-spacing:1px;margin:0">NUEVO LEAD · MINI DIAGNÓSTICO</p>' +
    '<h2 style="color:#06536B;margin:4px 0 2px 0">' + esc_(lead.empresa) + '</h2>' +
    '<p style="margin:0 0 14px 0;color:#555">' + esc_(lead.nombre) + ' · ' + esc_(lead.puesto) + ' · ' +
    '<a href="mailto:' + esc_(lead.correo) + '" style="color:#06536B">' + esc_(lead.correo) + '</a></p>' +
    '<p style="margin:0 0 6px 0">Resultado global: ' + (g.pct === null ? '<strong>No evaluable</strong>' : '<strong style="font-size:20px">' + g.pct + '%</strong> ' + insignia_(g.banda)) + '</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '</table>' +
    h3('Lectura rápida') +
    '<p style="margin:0 0 4px 0"><strong>' + esc_(L.titulares[0]) + '</strong></p>' +
    L.titulares.slice(1).map(function (t) { return '<p style="margin:0 0 4px 0">' + esc_(t) + '</p>'; }).join('') +
    h3('Qué necesitaría') + lista(L.necesidades.map(function (n) { return n.sistema + ' (' + n.pct + '%): ' + n.texto; }));
  if (L.alertas.length) html += h3('Alertas') + lista(L.alertas);
  if (L.prioridades.length) html += h3('Prioridades inmediatas') + lista(L.prioridades.map(function (p) { return p.rec; }));
  if (L.perfil.length) html += h3('Perfil (hipótesis para validar)') + lista(L.perfil);
  html += h3('Siguiente paso sugerido') + '<p style="margin:0"><strong>' + esc_(L.siguiente) + '</strong></p>';

  if (hayReporte) {
    html += '<p style="margin:22px 0 0 0;padding:10px 12px;background:#f3f5f6;font-size:13px">Se adjunta el <strong>reporte interno en PDF</strong>, con los resultados, el perfil, las respuestas abiertas y las 20 preguntas contestadas.</p>';
  } else {
    const p = lead.perfil;
    html += '<p style="margin:22px 0 6px 0;padding:10px 12px;background:#fff6da;font-size:13px">No se pudo generar el PDF del reporte. Las respuestas completas están en la hoja de resultados.</p>' +
      h3('Perfil') + lista([
        'Familia propietaria: ' + (p.PF_FAMILIA || '(sin respuesta)'), 'Generación: ' + (p.PF_GENERACION || '(sin respuesta)'),
        'Años en la empresa: ' + (p.PF_ANTIGUEDAD || '(sin respuesta)'), 'Motivo principal: ' + (p.PF_MOTIVO || '(sin respuesta)'),
        'Preocupación principal: ' + (p.PF_PREOCUPACION || '(sin respuesta)')]) +
      h3('Preguntas de apertura') + lista(DX.apertura.map(function (a) { return a[1] + ' → ' + (lead.apertura[a[0]] || '(sin respuesta)'); }));
  }
  return html + '</div>';
}
