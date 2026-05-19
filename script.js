// DOM Elements
const buildsContainer = document.getElementById('builds-grid');
const buildUrlInput = document.getElementById('build-link-input');
const buildTitleInput = document.getElementById('build-title-input');
const buildClassSelect = document.getElementById('build-class-select');
const buildUserInput = document.getElementById('build-user-input');
const btnSetUser = document.getElementById('set-user-button');
const btnImport = document.getElementById('import-build-button');
const buildsCountText = document.getElementById('builds-count');
const currentUserDisplay = document.getElementById('current-user-display');

function getCurrentUser() {
    return localStorage.getItem('arpg-builds-user') || '';
}

function saveCurrentUser(user) {
    localStorage.setItem('arpg-builds-user', user);
}

function getUserKey(user) {
    return `arpg-builds-${user.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()}`;
}

function updateUserDisplay() {
    const user = getCurrentUser();
    currentUserDisplay.textContent = user
        ? `Current user: ${user}. Your builds are saved only in this browser under this name.`
        : 'No user selected yet. Enter your name to save builds separately for each person.';
    buildUserInput.value = user;
}

// Load builds from localStorage on startup
function loadBuilds() {
    const user = getCurrentUser();
    buildsContainer.innerHTML = '';

    if (!user) {
        buildsCountText.textContent = 'Enter a name to view your builds.';
        buildsContainer.innerHTML = `<p class="empty-builds-message">Please enter your name and click Set User before importing builds.</p>`;
        return;
    }

    const builds = JSON.parse(localStorage.getItem(getUserKey(user)) || '[]');
    buildsCountText.textContent = builds.length === 0
        ? 'No builds saved yet for this user.'
        : `${builds.length} saved build${builds.length === 1 ? '' : 's'} for ${user}`;

    if (builds.length === 0) {
        buildsContainer.innerHTML = `<p class="empty-builds-message">No builds saved yet. Import one above.</p>`;
        return;
    }

    builds.forEach((build, index) => {
        const card = document.createElement('div');
        card.className = 'build-card';
        card.innerHTML = `
            <div class="build-card-header">
                <div>
                    <h3>${build.title}</h3>
                    <div class="build-card-badges">
                        <span class="class-badge">${build.className}</span>
                        <span class="platform-badge-small platform-${build.platform}">${build.platform}</span>
                    </div>
                </div>
                <button class="delete-build-btn" data-index="${index}" aria-label="Delete build">×</button>
            </div>
            <div class="build-card-url">${build.url}</div>
            <div class="build-card-actions">
                <a href="${build.url}" target="_blank" rel="noopener noreferrer" class="launch-build-btn">Open Build Planner</a>
            </div>
        `;
        buildsContainer.appendChild(card);
    });

    document.querySelectorAll('.delete-build-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            deleteBuild(index);
        });
    });
}

// Save a new build to localStorage
function saveBuild(url) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please enter your name and click Set User before saving a build.');
        return;
    }

    const key = getUserKey(user);
    const builds = JSON.parse(localStorage.getItem(key) || '[]');

    let platform = 'd4builds';
    if (url.includes('mobalytics')) platform = 'mobalytics';
    else if (url.includes('maxroll')) platform = 'maxroll';

    let buildClass = buildClassSelect.value || 'General';
    if (!buildClass || buildClass === '') {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('necromancer')) buildClass = 'Necromancer';
        else if (lowerUrl.includes('sorcerer') || lowerUrl.includes('mage')) buildClass = 'Sorcerer';
        else if (lowerUrl.includes('rogue')) buildClass = 'Rogue';
        else if (lowerUrl.includes('barbarian') || lowerUrl.includes('warrior')) buildClass = 'Barbarian';
    }

    const titleValue = buildTitleInput.value.trim();
    const buildTitle = titleValue || `${buildClass} Build (${new Date().toLocaleDateString()})`;

    const newBuild = {
        url,
        className: buildClass,
        title: buildTitle,
        platform,
        createdAt: new Date().getTime()
    };

    builds.unshift(newBuild);
    localStorage.setItem(key, JSON.stringify(builds));
    loadBuilds();
}

// Delete a build from localStorage
function deleteBuild(index) {
    const user = getCurrentUser();
    if (!user) return;

    const key = getUserKey(user);
    const builds = JSON.parse(localStorage.getItem(key) || '[]');
    builds.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(builds));
    loadBuilds();
}

btnSetUser.addEventListener('click', () => {
    const userName = buildUserInput.value.trim();
    if (!userName) {
        alert('Please enter a name to save builds for your own account.');
        return;
    }

    saveCurrentUser(userName);
    updateUserDisplay();
    loadBuilds();
});

// Import button click handler
btnImport.addEventListener('click', () => {
    const url = buildUrlInput.value.trim();
    if (!url) return;

    saveBuild(url);
    buildUrlInput.value = '';
    buildTitleInput.value = '';
    buildClassSelect.value = '';
});

// Allow Enter key to trigger import
buildUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnImport.click();
    }
});

// Load builds on page load
updateUserDisplay();
loadBuilds();