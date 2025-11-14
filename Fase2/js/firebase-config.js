// ============================================
// Firebase Config V9 - Proyecto: DevWeb---Proyecto-Idiomas
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhcpM30T-YCI3xmgRaZ0VgU5IPp1JXjok",
  authDomain: "devweb---proyecto-idiomas.firebaseapp.com",
  projectId: "devweb---proyecto-idiomas",
  storageBucket: "devweb---proyecto-idiomas.firebasestorage.app",
  messagingSenderId: "609833533415",
  appId: "1:609833533415:web:dcccba554d80d68d70c742"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

console.log("🔥 Firebase conectado con DEVWEB-PROYECTO-IDIOMAS");