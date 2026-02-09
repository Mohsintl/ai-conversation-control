import { PlatformDetector } from './platform-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Detector for Claude.ai platform.
 * Responsible for locating user messages and extracting their text.
 */
export class ClaudeDetector implements PlatformDetector {
  platform: Platform = 'claude';
  private observer: MutationObserver | null = null;
  private processedMessages = new Set<string>();
  
  isActive(): boolean {
    // Match Claude host.
    return window.location.hostname === 'claude.ai';
  }
  
  getConversationId(): string | null {
    // Claude uses URL pattern: /chat/{conversation-id}.
    const match = window.location.pathname.match(/\/chat\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  }
  
  getConversationTitle(): string | null {
    // Try to find the conversation title in the UI.
    const titleElement = document.querySelector('[data-testid="conversation-title"]');
    return titleElement?.textContent || null;
  }
  
  observeMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Look for user messages in Claude's UI.
    const messageContainer = document.querySelector('main') || document.body;
    
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length === 0) continue;
        
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          
          // Claude typically marks user messages with specific attributes or classes.
          const userMessages = node.querySelectorAll(
            '[data-is-user-message="true"], [data-testid="user-message"], .font-user-message'
          );
          
          // Also check if the node itself is a user message.
          if (this.isUserMessage(node)) {
            this.processUserMessage(node, callback);
          }
          
          // Process found messages.
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
    
    // Also process any existing messages on page load.
    this.processExistingMessages(callback);
  }
  
  private isUserMessage(element: HTMLElement): boolean {
    // Check various indicators that this is a user message.
    return (
      element.getAttribute('data-is-user-message') === 'true' ||
      element.getAttribute('data-testid') === 'user-message' ||
      element.classList.contains('font-user-message') ||
      element.querySelector('[data-is-user-message="true"]') !== null ||
      element.querySelector('[data-testid="user-message"]') !== null
    );
  }
  
  private processUserMessage(element: HTMLElement, callback: (message: string, element: HTMLElement) => void): void {
    // Get the message ID to avoid processing duplicates.
    const messageId = this.getMessageId(element);
    if (this.processedMessages.has(messageId)) {
      return;
    }
    
    // Extract and emit text content.
    const messageText = this.extractMessageText(element);
    if (messageText && messageText.trim().length > 0) {
      this.processedMessages.add(messageId);
      callback(messageText, element);
    }
  }
  
  private processExistingMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Process messages already on the page.
    const userMessages = document.querySelectorAll(
      '[data-is-user-message="true"], [data-testid="user-message"], .font-user-message'
    );
    userMessages.forEach(msgElement => {
      if (msgElement instanceof HTMLElement) {
        this.processUserMessage(msgElement, callback);
      }
    });
  }
  
  private getMessageId(element: HTMLElement): string {
    // Try to get a unique identifier for the message.
    return element.getAttribute('data-message-id') || 
           element.id || 
           this.extractMessageText(element).substring(0, 50);
  }
  
  private extractMessageText(element: HTMLElement): string {
    // Prefer the actual text node inside Claude's user message container.
    const contentElement = element.querySelector('.whitespace-pre-wrap');
    if (contentElement) {
      return contentElement.textContent?.trim() || '';
    }

    // Fallback: extract text from the entire element after removing UI chrome.
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('button, svg, [role="button"]').forEach(el => el.remove());
    return clone.textContent?.trim() || '';
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
    return `https://claude.ai/chat/${conversationId}`;
  }
  
  findMessageElement(sequenceNumber: number): HTMLElement | null {
    // Locate the nth user message in the thread.
    const userMessages = document.querySelectorAll(
      '[data-is-user-message="true"], [data-testid="user-message"], .font-user-message'
    );
    return userMessages[sequenceNumber] as HTMLElement || null;
  }
}
