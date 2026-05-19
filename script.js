// DOM Elements
const buildsContainer = document.getElementById('builds-container');
const buildUrlInput = document.getElementById('build-url');
const btnImport = document.getElementById('btn-import');

// Load builds from localStorage on startup
function loadBuilds() {
    const builds = JSON.parse(localStorage.getItem('arpg-builds') || '[]');
    buildsContainer.innerHTML = '';
    
    if (builds.length === 0) {
        buildsContainer.innerHTML = `<p class="empty-builds-message">No builds saved yet. Import one above!</p>`;
        return;
    }
    
    builds.forEach((build, index) => {
        const card = document.createElement('div');
        card.className = 'build-card';
        card.innerHTML = `
            <div class="build-card-header">
                <div class="build-card-title">
                    <h3>${build.title}</h3>
                    <div class="build-card-badges">
                        <span class="class-badge">${build.className}</span>
                        <span class="platform-badge-small platform-${build.platform}">${build.platform}</span>
                    </div>
                </div>
                <button class="delete-build-btn" data-index="${index}">×</button>
            </div>
            <div class="build-card-url">${build.url}</div>
            <div class="build-card-actions">
                <a href="${build.url}" target="_blank" class="launch-build-btn">Open Build Planner</a>
            </div>
        `;
        buildsContainer.appendChild(card);
    });
    
    // Add delete functionality
    document.querySelectorAll('.delete-build-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteBuild(index);
        });
    });
}

// Save a new build to localStorage
function saveBuild(url) {
    const builds = JSON.parse(localStorage.getItem('arpg-builds') || '[]');
    
    // Detect platform from URL
    let platform = 'd4builds';
    if (url.includes('mobalytics')) platform = 'mobalytics';
    else if (url.includes('maxroll')) platform = 'maxroll';
    
    // Simple automatic parsing logic for title/class based on URL keywords
    let buildClass = "General";
    if (url.toLowerCase().includes("necromancer")) buildClass = "Necromancer";
    if (url.toLowerCase().includes("sorcerer") || url.toLowerCase().includes("mage")) buildClass = "Sorcerer";
    if (url.toLowerCase().includes("rogue")) buildClass = "Rogue";
    if (url.toLowerCase().includes("barbarian") || url.toLowerCase().includes("warrior")) buildClass = "Barbarian";
    
    const newBuild = {
        url: url,
        className: buildClass,
        title: `${buildClass} Build (${new Date().toLocaleDateString()})`,
        platform: platform,
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
});

// Allow Enter key to trigger import
buildUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnImport.click();
    }
});

// Load builds on page load
loadBuilds();