import { db } from "./firebase-config.js"
import {
    collection, getDocs, addDoc, query, doc, setDoc,
    where, deleteDoc, updateDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"

const cmbIdioma = document.getElementById("idCmbIdioma");
const cmbNivel = document.getElementById("idCmbNivel");
const cmbProfesor = document.getElementById("idCmbProfesor");
const cmbEstudiantes = document.getElementById("idCmbEstudiantes");

const idBtnAgregarEstudiante = document.getElementById("idBtnAgregarEstudiante");
const idListaEstudiantes = document.getElementById("idListaEstudiantes");

const idBtnNuevoIdioma = document.getElementById("idBtnNuevoIdioma");
const idBtnNuevoNivel = document.getElementById("idBtnNuevoNivel");
const idBtnNuevoEstudiante = document.getElementById("idBtnNuevoEstudiante");
const idBtnNuevoProfesor = document.getElementById("idBtnNuevoProfesor");
const idBtnRegistrarGrupo = document.getElementById("idBtnRegistrarGrupo");

const tiempoInicioEl = document.getElementById("idTiempoInicio");
const tiempoFinEl = document.getElementById("idTiempoFinalizacion");

const idiomasTableRoot = document.getElementById("idiomasTable") || null;
const nivelesTableRoot = document.getElementById("nivelesTable") || null;
const gruposListRoot = document.getElementById("gruposList") || null;

let estudiantesSeleccionados = [];

async function cargarIdiomas() {
    const snap = await getDocs(collection(db, "idiomas"));
    cmbIdioma.innerHTML = `<option value="0">Seleccione un idioma</option>`;
    snap.forEach(d => {
        cmbIdioma.innerHTML += `<option value="${d.id}">${d.data().nombre}</option>`;
    });
    renderIdiomasTable(snap);
}

async function cargarNivelesPorIdioma(idiomaId) {
    cmbNivel.innerHTML = `<option value="0">Seleccione un nivel</option>`;
    if (!idiomaId || idiomaId === "0") return;
    const q = query(collection(db, "niveles"), where("idiomaId", "==", idiomaId));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const data = d.data();
        cmbNivel.innerHTML += `<option value="${d.id}" data-precio="${data.precio ?? ''}">
      ${data.nombre} ${data.precio != null ? ` - $${data.precio}` : ''}</option>`;
    });
    renderNivelesTable(snap, idiomaId);
}

async function cargarProfesores() {
    const snap = await getDocs(collection(db, "usuarios"));
    cmbProfesor.innerHTML = `<option value="0">Seleccione un profesor</option>`;
    snap.forEach(d => {
        if (d.data().rol === "profesor") {
            cmbProfesor.innerHTML += `<option value="${d.id}">${d.data().email}</option>`
        }
    });
}

async function cargarEstudiantes() {
    const snap = await getDocs(collection(db, "usuarios"));
    cmbEstudiantes.innerHTML = `<option value="0">Seleccione un estudiante</option>`
    snap.forEach(d => {
        if (d.data().rol === "estudiante") {
            cmbEstudiantes.innerHTML += `<option value="${d.id}">${d.data().email}</option>`
        }
    });
}

// Tablas de Render para la UI del admin
function renderIdiomasTable(snapshot) {
    if (!idiomasTableRoot) return;
    idiomasTableRoot.innerHTML = `
    <table class="table">
      <thead><tr><th>Idioma</th><th>Acciones</th></tr></thead>
      <tbody>
        ${snapshot.docs.map(d => {
          const nombre = d.data().nombre;
          return `<tr>
            <td>${nombre}</td>
            <td>
              <button data-id="${d.id}" class="btn-edit-idioma btn btn-sm btn-outline-primary">Editar</button>
              <button data-id="${d.id}" class="btn-del-idioma btn btn-sm btn-outline-danger">Eliminar</button>
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;

    idiomasTableRoot.querySelectorAll(".btn-edit-idioma").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const nuevo = prompt("Nuevo idioma:");
            if (!nuevo) return;
            await updateDoc(doc(db, "idiomas", id), {nombre: nuevo});
            await cargarIdiomas();
        });
    });

    idiomasTableRoot.querySelectorAll(".btn-del-idioma").forEach(btn => {
        btn.addEventListener("click", async() => {
            const id = btn.dataset.id;
            if (!confirm("¿ Eliminar idioma y sus relaciones?")) return;
            const q = query(collection(db, "niveles"), where("idiomaId", "==", id));
            const nivSnap = await getDocs(q);
            for (const n of nivSnap.docs) await deleteDoc(doc(db, "niveles", n.id));
            await deleteDoc(doc(db, "idiomas", id));
            await cargarIdiomas();
            await cargarNivelesPorIdioma(cmbIdioma.value);
        });
    });
}

function renderNivelesTable(snapshot, idiomaId) {
    if (!nivelesTableRoot) return;
    nivelesTableRoot.innerHTML = `
    <table class="table">
      <thead><tr><th>Nivel</th><th>Precio</th><th>Acciones</th></tr></thead>
      <tbody>
        ${snapshot.docs.map(d => {
          const data = d.data();
          return `<tr>
            <td>${data.nombre}</td>
            <td>${data.precio != null ? '$' + data.precio : 'No definido'}</td>
            <td>
              <button data-id="${d.id}" data-nombre="${data.nombre}" data-precio="${data.precio}" class="btn-edit-nivel btn btn-sm btn-outline-primary">Editar</button>
              <button data-id="${d.id}" class="btn-del-nivel btn btn-sm btn-outline-danger">Eliminar</button>
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>`;

    nivelesTableRoot.querySelectorAll(".btn-edit-nivel").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const nombreActual = btn.dataset.nombre;
            const precioActual = btn.dataset.precio;
            const nuevoNombre = prompt("Nuevo nombre nivel:", nombreActual) || nombreActual;
            let nuevoPrecio = prompt("Nuevo precio (USD):", precioActual ?? "");
            if (nuevoPrecio === null) return;
            nuevoPrecio = parseFloat(nuevoPrecio);
            if (isNaN(nuevoPrecio)) { alert("Precio invalido"); return; }
            await updateDoc(doc(db, "niveles", id), { nombre: nuevoNombre, precio: nuevoPrecio });
            await cargarNivelesPorIdioma(idiomaId);
        });
    });

    nivelesTableRoot.querySelectorAll(".btn-del-nivel").forEach(btn => {
        btn.addEventListener("click", async() => {
            const id = btn.dataset.id;
            if (!confirm("¿Eliminar este nivel?")) return;
            await deleteDoc(doc(db, "niveles", id));
            await cargarNivelesPorIdioma(idiomaId);
        });
    });
}

idBtnNuevoIdioma?.addEventListener("click", async (e) => {
    e.preventDefault();
    const nombre = prompt("Nuevo idioma:");
    if (!nombre) return;
    await addDoc(collection(db, "idiomas"), {nombre});
    await cargarIdiomas();
    alert("Idioma agregado");
});

idBtnNuevoNivel?.addEventListener("click", async (e) => {
    e.preventDefault();
    const idiomaId = cmbIdioma.value;
    if (!idiomaId || idiomaId === "0") {alert("Seleccione un idioma"); return;}
    const nombre = prompt("Nombre del nivel (ejemplo: Intermedio):");
    if (!nombre) return;
    let precio = prompt("Precio mensual en USD (ejemplo: 30):");
    if (precio === null) return;
    precio = parseFloat(precio);
    if (isNaN(precio)) {alert("Precio invalido"); return;}
    await addDoc(collection(db, "niveles"), {nombre, idiomaId, precio});
    await cargarNivelesPorIdioma(idiomaId);
    alert("Nivel agregado");
});

idBtnNuevoProfesor?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt("Correo del profesor:");
    if (!email) return;
    await addDoc(collection(db, "usuarios"), {email, rol:"profesor"});
    await cargarProfesores();
    alert("Profesor creado (registro simple).")
});

idBtnNuevoEstudiante?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt("Correo del estudiante:");
    if (!email) return;
    await addDoc(collection(db, "usuarios"), { email, rol: "estudiante" });
    await cargarEstudiantes();
    alert("Estudiante creado.");
});

idBtnAgregarEstudiante?.addEventListener("click", (e) => {
    e.preventDefault();
    const sel = cmbEstudiantes.value;
    const selText = cmbEstudiantes.options[cmbEstudiantes.selectedIndex]?.text || "";
    if (!sel || sel === "0") return alert("Seleccione un estudiante");
    if (estudiantesSeleccionados.find(s=> s.id === sel)) return alert("Estudiante ya agregado");
    estudiantesSeleccionados.push({id: sel, email: selText});
    renderListaEstudiantes();
});

function renderListaEstudiantes() {
    if (!idListaEstudiantes) return;
    if (estudiantesSeleccionados.length === 0) {
        idListaEstudiantes.innerHTML = "<li>Ninguno<li>";
        return;
    }

    idListaEstudiantes.innerHTML = estudiantesSeleccionados.map(s =>
        `<li data-id="${s.id}">${s.email} <button class="btn-remove-est btn btn-sm btn-outline-danger">Eliminar</button></li>`
    ).join("");

    idListaEstudiantes.querySelectorAll(".btn-remove-est").forEach((btn, idx) => {
        btn.addEventListener("click", (e) => {
            const li = btn.closest("li");
            const id = li.dataset.id;
            estudiantesSeleccionados = estudiantesSeleccionados.filter(s => s.id !== id);
            renderListaEstudiantes();
        });
    });
}

// Registrar grupo
idBtnRegistrarGrupo?.addEventListener("click", async (e) => {
    e.preventDefault();
    const idiomaId = cmbIdioma.value;
    const nivelId = cmbNivel.value;
    const profesorId = cmbProfesor.value;
    const inicio = tiempoInicioEl?.value;
    const fin = tiempoFinEl?.value;

    if (!idiomaId || idiomaId === "0") return alert("Seleccione un idioma");
    if (!nivelId || nivelId === "0") return alert("Seleccione un nivel");
    if (!profesorId || profesorId === "0") return alert("Seleccione un profesor");
    if (!inicio || !fin) return alert("Seleccione horario de inicio y fin");
    if (estudiantesSeleccionados.length === 0) return alert("Agregue al menos 1 estudiante");

    const grupo = {
        idiomaId,
        nivelId,
        profesorId,
        horaInicio: inicio,
        horaFin: fin,
        estudiantes: estudiantesSeleccionados.map(s => s.id),
        createdAt: new Date().toISOString()
    };
    
    try {
        await addDoc(collection(db, "grupos"), grupo);
        alert("Grupo creado correctamente");
        estudiantesSeleccionados = [];
        renderListaEstudiantes();
        listarGrupos();
    } catch (err) {
        console.error(err);
        alert("Error creando grupo: " + err.message);
    }    
});

async function listarGrupos() {
    if (!gruposListRoot) return;
    const snap = await getDocs(collection(db, "grupos"));
    if (snap.empty) {
        gruposListRoot.innerHTML = "<p>No hay grupos<p>";
        return;
    }

    gruposListRoot.innerHTML = snap.docs.map(g => {
        const d = g.data();
        return `<div class="grupo-card" data-id="${g.id}">
      <strong>Grupo:</strong> idioma(${d.idiomaId}) nivel(${d.nivelId}) profesor(${d.profesorId})<br/>
      ${d.horaInicio} - ${d.horaFin} | estudiantes: ${Array.isArray(d.estudiantes)?d.estudiantes.length:0}
      <div><button class="btn-edit-grupo btn btn-sm btn-outline-primary" data-id="${g.id}">Ver / Edit</button>
      <button class="btn-del-grupo btn btn-sm btn-outline-danger" data-id="${g.id}">Eliminar</button></div>
    </div>`;
    }).join("");

    gruposListRoot.querySelectorAll(".btn-del-grupo").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("¿Eliminar este grupo?")) return;
            await deleteDoc(doc(db, "grupos", id));
            listarGrupos();
        });
    });

    gruposListRoot.querySelectorAll(".btn-edit-grupo").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const snap = await getDocs(collection(db, "grupos"));
            const gdoc = snap.docs.find(x => x.id === id);
            
            if (!gdoc) return alert("Grupo no encontrado");
            const d = gdoc.data();
            
            alert(`Grupo ${id}\nProfesor: ${d.profesorId}\nEstudiantes: ${ (d.estudiantes || []).join(", ") }`);
        });
    });
}

async function listarUsuariosParaRol() {
    const usuariosRoot = document.getElementById("usuariosTable");
    if (!usuariosRoot) return;
    const snap = await getDocs(collection(db, "usuarios"));
    usuariosRoot.innerHTML = `
    <table class="table">
      <thead><tr><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody>
        ${snap.docs.map(u => {
          const d = u.data();
          return `<tr>
            <td>${d.email}</td>
            <td>${d.rol}</td>
            <td>
              <button data-id="${u.id}" data-rol="${d.rol}" class="btn-change-role btn btn-sm btn-outline-secondary">Cambiar rol</button>
              <button data-id="${u.id}" class="btn-del-user btn btn-sm btn-outline-danger">Eliminar</button>
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;

  usuariosRoot.querySelectorAll(".btn-change-role").forEach(btn => {
    btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const actual = btn.dataset.rol;
        const nuevo = prompt("Nuevo rol (admin/ profesor/ estudiante):", actual);
        if (!nuevo) return;
        await updateDoc(doc(db, "usuarios", id), {rol: nuevo});
        listarUsuariosParaRol();
    });
  });
}

cmbIdioma?.addEventListener("change", (e) => {
    cargarNivelesPorIdioma(e.target.value);
});

(async function init() {
    await cargarIdiomas();
    await cargarProfesores();
    await cargarEstudiantes();
    await cargarNivelesPorIdioma(cmbIdioma.value || "0");
    await listarGrupos();
    listarUsuariosParaRol();
    console.log("¡Panel de administrador listo!");
})();