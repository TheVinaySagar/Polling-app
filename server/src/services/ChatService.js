import { generateId, getCurrentTimestamp, validateRequired, sanitizeString } from '../utils/helpers.js';

class ChatService {
  constructor() {
    // Store messages in memory instead of database
    this.messages = [];
  }

  async sendMessage(sender, message, isTeacher = false) {
    try {
      validateRequired(['sender', 'message'], { sender, message });

      const messageId = generateId();
      const chatMessage = {
        id: messageId,
        sender: sanitizeString(sender),
        message: sanitizeString(message),
        timestamp: getCurrentTimestamp(),
        isTeacher: Boolean(isTeacher)
      };

      // Store in memory instead of database
      this.messages.push(chatMessage);
      
      // Keep only last 100 messages to prevent memory issues
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
      }

      return chatMessage;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async getChatHistory(limit = 50) {
    try {
      // Return messages from memory, sorted by timestamp
      const sortedMessages = [...this.messages]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-limit);
      
      return sortedMessages;
    } catch (error) {
      throw new Error(`Failed to get chat history: ${error.message}`);
    }
  }

  async deleteMessage(messageId) {
    try {
      // Remove message from memory
      const initialLength = this.messages.length;
      this.messages = this.messages.filter(msg => msg.id !== messageId);
      return this.messages.length < initialLength;
    } catch (error) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  async clearChatHistory() {
    try {
      const deletedCount = this.messages.length;
      this.messages = [];
      return deletedCount;
    } catch (error) {
      throw new Error(`Failed to clear chat history: ${error.message}`);
    }
  }

  async getRecentMessages(minutes = 60) {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      const recentMessages = this.messages.filter(msg => 
        new Date(msg.timestamp) >= cutoffTime
      );
      return recentMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      throw new Error(`Failed to get recent messages: ${error.message}`);
    }
  }

  async getMessagesByUser(sender, limit = 20) {
    try {
      const userMessages = this.messages
        .filter(msg => msg.sender === sender)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      return userMessages;
    } catch (error) {
      throw new Error(`Failed to get messages by user: ${error.message}`);
    }
  }

  async getMessagesCount() {
    try {
      return this.messages.length;
    } catch (error) {
      throw new Error(`Failed to get messages count: ${error.message}`);
    }
  }

  async cleanupOldMessages() {
    try {
      // For in-memory storage, we don't need to cleanup old messages
      // as they're already cleared when server restarts or teacher disconnects
      return 0;
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
      return 0;
    }
  }
}

export const chatService = new ChatService();
