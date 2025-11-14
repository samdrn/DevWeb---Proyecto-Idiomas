import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import {
    doc,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Registrarse
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailReg').value;
    const password = document.getElementById('passwordReg').value;

    console.log("📌 Email recibido:", email);
    console.log("📌 Password recibido:", password);

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
            email,
            rol: "estudiante"
        });

        console.log('Registro exitoso!', cred.user.uid);
        window.location.href = "../index.html";

    } catch (err) {
        alert('Error en el registro: ' + err.message);
    }
});

// Iniciar sesión
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'usuarios', cred.user.uid));

        if (userDoc.exists()) {
            const rol = userDoc.data().rol;

            if (rol === 'admin') {
                window.location.href = '../Fase1/admin/admin.html';

            } else if (rol === 'profesor') {
                window.location.href = '../Fase1/profesor/profesor.html';

            } else {
                window.location.href = '../index.html';
            }
        } else {
            alert('No se encontró el rol asignado.');
        }

    } catch (err) {
        alert('Error al iniciar sesión: ' + err.message);
    }
});