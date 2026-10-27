/**
 * UB CONSULTORES · MINI MOTOR DE DIAGNÓSTICO (app web)
 * ---------------------------------------------------------------------------
 * La página (index.html) muestra el test y los resultados en pantalla. Al
 * terminar, envía las respuestas a este script (doPost). Aquí se:
 *   1. Recalcula el puntaje (no se confía en el puntaje del navegador).
 *   2. Genera el PDF con recomendaciones y lo envía por correo.
 *   3. Avisa al equipo de UB y guarda el lead en la hoja "Resultados".
 *
 * Instalación: ver apps-script/README.md
 *   configurar()  -> crea la hoja de resultados. Se ejecuta UNA vez.
 *   Implementar   -> "Aplicación web", ejecutar como "Yo", acceso "Cualquier persona".
 *   probarCalculo() / probarPdf() -> pruebas sin enviar nada.
 *
 * Puntos: 2 / 1 / 0 por respuesta (la opción 1, 2 y 3 de cada pregunta).
 * "No aplica" se excluye del cálculo. Score global = promedio simple de los
 * sistemas evaluables. Bandas: 0-33 / 34-66 / 67-100.
 *
 * El contenido (preguntas, bandas, recomendaciones) vive en Datos.gs, que se
 * genera con diagnostico/build.py. No lo edites a mano.
 */

const CONFIG = {
  FIRMA: 'UB Consultores',
  NOMBRE_ARCHIVO_HOJA: 'UB Mini Diagnóstico - Resultados',
  REPLY_TO: 'ub@ubconsultores.mx',        // A este correo llegan las respuestas de los prospectos
  CORREO_INTERNO: 'ub@ubconsultores.mx',  // Aviso de nuevo lead
  URL_AGENDA: 'https://calendar.app.google/gx4gJDjGpWsMHpJV7', // Agenda del Diagnóstico Profundo
  MINUTOS_ENTRE_ENVIOS: 10                // Un mismo correo no puede pedir otro envío antes de este tiempo
};

const NA = null;
const SISTEMAS = DX.sistemas.map(function (s) { return s.clave; });

const ENCABEZADOS = [
  'Timestamp', 'Nombre', 'Empresa', 'Puesto', 'Correo',
  'Familia propietaria', 'Generación', 'Años en la empresa', 'Motivo principal', 'Preocupación principal',
  'Apertura_1', 'Apertura_2', 'Apertura_3', 'Apertura_4', 'Apertura_5',
  '% Patrimonial', 'Banda Patrimonial',
  '% Empresarial', 'Banda Empresarial',
  '% Operativo', 'Banda Operativo',
  '% Global', 'Banda Global',
  'Estado correo'
];

// ===========================================================================
// 1. CONFIGURACIÓN INICIAL (ejecutar UNA sola vez)
// ===========================================================================
function configurar() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) {
    throw new Error('Ya existe una hoja de resultados. Si quieres empezar de cero, ejecuta reiniciarConfiguracion().');
  }
  const ss = SpreadsheetApp.create(CONFIG.NOMBRE_ARCHIVO_HOJA);
  const hojaRes = ss.getSheets()[0].setName('Resultados');
  hojaRes.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]).setFontWeight('bold');
  hojaRes.setFrozenRows(1);
  const hojaLog = ss.insertSheet('Log');
  hojaLog.getRange(1, 1, 1, 2).setValues([['Fecha', 'Detalle']]).setFontWeight('bold');
  hojaLog.setFrozenRows(1);
  props.setProperty('SHEET_ID', ss.getId());
  Logger.log('HOJA DE RESULTADOS: ' + ss.getUrl());
}

/** Borra la referencia a la hoja (NO borra la hoja, que queda en tu Drive). */
function reiniciarConfiguracion() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Configuración reiniciada. Ya puedes ejecutar configurar() de nuevo.');
}

// ===========================================================================
// 2. ENDPOINT (lo llama la página)
// ===========================================================================
function doPost(e) {
  let ss = null;
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (sheetId) ss = SpreadsheetApp.openById(sheetId);

    const datos = JSON.parse(e.postData.contents);
    if (datos.website) return json_({ ok: true }); // campo trampa para bots: se ignora en silencio

    const lead = validar_(datos);
    if (lead.error) return json_({ ok: false, error: lead.error });

    if (!permitirEnvio_(lead.correo)) {
      return json_({ ok: false, error: 'Ya enviamos un diagnóstico a este correo hace unos minutos. Revisa tu bandeja o inténtalo más tarde.' });
    }

    const res = evaluar_(lead.respuestas, ss);
    const estado = enviarCorreoResultado_(lead, res, ss);
    avisarEquipo_(lead, res, ss);
    guardarResultado_(ss, lead, res, estado);
    return json_({ ok: estado === 'Enviado', error: estado === 'Enviado' ? '' : 'No se pudo enviar el correo.' });
  } catch (err) {
    registrarError_(ss, 'Error en doPost: ' + err.message);
    return json_({ ok: false, error: 'Error al procesar el diagnóstico.' });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Valida y limpia lo que manda la página. Solo se aceptan índices de opción. */
function validar_(d) {
  const lead = {
    nombre: recortar_(d.nombre, 120), empresa: recortar_(d.empresa, 160),
    puesto: recortar_(d.puesto, 120), correo: recortar_(d.correo, 160).toLowerCase(),
    perfil: {}, apertura: {}, respuestas: {}
  };
  if (!lead.nombre || !lead.empresa || !lead.puesto) return { error: 'Faltan datos de contacto.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.correo)) return { error: 'El correo no es válido.' };

  DX.perfil.forEach(function (p) { lead.perfil[p.clave] = recortar_((d.perfil || {})[p.clave], 1000); });
  DX.apertura.forEach(function (a) { lead.apertura[a[0]] = recortar_((d.apertura || {})[a[0]], 1000); });

  for (let i = 0; i < DX.preguntas.length; i++) {
    const p = DX.preguntas[i];
    const idx = (d.respuestas || {})[p.clave];
    if (typeof idx !== 'number' || idx % 1 !== 0 || idx < 0 || idx >= p.opciones.length) {
      return { error: 'Faltan respuestas del diagnóstico.' };
    }
    lead.respuestas[p.clave] = idx;
  }
  return lead;
}

/** Evita que alguien use el formulario para llenar de correos una bandeja ajena. */
function permitirEnvio_(correo) {
  const cache = CacheService.getScriptCache();
  const llave = 'envio_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, correo));
  if (cache.get(llave)) return false;
  cache.put(llave, '1', Math.min(CONFIG.MINUTOS_ENTRE_ENVIOS * 60, 21600));
  return true;
}

// ===========================================================================
// 3. LÓGICA DE PUNTAJE (misma que usa la página)
// ===========================================================================
/** Puntos de una opción: 2, 1, 0 en orden; "No aplica" (siempre la última) devuelve NA. */
function puntosDe_(pregunta, idx) {
  if (pregunta.opciones[idx].indexOf('No aplica') === 0) return NA;
  return 2 - idx;
}

function evaluar_(respuestas) {
  const res = {};
  const evaluables = [];

  SISTEMAS.forEach(function (sistema) {
    let puntos = 0, respondidas = 0;
    const pendientes = [];
    DX.preguntas.filter(function (p) { return p.sistema === sistema; }).forEach(function (p) {
      const pts = puntosDe_(p, respuestas[p.clave]);
      if (pts === NA) return;
      puntos += pts;
      respondidas++;
      if (pts < 2) pendientes.push({ clave: p.clave, titulo: p.titulo, pts: pts, rec: p.rec[pts] });
    });
    if (respondidas === 0) {
      res[sistema] = { pct: null, banda: null, pendientes: [] };
    } else {
      const exacto = (puntos / (respondidas * 2)) * 100;
      evaluables.push(exacto);
      const pct = Math.round(exacto);
      res[sistema] = { pct: pct, banda: bandaDe_(pct), pendientes: pendientes };
    }
  });

  if (evaluables.length === 0) {
    res.Global = { pct: null, banda: null };
  } else {
    const pct = Math.round(evaluables.reduce(function (a, b) { return a + b; }, 0) / evaluables.length);
    res.Global = { pct: pct, banda: bandaDe_(pct) };
  }
  return res;
}

function bandaDe_(pct) {
  for (let i = 0; i < DX.bandas.length; i++) {
    if (pct <= DX.bandas[i].hasta) return DX.bandas[i];
  }
  return DX.bandas[DX.bandas.length - 1];
}

function resumenDe_(sistema, banda) {
  return DX.resumen[sistema][DX.bandas.indexOf(banda)];
}

// ===========================================================================
// 4. PDF Y CORREOS
// ===========================================================================
function enviarCorreoResultado_(lead, res, ss) {
  try {
    const pdf = Utilities.newBlob(construirPdfHtml_(lead, res), 'text/html', 'diagnostico.html')
      .getAs('application/pdf')
      .setName('Diagnostico UB - ' + lead.empresa.replace(/[^\w\- áéíóúñÁÉÍÓÚÑ]/g, '') + '.pdf');
    const c = construirCorreo_(lead, res);
    const opciones = {
      to: lead.correo, subject: c.asunto, body: c.texto, htmlBody: c.html,
      name: CONFIG.FIRMA, attachments: [pdf]
    };
    if (CONFIG.REPLY_TO) opciones.replyTo = CONFIG.REPLY_TO;
    MailApp.sendEmail(opciones);
    return 'Enviado';
  } catch (err) {
    registrarError_(ss, 'Fallo al enviar correo a ' + lead.correo + ': ' + err.message);
    return 'Error: ' + err.message;
  }
}

function etiquetaGlobal_(res) {
  const g = res.Global;
  return g.pct === null ? 'No evaluable' : g.pct + '% · ' + g.banda.etiqueta;
}

function insignia_(banda) {
  return '<span style="background:' + banda.color + ';color:' + banda.texto + ';padding:3px 10px;font-size:12px;font-weight:bold;white-space:nowrap">' +
    esc_(banda.etiqueta) + '</span>';
}

function construirCorreo_(lead, res) {
  const g = res.Global;
  const agendaTxt = 'Agenda tu sesión de Diagnóstico Profundo aquí: ' + CONFIG.URL_AGENDA;

  const lineas = SISTEMAS.map(function (s) {
    const r = res[s];
    return '- Sistema ' + s + ': ' + (r.pct === null ? 'No evaluable' : r.pct + '% · ' + r.banda.etiqueta);
  });
  const texto =
    'Hola ' + lead.nombre + ',\n\n' +
    'Gracias por responder el diagnóstico de institucionalización de ' + lead.empresa + '.\n\n' +
    'Resultado global: ' + etiquetaGlobal_(res) + '\n\n' + lineas.join('\n') + '\n\n' +
    'En el PDF adjunto encontrarás el detalle y las recomendaciones para cada sistema.\n\n' +
    'Este resultado es un pre-diagnóstico basado únicamente en tus respuestas. Un Diagnóstico Profundo con ' + CONFIG.FIRMA +
    ' permite entender a detalle estos hallazgos y construir un plan de acción a la medida de ' + lead.empresa + '. ' + agendaTxt +
    '\n\n' + CONFIG.FIRMA;

  const filas = SISTEMAS.map(function (s) {
    const r = res[s];
    return '<tr><td style="padding:10px 8px;border-bottom:1px solid #e5e5e5"><strong>Sistema ' + esc_(s) + '</strong></td>' +
      '<td style="padding:10px 8px;border-bottom:1px solid #e5e5e5;text-align:center;font-size:18px;font-weight:bold">' + (r.pct === null ? '—' : r.pct + '%') + '</td>' +
      '<td style="padding:10px 8px;border-bottom:1px solid #e5e5e5;text-align:right">' + (r.pct === null ? 'No evaluable' : insignia_(r.banda)) + '</td></tr>';
  }).join('');

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:auto;color:#222;line-height:1.5">' +
    '<h2 style="color:#06536B;margin-bottom:4px">Tu diagnóstico de institucionalización</h2>' +
    '<p style="margin-top:0;color:#555">' + esc_(lead.empresa) + '</p>' +
    '<p>Hola ' + esc_(lead.nombre) + ', gracias por responder. Resultado global: ' +
    (g.pct === null ? 'No evaluable' : '<strong>' + g.pct + '%</strong> ' + insignia_(g.banda)) + '</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '</table>' +
    '<p style="margin-top:20px">En el <strong>PDF adjunto</strong> encontrarás el detalle y las recomendaciones para cada sistema.</p>' +
    '<p>Este resultado es un pre-diagnóstico basado únicamente en tus respuestas. Un Diagnóstico Profundo con ' + esc_(CONFIG.FIRMA) +
    ' permite entender a detalle estos hallazgos y construir un plan de acción a la medida de ' + esc_(lead.empresa) + '.</p>' +
    '<p style="margin:20px 0"><a href="' + esc_(CONFIG.URL_AGENDA) + '" style="background:#06536B;color:#fff;padding:12px 22px;text-decoration:none;font-weight:bold">Agendar mi sesión</a></p>' +
    '<p style="color:#777;font-size:13px">' + esc_(CONFIG.FIRMA) + '</p></div>';

  return { asunto: 'Tu diagnóstico de institucionalización — ' + lead.empresa, texto: texto, html: html };
}

/** HTML del PDF. Apps Script convierte HTML básico: tablas y estilos en línea, sin CSS moderno. */
function construirPdfHtml_(lead, res) {
  const g = res.Global;
  const fecha = Utilities.formatDate(new Date(), 'America/Mexico_City', "d 'de' MMMM 'de' yyyy");

  const resumenSistemas = SISTEMAS.map(function (s) {
    const r = res[s];
    const barra = r.pct === null ? '' :
      '<table style="width:100%;border-collapse:collapse;margin-top:6px"><tr>' +
      '<td style="width:' + Math.max(r.pct, 1) + '%;background:' + r.banda.color + ';height:10px;font-size:1px">&nbsp;</td>' +
      '<td style="width:' + (100 - Math.max(r.pct, 1)) + '%;background:#e3e6e8;height:10px;font-size:1px">&nbsp;</td></tr></table>';
    return '<tr><td style="padding:12px 0;border-bottom:1px solid #dcdcdc">' +
      '<table style="width:100%"><tr><td><strong style="font-size:14px">Sistema ' + esc_(s) + '</strong></td>' +
      '<td style="text-align:right"><strong style="font-size:16px">' + (r.pct === null ? 'No evaluable' : r.pct + '%') + '</strong></td></tr></table>' +
      barra +
      (r.pct === null ? '' : '<div style="margin-top:6px">' + insignia_(r.banda) + '</div>') +
      '</td></tr>';
  }).join('');

  const detalle = SISTEMAS.map(function (s) {
    const r = res[s];
    const desc = DX.sistemas.filter(function (x) { return x.clave === s; })[0].descripcion;
    let cuerpo;
    if (r.pct === null) {
      cuerpo = '<p style="color:#555">Las respuestas indican que este sistema no aplica en la etapa actual de la empresa.</p>';
    } else {
      const items = r.pendientes.slice().sort(function (a, b) { return a.pts - b.pts; });
      cuerpo = '<p>' + esc_(resumenDe_(s, r.banda)) + '</p>' +
        (items.length === 0
          ? '<p><strong>Sin acciones pendientes en este sistema.</strong> Mantén vivas las prácticas actuales y revísalas con periodicidad.</p>'
          : '<p style="margin-bottom:4px"><strong>Recomendaciones</strong></p>' +
            items.map(function (it) {
              return '<p style="margin:0 0 8px 0;padding-left:10px;border-left:3px solid ' + (it.pts === 0 ? '#B93A32' : '#D9A21B') + '">' +
                '<span style="font-size:10px;color:#777">' + (it.pts === 0 ? 'PRIORIDAD ALTA' : 'POR FORMALIZAR') + '</span><br>' + esc_(it.rec) + '</p>';
            }).join(''));
    }
    return '<h3 style="color:#06536B;margin-bottom:2px;margin-top:22px">Sistema ' + esc_(s) + '</h3>' +
      '<div style="color:#777;font-size:11px;margin-bottom:8px">' + esc_(desc) + '</div>' + cuerpo;
  }).join('');

  return '<html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;font-size:12px;line-height:1.45">' +
    '<div style="border-bottom:3px solid #CBDC2F;padding-bottom:10px;margin-bottom:18px">' +
    '<div style="font-size:11px;color:#06536B;font-weight:bold;letter-spacing:2px">UB CONSULTORES</div>' +
    '<h1 style="color:#06536B;font-size:22px;margin:6px 0 2px 0">Diagnóstico de institucionalización</h1>' +
    '<div style="color:#555">' + esc_(lead.empresa) + ' · ' + esc_(lead.nombre) + ' · ' + fecha + '</div></div>' +

    '<table style="width:100%;margin-bottom:6px"><tr><td style="background:#f3f5f6;padding:16px;text-align:center">' +
    '<div style="font-size:11px;color:#555;letter-spacing:1px">RESULTADO GLOBAL</div>' +
    (g.pct === null ? '<div style="font-size:22px;font-weight:bold">No evaluable</div>' :
      '<div style="font-size:36px;font-weight:bold;color:#222">' + g.pct + '%</div><div>' + insignia_(g.banda) + '</div>' +
      '<div style="margin-top:8px;color:#444">' + esc_(g.banda.lectura) + '</div>') +
    '</td></tr></table>' +

    '<table style="width:100%;border-collapse:collapse">' + resumenSistemas + '</table>' +
    '<h2 style="color:#06536B;font-size:16px;margin-top:26px;margin-bottom:0">Recomendaciones por sistema</h2>' + detalle +

    '<div style="margin-top:26px;padding:14px;background:#06536B;color:#fff">' +
    '<strong>Siguiente paso: Diagnóstico Profundo</strong><br>' +
    'Este resultado es un pre-diagnóstico basado únicamente en tus respuestas. Un Diagnóstico Profundo con ' + esc_(CONFIG.FIRMA) +
    ' permite contrastar estos hallazgos con la mirada de la familia y del equipo directivo, y construir un plan de acción a la medida de ' + esc_(lead.empresa) + '.<br>' +
    '<span style="color:#CBDC2F">Agenda tu sesión: ' + esc_(CONFIG.URL_AGENDA) + '</span></div>' +
    '<p style="color:#888;font-size:10px;margin-top:14px">Pre-diagnóstico generado automáticamente a partir de las respuestas proporcionadas. No sustituye una evaluación profesional.</p>' +
    '</body></html>';
}

function avisarEquipo_(lead, res, ss) {
  if (!CONFIG.CORREO_INTERNO) return;
  try {
    const g = res.Global;
    const p = lead.perfil;
    const cuerpo =
      'Nuevo lead del mini diagnóstico\n\n' +
      'Nombre: ' + lead.nombre + '\nEmpresa: ' + lead.empresa + '\nPuesto: ' + lead.puesto + '\nCorreo: ' + lead.correo + '\n\n' +
      'Perfil:\n' +
      '- Familia propietaria: ' + (p.PF_FAMILIA || '(sin respuesta)') + '\n' +
      '- Generación: ' + (p.PF_GENERACION || '(sin respuesta)') + '\n' +
      '- Años en la empresa: ' + (p.PF_ANTIGUEDAD || '(sin respuesta)') + '\n' +
      '- Motivo principal: ' + (p.PF_MOTIVO || '(sin respuesta)') + '\n' +
      '- Preocupación principal: ' + (p.PF_PREOCUPACION || '(sin respuesta)') + '\n\n' +
      'Global: ' + etiquetaGlobal_(res) + '\n' +
      SISTEMAS.map(function (s) {
        const r = res[s];
        return s + ': ' + (r.pct === null ? 'No evaluable' : r.pct + '% · ' + r.banda.etiqueta);
      }).join('\n') + '\n\n' +
      'Preguntas de apertura:\n' +
      DX.apertura.map(function (a) { return a[1] + '\n  → ' + (lead.apertura[a[0]] || '(sin respuesta)'); }).join('\n');
    MailApp.sendEmail({
      to: CONFIG.CORREO_INTERNO,
      subject: 'Nuevo lead: ' + lead.empresa + ' (' + (g.pct === null ? 'N/E' : g.pct + '%') + ')',
      body: cuerpo, name: CONFIG.FIRMA
    });
  } catch (err) {
    registrarError_(ss, 'Fallo al avisar al equipo: ' + err.message);
  }
}

// ===========================================================================
// 5. REGISTRO EN HOJA
// ===========================================================================
function guardarResultado_(ss, lead, res, estado) {
  if (!ss) return;
  const p = lead.perfil, a = lead.apertura;
  const fila = [
    new Date(), lead.nombre, lead.empresa, lead.puesto, lead.correo,
    p.PF_FAMILIA, p.PF_GENERACION, p.PF_ANTIGUEDAD, p.PF_MOTIVO, p.PF_PREOCUPACION,
    a.A1, a.A2, a.A3, a.A4, a.A5
  ];
  SISTEMAS.concat(['Global']).forEach(function (k) {
    const r = res[k];
    fila.push(r.pct === null ? '' : r.pct);
    fila.push(r.banda ? r.banda.etiqueta : 'No evaluable');
  });
  fila.push(estado);
  // Las celdas que empiezan con = + - @ se guardan como texto para que nadie inyecte fórmulas.
  const segura = fila.map(function (v) {
    return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
  });
  ss.getSheetByName('Resultados').appendRow(segura);
}

function registrarError_(ss, mensaje) {
  console.error(mensaje);
  try {
    if (!ss) {
      const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
      if (id) ss = SpreadsheetApp.openById(id);
    }
    if (ss) ss.getSheetByName('Log').appendRow([new Date(), mensaje]);
  } catch (err) {
    console.error('No se pudo escribir en el Log: ' + err.message);
  }
}

// ===========================================================================
// 6. UTILIDADES Y PRUEBAS
// ===========================================================================
function recortar_(s, max) {
  return String(s === undefined || s === null ? '' : s).replace(/\s+/g, ' ').trim().substring(0, max);
}

function esc_(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Prueba la lógica de puntos sin enviar correos. Resultado esperado (Ver > Registros):
 *   opción 1 en todo -> 100% (Sólido) · opción 2 -> 50% (En desarrollo) · opción 3 -> 0% (Requiere atención urgente)
 *   Caso mixto: P7-P11 en "No aplica" -> Empresarial se calcula solo con P12 (100%)
 */
function probarCalculo() {
  [0, 1, 2].forEach(function (n) {
    const r = {};
    DX.preguntas.forEach(function (p) { r[p.clave] = n; });
    const res = evaluar_(r);
    Logger.log('Opción #' + (n + 1) + ' en todas -> ' + JSON.stringify({
      Patrimonial: res.Patrimonial.pct, Empresarial: res.Empresarial.pct,
      Operativo: res.Operativo.pct, Global: res.Global.pct,
      BandaGlobal: res.Global.banda ? res.Global.banda.etiqueta : null
    }));
  });
  const mixto = {};
  DX.preguntas.forEach(function (p) {
    mixto[p.clave] = (['P7', 'P8', 'P9', 'P10', 'P11'].indexOf(p.clave) >= 0) ? p.opciones.length - 1 : 0;
  });
  Logger.log('Caso mixto (P7-P11 No aplica) -> Empresarial: ' + evaluar_(mixto).Empresarial.pct + '% (solo cuenta P12)');
}

/** Te manda a TU correo (el de la cuenta que ejecuta) un PDF de prueba con respuestas mixtas. No guarda nada. */
function probarPdf() {
  const r = {};
  DX.preguntas.forEach(function (p, i) { r[p.clave] = i % 3; });
  const lead = { nombre: 'Prueba', empresa: 'Empresa de Prueba', puesto: 'Dirección', correo: Session.getActiveUser().getEmail(), perfil: {}, apertura: {}, respuestas: r };
  const res = evaluar_(r);
  Logger.log('Envío de prueba a ' + lead.correo + ': ' + enviarCorreoResultado_(lead, res, null));
}
