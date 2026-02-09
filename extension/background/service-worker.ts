import { StorageService } from '../storage/storage-service.js';
import { Checkpoint } from '../shared/interfaces/checkpoint.js';
import { MessageType, ExtensionMessage } from '../shared/types/messages.js';
import { generateId } from '../utils/helpers.js';

/**
 * Background service worker.
 * Routes messages between extension components and persists data.
 */
class BackgroundService {
  constructor() {
    this.init();
  }

  private init(): void {
    // Bootstraps listeners for messaging and lifecycle events.
    console.log('[AI Conversation Control] Background service initialized');

    // Listen for messages from content scripts and popup.
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle messages asynchronously; return true to keep the port open.
      this.handleMessage(message as ExtensionMessage, sender, sendResponse);
      // Return true to indicate we'll send a response asynchronously
      return true;
    });

    // Listen for extension installation/update.
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleInstall();
      } else if (details.reason === 'update') {
        this.handleUpdate(details.previousVersion || '');
      }
    });
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      // Central dispatcher for all messages.
      console.log('[Background] Received message', {
        type: message.type,
        sender: sender?.id,
        url: sender?.url
      });
      switch (message.type) {
        case MessageType.CHECKPOINT_CAPTURED:
          // Save a newly captured checkpoint.
          console.log('[Background] CHECKPOINT_CAPTURED', {
            hasCheckpoint: Boolean(message.data?.checkpoint),
            conversationId: message.data?.checkpoint?.conversationId,
            platform: message.data?.checkpoint?.platform
          });
          await this.handleCheckpointCaptured(message.data.checkpoint);
          sendResponse({ type: MessageType.SUCCESS });
          break;

        case MessageType.GET_CHECKPOINTS:
          // Return checkpoint list (optionally filtered/paginated).
          console.log('[Background] GET_CHECKPOINTS', message.data);
          const checkpoints = await StorageService.getAllCheckpoints(message.data);
          sendResponse({
            type: MessageType.CHECKPOINTS_RESPONSE,
            timestamp: Date.now(),
            data: {
              checkpoints,
              total: checkpoints.length
            }
          });
          break;

        case MessageType.GET_CONVERSATIONS:
          // Return conversation summary list.
          console.log('[Background] GET_CONVERSATIONS', message.data);
          const conversations = await StorageService.getAllConversations(
            message.data?.platform
          );
          sendResponse({
            type: MessageType.CONVERSATIONS_RESPONSE,
            timestamp: Date.now(),
            data: {
              conversations,
              total: conversations.length
            }
          });
          break;

        case MessageType.SEARCH_CHECKPOINTS:
          // Full-text search across checkpoints.
          console.log('[Background] SEARCH_CHECKPOINTS', message.data);
          const results = await StorageService.searchCheckpoints(
            message.data.query,
            message.data.platform
          );
          sendResponse({
            type: MessageType.SEARCH_RESULTS,
            timestamp: Date.now(),
            data: {
              checkpoints: results,
              total: results.length
            }
          });
          break;

        case MessageType.JUMP_TO_CHECKPOINT:
          // Open or focus the tab for a checkpoint.
          console.log('[Background] JUMP_TO_CHECKPOINT', message.data);
          await this.handleJumpToCheckpoint(message.data.checkpointId);
          sendResponse({ type: MessageType.SUCCESS });
          break;

        case MessageType.DELETE_CHECKPOINT:
          // Remove a checkpoint by ID.
          console.log('[Background] DELETE_CHECKPOINT', message.data);
          await StorageService.deleteCheckpoint(message.data.checkpointId);
          sendResponse({ type: MessageType.SUCCESS });
          break;

        case MessageType.UPDATE_CHECKPOINT:
          // Update checkpoint metadata.
          console.log('[Background] UPDATE_CHECKPOINT', message.data);
          await StorageService.updateCheckpoint(
            message.data.checkpointId,
            message.data.updates
          );
          sendResponse({ type: MessageType.SUCCESS });
          break;

        case MessageType.PAGE_LOADED:
          // Informational signal from content script.
          console.log('[Background] PAGE_LOADED', message.data);
          sendResponse({ type: MessageType.SUCCESS });
          break;

        default:
          // Defensive handling for unknown message types.
          console.warn('[Background] Unknown message type:', message.type);
          sendResponse({
            type: MessageType.ERROR,
            data: { error: 'Unknown message type' }
          });
      }
    } catch (error) {
      // Catch-all error handler for message processing.
      console.error('[Background] Error handling message:', error);
      sendResponse({
        type: MessageType.ERROR,
        timestamp: Date.now(),
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  private async handleCheckpointCaptured(
    checkpoint: import('../shared/interfaces/checkpoint.js').Checkpoint
  ): Promise<void> {
    // Check for existing checkpoint with same ID to avoid duplicates.
    const existing = await StorageService.getCheckpoint(checkpoint.id);
    if (existing) {
      console.log('[Background] Checkpoint already exists, skipping:', checkpoint.id);
      return;
    }

    await StorageService.saveCheckpoint(checkpoint);
    console.log('[Background] Checkpoint saved:', checkpoint.id);

    // Show badge to indicate a new checkpoint was saved.
    await this.updateBadge();
  }

  private async handleJumpToCheckpoint(checkpointId: string): Promise<void> {
    const checkpoint = await StorageService.getCheckpoint(checkpointId);

    if (!checkpoint) {
      throw new Error('Checkpoint not found');
    }

    const tab = await chrome.tabs.create({ url: checkpoint.url });
    if (!tab?.id) {
      console.warn('[Background] Jump tab created without ID');
      return;
    }

    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    this.waitForTabToLoadAndHighlight(tab.id, checkpoint);
  }

  private waitForTabToLoadAndHighlight(tabId: number, checkpoint: Checkpoint): void {
    const listener = async (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo): Promise<void> => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') {
        return;
      }

      chrome.tabs.onUpdated.removeListener(listener);

      try {
        await chrome.tabs.sendMessage(tabId, {
          type: MessageType.HIGHLIGHT_MESSAGE,
          timestamp: Date.now(),
          data: {
            checkpointId: checkpoint.id,
            sequenceNumber: checkpoint.sequenceNumber,
            message: checkpoint.message
          }
        });
      } catch (error) {
        console.error('[Background] Failed to highlight checkpoint', error);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  }

  private async updateBadge(): Promise<void> {
    // Badge shows total number of checkpoints.
    const stats = await StorageService.getStorageStats();
    const badgeText = stats.checkpointCount > 0 ? stats.checkpointCount.toString() : '';

    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: '#10a37f' });
  }

  private async handleInstall(): Promise<void> {
    // Open onboarding page on first install.
    console.log('[Background] Extension installed');

    // Open onboarding page
    await chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/onboarding.html')
    });
  }

  private handleUpdate(previousVersion: string): void {
    // Placeholder for migration logic.
    console.log(`[Background] Extension updated from ${previousVersion}`);
    // Handle any migration logic here
  }
}

// Initialize background service
new BackgroundService();
