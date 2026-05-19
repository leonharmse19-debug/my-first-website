# ARPG Build Tracker

A modern, dark-themed web application for importing, managing, and tracking your ARPG builds from popular platforms like **D4Builds**, **Mobalytics**, and **Maxroll**.

## Features

- **Multi-Platform Support**: Import builds from D4Builds, Mobalytics, and Maxroll with automatic platform detection
- **Build Manager**: Create a custom library of your favorite builds with:
  - Custom build titles
  - Class selection (Sorcerer, Barbarian, Druid, Necromancer, Rogue, Spiritborn, Warlock, Paladin)
  - Original build links
  - Platform badges
- **Persistent Storage**: All builds are automatically saved to your browser's localStorage and persist across sessions
- **Beautiful UI**: Dark-themed, modern design with responsive grid layout
- **Quick Access**: One-click "Launch Build" buttons to open builds in new tabs
- **Easy Management**: Delete builds with confirmation to keep your collection organized

## How to Use

### Importing a Build

1. **Enter Build Title**: Give your build a memorable name (e.g., "Crit Barb Leveling")
2. **Select Class**: Choose the character class from the dropdown
3. **Paste Build Link**: Paste a URL from one of the supported platforms:
   - `https://d4builds.gg/...`
   - `https://mobalytics.gg/...`
   - `https://maxroll.gg/...`
4. **Click "Import Build"**: The build will be validated and saved automatically

### Managing Your Builds

- **View Builds**: Your saved builds appear as cards in the "Your Saved Builds" grid
- **Launch Build**: Click "Launch Build" to open the original build page in a new tab
- **Delete Build**: Click the red **×** button to remove a build (confirmation required)

## Technologies

- **HTML5**: Semantic markup and form controls
- **CSS3**: Dark theme with gradients, animations, and responsive grid layout
- **JavaScript (Vanilla)**: DOM manipulation, localStorage API, URL validation, and event handling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

All modern browsers with localStorage support.

## Features Coming Soon

- Build comparison tool
- Export/import build collections
- Cloud sync across devices
- Build performance metrics
- Community build sharing

## Project Structure

```
.
├── index.html      # Main HTML structure and form
├── style.css       # Dark theme styling and layout
├── script.js       # Build management and localStorage logic
└── README.md       # This file
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/arpg-build-tracker.git
   cd arpg-build-tracker
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

3. Visit `http://localhost:8000` and start building!

## Data Storage

Builds are stored in browser localStorage under the key `arpg-builds` as a JSON array. Each build object contains:

```javascript
{
  id: timestamp,
  title: "Build Name",
  class: "Sorcerer",
  platform: "D4Builds",
  platformKey: "d4builds",
  url: "https://...",
  badge: "platform-d4builds",
  addedAt: "2026-05-19T..."
}
```

To clear all builds, open Developer Tools and run:
```javascript
localStorage.removeItem('arpg-builds');
```

## License

MIT License - feel free to use, modify, and distribute!

## Support

Found a bug or have a feature request? Please open an issue on GitHub or submit feedback through the contact form on the website.

---

**Happy Build Tracking!** 🎮⚔️
