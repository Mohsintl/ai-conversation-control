import { Checkpoint, Conversation, Platform } from '../interfaces/checkpoint.js';

/**
 * Message types for communication between extension components
 */
export enum MessageType {
  // From content script to background
  CHECKPOINT_CAPTURED = 'checkpoint_captured',
  PAGE_LOADED = 'page_loaded',
  
  // From popup to background
  GET_CHECKPOINTS = 'get_checkpoints',
  GET_CONVERSATIONS = 'get_conversations',
  SEARCH_CHECKPOINTS = 'search_checkpoints',
  DELETE_CHECKPOINT = 'delete_checkpoint',
  UPDATE_CHECKPOINT = 'update_checkpoint',
  JUMP_TO_CHECKPOINT = 'jump_to_checkpoint',
  
  // From background to content script
  HIGHLIGHT_MESSAGE = 'highlight_message',
  
  // Responses
  CHECKPOINTS_RESPONSE = 'checkpoints_response',
  CONVERSATIONS_RESPONSE = 'conversations_response',
  SEARCH_RESULTS = 'search_results',
  ERROR = 'error',
  SUCCESS = 'success'
}

/**
 * Base message structure
 */
export type BaseMessage<T extends MessageType = MessageType> = {
  type: T;
  // Unix timestamp (ms) set by sender.
  timestamp: number;
};

/**
 * Message sent when a checkpoint is captured
 */
export type CheckpointCapturedMessage = BaseMessage<
  MessageType.CHECKPOINT_CAPTURED
> & {
  data: {
    checkpoint: Omit<Checkpoint, 'id'>;
  };
};

/**
 * Request to get checkpoints
 */
export type GetCheckpointsMessage = BaseMessage<
  MessageType.GET_CHECKPOINTS
> & {
  // Optional filters/pagination for retrieving checkpoints.
  data?: {
    conversationId?: string;
    platform?: Platform;
    limit?: number;
    offset?: number;
  };
};

/**
 * Request to get conversations
 */
export type GetConversationsMessage = BaseMessage<
  MessageType.GET_CONVERSATIONS
> & {
  // Optional filters/pagination for retrieving conversations.
  data?: {
    platform?: Platform;
    limit?: number;
    offset?: number;
  };
};

/**
 * Request to search checkpoints
 */
export type SearchCheckpointsMessage = BaseMessage<
  MessageType.SEARCH_CHECKPOINTS
> & {
  data: {
    query: string;
    platform?: Platform;
  };
};

/**
 * Request to jump to a checkpoint
 */
export type JumpToCheckpointMessage = BaseMessage<
  MessageType.JUMP_TO_CHECKPOINT
> & {
  data: {
    checkpointId: string;
  };
};

/**
 * Request to delete a checkpoint
 */
export type DeleteCheckpointMessage = BaseMessage<
  MessageType.DELETE_CHECKPOINT
> & {
  data: {
    checkpointId: string;
  };
};

/**
 * Request to update a checkpoint
 */
export type UpdateCheckpointMessage = BaseMessage<
  MessageType.UPDATE_CHECKPOINT
> & {
  data: {
    checkpointId: string;
    updates: Partial<Checkpoint>;
  };
};

/**
 * Message sent when a page is loaded
 */
export type PageLoadedMessage = BaseMessage<MessageType.PAGE_LOADED> & {
  data?: {
    platform?: Platform;
    conversationId?: string;
  };
};

export type HighlightMessage = BaseMessage<MessageType.HIGHLIGHT_MESSAGE> & {
  data: {
    checkpointId: string;
    sequenceNumber?: number;
    message?: string;
  };
};

/**
 * Response with checkpoints
 */
export type CheckpointsResponseMessage = BaseMessage<
  MessageType.CHECKPOINTS_RESPONSE
> & {
  data: {
    checkpoints: Checkpoint[];
    total: number;
  };
};

/**
 * Response with conversations
 */
export type ConversationsResponseMessage = BaseMessage<
  MessageType.CONVERSATIONS_RESPONSE
> & {
  data: {
    conversations: Conversation[];
    total: number;
  };
};

/**
 * Response with search results
 */
export type SearchResultsMessage = BaseMessage<MessageType.SEARCH_RESULTS> & {
  data: {
    checkpoints: Checkpoint[];
    total: number;
  };
};

/**
 * Error response
 */
export type ErrorMessage = BaseMessage<MessageType.ERROR> & {
  data: {
    error: string;
  };
};

/**
 * Success response
 */
export type SuccessMessage = BaseMessage<MessageType.SUCCESS> & {
  data?: {
    message?: string;
  };
};

/**
 * Union type of all messages
 */
export type ExtensionMessage =
  | CheckpointCapturedMessage
  | GetCheckpointsMessage
  | GetConversationsMessage
  | SearchCheckpointsMessage
  | JumpToCheckpointMessage
  | DeleteCheckpointMessage
  | UpdateCheckpointMessage
  | PageLoadedMessage
  | HighlightMessage
  | CheckpointsResponseMessage
  | ConversationsResponseMessage
  | SearchResultsMessage
  | ErrorMessage
  | SuccessMessage;
