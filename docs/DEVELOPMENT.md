# Development Guide

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Chrome or Chromium-based browser
- Basic understanding of TypeScript and Chrome Extensions

### Setup

1. Clone and install:
```bash
git clone https://github.com/Mohsintl/ai-conversation-control.git
cd ai-conversation-control
npm install
```

2. Build the extension:
```bash
npm run build
# or use the build script
./build.sh
```

3. Load in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select `dist/extension` directory

## Project Structure

### Extension Components

#### 1. Content Script (`extension/content/`)
Runs on AI platform pages to capture user messages.

**Key responsibilities:**
- Detect which AI platform is active
- Observe DOM for new user messages
- Extract message content
- Send checkpoints to background script

#### 2. Background Service Worker (`extension/background/`)
Handles storage operations and message routing.

**Key responsibilities:**
- Receive checkpoints from content script
- Store checkpoints in Chrome storage
- Handle requests from popup
- Manage extension badge

#### 3. Popup (`extension/popup/`)
User interface for viewing and managing checkpoints.

**Key responsibilities:**
- Display checkpoints and conversations
- Search functionality
- Jump-back action
- Export data

#### 4. Platform Detectors (`extension/sources/`)
Platform-specific logic for message detection.

**Key responsibilities:**
- Detect if platform is active
- Extract conversation ID
- Observe for new messages
- Generate jump-back URLs

#### 5. Storage Service (`extension/storage/`)
Wrapper around Chrome storage API.

**Key responsibilities:**
- CRUD operations for checkpoints
- Search functionality
- Conversation metadata management
- Storage statistics

## Architecture Decisions

### Why Manifest V3?
- Required for new Chrome extensions
- Better security model
- Service worker instead of background page

### Why Local Storage Only?
- Privacy first - no data leaves user's device
- Simpler MVP implementation
- Faster operations
- No server costs

### Why TypeScript?
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Easier refactoring

## Adding a New Platform

To add support for a new AI platform:

1. Create a new detector in `extension/sources/`:

```typescript
// extension/sources/newplatform-detector.ts
import { PlatformDetector } from './platform-detector';
import { Platform } from '../../shared/interfaces/checkpoint';

export class NewPlatformDetector implements PlatformDetector {
  platform: Platform = 'newplatform';
  
  isActive(): boolean {
    return window.location.hostname === 'newplatform.com';
  }
  
  // Implement other methods...
}
```

2. Update `shared/interfaces/checkpoint.ts`:
```typescript
export type Platform = 'claude' | 'chatgpt' | 'gemini' | 'newplatform';
```

3. Register in `extension/content/content-script.ts`:
```typescript
const detectors = [
  new ClaudeDetector(),
  new ChatGPTDetector(),
  new GeminiDetector(),
  new NewPlatformDetector() // Add here
];
```

4. Update `extension/manifest.json` permissions:
```json
"host_permissions": [
  "https://newplatform.com/*"
]
```

## Testing

### Manual Testing Checklist

- [ ] Load extension in Chrome
- [ ] Visit Claude.ai and send a message
- [ ] Verify checkpoint appears in popup
- [ ] Test search functionality
- [ ] Test jump-back functionality
- [ ] Test on ChatGPT
- [ ] Test on Gemini
- [ ] Test export functionality
- [ ] Test with long conversations (50+ messages)

### Debugging

Enable debug logging:
```typescript
// Add to any file
console.log('[Component Name] Debug info:', data);
```

View logs:
- Content script: Right-click page → Inspect → Console
- Background: chrome://extensions/ → "service worker" link
- Popup: Right-click popup → Inspect

### Common Issues

**Checkpoints not saving:**
- Check console for errors
- Verify platform detector is working
- Check Chrome storage in DevTools

**Jump-back not working:**
- Verify URL pattern is correct
- Check conversation ID extraction
- Test URL manually

**Search not finding results:**
- Verify checkpoints are stored
- Check search query formatting
- Test with simpler queries

## Performance Considerations

### Storage Limits
- Chrome local storage: ~5MB per extension
- Each checkpoint: ~1-2KB average
- Approximate capacity: 2500-5000 checkpoints

### Optimization Tips
1. Debounce search input (already implemented)
2. Limit results shown in popup
3. Use pagination for large datasets
4. Clean up old conversations periodically

## Code Style

### TypeScript
- Use `interface` for data structures
- Use `type` for unions and primitives
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs

### Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase`

### File Organization
```
feature/
  ├── component.ts        # Main logic
  ├── component.test.ts   # Tests (future)
  ├── component.html      # UI (if applicable)
  └── component.css       # Styles (if applicable)
```

## Git Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add your feature"
```

3. Push and create PR:
```bash
git push origin feature/your-feature-name
```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## Release Process

1. Update version in `package.json` and `manifest.json`
2. Build production version: `npm run build`
3. Test thoroughly
4. Create git tag: `git tag v0.1.0`
5. Push tag: `git push --tags`
6. Create GitHub release
7. Package extension: `cd dist/extension && zip -r extension.zip .`

## Troubleshooting

### Extension won't load
- Check manifest.json syntax
- Verify all files are in dist/extension
- Check Chrome developer console for errors

### TypeScript errors
- Run `npm install` to ensure types are installed
- Check tsconfig.json configuration
- Verify import paths

### Build fails
- Clean and rebuild: `npm run clean && npm run build`
- Check for TypeScript errors
- Verify all dependencies are installed

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

## Getting Help

- Check existing GitHub issues
- Review this documentation
- Ask in GitHub discussions
- Create a detailed issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Console logs
  - Browser version
