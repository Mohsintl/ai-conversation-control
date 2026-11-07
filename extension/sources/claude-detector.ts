import { BaseDetector } from './base-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';
import { PLATFORM_CONFIGS, PlatformConfig } from './detector-configs.js';

/**
 * Detector for Claude.ai platform.
 * Inherits shared logic from BaseDetector.
 */
export class ClaudeDetector extends BaseDetector {
  platform: Platform = 'claude';
  protected config: PlatformConfig = PLATFORM_CONFIGS.claude;

  /**
   * Claude specific override for message URL.
   * Claude uses /chat/{id}.
   */
  getMessageUrl(conversationId: string, messageElement?: HTMLElement): string {
    return `https://claude.ai/chat/${conversationId}`;
  }
}
