# Open Scrutiny (recuento de votos)

Aplicación para configurar una elección sencilla y registrar el escrutinio en vivo, con la pantalla de ejecución pensada para proyección ante la mesa y el público.

## Language

**Proceso electoral**:
La elección configurada (título, descripción, logo y conjunto de preguntas con sus opciones).
_Avoid_: Evento, sesión

**Pregunta**:
Un ítem sobre el que se vota en cada papeleta (por ejemplo un cargo o una consulta).
_Avoid_: Voting item, ítem

**Opción**:
Una respuesta posible dentro de una pregunta (por defecto SI, NO, N/C).
_Avoid_: Choice, candidatura

**Papeleta**:
Una boleta física cuyo resultado vocaliza un participante de la mesa; el operador la traduce al sistema eligiendo una opción por pregunta antes de registrar el voto.
_Avoid_: Voto (cuando se refiere al papel), ballot slip

**Participante de mesa**:
Persona que, en voz alta, comunica el contenido de la papeleta que se está escrutinando.
_Avoid_: Vocal, escrutador

**Operador**:
Persona que maneja la aplicación el día de la votación, introduce las opciones de la papeleta actual y confirma el registro ante la pantalla proyectada.
_Avoid_: Usuario, admin

**Escrutinio**:
El conteo acumulado de papeletas ya registradas en el sistema, visible para la asamblea.
_Avoid_: Resultado final (hasta que no cierre el proceso), tally

**Contabilizar la papeleta**:
Confirmar en el sistema la papeleta en curso: persistir un voto en cada pregunta según las opciones pulsadas y actualizar el escrutinio mostrado.
_Avoid_: Contabilizar voto, guardar, submit

**Configuración**:
Fase previa al día de la votación en la que se define el proceso electoral.
_Avoid_: Setup, admin panel

**Ejecución**:
Fase del día de la votación: pantalla única de escrutinio en vivo para proyección y operación.
_Avoid_: Execution screen, modo live

**Cuadrícula de preguntas**:
Disposición de las preguntas en filas de hasta seis columnas; al superar seis preguntas continúa en una segunda fila (2×6, 3×6, etc.).
_Avoid_: Grid de charts, carrusel

**Zona de escrutinio**:
El bloque de ejecución reservado a los gráficos de barras (mínimo la mitad de la altura útil de la pantalla, ancho completo).
_Avoid_: Sección 2, área de charts

**Papeleta en curso**:
Selección temporal del operador (una opción pulsada por pregunta) que aún no se ha contabilizado.
_Avoid_: Borrador, selección pendiente

**Deshacer última papeleta**:
Quitar del escrutinio la última papeleta ya contabilizada, restaurando los totales como antes de ese registro.
_Avoid_: Undo, revertir voto

**Corrección de totales**:
Ajuste manual de los conteos por opción, fuera del flujo principal, accesible solo por atajo de teclado.
_Avoid_: Totales manuales, modo admin
