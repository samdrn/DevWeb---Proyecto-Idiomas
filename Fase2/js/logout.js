import { auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Cerrar sesión
const userMenu = document.getElementById('userMenu');
const userIcon = document.getElementById('userIcon');
const userDropdown = document.getElementById('userDropdown');
const userEmailSpan = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const loginMenuItem = document.getElementById('loginMenuItem');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userMenu.style.display = 'inline-block';

        if (loginMenuItem) loginMenuItem.style.display = 'none';
        userEmailSpan.textContent = user.email;
    } else {
        userMenu.style.display = 'none';

        if (loginMenuItem) loginMenuItem.style.display = 'inline-block';
    }
});

userIcon.addEventListener('click', () => {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
});

logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = './index.html';
});