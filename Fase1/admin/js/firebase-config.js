// ============================================
// 🔥 CONFIGURACIÓN DE FIREBASE
// ============================================
// Este archivo conecta tu HTML con Firebase
// Solo necesitas configurarlo UNA VEZ

// 1️⃣ Importar las funciones de Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 2️⃣ Tu configuración de Firebase (obtenida desde Firebase Console) //HAY QUE DESDE LA API A MEASUREMENT PERO HASTA QUE ALGUIEN CREE EL FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAVU-3qRRT0bZLyNAa0zwFZKsP0EVyTk2w",
    authDomain: "fir-b6e20.firebaseapp.com",
    projectId: "fir-b6e20",
    storageBucket: "fir-b6e20.firebasestorage.app",
    messagingSenderId: "311563666369",
    appId: "1:311563666369:web:6ce1128b5293cbc7056540",
    measurementId: "G-RBF8D401DS"
};

// 3️⃣ Inicializar Firebase con tu configuración
const app = initializeApp(firebaseConfig);

// 4️⃣ Obtener servicios de Firebase
const analytics = getAnalytics(app); // Para estadísticas (opcional)
const db = getFirestore(app); // Para la base de datos Firestore

// 5️⃣ Exportar para usar en otros archivos JavaScript
export { app, analytics, db };
