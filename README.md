# CalculaTuNota

Calculadora de notas universitarias en escala 0.00 – 5.00 (se aprueba con 2.95).

👉 **Úsala aquí:** https://emilyb0.github.io/CalculaTuNota/

## Qué hace

- Materias con sus créditos.
- Evaluaciones con porcentaje y nota; la nota puede quedar vacía si aún no la tienes.
- Nota acumulada (lo obtenido hasta ahora), porcentaje evaluado y lo que necesitas en lo que falta para llegar a 2.96.
- Simulador: "si saco X en lo que falta, ¿con cuánto cierro?".
- Resumen del semestre con el promedio ponderado por créditos y control de créditos inscritos.
- Sincronización entre dispositivos con tu cuenta de Google.

## Cómo se usa

1. Toca **+ Agregar materia** y ponle nombre y créditos.
2. Agrega sus evaluaciones con porcentaje y nota (sirve punto o coma: `3,5` o `3.5`).
3. Mira cuánto necesitas en lo que falta; todo se calcula mientras escribes.
4. Opcional: toca **Sincronizar** para ver tus datos en el celular y el PC.

## Importante

- Sin iniciar sesión, los datos quedan solo en ese navegador. Usa **Exportar** para tener un respaldo.
- Con sesión iniciada, cada cuenta solo puede ver sus propios datos.
- En iPhone, si no se abre la ventana de Google, permite las ventanas emergentes en Safari.

## Técnico

- Un solo `index.html` con HTML, CSS y JavaScript puro; Firebase (Google + Firestore) para la sincronización.
- Pruebas de los cálculos: `node pruebas.js`.
