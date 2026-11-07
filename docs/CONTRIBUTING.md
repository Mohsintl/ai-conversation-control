# Contributing to AI Conversation Control

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Mohsintl/ai-conversation-control/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser version and OS
   - Console logs if relevant

### Suggesting Features

1. Check [existing feature requests](https://github.com/Mohsintl/ai-conversation-control/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create a new issue with:
   - Clear description of the feature
   - Why it would be useful
   - Potential implementation approach (optional)
   - Mockups or examples (optional)

### Contributing Code

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/ai-conversation-control.git
   cd ai-conversation-control
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   npm install
   npm run build
   ```

4. **Make your changes**
   - Follow the [code style](#code-style)
   - Add tests if applicable
   - Update documentation if needed

5. **Test your changes**
   - Load the extension in Chrome
   - Test on all supported platforms
   - Check for console errors

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```
   Use [conventional commits](#commit-messages)

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a PR on GitHub

## Development Guidelines

### Project Scope

**In Scope for MVP:**
- Capturing user messages as checkpoints
- Local storage only
- Search functionality
- Jump-back to checkpoints
- Support for Claude, ChatGPT, Gemini

**Out of Scope for MVP:**
- Branching UI
- Cloud sync
- Mobile apps
- Semantic search
- Multi-AI simultaneous support

See [docs/project-spec.md](project-spec.md) for detailed scope.

### Code Style

#### TypeScript
```typescript
// Good
interface Checkpoint {
  id: string;
  message: string;
}

async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
  // Implementation
}

// Bad
var checkpoint = {id: "1", msg: "test"}
function save(cp) {
  // Implementation
}
```

#### Naming Conventions
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase`

#### Comments
```typescript
/**
 * Save a checkpoint to storage
 * 
 * @param checkpoint - The checkpoint to save
 * @returns Promise that resolves when saved
 */
async function saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
  // Implementation
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(search): add fuzzy search for checkpoints

Implements fuzzy search algorithm to find checkpoints
even with typos or partial matches.

Closes #123
```

```
fix(popup): correct timestamp formatting

The timestamp was showing incorrect timezone.
Now uses local timezone consistently.
```

### Pull Request Process

1. **Update documentation** if you're adding features
2. **Test thoroughly** on all supported platforms
3. **Keep PRs focused** - one feature or fix per PR
4. **Respond to feedback** - be open to suggestions
5. **Squash commits** if asked (for cleaner history)

### PR Checklist

- [ ] Code follows project style guide
- [ ] Changes are tested on Chrome
- [ ] Works on Claude, ChatGPT, and Gemini
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No console errors
- [ ] Performance is acceptable

## Architecture

### Adding a New Platform

See [DEVELOPMENT.md](DEVELOPMENT.md#adding-a-new-platform) for detailed instructions.

Key points:
- Implement `PlatformDetector` interface
- Update `Platform` type
- Register in content script
- Update manifest permissions
- Test thoroughly

### Modifying Storage

When changing the storage structure:
1. Update interfaces in `shared/interfaces/`
2. Update `StorageService` methods
3. Add migration logic for existing data
4. Test with existing stored data
5. Document breaking changes

## Testing

### Manual Testing Checklist

Before submitting a PR:
- [ ] Extension loads without errors
- [ ] Captures messages on Claude.ai
- [ ] Captures messages on ChatGPT
- [ ] Captures messages on Gemini
- [ ] Search returns correct results
- [ ] Jump-back navigates to correct message
- [ ] Popup UI is responsive
- [ ] No console errors
- [ ] Works after browser restart

### Edge Cases to Test
- Very long messages (>10,000 characters)
- Messages with special characters
- Rapid message sending
- Multiple tabs open
- Extension disabled and re-enabled
- Storage limits (many checkpoints)

## Documentation

When adding features, update:
- `README.md` - If user-facing feature
- `docs/DEVELOPMENT.md` - If affects development
- `docs/QUICKSTART.md` - If changes getting started
- Code comments - Always
- `CHANGELOG.md` - For releases

## Questions?

- 💬 Open a [Discussion](https://github.com/Mohsintl/ai-conversation-control/discussions)
- 🐛 Create an [Issue](https://github.com/Mohsintl/ai-conversation-control/issues)
- 📧 Email: your.email@example.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commits

Thank you for contributing! 🎉
