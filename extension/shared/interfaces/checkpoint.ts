/**
 * Represents a captured checkpoint in an AI conversation
 */
export interface Checkpoint {
  /** Unique identifier for this checkpoint */
  id: string;
  
  /** The AI platform (claude, chatgpt, gemini) */
  platform: Platform;
  
  /** Conversation/thread ID from the AI platform */
  conversationId: string;
  
  /** User's message content */
  message: string;
  
  /** Timestamp when the checkpoint was created */
  timestamp: number;
  
  /** URL to jump back to this exact message */
  url: string;
  
  /** Optional user-defined tags */
  tags?: string[];
  
  /** Optional user notes */
  notes?: string;
  
  /** Message sequence number in the conversation */
  sequenceNumber: number;
}

/**
 * Supported AI platforms
 */
export type Platform = 'claude' | 'chatgpt' | 'gemini';

/**
 * Conversation metadata
 */
export interface Conversation {
  /** Unique conversation ID */
  id: string;
  
  /** Platform where this conversation exists */
  platform: Platform;
  
  /** Conversation title (if available) */
  title?: string;
  
  /** First checkpoint timestamp */
  startedAt: number;
  
  /** Last checkpoint timestamp */
  lastUpdatedAt: number;
  
  /** Number of checkpoints in this conversation */
  checkpointCount: number;
  
  /** URL to the conversation */
  url: string;
}
