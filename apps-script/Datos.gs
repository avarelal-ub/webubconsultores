// ARCHIVO GENERADO por diagnostico/build.py a partir de diagnostico/datos.json. No lo edites a mano.
const DX = {
 "sistemas": [
  {
   "clave": "Patrimonial",
   "descripcion": "Cómo se gobierna la familia propietaria: reglas, acuerdos y protección del patrimonio."
  },
  {
   "clave": "Empresarial",
   "descripcion": "Cómo se gobierna la empresa: Consejo, comités de control y separación de roles."
  },
  {
   "clave": "Operativo",
   "descripcion": "Cómo se dirige el día a día: dirección, estructura, procesos y toma de decisiones."
  }
 ],
 "bandas": [
  {
   "hasta": 33,
   "etiqueta": "Requiere atención urgente",
   "color": "#B93A32",
   "texto": "#FFFFFF",
   "lectura": "Hay carencias importantes: faltan reglas, órganos o acuerdos formales que protejan a la familia y a la empresa."
  },
  {
   "hasta": 66,
   "etiqueta": "En desarrollo",
   "color": "#D9A21B",
   "texto": "#2A2000",
   "lectura": "Hay avances y buenas intenciones, pero buena parte de lo que funciona es informal o no está documentado."
  },
  {
   "hasta": 100,
   "etiqueta": "Sólido",
   "color": "#23774A",
   "texto": "#FFFFFF",
   "lectura": "Existen bases formales sólidas; el reto es mantenerlas vivas y seguir mejorándolas."
  }
 ],
 "resumen": {
  "Patrimonial": [
   "Las reglas de la familia propietaria casi no están formalizadas. La prioridad es dar orden al gobierno familiar: asamblea, consejo de familia y protocolo.",
   "Hay bases y acuerdos informales. El siguiente paso es documentarlos y darles reglas de funcionamiento para que resistan el paso de las generaciones.",
   "El gobierno patrimonial está bien establecido. El reto es mantenerlo vivo: revisar el protocolo con regularidad y preparar a la siguiente generación."
  ],
  "Empresarial": [
   "Falta contrapeso dentro de la empresa. La prioridad es instalar el Consejo de Administración y los comités de control.",
   "Existen órganos de gobierno, pero con funcionamiento parcial o informal. Conviene fortalecerlos con facultades por escrito, manuales y consejeros independientes.",
   "El gobierno corporativo es sólido. El reto es evaluar su desempeño con periodicidad y cuidar la independencia del Consejo."
  ],
  "Operativo": [
   "La operación depende más de las personas que de la estructura. La prioridad es definir roles, organigrama, comités y un plan estratégico.",
   "La operación funciona, pero parte de lo que funciona no está documentado. Formalizar procesos y comités reduce la dependencia de personas clave.",
   "La estructura operativa es sólida. El reto es sostenerla con seguimiento de indicadores y desarrollo de talento."
  ]
 },
 "perfil": [
  {
   "clave": "PF_FAMILIA",
   "tipo": "opcion",
   "requerido": true,
   "titulo": "¿Eres parte de la familia propietaria?",
   "opciones": [
    "Sí, soy de la familia propietaria y trabajo en la empresa",
    "Sí, soy de la familia propietaria, pero no trabajo en la empresa",
    "No soy de la familia (directivo, colaborador o asesor)"
   ]
  },
  {
   "clave": "PF_GENERACION",
   "tipo": "opcion",
   "requerido": true,
   "titulo": "¿A qué generación de la familia perteneces?",
   "opciones": [
    "Primera generación (fundador/a)",
    "Segunda generación",
    "Tercera generación",
    "Cuarta generación o más",
    "No soy de la familia propietaria"
   ]
  },
  {
   "clave": "PF_ANTIGUEDAD",
   "tipo": "opcion",
   "requerido": true,
   "titulo": "¿Cuántos años llevas en la empresa o vinculado/a a ella?",
   "opciones": [
    "Menos de 2 años",
    "De 2 a 5 años",
    "De 6 a 10 años",
    "De 11 a 20 años",
    "Más de 20 años"
   ]
  },
  {
   "clave": "PF_MOTIVO",
   "tipo": "opcion",
   "requerido": true,
   "otra": true,
   "titulo": "¿Cuál es hoy tu principal motivo para buscar institucionalizar la empresa?",
   "opciones": [
    "Preparar la sucesión o el relevo generacional",
    "Evitar o resolver conflictos dentro de la familia",
    "Ordenar la relación entre familia y empresa (reglas, roles, sueldos)",
    "Profesionalizar la dirección y la operación",
    "Proteger el patrimonio familiar",
    "Crecer o abrirme a nuevos socios, inversionistas o financiamiento"
   ]
  },
  {
   "clave": "PF_PREOCUPACION",
   "tipo": "parrafo",
   "requerido": false,
   "titulo": "En tus palabras: ¿qué es lo que más te preocupa hoy de tu empresa y de tu familia?"
  }
 ],
 "apertura": [
  [
   "A1",
   "¿Qué pasaría con tu empresa si mañana tú no estuvieras al frente?"
  ],
  [
   "A2",
   "¿Tu familia tiene reglas claras para participar en la empresa o todo se resuelve sobre la marcha?"
  ],
  [
   "A3",
   "¿Tienes claro de quién depende el futuro del negocio?"
  ],
  [
   "A4",
   "¿Tienes un plan claro de sucesión o solo esperas que el tiempo lo resuelva?"
  ],
  [
   "A5",
   "¿Qué legado quieres dejar: una empresa dependiente de ti o una organización que trascienda generaciones?"
  ]
 ],
 "preguntas": [
  {
   "clave": "P1",
   "sistema": "Patrimonial",
   "titulo": "¿Los accionistas se reúnen de manera formal y periódica para tomar decisiones de la empresa?",
   "opciones": [
    "Sí, nos reunimos de forma regular, con fechas fijas y todo se documenta",
    "Nos reunimos, pero sin orden fijo, sin actas, o solo cuando surge algo urgente",
    "No tenemos un espacio así; las decisiones se toman de manera informal",
    "No aplica en esta etapa (ej. hay un solo accionista)"
   ],
   "rec": [
    "Instalar una Asamblea de Accionistas con calendario anual, orden del día y actas firmadas, para que las decisiones de propiedad dejen de tomarse de manera informal.",
    "Formalizar la Asamblea de Accionistas: fechas fijas durante el año, convocatoria, orden del día y acta de cada sesión."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema patrimonial: acuerdos que cuidan lo que compartimos»",
    "pag": 62,
    "cita": "Asamblea de accionistas: decide sobre temas clave, como otorgar mandato al consejo de administración, designar consejeros, modificar estatutos, aprobar fusiones, inversiones, venta de activos o distribución de dividendos."
   }
  },
  {
   "clave": "P2",
   "sistema": "Patrimonial",
   "titulo": "¿Existe un espacio formal donde la familia dueña hable temas de familia y patrimonio, distinto de las juntas de negocio?",
   "opciones": [
    "Sí, con reglas claras, representación de todas las ramas de la familia y reuniones periódicas",
    "Existe de manera informal (reuniones familiares sin estructura) o sin representar a todas las ramas",
    "No existe ningún espacio así",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Crear un Consejo de Familia, separado de la Asamblea y del Consejo de Administración, donde las ramas de la familia hablen de patrimonio, valores y convivencia.",
    "Dar estructura al espacio familiar: reglas de integración, representación de todas las ramas y reuniones periódicas con agenda."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema patrimonial: acuerdos que cuidan lo que compartimos»",
    "pag": 62,
    "cita": "Consejo de familia: conecta intereses del negocio con los de la familia, ayuda a mantener alineada la visión y crea un espacio de diálogo fuera de la operación."
   }
  },
  {
   "clave": "P3",
   "sistema": "Patrimonial",
   "titulo": "¿Existe un documento firmado que establezca las reglas de convivencia entre familia y empresa?",
   "opciones": [
    "Sí, firmado y cubre los temas clave (historia, valores, gobierno, entradas/salidas, patrimonio)",
    "Existe un borrador o solo acuerdos verbales, sin firmar",
    "No existe ningún documento ni acuerdo",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Elaborar un Protocolo Familiar firmado que defina historia, valores, gobierno, reglas de entrada y salida, y manejo del patrimonio.",
    "Convertir los acuerdos verbales o el borrador en un Protocolo Familiar firmado, y revisarlo de forma periódica."
   ],
   "libro": {
    "ref": "Cap. 2, «Institucionalizar el amor»",
    "pag": 38,
    "cita": "El protocolo familiar —o acuerdo de socios— es un marco más estructurado. Establece principios, reglas y compromisos que guían la relación entre la familia (o socios), la propiedad y la empresa."
   }
  },
  {
   "clave": "P4",
   "sistema": "Patrimonial",
   "titulo": "¿Existen reglas escritas que protejan la propiedad de la empresa si algo le pasa a un accionista, o si las acciones se van repartiendo entre más personas con el paso de las generaciones?",
   "opciones": [
    "Sí, documentadas en un acuerdo de accionistas",
    "Se conocen de manera informal, sin documentar",
    "No se ha abordado el tema"
   ],
   "rec": [
    "Abordar la protección de la propiedad: diseñar un Acuerdo de Accionistas con mecanismos de transmisión y protección de acciones antes de que ocurra una eventualidad.",
    "Documentar en un Acuerdo de Accionistas las reglas que hoy se conocen de manera informal (transmisión, venta, fallecimiento, entrada de nuevos accionistas)."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema patrimonial: acuerdos que cuidan lo que compartimos»",
    "pag": 62,
    "cita": "¿Existen protocolos que regulan la venta, donación o herencia de acciones?"
   }
  },
  {
   "clave": "P5",
   "sistema": "Patrimonial",
   "titulo": "¿Los accionistas que NO trabajan en la operación del negocio piden o reciben puestos y sueldos solo por ser dueños?",
   "opciones": [
    "No; ser accionista no da derecho automático a un puesto",
    "Ocurre ocasionalmente y genera tensión",
    "Es una práctica común, sin importar desempeño o preparación"
   ],
   "rec": [
    "Establecer que ser accionista no da derecho automático a un puesto ni a un sueldo, y definir criterios de ingreso basados en preparación y desempeño.",
    "Poner por escrito los criterios para que un familiar ingrese, permanezca y sea remunerado en la empresa, y aplicarlos sin excepciones."
   ],
   "libro": {
    "ref": "Cap. 5, «La participación del accionista: entre el derecho económico y la responsabilidad institucional»",
    "pag": 109,
    "cita": "El accionista institucional no gestiona, no presiona, no improvisa. Participa cuando le corresponde, decide lo que le incumbe y confía en los sistemas que gestionan y ejecutan."
   }
  },
  {
   "clave": "P6",
   "sistema": "Patrimonial",
   "titulo": "¿Los accionistas tienen claro y coinciden en para qué existe la empresa, más allá de generar utilidades?",
   "opciones": [
    "Sí, con un ejercicio formal documentado",
    "Existe una idea compartida, pero no está formalizada",
    "No se ha hablado del tema, o hay ideas muy distintas entre accionistas"
   ],
   "rec": [
    "Realizar un ejercicio formal de propósito y visión compartida entre los accionistas, para alinear para qué existe la empresa.",
    "Formalizar la idea compartida en un documento de propósito, visión y valores que los accionistas conozcan y firmen."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema patrimonial: acuerdos que cuidan lo que compartimos»",
    "pag": 62,
    "cita": "El sistema patrimonial es el encargado de gestionar esa convivencia: la relación entre accionistas, sus reglas y expectativas. Es el espacio donde se alinean visión, propósito, valores, derechos y responsabilidades."
   }
  },
  {
   "clave": "P7",
   "sistema": "Empresarial",
   "titulo": "¿La empresa cuenta con un Consejo de Administración o Consultivo instalado, más allá de la operación diaria?",
   "opciones": [
    "Sí, formal, con consejeros independientes y agenda de trabajo",
    "Existe, pero solo con familiares o de manera informal",
    "No existe",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Instalar un Consejo de Administración (o un Consejo Consultivo como primer paso), con agenda de trabajo y calendario de sesiones.",
    "Fortalecer el Consejo: incorporar consejeros independientes, definir una agenda anual y redactar un manual de funcionamiento."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema empresarial: estrategia con respaldo»",
    "pag": 64,
    "cita": "Iniciar con consejos pequeños (tres a cinco miembros) para aprender a deliberar sin dispersarse."
   }
  },
  {
   "clave": "P8",
   "sistema": "Empresarial",
   "titulo": "¿Ese Consejo tiene realmente la facultad de nombrar o remover a la alta dirección de la empresa?",
   "opciones": [
    "Sí, es una facultad reconocida y que se ha ejercido",
    "Existe en el papel, pero no se ha usado o se cuestiona",
    "No la tiene; esa decisión la toma únicamente el fundador/dueño",
    "No aplica en esta etapa (no existe un Consejo)"
   ],
   "rec": [
    "Dotar al Consejo, por escrito, de la facultad de nombrar y remover a la alta dirección, y acordar con el fundador cómo se ejerce.",
    "Respaldar la facultad del Consejo sobre la alta dirección: documentarla en estatutos o en el manual del Consejo y definir un proceso de evaluación."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema operativo: donde la estrategia cobra vida»",
    "pag": 65,
    "cita": "No existe un espacio formal que supervise y apruebe la gestión del director general."
   }
  },
  {
   "clave": "P9",
   "sistema": "Empresarial",
   "titulo": "¿Existen comités que funcionen como contrapeso a la Dirección General (por ejemplo, de auditoría, temas fiscales o remuneraciones)?",
   "opciones": [
    "Sí, instalados y funcionando, con manual de operación",
    "Existe al menos uno, los demás se manejan caso por caso",
    "No existe ninguno",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Instalar comités de control (auditoría, temas fiscales, remuneraciones) que funcionen como contrapeso de la Dirección General.",
    "Instalar de forma ordenada los comités que faltan y documentar el manual de operación de cada uno."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema empresarial: estrategia con respaldo»",
    "pag": 64,
    "cita": "Crear comités de control y estratégicos, diseñados según la realidad de la organización."
   }
  },
  {
   "clave": "P10",
   "sistema": "Empresarial",
   "titulo": "¿Existe un comité que defina, con base en estudios de mercado, los sueldos y bonos de familiares y directivos?",
   "opciones": [
    "Sí, reporta al Consejo y documenta cada decisión",
    "Existe un criterio informal, sin comité ni actas",
    "La Dirección General decide los sueldos de familiares sin ningún contrapeso",
    "No aplica en esta etapa (no existen comités de control)"
   ],
   "rec": [
    "Crear un comité de remuneraciones que defina sueldos y bonos de familiares y directivos con base en estudios de mercado y que reporte al Consejo.",
    "Formalizar el criterio actual de remuneraciones en un comité con actas y reporte al Consejo."
   ],
   "libro": {
    "ref": "Cap. 2, «Institucionalizar el amor»",
    "pag": 43,
    "cita": "Creamos un comité de remuneraciones y diseñamos un sistema simple y eficaz: en los años pares, se compararía nuestra compensación contra el mercado, y en los años nones, se aplicaría una fórmula basada en las cuatro variables financieras más relevantes del negocio."
   }
  },
  {
   "clave": "P11",
   "sistema": "Empresarial",
   "titulo": "¿Existen comités específicos para decidir sobre crecimiento o expansión del negocio (nuevas unidades, nuevos socios, franquicias)?",
   "opciones": [
    "Sí, con facultades documentadas",
    "Existe al menos uno, pero sin facultades por escrito",
    "No existen",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Crear comités para las decisiones de crecimiento (nuevas unidades, nuevos socios, franquicias), con facultades claras.",
    "Poner por escrito las facultades de los comités de crecimiento que ya existen."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema empresarial: estrategia con respaldo»",
    "pag": 64,
    "cita": "¿El consejo ha instaurado comités que den seguimiento a la implementación de estrategias clave?"
   }
  },
  {
   "clave": "P12",
   "sistema": "Empresarial",
   "titulo": "¿Los miembros de la familia distinguen con claridad cuándo están hablando como accionistas, como consejeros o como colaboradores de la empresa?",
   "opciones": [
    "Sí, de manera consistente",
    "La mayoría de las veces, aunque a veces se mezclan",
    "No hay distinción; es fuente constante de conflicto"
   ],
   "rec": [
    "Definir los tres roles (accionista, consejero y colaborador) y establecer un foro y reglas distintas para cada uno.",
    "Reforzar la separación de roles con reglas de conducta y foros diferenciados para cada uno."
   ],
   "libro": {
    "ref": "Cap. 2, «Lazos personales vs. roles profesionales»",
    "pag": 36,
    "cita": "Crear espacios específicos para los roles profesionales —base de la institucionalización— permite cuidar que las relaciones familiares no se desgasten ni se erosionen."
   }
  },
  {
   "clave": "P13",
   "sistema": "Operativo",
   "titulo": "Si la persona que dirige la empresa hoy dejara de estar presente por un mes, ¿la operación seguiría funcionando con normalidad?",
   "opciones": [
    "Sí, las áreas tienen autonomía real para decidir",
    "Se nota su ausencia; muchas decisiones dependen de que regrese",
    "La operación se detendría; todo depende de esa persona"
   ],
   "rec": [
    "Reducir la dependencia de la persona que dirige: delegar decisiones con facultades documentadas y preparar una sucesión operativa.",
    "Documentar qué decisiones dependen hoy de una sola persona y transferirlas de forma gradual a las áreas, con límites de autoridad claros."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema operativo: donde la estrategia cobra vida»",
    "pag": 66,
    "cita": "Toda la operación depende de una o pocas personas."
   }
  },
  {
   "clave": "P14",
   "sistema": "Operativo",
   "titulo": "¿Existe un Comité de Dirección formalmente constituido, con facultades documentadas?",
   "opciones": [
    "Sí, con un documento claro de funcionamiento",
    "Hay reuniones de dirección regulares, pero sin documento formal",
    "No existe",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Constituir un Comité de Dirección con integrantes, facultades y periodicidad definidos.",
    "Formalizar el Comité de Dirección en un documento que establezca integrantes, facultades y calendario."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema operativo: donde la estrategia cobra vida»",
    "pag": 66,
    "cita": "El director general no ha conformado un comité de dirección que lo respalde."
   }
  },
  {
   "clave": "P15",
   "sistema": "Operativo",
   "titulo": "¿La empresa cuenta con un organigrama formal, actualizado y que todos conocen?",
   "opciones": [
    "Sí, documentado, actualizado y conocido por todos",
    "Existe, pero desactualizado o poco comunicado",
    "No existe"
   ],
   "rec": [
    "Elaborar un organigrama formal con funciones y líneas de reporte, y comunicarlo a toda la organización.",
    "Actualizar el organigrama, comunicarlo a todos y nombrar a un responsable de mantenerlo vigente."
   ],
   "libro": {
    "ref": "Cap. 9, «Estructuras correctas con las personas idóneas»",
    "pag": 166,
    "cita": "El organigrama no debe ser resultado de la historia, sino respuesta a una pregunta fundamental: ¿qué estructura permite ejecutar la estrategia con mayor eficacia?"
   }
  },
  {
   "clave": "P16",
   "sistema": "Operativo",
   "titulo": "¿Existe un Código de Ética formal, documentado y comunicado a todos los colaboradores?",
   "opciones": [
    "Sí, documentado, comunicado y aplicado",
    "Existe el documento, pero poco se comunica o aplica",
    "No existe"
   ],
   "rec": [
    "Redactar un Código de Ética y comunicarlo a todos los colaboradores.",
    "Difundir y aplicar el Código de Ética existente: inducción, capacitación y un mecanismo para atender casos."
   ],
   "libro": {
    "ref": "Cap. 5, «La cultura que sostiene la institucionalización»",
    "pag": 110,
    "cita": "Una cultura sólida sostiene la institucionalización incluso cuando las reglas fallan. Una cultura tóxica, en cambio, puede deshacer cualquier sistema, por muy bien diseñado que esté."
   }
  },
  {
   "clave": "P17",
   "sistema": "Operativo",
   "titulo": "¿Existen comités operativos (de ventas, producción, finanzas, etc.) con propósito y periodicidad definidos?",
   "opciones": [
    "Sí, con un mapa de comités documentado",
    "Hay reuniones periódicas, sin formalizarse como comité",
    "No existen o son esporádicas",
    "No aplica en esta etapa"
   ],
   "rec": [
    "Definir un mapa de comités operativos (ventas, producción, finanzas, etc.) con propósito y periodicidad.",
    "Formalizar las reuniones periódicas como comités, con propósito, integrantes y minuta."
   ],
   "libro": {
    "ref": "Cap. 4, «Sistema operativo: donde la estrategia cobra vida»",
    "pag": 65,
    "cita": "El sistema operativo traduce lo acordado en realidad; está compuesto por la dirección general, los comités operativos y los equipos que ejecutan la operación diaria."
   }
  },
  {
   "clave": "P18",
   "sistema": "Operativo",
   "titulo": "¿Existe un calendario institucional claro de quién se reúne, cuándo y para qué?",
   "opciones": [
    "Sí, documentado y se respeta",
    "Existe de manera informal o es inconsistente",
    "No existe"
   ],
   "rec": [
    "Construir un calendario institucional anual de reuniones: quién se reúne, cuándo y para qué.",
    "Documentar el calendario institucional y nombrar a un responsable de darle seguimiento."
   ],
   "libro": {
    "ref": "Cap. 5, «Dirección general: entre la urgencia operativa y la conducción institucional»",
    "pag": 105,
    "cita": "El calendario está definido con meses de anticipación. El segundo lunes de cada mes, por ejemplo, se celebra la reunión del comité enfocado en la «eficiencia operativa», con duración máxima de dos horas."
   }
  },
  {
   "clave": "P19",
   "sistema": "Operativo",
   "titulo": "¿Los sueldos se definen con base en un tabulador con referencias de mercado?",
   "opciones": [
    "Sí, actualizado y aplicado",
    "Existe, pero está desactualizado",
    "Se definen de manera discrecional; no existe un tabulador"
   ],
   "rec": [
    "Crear un tabulador de sueldos con referencias de mercado y reglas claras de aplicación.",
    "Actualizar el tabulador con referencias de mercado vigentes y aplicarlo de manera consistente."
   ],
   "libro": {
    "ref": "Cap. 9, «Decisiones justas en la gestión del talento»",
    "pag": 169,
    "cita": "Muchas veces, los sistemas de desarrollo humano están desalineados: premian mediocridades, otorgan incrementos sin mérito o toleran faltas graves contra los valores."
   }
  },
  {
   "clave": "P20",
   "sistema": "Operativo",
   "titulo": "¿Las decisiones operativas se basan en un plan estratégico aprobado, o principalmente en la intuición de los dueños/directivos?",
   "opciones": [
    "Se basan en un plan estratégico aprobado, con seguimiento de indicadores",
    "Hay una mezcla: algo de plan, pero muchas decisiones siguen siendo intuitivas",
    "La empresa opera solo con base en la intuición de los familiares"
   ],
   "rec": [
    "Elaborar un plan estratégico con objetivos e indicadores, para que las decisiones dejen de depender de la intuición.",
    "Consolidar el plan estratégico: aprobarlo en el órgano de gobierno y darle seguimiento con indicadores."
   ],
   "libro": {
    "ref": "Cap. 5, «Visión de futuro compartida: el mapa estratégico UB»",
    "pag": 102,
    "cita": "Incluso, cuando la visión de futuro es compartida, las diferencias en la ejecución o la falta de seguimiento impiden el avance con acciones efectivas."
   }
  }
 ],
 "libros": [
  {
   "id": "tmd",
   "titulo": "Tu mayor desafío",
   "autor": "Alfonso Urrea Martín",
   "anio": "2026",
   "url": "https://www.amazon.com.mx/Mayor-Desaf%C3%ADo-Alfonso-Urrea-Martin/dp/9689721224",
   "nota": "Cómo institucionalizar tu empresa para fortalecer su gestión y que trascienda generaciones."
  },
  {
   "id": "vtc",
   "titulo": "Vivir, Trabajar y Crecer en Familia",
   "autor": "Alfonso Urrea Martín",
   "anio": "2023",
   "url": "https://www.amazon.com.mx/Trabajar-Crecer-Familia-Gesti%C3%B3n-Institucionalizaci%C3%B3n/dp/6078704141",
   "nota": "Un modelo para la continuidad de la empresa y la unión familiar."
  }
 ],
 "libroCita": "Tu mayor desafío",
 "semaforo": {
  "ref": "Cap. 5, «Lo que sí funciona: el semáforo institucional UB»",
  "pag": 91,
  "cap6": "Cap. 6, «Diagnóstico emocional y estratégico»",
  "pag6": 117
 },
 "lecturas": {
  "Patrimonial": [
   {
    "ref": "Cap. 2, «La paradoja del amor»",
    "pag": 23
   },
   {
    "ref": "Cap. 4, «Sistema patrimonial: acuerdos que cuidan lo que compartimos»",
    "pag": 62
   },
   {
    "ref": "Cap. 10, «Sucesión en el sistema patrimonial»",
    "pag": 185
   }
  ],
  "Empresarial": [
   {
    "ref": "Cap. 4, «Sistema empresarial: estrategia con respaldo»",
    "pag": 63
   },
   {
    "ref": "Cap. 7, «Cuando los órganos fallan»",
    "pag": 129
   },
   {
    "ref": "Cap. 10, «Sucesión en el sistema empresarial»",
    "pag": 187
   }
  ],
  "Operativo": [
   {
    "ref": "Cap. 4, «Sistema operativo: donde la estrategia cobra vida»",
    "pag": 65
   },
   {
    "ref": "Cap. 5, «Dirección general: entre la urgencia operativa y la conducción institucional»",
    "pag": 105
   },
   {
    "ref": "Cap. 9, «Sistemas con alma»",
    "pag": 161
   },
   {
    "ref": "Cap. 10, «Sucesión en el sistema operativo»",
    "pag": 188
   }
  ]
 },
 "recursos": [
  {
   "titulo": "Cuando el río suena",
   "anio": "2026",
   "url": "https://www.youtube.com/watch?v=3MZxacnYea4"
  },
  {
   "titulo": "Podcast con Oso Trava",
   "anio": "2023",
   "url": "https://www.youtube.com/watch?v=nKB1neAd_2g"
  },
  {
   "titulo": "Entrevista con Andrea Gallardo",
   "anio": "2025",
   "url": "https://www.youtube.com/watch?v=IXxHsk3g2Lk"
  },
  {
   "titulo": "GIRA Podcast",
   "anio": "2025",
   "url": "https://www.youtube.com/watch?v=uxvwc7D4yeE"
  },
  {
   "titulo": "Entrevista con Jorge Serratos",
   "anio": "2025",
   "url": "https://www.youtube.com/watch?v=qMClcDYFDnQ"
  },
  {
   "titulo": "Progresivo Podcast",
   "anio": "2024",
   "url": "https://www.youtube.com/watch?v=PKlbqA2wdSs"
  }
 ]
};
