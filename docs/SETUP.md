# Setup Instructions

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 16 or higher installed
- **npm** 7 or higher
- **Google Chrome** or Chromium-based browser
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-conversation-control.git
cd ai-conversation-control
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- TypeScript compiler
- @types/chrome (TypeScript definitions for Chrome APIs)

### 3. Build the Extension

```bash
npm run build
```

Or use the build script:
```bash
./build.sh
```

This will:
- Compile TypeScript to JavaScript
- Copy HTML and CSS files
- Copy the manifest
- Create the dist/extension directory

### 4. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Navigate to and select the `dist/extension` folder
5. The extension should now appear in your extensions list

### 5. Verify Installation

1. Click the puzzle piece icon in Chrome toolbar
2. Pin the "AI Conversation Control" extension
3. Visit https://claude.ai or https://chat.openai.com
4. Start a conversation
5. Click the extension icon to see your checkpoints

## Troubleshooting

### Build Errors

**TypeScript compilation fails:**
```bash
# Clean and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Missing @types/chrome:**
```bash
npm install --save-dev @types/chrome
```

### Extension Won't Load

**Manifest errors:**
- Check that `dist/extension/manifest.json` exists
- Verify JSON syntax is valid
- Ensure all referenced files exist

**Missing files:**
```bash
# Rebuild completely
npm run clean
npm run build
```

### Extension Doesn't Capture Messages

**Check console errors:**
1. Right-click on the AI platform page
2. Select "Inspect"
3. Check Console tab for errors

**Verify platform detection:**
- Check that you're on a supported platform
- Refresh the page after loading extension
- Check that content script is injected

**Background service worker errors:**
1. Go to `chrome://extensions/`
2. Find "AI Conversation Control"
3. Click "service worker" link
4. Check console for errors

## Development Mode

### Watch Mode

Run TypeScript compiler in watch mode:
```bash
npm run watch
```

Changes will automatically recompile. You'll need to:
1. Refresh the extension at `chrome://extensions/`
2. Refresh the AI platform page

### Hot Reload

For faster development, consider using:
- Extension reload extension (search Chrome Web Store)
- Or manually reload at `chrome://extensions/`

### Debug Logging

Content script logs:
- Right-click page → Inspect → Console

Background worker logs:
- chrome://extensions/ → "service worker" link

Popup logs:
- Right-click extension popup → Inspect

## Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: Extension icon not showing
**Solution:** Ensure icon files exist in `dist/extension/icons/`
(Note: Current build uses placeholder icons)

### Issue: Checkpoints not saving
**Solution:** 
1. Check Chrome storage permissions in manifest
2. Verify storage service is working
3. Check background worker console for errors

### Issue: Search not working
**Solution:**
1. Ensure checkpoints exist
2. Check popup console for errors
3. Verify search debouncing is working

## Next Steps

- Read [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details
- See [QUICKSTART.md](QUICKSTART.md) for usage guide
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Getting Help

If you encounter issues:
1. Check this guide first
2. Search [GitHub Issues](https://github.com/yourusername/ai-conversation-control/issues)
3. Create a new issue with:
   - Your OS and Chrome version
   - Steps to reproduce
   - Console logs
   - Screenshots

## Production Build

For a production-ready build:

```bash
# 1. Update version numbers
# Edit package.json and extension/manifest.json

# 2. Build
npm run build

# 3. Test thoroughly
# Load in Chrome and test all features

# 4. Package
cd dist/extension
zip -r extension.zip .

# 5. The extension.zip file is ready for distribution
```

## Platform-Specific Notes

### macOS
- Use Terminal or iTerm2
- May need to allow Chrome in Security & Privacy settings

### Windows
- Use PowerShell or Git Bash
- Paths use backslashes: `dist\extension`

### Linux
- Standard bash commands
- May need to run with `sudo` for npm global installs

---

**Successfully installed?** Check out the [Quick Start Guide](QUICKSTART.md) to start using the extension!
