// Pruebas de la lógica de cálculo de CalculaTuNota.
// Uso: node pruebas.js   (no hace falta para publicar la página)
// Toma el bloque <script id="nucleo"> de index.html, así se prueba el mismo código que usa la app.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const codigo = html.match(/<script id="nucleo">([\s\S]*?)<\/script>/)[1];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(codigo, ctx);
const N = ctx.Nota;

let ok = 0, fallos = 0;
function igual(descripcion, obtenido, esperado) {
  const pasa = Object.is(obtenido, esperado) || obtenido === esperado;
  pasa ? ok++ : fallos++;
  console.log(`  ${pasa ? '✔' : '✘'} ${descripcion}: ${JSON.stringify(obtenido)}${pasa ? '' : `  (esperado ${JSON.stringify(esperado)})`}`);
}
function caso(titulo, fn) { console.log(`\n${titulo}`); fn(); }
const ev = (porcentaje, nota) => ({ porcentaje, nota: nota === undefined ? null : nota });
const f2 = (x) => N.formatear(x, 2);

caso('1) Caso dado: P1 30% 3.5 · P2 30% 2.8 · falta 40% · meta 3.0', () => {
  const c = N.calcularMateria([ev(30, 3.5), ev(30, 2.8), ev(40)], 3);
  igual('Acumulada', f2(c.acumulada), '1.89');
  igual('% evaluado', c.porcentajeEvaluado, 60);
  igual('% que falta', c.porcentajeRestante, 40);
  igual('Nota necesaria', f2(c.necesaria), '2.78');
  igual('Estado', c.estado, 'posible');
  igual('Color (≤ 3.0 = verde)', N.colorNecesaria(c.necesaria), 'verde');
  igual('Suma 100%', c.sumaCorrecta, true);
});

caso('2) Meta que ya no se alcanza: mismo caso con meta 4.5', () => {
  const c = N.calcularMateria([ev(30, 3.5), ev(30, 2.8), ev(40)], 4.5);
  igual('Nota necesaria', f2(c.necesaria), '6.53');
  igual('Estado', c.estado, 'inalcanzable');
  igual('Nota máxima posible', f2(c.notaMaxima), '3.89');
});

caso('2b) Inalcanzable incluso para aprobar: P1 50% 1.0 · P2 30% 1.5 · meta 3.0', () => {
  const c = N.calcularMateria([ev(50, 1.0), ev(30, 1.5), ev(20)], 3);
  igual('Acumulada', f2(c.acumulada), '0.95');
  igual('Nota necesaria', f2(c.necesaria), '10.25');
  igual('Estado', c.estado, 'inalcanzable');
  igual('Nota máxima posible', f2(c.notaMaxima), '1.95');
});

caso('3) Meta ya asegurada: P1 50% 5.0 · P2 30% 4.5 · falta 20% · meta 3.0', () => {
  const c = N.calcularMateria([ev(50, 5), ev(30, 4.5), ev(20)], 3);
  igual('Acumulada', f2(c.acumulada), '3.85');
  igual('Nota necesaria', f2(c.necesaria), '-4.25');
  igual('Estado', c.estado, 'asegurada');
});

caso('3b) Asegurada justo en el límite (necesaria = 0): P1 40% 4.5 · P2 30% 4.0', () => {
  const c = N.calcularMateria([ev(40, 4.5), ev(30, 4.0), ev(30)], 3);
  igual('Acumulada', f2(c.acumulada), '3.00');
  igual('Nota necesaria', c.necesaria, 0);
  igual('Estado', c.estado, 'asegurada');
});

caso('4) Redondeo sin errores de punto flotante', () => {
  igual('2.775 → 2 decimales', N.formatear(2.775, 2), '2.78');
  igual('1.005 → 2 decimales', N.formatear(1.005, 2), '1.01');
  igual('(3 − 1.89) / 0.4 → 2 decimales', N.formatear((3 - 1.89) / 0.4, 2), '2.78');
  igual('3 → dos decimales', N.formatear(3, 2), '3.00');
  igual('3.0199 → dos decimales', N.formatear(3.0199, 2), '3.02');
  igual('0.1 + 0.2 → 2 decimales', N.formatear(0.1 + 0.2, 2), '0.30');
});

caso('5) Lectura de números con punto o coma y validación', () => {
  igual('"3,5"', N.parsearNumero('3,5'), 3.5);
  igual('"3.5"', N.parsearNumero('3.5'), 3.5);
  igual('" 4 "', N.parsearNumero(' 4 '), 4);
  igual('"" (vacío)', N.parsearNumero(''), null);
  igual('"abc" es inválido', Number.isNaN(N.parsearNumero('abc')), true);
  igual('"3,5,1" es inválido', Number.isNaN(N.parsearNumero('3,5,1')), true);
  igual('Nota 5.1 válida', N.esNotaValida(5.1), false);
  igual('Nota -0.5 válida', N.esNotaValida(-0.5), false);
  igual('Nota 0 válida', N.esNotaValida(0), true);
  igual('Porcentaje 101 válido', N.esPorcentajeValido(101), false);
  igual('Porcentaje 100 válido', N.esPorcentajeValido(100), true);
});

caso('6) Colores según la nota necesaria', () => {
  igual('3.00', N.colorNecesaria(3), 'verde');
  igual('3.01', N.colorNecesaria(3.01), 'amarillo');
  igual('4.00', N.colorNecesaria(4), 'amarillo');
  igual('4.01', N.colorNecesaria(4.01), 'rojo');
});

caso('7) Simulador: caso dado sacando X en el 40% que falta', () => {
  igual('Saco 3.5 → cierro con', f2(N.notaFinalSimulada(1.89, 40, 3.5)), '3.29');
  igual('Saco 2.78 → cierro con', f2(N.notaFinalSimulada(1.89, 40, 2.78)), '3.00');
  igual('Saco 2.65 → cierro con', f2(N.notaFinalSimulada(1.89, 40, 2.65)), '2.95');
  igual('Saco 2.65 → aprueba (2.95)', N.aprueba(N.notaFinalSimulada(1.89, 40, 2.65)), true);
  igual('Saco 2.6 → aprueba (2.93)', N.aprueba(N.notaFinalSimulada(1.89, 40, 2.6)), false);
});

caso('7b) Se aprueba con 2.95 · color de la nota de la materia', () => {
  igual('2.94 aprueba', N.aprueba(2.94), false);
  igual('2.95 aprueba', N.aprueba(2.95), true);
  igual('2.945 (se muestra 2.95) aprueba', N.aprueba(2.945), true);
  igual('2.94 → color', N.colorNotaFinal(2.94), 'rojo');
  igual('2.95 → color', N.colorNotaFinal(2.95), 'amarillo');
  igual('2.99 → color', N.colorNotaFinal(2.99), 'amarillo');
  igual('3.00 → color', N.colorNotaFinal(3), 'verde');
  igual('4.50 → color', N.colorNotaFinal(4.5), 'verde');
});

caso('8) Porcentajes que no suman 100%', () => {
  const a = N.calcularMateria([ev(30, 3.5), ev(30, 2.8)], 3);
  igual('Suman 60% → advertencia', a.sumaCorrecta, false);
  igual('Total registrado', a.porcentajeTotal, 60);
  const b = N.calcularMateria([ev(60, 4), ev(50)], 3);
  igual('Suman 110% → advertencia', b.sumaCorrecta, false);
});

caso('9) Materia terminada', () => {
  const c = N.calcularMateria([ev(30, 3.5), ev(30, 2.8), ev(40, 3.2)], 3);
  igual('Nota final', f2(c.acumulada), '3.17');
  igual('Completa', c.completa, true);
  igual('Estado', c.estado, 'meta-cumplida');
  igual('Necesaria (no aplica)', c.necesaria, null);
});

caso('10) Resumen del semestre: nota actual = lo obtenido hasta ahora, ponderado por créditos', () => {
  const r = N.resumenSemestre([
    { nombre: 'Cálculo', creditos: 4, calculo: N.calcularMateria([ev(30, 3.5), ev(30, 2.8), ev(40)]) },
    { nombre: 'Física', creditos: 3, calculo: N.calcularMateria([ev(50, 4), ev(50, 4.4)]) },
    { nombre: 'Ética', creditos: 2, calculo: N.calcularMateria([ev(100)]) }
  ]);
  igual('Cálculo actual (acumulada)', f2(r.filas[0].actual), '1.89');
  igual('Física actual (final)', f2(r.filas[1].actual), '4.20');
  igual('Ética sin notas', f2(r.filas[2].actual), '0.00');
  igual('Promedio (1.89×4 + 4.20×3 + 0×2) / 9', f2(r.promedio), '2.24');
  igual('Créditos', r.creditosTotales, 9);
});

caso('10b) Meta fija 2.96 y color de la acumulada', () => {
  const c = N.calcularMateria([ev(30, 3.5), ev(30, 2.8), ev(40)]);
  igual('Meta usada por defecto', c.meta, 2.96);
  igual('Necesaria para 2.96: (2.96 − 1.89) / 0.40', f2(c.necesaria), '2.68');
  const e = N.calcularMateria([ev(15, 5), ev(10, 5), ev(20, 3.8), ev(20, 2.7), ev(25, 1.5), ev(10)]);
  igual('Caso de la captura: acumulada', f2(e.acumulada), '2.93');
  igual('Acumulada 2.93 → rojo', N.colorNotaFinal(e.acumulada), 'rojo');
});

caso('11) Créditos inscritos del semestre vs. créditos de las materias', () => {
  igual('18 inscritos, 18 en materias', N.verificarCreditos(18, 18).estado, 'ok');
  const f = N.verificarCreditos(18, 14);
  igual('18 inscritos, 14 en materias', f.estado + ' ' + f.diferencia, 'faltan 4');
  const s = N.verificarCreditos(18, 20);
  igual('18 inscritos, 20 en materias', s.estado + ' ' + s.diferencia, 'sobran 2');
  igual('Sin dato de inscritos', N.verificarCreditos(null, 14).estado, 'sin-dato');
});

console.log(`\nResultado: ${ok} pruebas correctas, ${fallos} fallidas.`);
process.exit(fallos ? 1 : 0);
