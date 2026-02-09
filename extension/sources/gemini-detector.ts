import { PlatformDetector } from './platform-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Detector for Google Gemini platform.
 * Uses best-effort selectors because Gemini DOM changes frequently.
 */
export class GeminiDetector implements PlatformDetector {
  platform: Platform = 'gemini';
  private observer: MutationObserver | null = null;
  private processedMessages = new Set<string>();
  
  isActive(): boolean {
    // Match Gemini host.
    return window.location.hostname === 'gemini.google.com';
  }
  
  getConversationId(): string | null {
    // Gemini might use different URL patterns, adjust as needed.
    const match = window.location.pathname.match(/\/chat\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : window.location.pathname;
  }
  
  getConversationTitle(): string | null {
    // Try to find conversation title in Gemini UI.
    const titleElement = document.querySelector('h1, [role="heading"]');
    return titleElement?.textContent || null;
  }
  
  observeMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Observe the main container and scan added nodes for user messages.
    const messageContainer = document.querySelector('main') || document.body;
    
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length === 0) continue;
        
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          
          // Gemini uses specific patterns - adjust based on actual DOM structure.
          const userMessages = node.querySelectorAll('[data-test-id*="user"], .user-message');
          
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
    // Adjust these selectors based on Gemini's actual DOM structure.
    const testId = element.getAttribute('data-test-id') || '';
    return (
      testId.includes('user') ||
      element.classList.contains('user-message') ||
      element.querySelector('[data-test-id*="user"]') !== null
    );
  }
  
  private processUserMessage(element: HTMLElement, callback: (message: string, element: HTMLElement) => void): void {
    // Deduplicate by ID and emit text content.
    const messageId = this.getMessageId(element);
    if (this.processedMessages.has(messageId)) {
      return;
    }
    
    const messageText = this.extractMessageText(element);
    if (messageText && messageText.trim().length > 0) {
      this.processedMessages.add(messageId);
      callback(messageText, element);
    }
  }
  
  private processExistingMessages(callback: (message: string, element: HTMLElement) => void): void {
    // Process messages already on the page.
    const userMessages = document.querySelectorAll('[data-test-id*="user"], .user-message');
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
    // Remove UI chrome from message content.
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
    return `https://gemini.google.com/chat/${conversationId}`;
  }
  
  findMessageElement(sequenceNumber: number): HTMLElement | null {
    // Locate the nth user message in the thread.
    const userMessages = document.querySelectorAll('[data-test-id*="user"], .user-message');
    return userMessages[sequenceNumber] as HTMLElement || null;
  }
}
