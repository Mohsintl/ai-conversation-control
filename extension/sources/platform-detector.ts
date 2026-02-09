import { Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Interface for platform-specific message detection and extraction.
 * Each platform implements its own DOM selectors and extraction logic.
 */
export interface PlatformDetector {
  /** Platform identifier. */
  platform: Platform;

  /** Check if the current page is this platform. */
  isActive(): boolean;

  /** Get the conversation ID from the current page. */
  getConversationId(): string | null;

  /** Get the conversation title if available. */
  getConversationTitle(): string | null;

  /** Observe for new user messages. */
  observeMessages(callback: (message: string, element: HTMLElement, messageId: string) => void): void;

  /** Clean up observers. */
  cleanup(): void;

  /** Get the URL for a specific message (for jump-back functionality). */
  getMessageUrl(conversationId: string, messageElement?: HTMLElement): string;

  /** Find the message element that corresponds to a checkpoint. */
  findMessageElement(sequenceNumber: number): HTMLElement | null;
}
