// DOM Elements
const buildsContainer = document.getElementById('builds-grid');
const buildUrlInput = document.getElementById('build-link-input');
const buildTitleInput = document.getElementById('build-title-input');
const buildClassSelect = document.getElementById('build-class-select');
const btnImport = document.getElementById('import-build-button');
const buildsCountText = document.getElementById('builds-count');

// Load builds from localStorage on startup
function loadBuilds() {
    const builds = JSON.parse(localStorage.getItem('arpg-builds') || '[]');
    buildsContainer.innerHTML = '';

    buildsCountText.textContent = builds.length === 0 ? 'No builds saved yet.' : `${builds.length} saved build${builds.length === 1 ? '' : 's'}`;

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
    const builds = JSON.parse(localStorage.getItem('arpg-builds') || '[]');

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
    localStorage.setItem('arpg-builds', JSON.stringify(builds));
    loadBuilds();
}

// Delete a build from localStorage
function deleteBuild(index) {
    const builds = JSON.parse(localStorage.getItem('arpg-builds') || '[]');
    builds.splice(index, 1);
    localStorage.setItem('arpg-builds', JSON.stringify(builds));
    loadBuilds();
}

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
loadBuilds();