/* ============================================================
   EL NÚCLEO

   De los 873 del catálogo, estos son los que se pueden programar
   de verdad, cada uno etiquetado a mano con lo que un filtro
   médico necesita saber y que el nombre no dice.

   Por qué existe este archivo: filtrar por palabras del nombre
   no funciona. "Superman" no dice que sea boca abajo, y
   "Elevación frontal pullover" no dice que el brazo pase por
   encima de la cabeza. Con un filtro así el plan PARECE seguro
   y no lo es, que es peor que no filtrar.

   ETIQUETAS (todo lo que no se escribe vale 0)
     pos  dónde está el cuerpo:
          pie · sent (sentada o en banco) · sup (boca arriba)
          pron (boca abajo) · cuatro (a cuatro apoyos) · lat (de lado)
     imp  hay impacto o fase de vuelo            0/1
     oh   los brazos pasan por encima del hombro 0/1
     homb la articulación del hombro carga igual  0/1
     col  carga que aguanta la columna           0-2
     cad  cuánto se cierra la cadera             0-2
     rod  cuánto exige la rodilla                0-2
     mun  el peso del cuerpo cae en las muñecas  0/1
     abd  exige la pared abdominal (diástasis)   0/1
     iso  hay que aguantar apretando             0/1

   Los datos que ya vienen del catálogo (músculo, material, fotos,
   nivel) no se repiten acá: se cruzan por el id.
   ============================================================ */

const e = (id, pos, t = {}) => ({ id, pos, imp: 0, oh: 0, homb: 0, col: 0, cad: 0, rod: 0, mun: 0, abd: 0, iso: 0, ...t })

export const NUCLEO = [
  /* ---------- cuádriceps ---------- */
  e('Leg_Press', 'sent', { cad: 2, rod: 2 }),
  e('Leg_Extensions', 'sent', { rod: 2 }),
  e('Single-Leg_Leg_Extension', 'sent', { rod: 2 }),
  e('Hack_Squat', 'pie', { col: 1, cad: 2, rod: 2 }),
  e('Bodyweight_Squat', 'pie', { cad: 2, rod: 1 }),
  e('Barbell_Squat', 'pie', { col: 2, cad: 2, rod: 2 }),
  e('Barbell_Squat_To_A_Bench', 'pie', { col: 2, cad: 1, rod: 1 }),
  e('Smith_Machine_Squat', 'pie', { col: 2, cad: 2, rod: 2 }),
  e('Dumbbell_Lunges', 'pie', { cad: 1, rod: 2 }),
  e('Dumbbell_Squat_To_A_Bench', 'pie', { cad: 1, rod: 1 }),
  e('Hip_Flexion_with_Band', 'pie', { cad: 1 }),

  /* ---------- glúteos ---------- */
  e('Butt_Lift_Bridge', 'sup', { cad: 1 }),
  e('Single_Leg_Glute_Bridge', 'sup', { cad: 1 }),
  e('Glute_Kickback', 'cuatro', { mun: 1 }),
  e('Pull_Through', 'pie', { cad: 1 }),
  e('Hip_Extension_with_Bands', 'pie'),
  e('Step-up_with_Knee_Raise', 'pie', { cad: 1, rod: 1 }),
  e('One-Legged_Cable_Kickback', 'pie'),
  e('Leg_Lift', 'lat'),

  /* ---------- isquios ---------- */
  e('Lying_Leg_Curls', 'pron', { rod: 1 }),
  e('Seated_Leg_Curl', 'sent', { rod: 1 }),
  e('Standing_Leg_Curl', 'pie', { rod: 1 }),
  e('Ball_Leg_Curl', 'sup', { rod: 1 }),
  e('Stiff-Legged_Dumbbell_Deadlift', 'pie', { col: 2, cad: 1 }),
  e('Front_Leg_Raises', 'pie'),

  /* ---------- gemelos ---------- */
  e('Standing_Calf_Raises', 'pie'),
  e('Standing_Barbell_Calf_Raise', 'pie', { col: 1 }),
  e('Standing_Dumbbell_Calf_Raise', 'pie'),
  e('Seated_Calf_Raise', 'sent'),
  e('Barbell_Seated_Calf_Raise', 'sent', { col: 1 }),
  e('Dumbbell_Seated_One-Leg_Calf_Raise', 'sent'),
  e('Smith_Machine_Calf_Raise', 'pie', { col: 1 }),
  e('Calf_Raises_-_With_Bands', 'pie'),

  /* ---------- pecho ---------- */
  e('Barbell_Bench_Press_-_Medium_Grip', 'sup', { homb: 1 }),
  e('Incline_Push-Up', 'pie', { mun: 1 }),
  e('Pushups', 'pron', { mun: 1, abd: 1, homb: 1 }),
  e('Dumbbell_Flyes', 'sup', { homb: 1 }),
  e('Incline_Dumbbell_Flyes', 'sent'),
  e('Decline_Dumbbell_Flyes', 'sup', { homb: 1 }),
  e('Cable_Crossover', 'pie'),
  e('Low_Cable_Crossover', 'pie'),
  e('Flat_Bench_Cable_Flyes', 'sup'),
  e('One-Arm_Flat_Bench_Dumbbell_Flye', 'sup', { homb: 1 }),

  /* ---------- dorsales ---------- */
  e('Wide-Grip_Lat_Pulldown', 'sent', { oh: 1 }),
  e('One_Arm_Lat_Pulldown', 'sent', { oh: 1 }),
  e('Close-Grip_Front_Lat_Pulldown', 'sent', { oh: 1 }),
  e('Straight-Arm_Pulldown', 'pie'),
  e('Rope_Straight-Arm_Pulldown', 'pie'),

  /* ---------- espalda media ---------- */
  e('One-Arm_Dumbbell_Row', 'pie', { col: 1 }),
  e('Seated_Cable_Rows', 'sent'),
  e('Bent_Over_Barbell_Row', 'pie', { col: 2 }),
  e('Smith_Machine_Bent_Over_Row', 'pie', { col: 2 }),
  e('Leverage_High_Row', 'sent'),
  e('T-Bar_Row_with_Handle', 'pie', { col: 2 }),
  e('Two-Arm_Kettlebell_Row', 'pie', { col: 1 }),
  e('Straight_Bar_Bench_Mid_Rows', 'sent'),
  e('Middle_Back_Shrug', 'pie'),

  /* ---------- hombros ---------- */
  e('Dumbbell_Shoulder_Press', 'sent', { oh: 1 }),
  e('Reverse_Flyes', 'pie', { col: 1 }),
  e('Cable_Rear_Delt_Fly', 'pie'),
  e('Reverse_Machine_Flyes', 'sent'),
  e('Back_Flyes_-_With_Bands', 'pie'),
  e('Alternating_Deltoid_Raise', 'pie'),
  e('Standing_Low-Pulley_Deltoid_Raise', 'pie'),
  e('Dumbbell_Raise', 'pie'),

  /* ---------- bíceps ---------- */
  e('Barbell_Curl', 'pie'),
  e('Dumbbell_Bicep_Curl', 'pie'),
  e('Dumbbell_Alternate_Bicep_Curl', 'pie'),
  e('Concentration_Curls', 'sent'),
  e('Standing_Concentration_Curl', 'pie'),
  e('Close-Grip_EZ_Bar_Curl', 'pie'),
  e('Spider_Curl', 'sent'),
  e('Alternate_Incline_Dumbbell_Curl', 'sent'),

  /* ---------- tríceps ---------- */
  e('Triceps_Pushdown', 'pie'),
  e('Cable_One_Arm_Tricep_Extension', 'pie'),
  e('Low_Cable_Triceps_Extension', 'pie'),
  e('Standing_Dumbbell_Triceps_Extension', 'pie', { oh: 1 }),
  e('Standing_One-Arm_Dumbbell_Triceps_Extension', 'pie', { oh: 1 }),
  e('Decline_Dumbbell_Triceps_Extension', 'sup'),
  e('Bench_Dips', 'sent', { mun: 1, homb: 1 }),
  e('Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension', 'pie', { col: 1 }),

  /* ---------- abdomen ---------- */
  e('3_4_Sit-Up', 'sup', { abd: 1 }),
  e('Crunches', 'sup', { abd: 1 }),
  e('Tuck_Crunch', 'sup', { abd: 1 }),
  e('Cross-Body_Crunch', 'sup', { abd: 1 }),
  e('Dead_Bug', 'sup', { abd: 1 }),
  e('Air_Bike', 'sup', { abd: 1 }),
  e('Cable_Crunch', 'cuatro', { abd: 1 }),
  e('Exercise_Ball_Crunch', 'sup', { abd: 1 }),
  e('Bent-Knee_Hip_Raise', 'sup', { abd: 1 }),
  e('Plank', 'pron', { mun: 1, abd: 1, iso: 1 }),
]

/* ---------- cómo lee cada restricción estas etiquetas ---------- */

export const FILTROS = {
  cadera: (x) => x.cad === 0 && x.imp === 0,
  rodilla: (x) => x.rod <= 1 && x.imp === 0,
  hombro: (x) => x.oh === 0 && x.homb === 0,
  espalda: (x) => x.col === 0,
  muneca: (x) => x.mun === 0,
  embarazo: (x) => x.pos !== 'sup' && x.pos !== 'pron' && x.abd === 0 && x.imp === 0 && x.col === 0,
  tension: (x) => x.iso === 0 && x.oh === 0,
  impacto: (x) => x.imp === 0,
  suelo: (x) => x.pos === 'pie' || x.pos === 'sent',
}

export const POR_ID = Object.fromEntries(NUCLEO.map((x) => [x.id, x]))
