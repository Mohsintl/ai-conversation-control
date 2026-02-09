import { PlatformDetector } from './platform-detector.js';
import { Platform } from '../shared/interfaces/checkpoint.js';
import { PlatformConfig } from './detector-configs.js';

/**
 * Base class for platform detectors providing shared logic.
 */
export abstract class BaseDetector implements PlatformDetector {
    abstract platform: Platform;
    protected abstract config: PlatformConfig;
    protected observer: MutationObserver | null = null;
    protected processedMessages = new Set<string>();

    isActive(): boolean {
        const active = this.config.hostnames.includes(window.location.hostname);
        console.log(`[AI Conversation Control] ${this.platform} Detector.isActive`, {
            hostname: window.location.hostname,
            active
        });
        return active;
    }

    getConversationId(): string | null {
        const match = window.location.pathname.match(this.config.urlPathPattern);
        return match ? match[1] : null;
    }

    getConversationTitle(): string | null {
        if (!this.config.selectors.title) return null;
        const titleElement = document.querySelector(this.config.selectors.title);
        return titleElement?.textContent || null;
    }

    observeMessages(callback: (message: string, element: HTMLElement, messageId: string) => void): void {
        const messageContainer = document.querySelector(this.config.selectors.mainContainer) || document.body;

        console.log(`[AI Conversation Control] ${this.platform} Detector.observeMessages`, {
            hasContainer: Boolean(messageContainer),
            containerTag: messageContainer?.tagName
        });

        this.observer = new MutationObserver((mutations) => {
            const pendingElements = new Set<HTMLElement>();

            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;

                    if (this.isUserMessage(node)) {
                        pendingElements.add(node);
                    }

                    node.querySelectorAll(this.config.selectors.userMessage).forEach(msgElement => {
                        if (msgElement instanceof HTMLElement) {
                            pendingElements.add(msgElement);
                        }
                    });
                });
            }

            pendingElements.forEach(element => {
                this.processUserMessage(element, callback);
            });
        });

        this.observer.observe(messageContainer, {
            childList: true,
            subtree: true
        });

        this.processExistingMessages(callback);
    }

    protected isUserMessage(element: HTMLElement): boolean {
        const { userMessage } = this.config.selectors;
        return (
            element.matches(userMessage) ||
            element.querySelector(userMessage) !== null
        );
    }

    protected processUserMessage(element: HTMLElement, callback: (message: string, element: HTMLElement, messageId: string) => void): void {
        // Prefer the specific message element if applying the selector yields child nodes.
        const target = element.matches(this.config.selectors.userMessage)
            ? element
            : (element.querySelector(this.config.selectors.userMessage) as HTMLElement | null) || element;

        const messageId = this.getMessageId(target);
        if (!messageId || this.processedMessages.has(messageId)) {
            return;
        }

        const messageText = this.extractMessageText(target);
        if (messageText && messageText.trim().length > 0) {
            this.processedMessages.add(messageId);
            callback(messageText, target, messageId);

            // Keep the set from growing indefinitely.
            if (this.processedMessages.size > 1000) {
                const first = this.processedMessages.values().next().value;
                if (first !== undefined) this.processedMessages.delete(first);
            }
        }
    }

    protected processExistingMessages(callback: (message: string, element: HTMLElement, messageId: string) => void): void {
        const userMessages = document.querySelectorAll(this.config.selectors.userMessage);
        userMessages.forEach(msgElement => {
            if (msgElement instanceof HTMLElement) {
                this.processUserMessage(msgElement, callback);
            }
        });
    }

    protected getMessageId(element: HTMLElement): string {
        const dataId = element.getAttribute('data-message-id') ||
            element.closest('[data-message-id]')?.getAttribute('data-message-id');

        if (dataId) return `id:${dataId}`;

        const text = this.extractMessageText(element).substring(0, 100);
        return `text:${text}`;
    }

    protected extractMessageText(element: HTMLElement): string {
        const { messageText } = this.config.selectors;
        const contentElement = element.querySelector(messageText) || element;

        const clone = contentElement.cloneNode(true) as HTMLElement;
        // Remove common UI elements that might be embedded in messages.
        clone.querySelectorAll('button, svg, [role="button"], .sr-only').forEach(el => el.remove());
        return clone.textContent?.trim() || '';
    }

    cleanup(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.processedMessages.clear();
    }

    getMessageUrl(conversationId: string, messageElement?: HTMLElement): string {
        return `${window.location.origin}${window.location.pathname.startsWith('/chat') ? '/chat' : '/c'}/${conversationId}`;
    }

    findMessageElement(sequenceNumber: number): HTMLElement | null {
        const userMessages = document.querySelectorAll(this.config.selectors.userMessage);
        return userMessages[sequenceNumber] as HTMLElement || null;
    }
}
