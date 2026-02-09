import { PlatformDetector } from './platform-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Detector for ChatGPT platform.
 * Responsible for locating user messages and extracting their text.
 */
export class ChatGPTDetector implements PlatformDetector {
  platform: Platform = 'chatgpt';
  private observer: MutationObserver | null = null;
  private processedMessages = new Set<string>();
  
  isActive(): boolean {
    // Match known ChatGPT hostnames.
    const active =
      window.location.hostname === 'chat.openai.com' ||
      window.location.hostname === 'chatgpt.com';
    console.log('[AI Conversation Control] ChatGPTDetector.isActive', {
      hostname: window.location.hostname,
      active
    });
    return active;
  }
  
  getConversationId(): string | null {
    // ChatGPT uses URL pattern: /c/{conversation-id}.
    const match = window.location.pathname.match(/\/c\/([a-f0-9-]+)/);
    const conversationId = match ? match[1] : null;
    console.log('[AI Conversation Control] ChatGPTDetector.getConversationId', {
      path: window.location.pathname,
      conversationId
    });
    return conversationId;
  }
  
  getConversationTitle(): string | null {
    // Try to find the conversation title.
    const titleElement = document.querySelector('h1');
    return titleElement?.textContent || null;
  }
  
  observeMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Observe the main container and scan added nodes for user messages.
    const messageContainer = document.querySelector('main') || document.body;

    console.log('[AI Conversation Control] ChatGPTDetector.observeMessages', {
      hasContainer: Boolean(messageContainer),
      containerTag: messageContainer?.tagName
    });
    
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length === 0) continue;
        
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          
          // ChatGPT user messages typically have role attr or the bubble class.
          const userMessages = node.querySelectorAll(
            '[data-message-author-role="user"], .user-message-bubble-color'
          );
          
          if (this.isUserMessage(node)) {
            this.processUserMessage(node, callback);
          }
          
          userMessages.forEach(msgElement => {
            if (msgElement instanceof HTMLElement) {
              this.processUserMessage(msgElement, callback);
            }
          });
        });
      }
    });
    
    this.observer.observe(messageContainer, {
      childList: true,
      subtree: true
    });
    
    this.processExistingMessages(callback);
  }
  
  private isUserMessage(element: HTMLElement): boolean {
    // Check multiple indicators because ChatGPT DOM changes frequently.
    return (
      element.getAttribute('data-message-author-role') === 'user' ||
      element.classList.contains('user-message-bubble-color') ||
      element.querySelector('[data-message-author-role="user"]') !== null ||
      element.querySelector('.user-message-bubble-color') !== null
    );
  }
  
  private processUserMessage(element: HTMLElement, callback: (message: string, element: HTMLElement) => void): void {
    // Prefer the bubble itself if the node contains it.
    const bubble = element.classList.contains('user-message-bubble-color')
      ? element
      : (element.querySelector('.user-message-bubble-color') as HTMLElement | null);
    const target = bubble || element;

    // Use a stable ID to avoid duplicate processing.
    const messageId = this.getMessageId(element);
    if (this.processedMessages.has(messageId)) {
      return;
    }
    
    // Extract and emit text content.
    const messageText = this.extractMessageText(target);
    if (messageText && messageText.trim().length > 0) {
      this.processedMessages.add(messageId);
      callback(messageText, target);
    }
  }
  
  private processExistingMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Process messages already on the page.
    const userMessages = document.querySelectorAll(
      '[data-message-author-role="user"], .user-message-bubble-color'
    );
    console.log('[AI Conversation Control] ChatGPTDetector.processExistingMessages', {
      count: userMessages.length
    });
    userMessages.forEach(msgElement => {
      if (msgElement instanceof HTMLElement) {
        this.processUserMessage(msgElement, callback);
      }
    });
  }
  
  private getMessageId(element: HTMLElement): string {
    // Best-effort ID for deduplication.
    return element.getAttribute('data-message-id') || 
           element.id || 
           this.extractMessageText(element).substring(0, 50);
  }
  
  private extractMessageText(element: HTMLElement): string {
    // ChatGPT message content is typically in a .whitespace-pre-wrap element.
    const contentElement = element.querySelector('.whitespace-pre-wrap, [data-message-content]');
    
    if (contentElement) {
      const clone = contentElement.cloneNode(true) as HTMLElement;
      // Remove inline UI from the text content.
      clone.querySelectorAll('button, svg, [role="button"]').forEach(el => el.remove());
      return clone.textContent?.trim() || '';
    }
    
    return element.textContent?.trim() || '';
  }
  
  cleanup(): void {
    // Stop observing and clear local cache.
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.processedMessages.clear();
  }
  
  getMessageUrl(conversationId: string, messageElement?: HTMLElement): string {
    // Build a URL to return to the conversation.
    return `${window.location.origin}/c/${conversationId}`;
  }
  
  findMessageElement(sequenceNumber: number): HTMLElement | null {
    // Locate the nth user message in the thread.
    const userMessages = document.querySelectorAll(
      '[data-message-author-role="user"], .user-message-bubble-color'
    );
    return userMessages[sequenceNumber] as HTMLElement || null;
  }
}
