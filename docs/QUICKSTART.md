# Quick Start Guide

Get up and running with AI Conversation Control in 5 minutes.

## Installation

### Step 1: Download or Clone
```bash
git clone https://github.com/Mohsintl/ai-conversation-control.git
cd ai-conversation-control
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build
```bash
npm run build
```

### Step 4: Load in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top-right corner)
4. Click "Load unpacked"
5. Navigate to and select the `dist/extension` folder
6. Done! You should see the extension icon in your toolbar

## First Use

### 1. Visit an AI Platform
Open any supported platform:
- https://claude.ai
- https://chat.openai.com
- https://gemini.google.com

### 2. Start Chatting
Just start a normal conversation. Every message you send is automatically saved as a checkpoint.

### 3. View Your Checkpoints
Click the extension icon in your toolbar to see:
- All your saved checkpoints
- Search through your messages
- Jump back to any point in the conversation

## Basic Features

### Automatic Saving
✅ Every message is saved automatically
✅ No manual action required
✅ Works across all supported platforms

### Search
1. Click extension icon
2. Type in the search box
3. Results appear instantly
4. Click any checkpoint to jump back

### Jump Back
When a conversation goes off track:
1. Open the extension popup
2. Find the last good checkpoint
3. Click "Jump to"
4. You're back at that point in the conversation!

## Tips & Tricks

### Keyboard Shortcuts
- Click extension icon: `Alt+Shift+C` (you can customize this)
- Quick search: Focus search box immediately after opening popup

### Best Practices
- Use descriptive language in your messages (makes searching easier)
- Check your checkpoints regularly
- Export your data periodically as backup

### Managing Storage
The extension shows:
- Number of checkpoints
- Number of conversations
- Storage used

To free up space:
- Delete old checkpoints
- Export and clear historical data

## Common Questions

### Do my checkpoints sync across devices?
No, all data is stored locally for privacy. Each device has its own checkpoints.

### Can I export my data?
Yes! Click "Export Data" in the popup to download a JSON file with all your checkpoints.

### What if I want to keep only certain checkpoints?
You can delete individual checkpoints from the popup. Future versions will support tagging and filtering.

### Does it work with other AI platforms?
Currently supports Claude, ChatGPT, and Gemini. More platforms coming soon!

## What's Next?

### Learn More
- Read the [full documentation](DEVELOPMENT.md)
- Check out the [project roadmap](../README.md#roadmap)
- See [contributing guidelines](contributing.md)

### Get Involved
- Report bugs on GitHub
- Suggest features
- Contribute code

## Troubleshooting

### Extension not capturing messages?
1. Refresh the AI platform page
2. Check that the extension is enabled
3. Look for errors in Chrome DevTools console

### Can't find a checkpoint?
1. Try different search terms
2. Check the "Conversations" tab
3. Verify the message was actually sent (not just drafted)

### Jump-back not working?
1. Make sure you're logged into the AI platform
2. The conversation must still exist
3. Try clicking the conversation in the "Conversations" tab first

## Support

Need help?
- 📖 [Read the docs](DEVELOPMENT.md)
- 🐛 [Report a bug](https://github.com/Mohsintl/ai-conversation-control/issues)
- 💡 [Request a feature](https://github.com/Mohsintl/ai-conversation-control/issues)
- 💬 [Join discussions](https://github.com/Mohsintl/ai-conversation-control/discussions)

---

**Ready to take control of your AI conversations? Install now and never lose track again!** 🚀
