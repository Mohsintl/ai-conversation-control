import { BaseDetector } from './base-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';
import { PLATFORM_CONFIGS, PlatformConfig } from './detector-configs.js';

/**
 * Detector for Google Gemini platform.
 * Inherits shared logic from BaseDetector.
 */
export class GeminiDetector extends BaseDetector {
  platform: Platform = 'gemini';
  protected config: PlatformConfig = PLATFORM_CONFIGS.gemini;

  /**
   * Gemini specific override for message URL.
   * Gemini uses /chat/{id}.
   */
  getMessageUrl(conversationId: string, messageElement?: HTMLElement): string {
    return `https://gemini.google.com/chat/${conversationId}`;
  }
}
