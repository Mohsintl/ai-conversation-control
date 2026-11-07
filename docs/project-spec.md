# Project Specification: AI Conversation Control

## Executive Summary

AI Conversation Control is a browser extension that provides checkpoint-based version control for AI conversations. It automatically captures user messages as recoverable checkpoints, enabling users to search their conversation history and jump back to specific points when AI responses drift or hallucinate.

## Vision

Create a Git-like version control system for AI conversations, where every user message is an implicit commit that can be searched, reviewed, and jumped back to.

## Problem Statement

### Current Pain Points

1. **Conversation Drift**: Long AI conversations gradually lose context or drift from the original intent
2. **Hallucinations**: AI responses may contain incorrect information that compounds in later turns
3. **No Recovery**: Users must manually copy-paste or start over when conversations go wrong
4. **Lost Context**: Valuable conversation states are lost when users navigate away or sessions expire
5. **Poor Discoverability**: No way to search across past conversations to find specific exchanges

### Target Users

- **Power users** of AI chat platforms who have long, complex conversations
- **Professionals** using AI for research, writing, coding, or analysis
- **Researchers** conducting multi-turn AI interactions
- **Anyone** who values conversation reliability over convenience

## Solution Overview

### Core Concept

Treat each user-sent message as a checkpoint that can be:
- Automatically captured and stored locally
- Searched across all conversations
- Used as a jump-back point to recover from drift

### Key Metaphor

**"Git for AI Conversations"** - Version control for your AI interactions

## MVP Feature Set

### ✅ In Scope

1. **Automatic Checkpoint Capture**
   - Passive capture of user-sent messages only
   - No manual saving required
   - Works across supported platforms

2. **Local Storage**
   - All data stored in browser local storage
   - No cloud sync
   - Privacy-first approach

3. **Search Functionality**
   - Text search across all checkpoints
   - Filter by platform
   - Ordered by recency

4. **Jump-Back**
   - Click to open conversation at checkpoint
   - Works with existing tab or new tab
   - Direct URL navigation

5. **Multi-Platform Support**
   - Claude.ai
   - ChatGPT
   - Google Gemini

6. **Basic UI**
   - Extension popup for viewing checkpoints
   - Simple list view
   - Platform badges and timestamps

### ❌ Out of Scope (MVP)

1. **Branching UI** - Visual tree of conversation branches
2. **Cloud Sync** - Cross-device synchronization
3. **Mobile Apps** - Native iOS/Android support
4. **Semantic Search** - AI-powered search
5. **AI Response Capture** - Only user messages are saved
6. **Real-time Collaboration** - Shared checkpoints
7. **Conversation Editing** - Modifying captured messages
8. **Advanced Filtering** - Complex query syntax
9. **Analytics** - Usage statistics and insights
10. **Multiple AI Platform Comparison** - Side-by-side views

## Technical Architecture

### Technology Stack

- **Language**: TypeScript
- **Runtime**: Chrome Extension (Manifest V3)
- **Storage**: Chrome Storage API (local)
- **Build**: TypeScript Compiler
- **UI**: Vanilla HTML/CSS/JS (no framework)

### Components

#### 1. Content Script
- Runs on AI platform pages
- Detects platform (Claude, ChatGPT, Gemini)
- Observes DOM for new user messages
- Extracts message content and metadata
- Sends to background worker

#### 2. Background Service Worker
- Receives messages from content script
- Stores checkpoints in Chrome storage
- Handles popup requests
- Manages badge counter
- Routes jump-back commands

#### 3. Popup UI
- Displays checkpoint list
- Search interface
- Platform filtering
- Jump-back actions
- Export functionality

#### 4. Platform Detectors
- Abstract interface for platform-specific logic
- Implementations for each supported platform
- Handles URL patterns, DOM selectors, message extraction

#### 5. Storage Service
- Wrapper around Chrome Storage API
- CRUD operations for checkpoints
- Search functionality
- Conversation metadata management

### Data Models

```typescript
interface Checkpoint {
  id: string;                    // Unique identifier
  platform: Platform;            // 'claude' | 'chatgpt' | 'gemini'
  conversationId: string;        // Platform-specific conversation ID
  message: string;               // User message content
  timestamp: number;             // Unix timestamp
  url: string;                   // Deep link to message
  sequenceNumber: number;        // Order in conversation
  tags?: string[];              // User-added tags (future)
  notes?: string;               // User notes (future)
}

interface Conversation {
  id: string;                   // Same as first checkpoint's conversationId
  platform: Platform;
  title?: string;               // Extracted from UI
  startedAt: number;           // Timestamp of first checkpoint
  lastUpdatedAt: number;       // Timestamp of latest checkpoint
  checkpointCount: number;     // Number of checkpoints
  url: string;                 // Link to conversation
}
```

### Storage Strategy

- **Location**: Chrome Storage Local API
- **Capacity**: ~5MB (approximately 2500-5000 checkpoints)
- **Structure**: 
  - `checkpoints`: Array of Checkpoint objects
  - `conversations`: Array of Conversation objects
  - `settings`: User preferences (future)

### Platform Detection Strategy

Each platform has unique DOM structure:

**Claude.ai:**
- User messages: `[data-is-user-message="true"]`
- Conversation ID: URL path `/chat/{id}`

**ChatGPT:**
- User messages: `[data-message-author-role="user"]`
- Conversation ID: URL path `/c/{id}`

**Gemini:**
- User messages: `[data-test-id*="user"]` (subject to change)
- Conversation ID: URL path or session-based

## User Workflows

### Primary: Capture & Search

1. User installs extension
2. User visits Claude.ai and starts conversation
3. Each message is automatically captured
4. User can click extension icon anytime
5. User searches for past message
6. User clicks checkpoint to jump back

### Secondary: Recovery from Drift

1. User has long conversation (20+ turns)
2. AI response becomes incorrect or off-topic
3. User opens extension
4. User finds last good checkpoint
5. User clicks "Jump to" button
6. Browser navigates to that point
7. User continues from there

### Tertiary: Cross-Conversation Search

1. User has multiple conversations over time
2. User needs to find specific topic
3. User opens extension and searches
4. Results span all conversations
5. User navigates to relevant checkpoint

## Success Metrics

### MVP Success Criteria

1. **Capture Rate**: >95% of user messages captured
2. **Search Accuracy**: Relevant results in top 5
3. **Jump-Back Success**: >98% successful navigations
4. **Performance**: Search results <500ms
5. **Storage Efficiency**: <2KB per checkpoint
6. **User Adoption**: 100+ active users in first month

### Long-term Goals

- 10,000+ active users
- <1% error rate
- Feature parity with Git (branching, merging)
- Cross-platform support (Edge, Firefox, Safari)

## Development Phases

### Phase 1: MVP (Current)
**Timeline**: 2-4 weeks
**Focus**: Core functionality, basic UI, Claude + ChatGPT support

Deliverables:
- [x] Project structure
- [x] Chrome extension scaffolding
- [x] Platform detectors (Claude, ChatGPT, Gemini)
- [x] Storage service
- [x] Popup UI
- [x] Search functionality
- [x] Jump-back functionality
- [ ] Testing and debugging
- [ ] Documentation

### Phase 2: Polish & Stability
**Timeline**: 2-3 weeks
**Focus**: Bug fixes, UI improvements, user feedback

Features:
- Visual indicators on captured messages
- Better error handling
- Keyboard shortcuts
- Export/import functionality
- Performance optimization
- User onboarding improvements

### Phase 3: Enhanced Features
**Timeline**: 1-2 months
**Focus**: Tags, notes, advanced search

Features:
- User-added tags
- Checkpoint notes
- Advanced filtering
- Conversation grouping
- Storage management UI
- Settings page

### Phase 4: Advanced Capabilities
**Timeline**: 2-3 months
**Focus**: Branching, visualization, semantic search

Features:
- Conversation branching UI
- Visual timeline
- Semantic search
- Cloud sync (optional)
- Additional platform support
- Browser compatibility (Firefox, Edge)

## Risk Assessment

### Technical Risks

1. **DOM Structure Changes**: AI platforms may change their HTML structure
   - **Mitigation**: Modular detector design, easy to update

2. **Storage Limits**: Chrome storage has 5MB limit
   - **Mitigation**: Efficient storage, cleanup tools, export functionality

3. **Performance**: Large checkpoint sets may slow search
   - **Mitigation**: Indexing, pagination, lazy loading

4. **Platform Restrictions**: Future browser changes may limit capabilities
   - **Mitigation**: Follow web standards, minimal permission requests

### Product Risks

1. **User Adoption**: Users may not see value
   - **Mitigation**: Clear onboarding, showcase use cases

2. **Complexity**: Too many features may confuse users
   - **Mitigation**: Progressive disclosure, simple MVP

3. **Competition**: Other tools may emerge
   - **Mitigation**: Focus on core value proposition, open source

## Open Questions

1. **Should we capture AI responses?**
   - Pro: More context for search
   - Con: More storage, privacy concerns
   - Decision: No for MVP, revisit later

2. **How to handle conversation edits?**
   - User edits message after sending
   - Decision: Capture original, future: track edits

3. **What's the ideal checkpoint limit?**
   - Trade-off between history and performance
   - Decision: No hard limit, provide cleanup tools

4. **Should we support conversation branching in MVP?**
   - Technically feasible
   - Decision: No, too complex for MVP

## Future Possibilities

### Year 1
- Mobile app (React Native)
- More AI platforms (Perplexity, Poe, etc.)
- Browser compatibility (Firefox, Edge, Safari)
- Cloud sync (optional, paid feature)

### Year 2
- Conversation branching and merging
- Collaborative checkpoints
- API for third-party integrations
- AI-powered insights and summaries

### Long-term
- Standalone desktop app
- Enterprise features
- AI conversation analytics
- Cross-platform conversation sync

## License & Distribution

- **License**: MIT (open source)
- **Distribution**: Chrome Web Store (free)
- **Source**: GitHub (public repository)
- **Monetization**: None initially, possible premium features later

## Conclusion

AI Conversation Control addresses a real need in the AI interaction space: reliable, recoverable conversations. The MVP focuses on core functionality with a clean, privacy-first approach. The "Git for AI conversations" metaphor provides a clear vision for long-term feature development.

Success depends on:
1. Reliable checkpoint capture
2. Fast, accurate search
3. Seamless jump-back experience
4. Respect for user privacy
5. Simple, intuitive UI

With disciplined scope management and user-focused development, this project can become an essential tool for serious AI users.
