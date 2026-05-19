import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your exact Firebase configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyBPNW19YPRkhzpiNpmTYuVGuXvojUjd43Y",
  authDomain: "arpg-build-tracker.firebaseapp.com",
  projectId: "arpg-build-tracker",
  storageBucket: "arpg-build-tracker.firebasestorage.app",
  messagingSenderId: "301830886645",
  appId: "1:301830886645:web:cc30ae905856a7ad38a1bc",
  measurementId: "G-8H70D8WX0H"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const mainTracker = document.getElementById('main-tracker');
const userDisplay = document.getElementById('user-display');
const authError = document.getElementById('auth-error');
const buildsContainer = document.getElementById('builds-container');

let currentUser = null;
let unsubscribeBuilds = null;

// --- AUTHENTICATION LISTENERS ---

// Sign Up
document.getElementById('btn-signup').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    authError.textContent = "";
    
    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => { authError.textContent = error.message; });
});

// Login
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    authError.textContent = "";

    signInWithEmailAndPassword(auth, email, password)
        .catch(error => { authError.textContent = error.message; });
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// Track Auth State (User logs in or logs out)
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userDisplay.textContent = `Logged in as: ${user.email}`;
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');
        mainTracker.classList.remove('hidden');
        loadUserBuilds(user.uid);
    } else {
        currentUser = null;
        userDisplay.textContent = "";
        loggedOutView.classList.remove('hidden');
        loggedInView.classList.add('hidden');
        mainTracker.classList.add('hidden');
        buildsContainer.innerHTML = "";
        if (unsubscribeBuilds) unsubscribeBuilds();
    }
});

// --- DATA LOGIC (FIRESTORE) ---

// Save a new build linked to user's UID
document.getElementById('btn-import').addEventListener('click', async () => {
    const urlInput = document.getElementById('build-url');
    const url = urlInput.value.trim();

    if (!url || !currentUser) return;

    try {
        // Simple automatic parsing logic for title/class based on URL keywords
        let buildClass = "General";
        if (url.toLowerCase().includes("necromancer")) buildClass = "Necromancer";
        if (url.toLowerCase().includes("sorcerer") || url.toLowerCase().includes("mage")) buildClass = "Sorcerer";
        if (url.toLowerCase().includes("rogue")) buildClass = "Rogue";
        if (url.toLowerCase().includes("barbarian") || url.toLowerCase().includes("warrior")) buildClass = "Barbarian";

        await addDoc(collection(db, "builds"), {
            userId: currentUser.uid,
            url: url,
            className: buildClass,
            title: `${buildClass} Build (${new Date().toLocaleDateString()})`,
            createdAt: new Date().getTime()
        });

        urlInput.value = ""; // Clear input field
    } catch (error) {
        console.error("Error saving build: ", error);
    }
});

// Load only the builds belonging to this user
function loadUserBuilds(uid) {
    const q = query(collection(db, "builds"), where("userId", "==", uid));
    
    // Live stream database changes
    unsubscribeBuilds = onSnapshot(q, (snapshot) => {
        buildsContainer.innerHTML = "";
        
        if (snapshot.empty) {
            buildsContainer.innerHTML = `<p style="grid-column: 1/-1; color: #a0aec0;">No builds saved yet. Import one above!</p>`;
            return;
        }

        snapshot.forEach((doc) => {
            const build = doc.data();
            const card = document.createElement('div');
            card.className = 'card build-card';
            card.innerHTML = `
                <h4>${build.title}</h4>
                <p>Class: <strong>${build.className}</strong></p>
                <a href="${build.url}" target="_blank" class="btn" style="display:inline-block; text-align:center; text-decoration:none; margin-top:10px;">Open Build Planner</a>
            `;
            buildsContainer.appendChild(card);
        });
    });
}