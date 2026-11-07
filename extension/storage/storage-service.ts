import { Checkpoint, Conversation, Platform } from '../shared/interfaces/checkpoint.js';

/**
 * Storage keys used in Chrome storage.
 */
const STORAGE_KEYS = {
  CHECKPOINTS: 'checkpoints',
  CONVERSATIONS: 'conversations',
  SETTINGS: 'settings'
} as const;

/**
 * Storage service for managing checkpoints and conversations.
 * Wraps chrome.storage.local with helpers for filtering and updates.
 */
export class StorageService {
  /**
   * Save a new checkpoint.
   */
  static async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    const checkpoints = await this.getAllCheckpoints();
    checkpoints.push(checkpoint);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.CHECKPOINTS]: checkpoints
    });
    
    // Update conversation metadata.
    await this.updateConversationMetadata(checkpoint);
  }

  /**
   * Get all checkpoints, optionally filtered.
   */
  static async getAllCheckpoints(filters?: {
    conversationId?: string;
    platform?: Platform;
    limit?: number;
    offset?: number;
  }): Promise<Checkpoint[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CHECKPOINTS);
    let checkpoints: Checkpoint[] = result[STORAGE_KEYS.CHECKPOINTS] || [];
    
    // Apply filters.
    if (filters?.conversationId) {
      checkpoints = checkpoints.filter(cp => cp.conversationId === filters.conversationId);
    }
    
    if (filters?.platform) {
      checkpoints = checkpoints.filter(cp => cp.platform === filters.platform);
    }
    
    // Sort by timestamp (newest first).
    checkpoints.sort((a, b) => b.timestamp - a.timestamp);
    
    // Apply pagination.
    if (filters?.offset !== undefined) {
      checkpoints = checkpoints.slice(filters.offset);
    }
    
    if (filters?.limit !== undefined) {
      checkpoints = checkpoints.slice(0, filters.limit);
    }
    
    return checkpoints;
  }

  /**
   * Search checkpoints by message content.
   */
  static async searchCheckpoints(query: string, platform?: Platform): Promise<Checkpoint[]> {
    const checkpoints = await this.getAllCheckpoints({ platform });
    const lowerQuery = query.toLowerCase();
    
    return checkpoints.filter(checkpoint => 
      checkpoint.message.toLowerCase().includes(lowerQuery) ||
      checkpoint.notes?.toLowerCase().includes(lowerQuery) ||
      checkpoint.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get a specific checkpoint by ID.
   */
  static async getCheckpoint(id: string): Promise<Checkpoint | null> {
    const checkpoints = await this.getAllCheckpoints();
    return checkpoints.find(cp => cp.id === id) || null;
  }

  /**
   * Update a checkpoint.
   */
  static async updateCheckpoint(id: string, updates: Partial<Checkpoint>): Promise<void> {
    const checkpoints = await this.getAllCheckpoints();
    const index = checkpoints.findIndex(cp => cp.id === id);
    
    if (index !== -1) {
      checkpoints[index] = { ...checkpoints[index], ...updates };
      await chrome.storage.local.set({
        [STORAGE_KEYS.CHECKPOINTS]: checkpoints
      });
    }
  }

  /**
   * Delete a checkpoint.
   */
  static async deleteCheckpoint(id: string): Promise<void> {
    const checkpoints = await this.getAllCheckpoints();
    const filtered = checkpoints.filter(cp => cp.id !== id);
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.CHECKPOINTS]: filtered
    });
  }

  /**
   * Get all conversations with metadata.
   */
  static async getAllConversations(platform?: Platform): Promise<Conversation[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CONVERSATIONS);
    let conversations: Conversation[] = result[STORAGE_KEYS.CONVERSATIONS] || [];
    
    if (platform) {
      conversations = conversations.filter(conv => conv.platform === platform);
    }
    
    // Sort by last updated (newest first).
    conversations.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
    
    return conversations;
  }

  /**
   * Update conversation metadata when a checkpoint is added.
   */
  private static async updateConversationMetadata(checkpoint: Checkpoint): Promise<void> {
    const conversations = await this.getAllConversations();
    const existingIndex = conversations.findIndex(
      conv => conv.id === checkpoint.conversationId
    );
    
    if (existingIndex !== -1) {
      // Update existing conversation.
      conversations[existingIndex].lastUpdatedAt = checkpoint.timestamp;
      conversations[existingIndex].checkpointCount++;
    } else {
      // Create new conversation entry.
      const newConversation: Conversation = {
        id: checkpoint.conversationId,
        platform: checkpoint.platform,
        startedAt: checkpoint.timestamp,
        lastUpdatedAt: checkpoint.timestamp,
        checkpointCount: 1,
        url: checkpoint.url
      };
      conversations.push(newConversation);
    }
    
    await chrome.storage.local.set({
      [STORAGE_KEYS.CONVERSATIONS]: conversations
    });
  }

  /**
   * Clear all data (for debugging/testing).
   */
  static async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }

  /**
   * Get storage usage statistics.
   */
  static async getStorageStats(): Promise<{
    checkpointCount: number;
    conversationCount: number;
    bytesUsed: number;
  }> {
    const checkpoints = await this.getAllCheckpoints();
    const conversations = await this.getAllConversations();
    const bytesInUse = await chrome.storage.local.getBytesInUse();
    
    return {
      checkpointCount: checkpoints.length,
      conversationCount: conversations.length,
      bytesUsed: bytesInUse
    };
  }
}
