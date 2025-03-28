/* script.js */

// ----------------------------
// Configuración de Firebase
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCFd1cvTI2Upd3zpEETxvzp7fRTKVdeqTQ",
  authDomain: "dardos-a95b2.firebaseapp.com",
  projectId: "dardos-a95b2",
  storageBucket: "dardos-a95b2.firebasestorage.app",
  messagingSenderId: "850308611572",
  appId: "1:850308611572:web:d8393cdc17f5b6fb7e8da1"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Referencia a la colección "modulos"
const modulosRef = db.collection("modulos");

// ----------------------------
// Variables y Elementos DOM
// ----------------------------
const iniciarSeccion = document.getElementById("iniciarSeccion");
const nombreJugadorInput = document.getElementById("nombreJugador");
const btnIniciar = document.getElementById("btnIniciar");

const juegoSeccion = document.getElementById("juegoSeccion");
const puntajeActualSpan = document.getElementById("puntajeActual");
const dardosRestantesSpan = document.getElementById("dardosRestantes");
const btnFinalizar = document.getElementById("btnFinalizar");
const dartboardCanvas = document.getElementById("dartboard");
const ctx = dartboardCanvas.getContext("2d");

const resultadosList = document.getElementById("resultados");

let jugadorActual = "";
let puntajeActual = 0;
let dardosRestantes = 5;

// Parámetros del dartboard (se actualizarán dinámicamente)
let boardCenter = { x: dartboardCanvas.width / 2, y: dartboardCanvas.height / 2 };
let boardRadius = dartboardCanvas.width / 2;
let bullseyeRadius = boardRadius * 0.15;   // 15% del radio: 50 puntos
let innerRingRadius = boardRadius * 0.35;    // 35%: 25 puntos
let outerRingRadius = boardRadius * 0.60;    // 60%: 10 puntos

// ----------------------------
// Funciones del Juego
// ----------------------------

// Actualiza dimensiones del canvas y parámetros del dartboard
function updateDimensions() {
  // Usamos el ancho del canvas desde su estilo (offsetWidth) para que se adapte al contenedor
  const canvasSize = dartboardCanvas.offsetWidth;
  dartboardCanvas.width = canvasSize;
  dartboardCanvas.height = canvasSize;

  boardCenter = { x: canvasSize / 2, y: canvasSize / 2 };
  boardRadius = canvasSize / 2;
  bullseyeRadius = boardRadius * 0.15;
  innerRingRadius = boardRadius * 0.35;
  outerRingRadius = boardRadius * 0.60;

  dibujarDiana();
}

// Dibuja la diana con círculos y colores
function dibujarDiana() {
  // Limpiar canvas
  ctx.clearRect(0, 0, dartboardCanvas.width, dartboardCanvas.height);

  // Círculo exterior
  ctx.beginPath();
  ctx.arc(boardCenter.x, boardCenter.y, boardRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.strokeStyle = "#ccc";
  ctx.stroke();

  // Círculo de outer ring
  ctx.beginPath();
  ctx.arc(boardCenter.x, boardCenter.y, outerRingRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#f8f8f8";
  ctx.fill();
  ctx.stroke();

  // Círculo de inner ring
  ctx.beginPath();
  ctx.arc(boardCenter.x, boardCenter.y, innerRingRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ddd";
  ctx.fill();
  ctx.stroke();

  // Bullseye
  ctx.beginPath();
  ctx.arc(boardCenter.x, boardCenter.y, bullseyeRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4d4d";
  ctx.fill();
  ctx.stroke();
}

// Calcula el puntaje según la distancia desde el centro
function calcularPuntaje(x, y) {
  const dx = x - boardCenter.x;
  const dy = y - boardCenter.y;
  const distancia = Math.sqrt(dx * dx + dy * dy);

  if (distancia <= bullseyeRadius) {
    return 50;
  } else if (distancia <= innerRingRadius) {
    return 25;
  } else if (distancia <= outerRingRadius) {
    return 10;
  } else {
    return 0;
  }
}

// Dibuja el "dardo" lanzado (un pequeño círculo)
function dibujarDardo(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
}

// Reinicia el juego (excepto los resultados guardados)
function reiniciarJuego() {
  puntajeActual = 0;
  dardosRestantes = 5;
  puntajeActualSpan.textContent = puntajeActual;
  dardosRestantesSpan.textContent = dardosRestantes;
  dibujarDiana();
}

// ----------------------------
// Eventos del Juego
// ----------------------------

// Iniciar juego: valida nombre y muestra la sección de juego
btnIniciar.addEventListener("click", () => {
  const nombre = nombreJugadorInput.value.trim();
  if (nombre === "") {
    alert("Por favor, ingresa tu nombre para iniciar el juego.");
    return;
  }
  jugadorActual = nombre;
  iniciarSeccion.classList.add("hidden");
  juegoSeccion.classList.remove("hidden");
  reiniciarJuego();
});

// Evento para detectar clics en el canvas (lanzamiento de dardo)
dartboardCanvas.addEventListener("click", (e) => {
  if (dardosRestantes <= 0) return; // No se permiten más lanzamientos

  // Obtener coordenadas relativas al canvas
  const rect = dartboardCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Desplazamiento aleatorio en el eje X (entre 0 y 10 píxeles)
  const offsetX = Math.floor(Math.random() * 11); // 0 a 10 inclusive
  // Desplazamiento aleatorio en el eje Y (entre 10 y 200 píxeles)
  const offsetY = Math.floor(Math.random() * (200 - 10 + 1)) + 10;

  const xAjustado = x + offsetX;
  const yAjustado = y + offsetY;

  // Calcular puntaje del lanzamiento usando la posición ajustada
  const puntajeLanzado = calcularPuntaje(xAjustado, yAjustado);
  puntajeActual += puntajeLanzado;
  dardosRestantes--;
  puntajeActualSpan.textContent = puntajeActual;
  dardosRestantesSpan.textContent = dardosRestantes;

  // Dibujar el dardo sobre la diana en la posición ajustada
  dibujarDardo(xAjustado, yAjustado);
});

// Finalizar juego: guardar resultado en Firebase, reiniciar el juego y mostrar la pantalla inicial para el siguiente jugador
btnFinalizar.addEventListener("click", () => {
  if (jugadorActual === "") return;

  modulosRef.add({
    nombre: jugadorActual,
    puntaje: puntajeActual
  })
  .then(() => {
    alert(`Juego finalizado. ${jugadorActual} obtuvo ${puntajeActual} puntos.`);
    // Reiniciar la interfaz para el próximo jugador:
    jugadorActual = "";
    nombreJugadorInput.value = "";
    reiniciarJuego();
    juegoSeccion.classList.add("hidden");
    iniciarSeccion.classList.remove("hidden");
  })
  .catch((error) => {
    console.error("Error al guardar el resultado:", error);
  });
});

// ----------------------------
// CRUD: Mostrar, Editar y Eliminar Resultados
// ----------------------------

// Renderiza cada registro de la colección
function renderModulo(doc) {
  let li = document.createElement("li");
  li.setAttribute("data-id", doc.id);
  li.innerHTML = `
    <strong>${doc.data().nombre}</strong> - Puntaje: ${doc.data().puntaje}
    <div class="actions">
      <button class="edit">Editar</button>
      <button class="delete">Eliminar</button>
    </div>
  `;

  // Botón Eliminar
  li.querySelector(".delete").addEventListener("click", () => {
    let id = li.getAttribute("data-id");
    modulosRef.doc(id).delete();
  });

  // Botón Editar: permite actualizar nombre y puntaje
  li.querySelector(".edit").addEventListener("click", () => {
    let id = li.getAttribute("data-id");
    let nuevoNombre = prompt("Nuevo nombre:", doc.data().nombre);
    let nuevoPuntaje = prompt("Nuevo puntaje:", doc.data().puntaje);
    if (nuevoNombre !== null && nuevoPuntaje !== null) {
      modulosRef.doc(id).update({
        nombre: nuevoNombre,
        puntaje: parseInt(nuevoPuntaje)
      });
    }
  });

  resultadosList.appendChild(li);
}

// Lectura en tiempo real de la colección "modulos"
// Se ordenan los resultados por puntaje descendente
modulosRef.orderBy("puntaje", "desc").onSnapshot(snapshot => {
  resultadosList.innerHTML = "";
  snapshot.forEach(doc => {
    renderModulo(doc);
  });
});

// ----------------------------
// Inicialización y Responsividad
// ----------------------------

// Llamar a updateDimensions al cargar la página y en cada redimensionamiento
window.addEventListener("load", updateDimensions);
window.addEventListener("resize", updateDimensions);
