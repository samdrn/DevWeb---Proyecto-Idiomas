import { auth, db } from "../js/firebase-config.js"
import {
    collection,
    getDoc,
    getDocs,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const listaGrupos = document.getElementById("idListaGruposAsignados");
const listaAlumnos = document.getElementById("idListaAlumnos");
const cardEstudiantes = document.getElementById("contenedorEstudiantesCard");

const parrafoIdioma = document.getElementById("idParrafoIdioma");
const parrafoNivel = document.getElementById("idParrafoNivel");
const parrafoInicio = document.getElementById("idParrafoHoraInicio");
const parrafoFin = document.getElementById("idParrafoHoraFinalizacion");

let gruposProfesor = [];

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "../../Fase1/login.html";
        return;
    }

    const profesorId = user.uid;

    await cargarGruposProfesor(profesorId);
});

async function cargarGruposProfesor(profesorId) {
    const q = query(collection(db, "grupos"), where("profesorId", "==", profesorId));

    const snap = await getDocs(q);

    if (snap.empty) {
        listaGrupos.innerHTML = `<li class="list-group-item">No tiene grupos asignados</li>`;
        return;
    }

    gruposProfesor = snap.docs.map(d => ({
        id: d.id, ...d.data()
    }));

    await mostrarListaGrupos();
}

async function mostrarListaGrupos() {
    listaGrupos.innerHTML = "";

    for (const grupo of gruposProfesor){
        const idiomaGrupo = await getDoc(doc(db,"idiomas", grupo.idiomaId));
        const idiomaNombre = idiomaGrupo.exists() ? idiomaGrupo.data().nombre:grupo.idiomaId;
    

    const nivelGrupo = await getDoc(doc(db,"niveles", grupo.nivelId));
    const nivelNombre = nivelGrupo.exists() ? nivelGrupo.data().nombre:grupo.nivelId;
    
    const li = document.createElement("li");
    li.classList.add("list-group-item", "grupo-item");
    li.textContent = `${idiomaNombre}-${nivelNombre}`;
    li.dataset.id = grupo.id;

    li.addEventListener("click",()=>seleccionarGrupo(grupo.id));

    listaGrupos.appendChild(li);

}}

async function seleccionarGrupo(grupoId) {
    const grupo = gruposProfesor.find(g => g.id === grupoId);
    if (!grupo) return;

    await cargarInformacionGrupo(grupo);
    await cargarEstudiantesGrupo(grupo);

    cardEstudiantes.classList.remove("d-none");
}

async function cargarInformacionGrupo(grupo) {
    const idiomaSnap = await getDoc(doc(db, "idiomas", grupo.idiomaId));
    const idiomaNombre = idiomaSnap.exists() ? idiomaSnap.data().nombre : grupo.idiomaId;

    const nivelSnap = await getDoc(doc(db, "niveles", grupo.nivelId));
    const nivelNombre = nivelSnap.exists() ? nivelSnap.data().nombre : grupo.nivelId;

    parrafoIdioma.textContent = idiomaNombre;
    parrafoNivel.textContent = nivelNombre;
    parrafoInicio.textContent = grupo.horaInicio;
    parrafoFin.textContent = grupo.horaFin; 
}

async function cargarEstudiantesGrupo(grupo) {
    listaAlumnos.innerHTML = "";

    if (!grupo.estudiantes || grupo.estudiantes.length === 0) {
        listaAlumnos.innerHTML = `<li class="list-group-item">Ninguno</li>`;
        return;
    }

    for (const estId of grupo.estudiantes) {
        const docEst = await getDoc(doc(db, "usuarios", estId));
        let email = docEst.exists() ? docEst.data().email : estId;

        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = email;

        listaAlumnos.appendChild(li);
    }
}