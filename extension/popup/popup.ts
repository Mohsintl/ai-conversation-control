import { MessageType } from '../shared/types/messages.js';
import { Checkpoint, Conversation } from '../shared/interfaces/checkpoint.js';
import { formatTimestamp, truncateText, debounce } from '../utils/helpers.js';

/**
 * Popup UI controller.
 * Manages state, rendering, and user interactions in the extension popup.
 */
class PopupController {
  private checkpoints: Checkpoint[] = [];
  private conversations: Conversation[] = [];
  private currentTab: 'checkpoints' | 'conversations' = 'checkpoints';
  private searchQuery: string = '';

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Wire UI events and load initial data.
    // Set up event listeners
    this.setupTabSwitching();
    this.setupSearch();
    this.setupFooterButtons();

    // Load initial data
    await this.loadStats();
    await this.loadCheckpoints();
    await this.loadConversations();
  }

  private setupTabSwitching(): void {
    // Tab buttons toggle the two views.
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab as 'checkpoints' | 'conversations';
        this.switchTab(tabName);
      });
    });
  }

  private switchTab(tabName: 'checkpoints' | 'conversations'): void {
    // Swap active tab button and content pane.
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
  }

  private setupSearch(): void {
    // Debounced search input wired to background search.
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const clearButton = document.getElementById('clear-search') as HTMLButtonElement;

    // Debounced search
    const debouncedSearch = debounce((query: string) => {
      this.searchQuery = query;
      this.performSearch(query);
    }, 300);

    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      debouncedSearch(query);
    });

    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      this.loadCheckpoints();
    });
  }

  private async performSearch(query: string): Promise<void> {
    // Empty query falls back to full list.
    if (!query.trim()) {
      await this.loadCheckpoints();
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: MessageType.SEARCH_CHECKPOINTS,
      timestamp: Date.now(),
      data: { query }
    });

    if (response.type === MessageType.SEARCH_RESULTS) {
      this.checkpoints = response.data.checkpoints;
      this.renderCheckpoints();
    }
  }

  private setupFooterButtons(): void {
    // Footer actions for settings (placeholder) and export.
    const settingsButton = document.getElementById('settings-button');
    const exportButton = document.getElementById('export-button');

    settingsButton?.addEventListener('click', () => {
      // TODO: Open settings page
      console.log('Settings clicked');
    });

    exportButton?.addEventListener('click', () => {
      this.exportData();
    });
  }

  private async loadStats(): Promise<void> {
    // Pull aggregate counts for header stats.
    // Get stats from storage
    const checkpointsResponse = await chrome.runtime.sendMessage({
      type: MessageType.GET_CHECKPOINTS,
      timestamp: Date.now()
    });

    const conversationsResponse = await chrome.runtime.sendMessage({
      type: MessageType.GET_CONVERSATIONS,
      timestamp: Date.now()
    });

    const checkpointCount = checkpointsResponse.data?.total || 0;
    const conversationCount = conversationsResponse.data?.total || 0;

    document.getElementById('checkpoint-count')!.textContent = 
      `${checkpointCount} checkpoint${checkpointCount !== 1 ? 's' : ''}`;
    
    document.getElementById('conversation-count')!.textContent = 
      `${conversationCount} conversation${conversationCount !== 1 ? 's' : ''}`;
  }

  private async loadCheckpoints(): Promise<void> {
    // Load recent checkpoints for the list view.
    const response = await chrome.runtime.sendMessage({
      type: MessageType.GET_CHECKPOINTS,
      timestamp: Date.now(),
      data: { limit: 50 }
    });

    if (response.type === MessageType.CHECKPOINTS_RESPONSE) {
      this.checkpoints = response.data.checkpoints;
      this.renderCheckpoints();
    }
  }

  private renderCheckpoints(): void {
    // Render the checkpoint list (or empty state).
    const container = document.getElementById('checkpoints-list')!;
    container.innerHTML = '';

    if (this.checkpoints.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div>No checkpoints yet</div>
          <div style="font-size: 12px; margin-top: 8px;">
            Start a conversation on Claude.ai or ChatGPT
          </div>
        </div>
      `;
      return;
    }

    this.checkpoints.forEach(checkpoint => {
      const item = this.createCheckpointElement(checkpoint);
      container.appendChild(item);
    });
  }

  private createCheckpointElement(checkpoint: Checkpoint): HTMLElement {
    // Build DOM for a single checkpoint entry.
    const div = document.createElement('div');
    div.className = 'checkpoint-item';
    
    div.innerHTML = `
      <div class="checkpoint-header">
        <span class="platform-badge ${checkpoint.platform}">${checkpoint.platform}</span>
        <span class="timestamp">${formatTimestamp(checkpoint.timestamp)}</span>
      </div>
      <div class="checkpoint-message">${this.escapeHtml(checkpoint.message)}</div>
      <div class="checkpoint-actions">
        <button class="action-button primary" data-action="jump">Jump to</button>
        <button class="action-button" data-action="copy">Copy</button>
        <button class="action-button" data-action="delete">Delete</button>
      </div>
    `;

    // Add event listeners to action buttons.
    const jumpButton = div.querySelector('[data-action="jump"]') as HTMLButtonElement;
    const copyButton = div.querySelector('[data-action="copy"]') as HTMLButtonElement;
    const deleteButton = div.querySelector('[data-action="delete"]') as HTMLButtonElement;

    jumpButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.jumpToCheckpoint(checkpoint.id);
    });

    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.copyCheckpoint(checkpoint);
    });

    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCheckpoint(checkpoint.id);
    });

    return div;
  }

  private async loadConversations(): Promise<void> {
    // Load conversation summaries for the second tab.
    const response = await chrome.runtime.sendMessage({
      type: MessageType.GET_CONVERSATIONS,
      timestamp: Date.now()
    });

    if (response.type === MessageType.CONVERSATIONS_RESPONSE) {
      this.conversations = response.data.conversations;
      this.renderConversations();
    }
  }

  private renderConversations(): void {
    // Render the conversation list (or empty state).
    const container = document.getElementById('conversations-list')!;
    container.innerHTML = '';

    if (this.conversations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <div>No conversations yet</div>
        </div>
      `;
      return;
    }

    this.conversations.forEach(conversation => {
      const item = this.createConversationElement(conversation);
      container.appendChild(item);
    });
  }

  private createConversationElement(conversation: Conversation): HTMLElement {
    // Build DOM for a single conversation entry.
    const div = document.createElement('div');
    div.className = 'conversation-item';
    
    div.innerHTML = `
      <div class="conversation-header">
        <span class="platform-badge ${conversation.platform}">${conversation.platform}</span>
        <span class="timestamp">${formatTimestamp(conversation.lastUpdatedAt)}</span>
      </div>
      <div class="conversation-title">
        ${conversation.title || 'Untitled Conversation'}
      </div>
      <div class="conversation-meta">
        ${conversation.checkpointCount} checkpoint${conversation.checkpointCount !== 1 ? 's' : ''}
      </div>
    `;

    div.addEventListener('click', () => {
      this.openConversation(conversation);
    });

    return div;
  }

  private async jumpToCheckpoint(checkpointId: string): Promise<void> {
    // Ask background to navigate to the checkpoint, then close the popup.
    await chrome.runtime.sendMessage({
      type: MessageType.JUMP_TO_CHECKPOINT,
      timestamp: Date.now(),
      data: { checkpointId }
    });
    window.close();
  }

  private copyCheckpoint(checkpoint: Checkpoint): void {
    // Copy checkpoint message text to clipboard.
    navigator.clipboard.writeText(checkpoint.message);
    // TODO: Show toast notification
    console.log('Copied to clipboard');
  }

  private async deleteCheckpoint(checkpointId: string): Promise<void> {
    // Confirm and delete a checkpoint, then refresh UI.
    if (!confirm('Delete this checkpoint?')) {
      return;
    }

    await chrome.runtime.sendMessage({
      type: MessageType.DELETE_CHECKPOINT,
      timestamp: Date.now(),
      data: { checkpointId }
    });

    // Reload checkpoints
    await this.loadCheckpoints();
    await this.loadStats();
  }

  private openConversation(conversation: Conversation): void {
    // Open conversation URL in a new tab.
    chrome.tabs.create({ url: conversation.url });
    window.close();
  }

  private async exportData(): Promise<void> {
    // Export checkpoints and conversations to a JSON file.
    const data = {
      checkpoints: this.checkpoints,
      conversations: this.conversations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-control-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeHtml(text: string): string {
    // Basic HTML escape to prevent injection in innerHTML.
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PopupController());
} else {
  new PopupController();
}
