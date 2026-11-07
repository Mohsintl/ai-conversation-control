import { BaseDetector } from './base-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';
import { PLATFORM_CONFIGS, PlatformConfig } from './detector-configs.js';

/**
 * Detector for ChatGPT platform.
 * Inherits shared logic from BaseDetector.
 */
export class ChatGPTDetector extends BaseDetector {
  platform: Platform = 'chatgpt';
  protected config: PlatformConfig = PLATFORM_CONFIGS.chatgpt;

  /**
   * ChatGPT specific override for message URL.
   * ChatGPT uses /c/{id}.
   */
  getMessageUrl(conversationId: string, messageElement?: HTMLElement): string {
    return `${window.location.origin}/c/${conversationId}`;
  }
}
