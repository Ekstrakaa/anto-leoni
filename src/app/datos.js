/* Todo el contenido de la app vive acá.
   Para cambiar un texto, un ejercicio o una comida no hace falta
   tocar ningún componente: se edita este archivo.

   Los ejercicios salen de Free Exercise DB (dominio público) y cada id
   está verificado contra el dataset: existe y tiene dos fotos.
   Los pesos y series son de demostración: los define Anto por clienta. */

export const ANTO = '/anto3.png'
export const VIDEO_ANTO = '/video1.mp4'

/* ---------- El arranque: cuatro tandas que llegan de a una ---------- */

export const TANDAS = [
  {
    dice: 'Hola, soy Anto. Antes de armarte nada quiero saber con quién estoy trabajando. Son cuatro tandas cortas, se contestan tocando.',
    numeros: [
      { k: 'edad', e: 'Tu edad', u: 'años', min: 14, max: 90 },
      { k: 'peso', e: 'Tu peso', u: 'kg', min: 35, max: 180 },
      { k: 'altura', e: 'Tu altura', u: 'cm', min: 130, max: 210 },
    ],
    preguntas: [
      { k: 'meta', t: '¿Qué buscás?', opciones: ['Bajar grasa', 'Ganar músculo', 'Ponerme fuerte', 'Sentirme mejor'] },
    ],
  },
  {
    dice: 'Ahora lo que más me importa: cómo comés de verdad. Sin maquillar nada, que si no te armo un plan para otra persona.',
    preguntas: [
      { k: 'levanta', t: '¿A qué hora te levantás?', opciones: ['Antes de las 6', '6 a 8', '8 a 10', 'Más tarde'] },
      { k: 'desayuna', t: '¿Desayunás?', opciones: ['Todos los días', 'A veces', 'Casi nunca', 'Nunca'] },
      { k: 'veces', t: '¿Cuántas veces comés al día?', opciones: ['2', '3', '4', '5 o más'] },
      { k: 'cuesta', t: '¿Qué te cuesta más dejar?', varias: true, opciones: ['Dulce', 'Pan', 'Picar entre horas', 'Alcohol', 'Refrescos', 'Fritos', 'Nada'] },
    ],
  },
  {
    dice: 'Cómo te movés y qué tomás.',
    preguntas: [
      { k: 'mueve', t: '¿Cuánto te movés hoy por hoy?', opciones: ['Nada', '1 o 2 días', '3 o 4 días', 'Casi todos'] },
      { k: 'donde', t: '¿Dónde podés entrenar?', varias: true, opciones: ['Gimnasio', 'En casa', 'Al aire libre'] },
      { k: 'agua', t: '¿Cuánta agua tomás al día?', opciones: ['Menos de 1 L', '1 a 2 L', 'Más de 2 L', 'Ni idea'] },
      { k: 'supl', t: '¿Tomás algún suplemento?', varias: true, opciones: ['Ninguno', 'Proteína', 'Creatina', 'Magnesio', 'Colágeno', 'Vitamina D', 'Omega 3'] },
    ],
  },
  {
    dice: 'Y la última, que es la que más me importa: ¿hay algo que tu cuerpo no pueda hacer? Con esto decido qué ejercicios NO te mando. Si no estás segura, marcalo igual — prefiero pasarme.',
    preguntas: [
      {
        k: 'lesiones',
        t: '¿Algo que deba saber antes de mandarte nada?',
        varias: true,
        opciones: [
          'Nada, estoy bien', 'Cadera', 'Rodilla', 'Hombro', 'Espalda baja',
          'Muñecas', 'Embarazo o posparto', 'Tensión alta',
          'No puedo saltar', 'Me cuesta el suelo',
        ],
      },
    ],
  },
]

/* La etiqueta que ve la persona y la clave que entiende el motor. */
export const CLAVE_LESION = {
  'Nada, estoy bien': 'ninguna',
  Cadera: 'cadera',
  Rodilla: 'rodilla',
  Hombro: 'hombro',
  'Espalda baja': 'espalda',
  Muñecas: 'muneca',
  'Embarazo o posparto': 'embarazo',
  'Tensión alta': 'tension',
  'No puedo saltar': 'impacto',
  'Me cuesta el suelo': 'suelo',
}

export const clavesDeLesiones = (etiquetas = []) => {
  const k = etiquetas.map((e) => CLAVE_LESION[e]).filter(Boolean)
  return k.length ? k : ['ninguna']
}

export const NIVELES = [
  { n: 1, t: 'Te conozco', d: 'Contestaste las cuatro tandas. Ya sé con quién trabajo.' },
  { n: 2, t: 'Tu plan', d: 'Comida y entreno hechos con tus respuestas.' },
  { n: 3, t: 'Constancia', d: 'Se ajusta según lo que cumplís de verdad.' },
  { n: 4, t: 'Autonomía', d: 'Ya elegís sola. Yo superviso.' },
]

/* ---------- Agua: la gente no toma en vasos, toma en envases ---------- */

export const ENVASES = [
  { ic: 'CupSoda', n: 'Vaso', ml: 250 },
  { ic: 'Milk', n: 'Botella', ml: 500 },
  { ic: 'GlassWater', n: 'Grande', ml: 1500 },
  { ic: 'Coffee', n: 'Termo', ml: 1000 },
]

export const META_AGUA = 2000

export const COMIDAS_BASE = [
  { h: 'Desayuno', t: '', hora: '' },
  { h: 'Media mañana', t: '', hora: '' },
  { h: 'Almuerzo', t: '', hora: '' },
  { h: 'Merienda', t: '', hora: '' },
  { h: 'Cena', t: '', hora: '' },
]

/* ---------- El día de comidas: muchas opciones, elige la persona ----------
   Fotos: Wikimedia Commons, CC0 / dominio público, verificadas una a una.
   Donde no hay foto digna, la tarjeta lleva emoji — hasta que Anto
   fotografíe sus propios platos, que es lo que corresponde. */

const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb/'

export const MENU = [
  {
    k: 'desayuno',
    titulo: 'Tu desayuno',
    ayuda: 'Lo más importante del mes. Elegí el que te salga fácil.',
    con: [
      { k: 'fruta', n: 'Fruta fresca + café', d: 'plátano o manzana', foto: W + '2/21/Fruit-49741_-_bananas_apples_tangerines_close-up_-_Hans_Braxmeier.jpg/330px-Fruit-49741_-_bananas_apples_tangerines_close-up_-_Hans_Braxmeier.jpg' },
      { k: 'tostada', n: 'Tostada con tomate', d: 'pan integral y aceite', ic: 'Sandwich' },
      { k: 'avena', n: 'Avena con leche', d: 'y canela', ic: 'Wheat' },
      { k: 'revuelto', n: 'Huevos revueltos', d: 'dos huevos', ic: 'Egg' },
    ],
    mas: ['Yogur con granola', 'Tortitas de avena', 'Tostada con aguacate', 'Batido de fruta'],
  },
  {
    k: 'almuerzo',
    titulo: 'Tu proteína del almuerzo',
    ayuda: 'Elegí la que más te guste. Todas te sirven igual.',
    con: [
      { k: 'pollo', n: 'Pollo a la plancha', d: 'una pechuga', foto: W + 'b/b0/Grilled_chicken_breast%2C_Santo_Domingo%2C_La_Palma.jpg/330px-Grilled_chicken_breast%2C_Santo_Domingo%2C_La_Palma.jpg' },
      { k: 'atun', n: 'Ensalada de atún', d: 'una lata escurrida', foto: W + 'e/e7/Tuna_Salad_with_sweet_corn.jpg/330px-Tuna_Salad_with_sweet_corn.jpg' },
      { k: 'garbanzos', n: 'Bowl de garbanzos', d: 'un plato hondo', foto: W + '2/22/Edgell_Nourish_Bowl.jpg/330px-Edgell_Nourish_Bowl.jpg' },
      { k: 'pavo', n: 'Pavo a la plancha', d: 'con verduras', ic: 'Drumstick' },
    ],
    mas: ['Salmón', 'Ternera magra', 'Lentejas', 'Tofu', 'Merluza', 'Queso fresco', 'Sardinas', 'Quinoa con huevo'],
  },
  {
    k: 'merienda',
    titulo: 'Tu merienda',
    ayuda: 'La que te falta. Es la que corta el hambre de la noche.',
    con: [
      { k: 'frutos', n: 'Frutos secos', d: 'un puñado', foto: W + '9/97/MixedNuts.JPG/330px-MixedNuts.JPG' },
      { k: 'yogur', n: 'Yogur griego', d: 'con fruta', ic: 'Milk' },
      { k: 'batido', n: 'Batido de proteína', d: 'con leche o agua', ic: 'GlassWater' },
      { k: 'hummus', n: 'Hummus con zanahoria', d: 'o pepino', ic: 'Carrot' },
    ],
    mas: ['Requesón', 'Manzana con crema de cacahuete', 'Tostada con pavo'],
  },
  {
    k: 'cena',
    titulo: 'Tu cena',
    ayuda: 'Liviana, que dormís mejor. Verdura + proteína.',
    con: [
      { k: 'tortilla', n: 'Tortilla + ensalada', d: 'dos huevos', ic: 'Egg' },
      { k: 'verdura', n: 'Verduras salteadas', d: 'con queso fresco', ic: 'Salad' },
      { k: 'lentejas', n: 'Lentejas estofadas', d: 'plato hondo', ic: 'CookingPot' },
      { k: 'pescado', n: 'Merluza a la plancha', d: 'con limón', ic: 'Fish' },
    ],
    mas: ['Crema de calabaza', 'Revuelto de champiñones', 'Ensalada completa'],
  },
]

export const ELEGIDO_BASE = { desayuno: 'fruta', almuerzo: 'pollo', merienda: 'frutos', cena: 'tortilla' }

/* ---------- Ejercicios: Free Exercise DB ---------- */

const EJ = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'
export const fotoEjercicio = (id, n) => `${EJ}${encodeURIComponent(id)}/${n}.jpg`

/* Rutina semanal: tres días con nombre, para gimnasio y para casa.
   La versión corta de cada día son sus tres primeros ejercicios. */

export const RUTINAS = {
  gimnasio: [
    {
      dia: 'Lunes', nombre: 'Piernas y glúteos', ic: 'Footprints',
      ejercicios: [
        { id: 'Barbell_Squat_To_A_Bench', n: 'Sentadilla a banco', series: 3, repes: '12', peso: '30 kg', musculo: 'quadriceps',
          pasos: ['Barra en la espalda alta, pies al ancho de los hombros.', 'Bajá hasta rozar el banco con los glúteos.', 'Subí empujando con los talones.'] },
        { id: 'Leg_Press', n: 'Prensa de piernas', series: 3, repes: '12', peso: '60 kg', musculo: 'quadriceps',
          pasos: ['Pies al ancho de caderas, en el centro de la plataforma.', 'Bajá hasta que las rodillas hagan 90 grados.', 'Empujá sin bloquear las rodillas arriba.'] },
        { id: 'Lying_Leg_Curls', n: 'Curl femoral tumbada', series: 3, repes: '12', peso: '25 kg', musculo: 'hamstrings',
          pasos: ['Tumbada boca abajo, el rodillo sobre los tobillos.', 'Llevá los talones a los glúteos sin despegar la cadera.', 'Bajá en dos segundos, controlando.'] },
        { id: 'Pull_Through', n: 'Empuje de cadera en polea', series: 3, repes: '15', peso: '20 kg', musculo: 'glutes',
          pasos: ['De espaldas a la polea baja, cuerda entre las piernas.', 'Bisagra de cadera: el movimiento sale de los glúteos.', 'Apretá fuerte arriba un segundo.'] },
        { id: 'Standing_Calf_Raises', n: 'Gemelos de pie', series: 3, repes: '15', peso: '40 kg', musculo: 'calves',
          pasos: ['Puntas de los pies en el escalón, talones colgando.', 'Subí todo lo que puedas y aguantá un segundo.', 'Bajá lento hasta estirar.'] },
        { id: 'Plank', n: 'Plancha', series: 3, repes: '30 seg', peso: 'tu peso', musculo: 'abdominals',
          pasos: ['Antebrazos en el suelo, cuerpo en línea recta.', 'Apretá el abdomen: la cadera no sube ni cae.', 'Respirá. Si tiembla, va bien.'] },
      ],
    },
    {
      dia: 'Miércoles', nombre: 'Espalda y brazos', ic: 'Dumbbell',
      ejercicios: [
        { id: 'Wide-Grip_Lat_Pulldown', n: 'Jalón al pecho', series: 3, repes: '12', peso: '30 kg', musculo: 'lats',
          pasos: ['Agarre ancho, pecho arriba.', 'Llevá la barra a la clavícula tirando con la espalda.', 'Subí controlando, sin soltar el peso.'] },
        { id: 'Seated_Cable_Rows', n: 'Remo sentada en polea', series: 3, repes: '12', peso: '30 kg', musculo: 'middle back',
          pasos: ['Espalda recta, rodillas algo flexionadas.', 'Llevá el agarre al abdomen apretando los omóplatos.', 'Estirá los brazos sin encorvar la espalda.'] },
        { id: 'Barbell_Curl', n: 'Curl de bíceps con barra', series: 3, repes: '12', peso: '12 kg', musculo: 'biceps',
          pasos: ['Codos pegados al cuerpo.', 'Subí la barra sin balancearte.', 'Bajá en dos segundos: ahí está la mitad del trabajo.'] },
        { id: 'Triceps_Pushdown', n: 'Extensión de tríceps en polea', series: 3, repes: '12', peso: '15 kg', musculo: 'triceps',
          pasos: ['Codos fijos a los costados.', 'Empujá hacia abajo hasta estirar del todo.', 'Volvé lento hasta los 90 grados.'] },
        { id: 'Dumbbell_Shoulder_Press', n: 'Press de hombro', series: 3, repes: '10', peso: '8 kg', musculo: 'shoulders',
          pasos: ['Sentada, espalda apoyada, mancuernas a la altura de las orejas.', 'Subí hasta estirar sin chocarlas arriba.', 'Bajá contando dos segundos.'] },
      ],
    },
    {
      dia: 'Viernes', nombre: 'Cuerpo completo', ic: 'Flame',
      ejercicios: [
        { id: 'Barbell_Bench_Press_-_Medium_Grip', n: 'Press de banca', series: 3, repes: '10', peso: '20 kg', musculo: 'chest',
          pasos: ['Pies firmes en el suelo, omóplatos juntos.', 'Bajá la barra al pecho, codos a 45 grados.', 'Empujá hasta estirar los brazos.'] },
        { id: 'Bent_Over_Barbell_Row', n: 'Remo con barra', series: 3, repes: '10', peso: '25 kg', musculo: 'middle back',
          pasos: ['Torso inclinado, espalda recta.', 'Llevá la barra al abdomen apretando los omóplatos.', 'Bajá despacio, sin dejar caer el peso.'] },
        { id: 'Dumbbell_Lunges', n: 'Zancadas con mancuernas', series: 3, repes: '10 por pierna', peso: '6 kg', musculo: 'quadriceps',
          pasos: ['Paso largo al frente, torso derecho.', 'La rodilla de atrás baja casi hasta el suelo.', 'Empujá con el talón de adelante para volver.'] },
        { id: 'Stiff-Legged_Dumbbell_Deadlift', n: 'Peso muerto rumano', series: 3, repes: '12', peso: '10 kg', musculo: 'hamstrings',
          pasos: ['Mancuernas pegadas a las piernas.', 'Bajá empujando la cadera atrás, espalda recta.', 'Sentí el estirón atrás y subí apretando glúteos.'] },
        { id: 'Cable_Crunch', n: 'Abdominales en polea', series: 3, repes: '15', peso: '20 kg', musculo: 'abdominals',
          pasos: ['De rodillas, cuerda a los lados de la cara.', 'Enrollá el torso hacia abajo con el abdomen.', 'Subí controlando, sin tirar con los brazos.'] },
      ],
    },
  ],
  casa: [
    {
      dia: 'Lunes', nombre: 'Piernas y glúteos', ic: 'Footprints',
      ejercicios: [
        { id: 'Bodyweight_Squat', n: 'Sentadilla libre', series: 3, repes: '15', peso: 'tu peso', musculo: 'quadriceps',
          pasos: ['Pies al ancho de los hombros, brazos al frente.', 'Bajá como si te sentaras en una silla invisible.', 'Subí apretando los glúteos arriba.'] },
        { id: 'Butt_Lift_Bridge', n: 'Puente de glúteos', series: 3, repes: '15', peso: 'tu peso', musculo: 'glutes',
          pasos: ['Tumbada, rodillas dobladas, pies cerca de los glúteos.', 'Subí la cadera apretando fuerte arriba.', 'Bajá sin apoyar del todo y repetí.'] },
        { id: 'Glute_Kickback', n: 'Patada de glúteo', series: 3, repes: '12 por pierna', peso: 'tu peso', musculo: 'glutes',
          pasos: ['En cuatro apoyos, espalda neutra.', 'Llevá el talón al techo con la rodilla doblada.', 'No arquees la espalda: el que trabaja es el glúteo.'] },
        { id: 'Front_Leg_Raises', n: 'Elevación de pierna', series: 3, repes: '12 por pierna', peso: 'tu peso', musculo: 'hamstrings',
          pasos: ['De pie, apoyate en la pared si hace falta.', 'Subí la pierna estirada al frente.', 'Bajá controlando, sin dejarla caer.'] },
        { id: 'Plank', n: 'Plancha', series: 3, repes: '30 seg', peso: 'tu peso', musculo: 'abdominals',
          pasos: ['Antebrazos en el suelo, cuerpo en línea recta.', 'Apretá el abdomen: la cadera no sube ni cae.', 'Respirá. Si tiembla, va bien.'] },
      ],
    },
    {
      dia: 'Miércoles', nombre: 'Torso y brazos', ic: 'Dumbbell',
      ejercicios: [
        { id: 'Incline_Push-Up', n: 'Flexión con apoyo', series: 3, repes: '10', peso: 'tu peso', musculo: 'chest',
          pasos: ['Manos en el borde del sofá o una mesa firme.', 'Cuerpo en línea, bajá el pecho al borde.', 'Empujá hasta estirar los brazos.'] },
        { id: 'Bench_Dips', n: 'Fondos en el sofá', series: 3, repes: '10', peso: 'tu peso', musculo: 'triceps',
          pasos: ['Manos en el borde, dedos hacia adelante.', 'Bajá doblando los codos hacia atrás.', 'Subí estirando los brazos.'] },
        { id: 'Superman', n: 'Superman', series: 3, repes: '12', peso: 'tu peso', musculo: 'lower back',
          pasos: ['Boca abajo, brazos estirados adelante.', 'Despegá brazos y piernas a la vez.', 'Aguantá dos segundos arriba y bajá.'] },
        { id: 'Mountain_Climbers', n: 'Escaladores', series: 3, repes: '20', peso: 'tu peso', musculo: 'quadriceps',
          pasos: ['Posición de plancha alta.', 'Llevá las rodillas al pecho alternando rápido.', 'La cadera queda baja todo el tiempo.'] },
        { id: 'Pushups', n: 'Flexiones completas', series: 2, repes: '6', peso: 'cuando salgan las de apoyo', musculo: 'chest',
          pasos: ['Manos al ancho de los hombros.', 'Bajá el pecho al suelo con el cuerpo en línea.', 'Si no sale, seguí con las de apoyo. Llegan.'] },
      ],
    },
    {
      dia: 'Viernes', nombre: 'Cuerpo completo y core', ic: 'Flame',
      ejercicios: [
        { id: 'Inchworm', n: 'La oruga', series: 3, repes: '8', peso: 'tu peso', musculo: 'hamstrings',
          pasos: ['De pie, bajá las manos al suelo.', 'Caminá con las manos hasta la plancha.', 'Volvé caminando con los pies hacia las manos.'] },
        { id: 'Flutter_Kicks', n: 'Patada de tijera', series: 3, repes: '20', peso: 'tu peso', musculo: 'glutes',
          pasos: ['Boca abajo, piernas estiradas.', 'Pataleá corto y rápido sin tocar el suelo.', 'El abdomen sostiene, la espalda no se arquea.'] },
        { id: 'Bent-Knee_Hip_Raise', n: 'Elevación de cadera', series: 3, repes: '15', peso: 'tu peso', musculo: 'abdominals',
          pasos: ['Tumbada, rodillas dobladas.', 'Llevá las rodillas al pecho despegando la cadera.', 'Bajá sin apoyar del todo los pies.'] },
        { id: '3_4_Sit-Up', n: 'Abdominal corto', series: 3, repes: '12', peso: 'tu peso', musculo: 'abdominals',
          pasos: ['Tumbada, pies firmes, manos detrás de la cabeza.', 'Subí el torso hasta quedar casi vertical.', 'Bajá solo tres cuartos y volvé a subir.'] },
        { id: 'Air_Bike', n: 'Bicicleta en el suelo', series: 3, repes: '20', peso: 'tu peso', musculo: 'abdominals',
          pasos: ['Tumbada, manos detrás de la cabeza.', 'Codo a la rodilla contraria, alternando.', 'Despacio y girando de verdad: no es velocidad.'] },
      ],
    },
  ],
}

export const NOMBRE_MUSCULO = {
  quadriceps: 'Cuádriceps',
  'middle back': 'Espalda media',
  'lower back': 'Lumbar',
  shoulders: 'Hombros',
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  abdominals: 'Abdomen',
  glutes: 'Glúteos',
  hamstrings: 'Isquios',
  chest: 'Pecho',
  lats: 'Dorsales',
  calves: 'Gemelos',
}

/* Qué día de rutina toca según el día real de la semana.
   Lunes → A, martes → descanso… domingo → descanso. */
export function diaDeHoy() {
  const d = new Date().getDay() // 0 dom … 6 sáb
  if (d === 1) return { idx: 0, descanso: false }
  if (d === 3) return { idx: 1, descanso: false }
  if (d === 5) return { idx: 2, descanso: false }
  // día de descanso: se muestra el próximo entreno
  const prox = d === 0 || d === 6 ? 0 : d === 2 ? 1 : 2
  return { idx: prox, descanso: true }
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/* baja la primera letra sin tocar unidades (L, kg…) */
export const baja = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : t)
