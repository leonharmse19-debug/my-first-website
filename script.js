// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================
// Actual Firebase project configuration for ARPG Build Tracker
const firebaseConfig = {
  apiKey: "AIzaSyBPNW19YPRkhzpiNpmTYuVGuXvojUjd43Y",
  authDomain: "arpg-build-tracker.firebaseapp.com",
  projectId: "arpg-build-tracker",
  storageBucket: "arpg-build-tracker.firebasestorage.app",
  messagingSenderId: "301830886645",
  appId: "1:301830886645:web:cc30ae905856a7ad38a1bc",
  measurementId: "G-8H70D8WX0H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================================================
// CONSTANTS & DOM ELEMENTS
// ============================================================================
const SUPPORTED_PLATFORMS = {
  d4builds: { name: 'D4Builds', regex: /d4builds\.gg/i, badge: 'platform-d4builds' },
  mobalytics: { name: 'Mobalytics', regex: /mobalytics\.gg/i, badge: 'platform-mobalytics' },
  maxroll: { name: 'Maxroll', regex: /maxroll\.gg/i, badge: 'platform-maxroll' },
};

// Auth UI Elements
const authSection = document.getElementById('auth-section');
const authFormView = document.getElementById('auth-form-view');
const authSuccessView = document.getElementById('auth-success-view');
const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
const authError = document.getElementById('auth-error');

// Build UI Elements
const buildTitleInput = document.getElementById('build-title-input');
const buildClassSelect = document.getElementById('build-class-select');
const buildLinkInput = document.getElementById('build-link-input');
const importBuildButton = document.getElementById('import-build-button');
const buildsGrid = document.getElementById('builds-grid');
const buildsCount = document.getElementById('builds-count');
const importerSection = document.getElementById('importer');

// Auth State
let currentUser = null;
let savedBuilds = [];
let unsubscribeBuilds = null;

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================
function showAuthError(message) {
  authError.textContent = message;
  setTimeout(() => {
    authError.textContent = '';
  }, 5000);
}

async function handleLogin() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    showAuthError('Please enter both email and password.');
    return;
  }

  try {
    loginButton.disabled = true;
    signupButton.disabled = true;
    await auth.signInWithEmailAndPassword(email, password);
    // Auth state listener will handle UI update
  } catch (error) {
    showAuthError(error.message || 'Login failed. Please check your credentials.');
    loginButton.disabled = false;
    signupButton.disabled = false;
  }
}

async function handleSignup() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    showAuthError('Please enter both email and password.');
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  try {
    signupButton.disabled = true;
    loginButton.disabled = true;
    await auth.createUserWithEmailAndPassword(email, password);
    // Auth state listener will handle UI update
  } catch (error) {
    showAuthError(error.message || 'Sign up failed.');
    signupButton.disabled = false;
    loginButton.disabled = false;
  }
}

async function handleLogout() {
  try {
    // Unsubscribe from builds listener
    if (unsubscribeBuilds) {
      unsubscribeBuilds();
      unsubscribeBuilds = null;
    }
    
    await auth.signOut();
    // Auth state listener will handle UI update
  } catch (error) {
    console.error('Logout error:', error);
    showAuthError('Failed to logout.');
  }
}

function updateAuthUI(user) {
  currentUser = user;

  if (user) {
    // User is logged in
    authFormView.classList.add('hidden');
    authSuccessView.classList.remove('hidden');
    userEmailSpan.textContent = user.email;
    importerSection.classList.remove('hidden');
    loginButton.disabled = false;
    signupButton.disabled = false;

    // Subscribe to real-time builds from Firestore
    subscribeToBuilds();
  } else {
    // User is logged out
    authFormView.classList.remove('hidden');
    authSuccessView.classList.add('hidden');
    importerSection.classList.add('hidden');
    authEmailInput.value = '';
    authPasswordInput.value = '';
    authError.textContent = '';
    loginButton.disabled = false;
    signupButton.disabled = false;
    
    // Unsubscribe from builds listener
    if (unsubscribeBuilds) {
      unsubscribeBuilds();
      unsubscribeBuilds = null;
    }
    
    savedBuilds = [];
    renderBuilds();
  }
}

// ============================================================================
// FIRESTORE FUNCTIONS
// ============================================================================
function subscribeToBuilds() {
  if (!currentUser) return;

  // Unsubscribe from previous listener if exists
  if (unsubscribeBuilds) {
    unsubscribeBuilds();
  }

  try {
    // Real-time listener for user's builds
    unsubscribeBuilds = db
      .collection('users')
      .doc(currentUser.uid)
      .collection('builds')
      .orderBy('addedAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          savedBuilds = [];
          snapshot.forEach((doc) => {
            savedBuilds.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          renderBuilds();
        },
        (error) => {
          console.error('Error subscribing to builds:', error);
          // Handle permission denied or other errors gracefully
          if (error.code === 'permission-denied') {
            console.warn('User does not have permission to read builds.');
          }
        }
      );
  } catch (error) {
    console.error('Error setting up builds listener:', error);
  }
}

async function saveBuildToFirestore(build) {
  if (!currentUser) {
    throw new Error('No user logged in.');
  }

  try {
    const docRef = await db
      .collection('users')
      .doc(currentUser.uid)
      .collection('builds')
      .add({
        title: build.title,
        class: build.class,
        platform: build.platform,
        platformKey: build.platformKey,
        url: build.url,
        badge: build.badge,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

    return docRef.id;
  } catch (error) {
    console.error('Error saving build:', error);
    throw error;
  }
}

async function deleteBuildFromFirestore(docId) {
  if (!currentUser) return;

  const confirmed = confirm('Are you sure you want to delete this build?');
  if (!confirmed) return;

  try {
    await db.collection('users').doc(currentUser.uid).collection('builds').doc(docId).delete();
    // The real-time listener will automatically update the UI
  } catch (error) {
    console.error('Error deleting build:', error);
    alert('Failed to delete build.');
  }
}

// ============================================================================
// BUILD MANAGEMENT FUNCTIONS
// ============================================================================
function getPlatformFromUrl(url) {
  const cleanUrl = url.trim();
  for (const [key, platform] of Object.entries(SUPPORTED_PLATFORMS)) {
    if (platform.regex.test(cleanUrl)) {
      return { key, ...platform };
    }
  }
  return null;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function addBuild() {
  const title = buildTitleInput.value.trim();
  const gameClass = buildClassSelect.value.trim();
  const url = buildLinkInput.value.trim();

  // Validation
  if (!title) {
    alert('Please enter a build title.');
    buildTitleInput.focus();
    return;
  }

  if (!gameClass) {
    alert('Please select a class.');
    buildClassSelect.focus();
    return;
  }

  if (!url) {
    alert('Please paste a build link.');
    buildLinkInput.focus();
    return;
  }

  if (!isValidUrl(url)) {
    alert('Please enter a valid URL.');
    buildLinkInput.focus();
    return;
  }

  const platform = getPlatformFromUrl(url);
  if (!platform) {
    alert('This link is not from a supported platform. Try D4Builds, Mobalytics, or Maxroll.');
    buildLinkInput.focus();
    return;
  }

  // Create build object
  const build = {
    title,
    class: gameClass,
    platform: platform.name,
    platformKey: platform.key,
    url,
    badge: platform.badge,
  };

  try {
    importBuildButton.disabled = true;
    await saveBuildToFirestore(build);

    // Clear form (real-time listener will update the grid)
    buildTitleInput.value = '';
    buildClassSelect.value = '';
    buildLinkInput.value = '';
    buildTitleInput.focus();
  } catch (error) {
    alert('Failed to save build. Please try again.');
    console.error('Error adding build:', error);
  } finally {
    importBuildButton.disabled = false;
  }
}

// ============================================================================
// RENDERING & UTILITY FUNCTIONS
// ============================================================================
function renderBuilds() {
  if (savedBuilds.length === 0) {
    buildsCount.textContent = 'No builds saved yet.';
    buildsGrid.innerHTML = '<div class="empty-builds-message">Start by importing a build from your favorite platform.</div>';
    return;
  }

  buildsCount.textContent = `${savedBuilds.length} build${savedBuilds.length !== 1 ? 's' : ''} saved.`;

  buildsGrid.innerHTML = savedBuilds
    .map(
      (build) => `
    <div class="build-card">
      <div class="build-card-header">
        <div class="build-card-title">
          <h3>${escapeHtml(build.title)}</h3>
          <div class="build-card-badges">
            <span class="class-badge">${escapeHtml(build.class)}</span>
            <span class="platform-badge-small ${build.badge}">${build.platform}</span>
          </div>
        </div>
        <button type="button" class="delete-build-btn" title="Delete build" data-id="${build.id}">×</button>
      </div>
      <div class="build-card-url" title="${escapeHtml(build.url)}">${escapeHtml(truncateUrl(build.url))}</div>
      <div class="build-card-actions">
        <a href="${escapeHtml(build.url)}" target="_blank" rel="noreferrer" class="launch-build-btn">Launch Build</a>
      </div>
    </div>
  `
    )
    .join('');

  // Add delete event listeners
  document.querySelectorAll('.delete-build-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const docId = btn.dataset.id;
      deleteBuildFromFirestore(docId);
    });
  });
}

function truncateUrl(url, maxLength = 50) {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
loginButton.addEventListener('click', handleLogin);
signupButton.addEventListener('click', handleSignup);
logoutButton.addEventListener('click', handleLogout);

authEmailInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    authPasswordInput.focus();
  }
});

authPasswordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleLogin();
  }
});

importBuildButton.addEventListener('click', addBuild);
buildLinkInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    addBuild();
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================
// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  updateAuthUI(user);
});

// No need for manual DOMContentLoaded—auth state listener handles initialization
