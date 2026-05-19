const STORAGE_KEY = 'arpg-builds';
const SUPPORTED_PLATFORMS = {
  d4builds: { name: 'D4Builds', regex: /d4builds\.gg/i, badge: 'platform-d4builds' },
  mobalytics: { name: 'Mobalytics', regex: /mobalytics\.gg/i, badge: 'platform-mobalytics' },
  maxroll: { name: 'Maxroll', regex: /maxroll\.gg/i, badge: 'platform-maxroll' },
};

const buildTitleInput = document.getElementById('build-title-input');
const buildClassSelect = document.getElementById('build-class-select');
const buildLinkInput = document.getElementById('build-link-input');
const importBuildButton = document.getElementById('import-build-button');
const buildsGrid = document.getElementById('builds-grid');
const buildsCount = document.getElementById('builds-count');

let savedBuilds = [];

function loadBuilds() {
  const stored = localStorage.getItem(STORAGE_KEY);
  savedBuilds = stored ? JSON.parse(stored) : [];
  renderBuilds();
}

function saveBuilds() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBuilds));
}

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

function addBuild() {
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
    id: Date.now(),
    title,
    class: gameClass,
    platform: platform.name,
    platformKey: platform.key,
    url,
    badge: platform.badge,
    addedAt: new Date().toISOString(),
  };

  // Add to array and save
  savedBuilds.unshift(build);
  saveBuilds();
  renderBuilds();

  // Clear form
  buildTitleInput.value = '';
  buildClassSelect.value = '';
  buildLinkInput.value = '';
  buildTitleInput.focus();
}

function deleteBuild(id) {
  const confirmed = confirm('Are you sure you want to delete this build?');
  if (!confirmed) return;

  savedBuilds = savedBuilds.filter((build) => build.id !== id);
  saveBuilds();
  renderBuilds();
}

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
      const id = parseInt(btn.dataset.id, 10);
      deleteBuild(id);
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

importBuildButton.addEventListener('click', addBuild);
buildLinkInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    addBuild();
  }
});

document.addEventListener('DOMContentLoaded', loadBuilds);
