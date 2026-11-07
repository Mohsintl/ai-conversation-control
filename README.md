# AI Conversation Control

A browser extension that adds a control and recovery layer for generative AI conversations. Automatically captures user messages as checkpoints, enabling search and jump-back functionality when AI responses drift or hallucinate.

> **Status:** early MVP. Capture, search, and jump-back work on ChatGPT and Claude; see [`MVP_CHECKLIST.md`](MVP_CHECKLIST.md) for what is still open.

## Features

- 🎯 **Automatic Checkpoint Capture**: Every message you send is saved locally
- 🔍 **Search Functionality**: Quickly find past messages across all conversations
- ↩️ **Jump Back**: Return to any checkpoint in the original conversation
- 🔒 **Privacy First**: All data stored locally, no cloud sync
- 🤖 **Multi-Platform**: Works with ChatGPT and Claude; Gemini is planned

## Installation

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/Mohsintl/ai-conversation-control.git
cd ai-conversation-control
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/extension` directory

## Usage

1. Install the extension
2. Visit a supported AI platform (ChatGPT or Claude.ai)
3. Start a conversation - your messages are automatically saved as checkpoints
4. Click the extension icon to:
   - View all checkpoints
   - Search through your messages
   - Jump back to any checkpoint in the conversation

## Architecture

```
├── extension/
│   ├── background/          # Service worker
│   ├── content/             # Content script (message capture)
│   ├── popup/               # Extension popup UI
│   ├── sources/             # Platform-specific detectors
│   ├── storage/             # Chrome storage wrapper
│   ├── onboarding/          # First-run experience
│   └── utils/               # Shared utilities
├── shared/
│   ├── interfaces/          # TypeScript interfaces
│   └── types/               # Type definitions
└── dist/                    # Build output
```

## Platform Detection

The extension uses platform-specific detectors to identify and extract messages:

- **Claude.ai**: Detects user messages via `[data-is-user-message="true"]`
- **ChatGPT**: Detects user messages via `[data-message-author-role="user"]`
- **Gemini**: Detects user messages via platform-specific selectors

## Storage Structure

Checkpoints are stored in Chrome's local storage:

```typescript
interface Checkpoint {
  id: string;
  platform: 'claude' | 'chatgpt' | 'gemini';
  conversationId: string;
  message: string;
  timestamp: number;
  url: string;
  sequenceNumber: number;
  tags?: string[];
  notes?: string;
}
```

## Development

### Build Commands

```bash
# Build once
npm run build

# Watch mode (rebuild on file changes)
npm run watch

# Clean build directory
npm run clean
```

### Project Structure

- **TypeScript**: All code is written in TypeScript for type safety
- **Modular Design**: Each component has a single responsibility
- **Platform Abstraction**: Platform-specific logic is isolated in detector classes

## Roadmap

### Phase 1: MVP (Current)
- [x] Automatic checkpoint capture
- [x] Local storage
- [x] Search functionality
- [x] Jump-back to checkpoints
- [x] Multi-platform support (Claude, ChatGPT, Gemini)

### Phase 2: Enhanced UX
- [ ] Visual indicators on captured messages
- [ ] Keyboard shortcuts
- [ ] Tags and notes on checkpoints
- [ ] Checkpoint grouping by conversation
- [ ] Export/import functionality

### Phase 3: Advanced Features
- [ ] Conversation branching visualization
- [ ] Semantic search
- [ ] Cloud sync (optional)
- [ ] Mobile support
- [ ] More AI platforms

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](docs/contributing.md) for details.

## Privacy

- All data is stored locally in Chrome's storage API
- No data is sent to external servers
- No tracking or analytics
- Open source and auditable

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Inspired by Git's approach to version control
- Built with Chrome Extension Manifest V3
- TypeScript for type safety and better DX

## Support

- [GitHub Issues](https://github.com/Mohsintl/ai-conversation-control/issues)
- [Documentation](docs/)

---

**Note**: This is an MVP release. The extension is functional but may have bugs. Please report issues on GitHub.
