import { ClaudeDetector } from '../sources/claude-detector.js';
import { ChatGPTDetector } from '../sources/chatgpt-detector.js';
import { GeminiDetector } from '../sources/gemini-detector.js';
import { PlatformDetector } from '../sources/platform-detector.js';
import { MessageType } from '../shared/types/messages.js';
import { Checkpoint } from '../shared/interfaces/checkpoint.js';
import { generateId } from '../utils/helpers.js';

/**
 * Content script that runs on AI platform pages.
 * Detects the current platform, observes user messages, and sends checkpoints
 * to the background service worker.
 */
class ContentScript {
  private detector: PlatformDetector | null = null;
  private messageCount = 0;

  constructor() {
    this.init();
  }

  private init(): void {
    // Entry point for the content script.
    console.log('[AI Conversation Control] Content script loaded', {
      href: window.location.href,
      hostname: window.location.hostname
    });
    
    // Detect which platform we're on.
    const detectors = [
      new ClaudeDetector(),
      new ChatGPTDetector(),
      new GeminiDetector()
    ];

    for (const detector of detectors) {
      // Each detector decides if the current page matches its platform.
      const active = detector.isActive();
      console.log('[AI Conversation Control] Detector check', {
        platform: detector.platform,
        active
      });
      if (active) {
        this.detector = detector;
        console.log('[AI Conversation Control] Detected platform', {
          platform: detector.platform
        });
        break;
      }
    }

    if (!this.detector) {
      // Bail early if we aren't on a supported platform.
      console.warn('[AI Conversation Control] No supported platform detected');
      return;
    }

    // Start observing messages in the page.
    this.startObserving();
    
    // Notify background script that page is loaded.
    this.notifyPageLoaded();
  }

  private startObserving(): void {
    if (!this.detector) return;

    // Begin DOM observation to detect user messages.
    console.log('[AI Conversation Control] Starting observation', {
      platform: this.detector.platform,
      conversationId: this.detector.getConversationId()
    });

    this.detector.observeMessages((message: string, element: HTMLElement) => {
      // Callback for each user message detected by the platform detector.
      console.log('[AI Conversation Control] User message detected', {
        preview: message.substring(0, 80),
        length: message.length
      });
      this.captureCheckpoint(message, element);
    });
  }

  private captureCheckpoint(message: string, element: HTMLElement): void {
    if (!this.detector) return;

    // Extract conversation ID for the current page.
    const conversationId = this.detector.getConversationId();
    if (!conversationId) {
      console.warn('[AI Conversation Control] Could not get conversation ID', {
        href: window.location.href
      });
      return;
    }

    const checkpoint: Omit<Checkpoint, 'id'> = {
      platform: this.detector.platform,
      conversationId,
      message,
      timestamp: Date.now(),
      url: this.detector.getMessageUrl(conversationId, element),
      sequenceNumber: this.messageCount++
    };

    // Send checkpoint to background script for persistence.
    console.log('[AI Conversation Control] Sending checkpoint', {
      platform: checkpoint.platform,
      conversationId: checkpoint.conversationId,
      sequenceNumber: checkpoint.sequenceNumber
    });

    chrome.runtime.sendMessage({
      type: MessageType.CHECKPOINT_CAPTURED,
      timestamp: Date.now(),
      data: { checkpoint }
    }).then((response) => {
      console.log('[AI Conversation Control] Checkpoint response', response);
    }).catch(error => {
      console.error('[AI Conversation Control] Failed to send checkpoint', error);
    });

    // Visual feedback (optional).
    this.showCheckpointFeedback(element);
  }

  private showCheckpointFeedback(element: HTMLElement): void {
    // Add a subtle visual indicator that the message was captured.
    const indicator = document.createElement('div');
    indicator.textContent = '✓';
    indicator.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      color: #10a37f;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    
    const container = element.closest('[data-message-id], .message') as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      indicator.style.position = 'fixed';
      indicator.style.top = `${rect.top + 5}px`;
      indicator.style.right = `${window.innerWidth - rect.right + 5}px`;
      
      document.body.appendChild(indicator);
      
      // Fade in.
      setTimeout(() => {
        indicator.style.opacity = '1';
      }, 10);
      
      // Fade out and remove.
      setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
      }, 2000);
    }
  }

  private notifyPageLoaded(): void {
    // Send a non-critical signal that the page is ready.
    console.log('[AI Conversation Control] Notifying page loaded');
    chrome.runtime.sendMessage({
      type: MessageType.PAGE_LOADED,
      timestamp: Date.now(),
      data: {
        platform: this.detector?.platform,
        conversationId: this.detector?.getConversationId()
      }
    }).then((response) => {
      console.log('[AI Conversation Control] Page loaded response', response);
    }).catch(error => {
      console.error('[AI Conversation Control] Failed to notify page loaded', error);
    });
  }

  cleanup(): void {
    // Clean up observers when the page unloads.
    if (this.detector) {
      this.detector.cleanup();
    }
  }
}

// Initialize content script.
const contentScript = new ContentScript();

// Cleanup on page unload.
window.addEventListener('beforeunload', () => {
  contentScript.cleanup();
});
