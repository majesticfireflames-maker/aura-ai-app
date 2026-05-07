// messageBus.js - ONLY ERROR HANDLING FIX
export class MessageBus {
  constructor() {
    this.agents = new Map();
    this.conversations = [];
    this.requestTracker = new Map();
    this.requestTimestamps = new Map();
    
    console.log('🚀 MessageBus started');
    this.startCleanup();
  }
  
  // === CRITICAL FIX: Better error handling ===
  async sendMessageObject(messageObj) {
    if (!messageObj || !messageObj.to || !messageObj.content) {
      console.error('❌ Invalid message object:', messageObj);
      return {
        reply: 'Invalid message format',
        showToUser: false,
        error: 'INVALID_MESSAGE'
      };
    }
    
    const { to: receiverId, content, from: senderId = 'user', userId, type = 'message' } = messageObj;
    
    // Create unique request ID
    const requestId = `${senderId}-${receiverId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for duplicate requests
    if (this.isDuplicateRequest(senderId, receiverId, content)) {
      console.log(`⏳ Skipping duplicate request: ${senderId} → ${receiverId}`);
      return {
        reply: `(Already processing your request to ${receiverId})`,
        showToUser: false,
        duplicate: true
      };
    }
    
    // Mark as processing
    this.requestTracker.set(requestId, true);
    this.requestTimestamps.set(requestId, Date.now());
    
    console.log(`📤 ${senderId} → ${receiverId} [${type}]: "${this.truncate(content, 60)}"`);
    
    const receiver = this.agents.get(receiverId);
    
    if (!receiver) {
      console.error(`❌ Agent not found: ${receiverId}`);
      console.log(`Available agents:`, Array.from(this.agents.keys()));
      
      // Clean up
      this.requestTracker.delete(requestId);
      this.requestTimestamps.delete(requestId);
      
      return {
        reply: `Sorry, the ${receiverId} agent is not available right now.`,
        showToUser: true,
        error: 'AGENT_NOT_FOUND',
        availableAgents: Array.from(this.agents.keys())
      };
    }
    
    // Set timeout for response (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Agent timeout after 30 seconds')), 30000);
    });
    
    try {
      // Prepare message object for agent
      const agentMessage = {
        from: senderId,
        content: content,
        type: type,
        timestamp: new Date().toISOString(),
        userId: userId || (receiver.currentUserId ? receiver.currentUserId : null),
        requestId: requestId
      };
      
      // Race between agent response and timeout
      const response = await Promise.race([
        receiver.receiveMessage(agentMessage),
        timeoutPromise
      ]);
      
      // Clean up
      this.requestTracker.delete(requestId);
      this.requestTimestamps.delete(requestId);
      
      // Validate and format response
      const formattedResponse = this.formatAgentResponse(response, receiverId, senderId);
      
      // Store conversation if relevant
      if (formattedResponse.showToUser && senderId === 'user') {
        this.storeConversation(senderId, receiverId, content, formattedResponse.reply, userId);
      }
      
      console.log(`✅ ${receiverId} → ${senderId}: Response sent (${formattedResponse.reply.length} chars)`);
      return formattedResponse;
      
    } catch (error) {
      console.error(`🔥 ${receiverId} error:`, error.message);
      
      // Clean up
      this.requestTracker.delete(requestId);
      this.requestTimestamps.delete(requestId);
      
      // Generate safe fallback response
      return this.generateFallbackResponse(receiverId, senderId, error);
    }
  }
  
  // === FIX: Better fallback responses ===
  generateFallbackResponse(receiverId, senderId, error) {
    // Different responses for user vs agent communication
    if (senderId === 'user') {
      const agentNames = {
        'nutrition': 'Nutrition Expert',
        'fitness': 'Fitness Pro',
        'finance': 'Finance Guru',
        'planner': 'Task Planner',
        'creative': 'Creative Muse',
        'mental': 'Mind Harmony',
        'general': 'Aura Prime'
      };
      
      const agentName = agentNames[receiverId] || receiverId;
      
      return {
        reply: `I'm experiencing some technical difficulties. ${agentName} will be back shortly. In the meantime, you can try another agent.`,
        showToUser: true,
        agent: receiverId,
        error: error.message,
        fallback: true
      };
    } else {
      // Agent-to-agent communication failed
      return {
        reply: `I couldn't process your request: ${error.message}`,
        showToUser: false,
        agent: receiverId,
        error: error.message,
        fallback: true
      };
    }
  }
  
  // ===== CONVERSATION STORAGE =====
  
  storeConversation(senderId, receiverId, message, response, userId) {
    const conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: senderId,
      to: receiverId,
      message: message,
      response: response,
      timestamp: new Date().toISOString(),
      userId: userId
    };
    
    this.conversations.push(conversation);
    
    // Keep only last 100 conversations
    if (this.conversations.length > 100) {
      this.conversations = this.conversations.slice(-100);
    }
    
    // Also store in agent's conversation history if available
    const agent = this.agents.get(receiverId);
    if (agent && agent.conversationHistory && Array.isArray(agent.conversationHistory)) {
      agent.conversationHistory.push({
        from: senderId,
        content: message,
        timestamp: new Date().toISOString()
      });
      
      // Limit agent's history too
      if (agent.conversationHistory.length > 20) {
        agent.conversationHistory = agent.conversationHistory.slice(-20);
      }
    }
    
    return conversation;
  }
  
  // ===== DUPLICATE DETECTION =====
  
  isDuplicateRequest(senderId, receiverId, content) {
    // Check for recent identical messages
    const recentTime = Date.now() - 5000; // 5 seconds ago
    
    // Check request timestamps
    for (const [reqId, timestamp] of this.requestTimestamps.entries()) {
      if (reqId.startsWith(`${senderId}-${receiverId}`) && timestamp > recentTime) {
        return true;
      }
    }
    
    // Check recent conversations
    const recentConvs = this.conversations.filter(conv => 
      conv.from === senderId && 
      conv.to === receiverId &&
      new Date(conv.timestamp).getTime() > recentTime
    );
    
    if (recentConvs.length > 0) {
      // Check if content is similar
      const lastConv = recentConvs[recentConvs.length - 1];
      if (this.isSimilarContent(lastConv.message, content)) {
        return true;
      }
    }
    
    return false;
  }
  
  isSimilarContent(text1, text2) {
    if (!text1 || !text2) return false;
    
    // Simple similarity check
    const t1 = text1.toLowerCase().replace(/\s+/g, ' ');
    const t2 = text2.toLowerCase().replace(/\s+/g, ' ');
    
    // Exact match
    if (t1 === t2) return true;
    
    // Check if one contains the other (for short messages)
    if (t1.length < 50 || t2.length < 50) {
      return t1.includes(t2) || t2.includes(t1);
    }
    
    return false;
  }
  
  // ===== UTILITY METHODS =====
  
  getAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      console.log(`⚠️ Agent ${agentId} not found`);
    }
    return agent;
  }
  
  listAgents() {
    const agents = Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      role: agent.role || 'agent',
      hasMemory: !!agent.getMemory,
      connected: true
    }));
    
    return agents;
  }
  
  getAgentCount() {
    return this.agents.size;
  }
  
  getAgentStatus() {
    const status = {};
    
    this.agents.forEach((agent, id) => {
      try {
        status[id] = {
          id,
          role: agent.role || 'agent',
          connected: true,
          ...(agent.getStatus ? agent.getStatus() : {}),
          memoryActive: agent.currentUserId && agent.currentUserId !== 'anonymous'
        };
      } catch (error) {
        status[id] = {
          id,
          role: 'agent',
          connected: true,
          error: error.message
        };
      }
    });
    
    return status;
  }
  
  broadcastToAll(message, senderId = 'system', exclude = []) {
    console.log(`📢 ${senderId} broadcasting to all agents`);
    
    const promises = [];
    this.agents.forEach((agent, agentId) => {
      if (!exclude.includes(agentId) && agentId !== senderId) {
        promises.push(
          this.sendMessageObject({
            to: agentId,
            content: message,
            from: senderId,
            type: 'broadcast',
            userId: agent.currentUserId || null
          }).catch(err => {
            console.log(`⚠️ Broadcast to ${agentId} failed:`, err.message);
            return null;
          })
        );
      }
    });
    
    return Promise.allSettled(promises);
  }
  
  getConversations(userId = null, limit = 20) {
    let filtered = this.conversations;
    
    if (userId) {
      filtered = filtered.filter(conv => conv.userId === userId);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return filtered.slice(0, limit);
  }
  
  clearConversations() {
    const count = this.conversations.length;
    this.conversations = [];
    console.log(`🗑️ Cleared ${count} conversations`);
    return count;
  }
  
  truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
  
  // ===== CLEANUP =====
  
  startCleanup() {
    setInterval(() => {
      this.cleanupOldRequests();
      this.cleanupOldConversations();
    }, 60000); // Every minute
  }
  
  cleanupOldRequests() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    let cleaned = 0;
    
    // Clean old request trackers
    for (const [reqId, timestamp] of this.requestTimestamps.entries()) {
      if (now - timestamp > maxAge) {
        this.requestTracker.delete(reqId);
        this.requestTimestamps.delete(reqId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old requests`);
    }
  }
  
  cleanupOldConversations() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    const initialCount = this.conversations.length;
    this.conversations = this.conversations.filter(conv => {
      const convTime = new Date(conv.timestamp);
      return now - convTime < maxAge;
    });
    
    const removed = initialCount - this.conversations.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned ${removed} old conversations`);
    }
  }
  
  // ===== STATISTICS =====
  
  getStats() {
    return {
      agents: this.agents.size,
      conversations: this.conversations.length,
      activeRequests: this.requestTracker.size,
      uptime: process.uptime ? Math.floor(process.uptime()) : 'unknown'
    };
  }
  
  // ===== AGENT DISCOVERY =====
  
  findAgentsByRole(roleKeyword) {
    const results = [];
    
    this.agents.forEach((agent, id) => {
      const agentRole = (agent.role || '').toLowerCase();
      if (agentRole.includes(roleKeyword.toLowerCase())) {
        results.push({
          id,
          role: agent.role,
          description: agent.description || 'No description'
        });
      }
    });
    
    return results;
  }
}

// Singleton instance with error handling
let messageBus;

try {
  messageBus = new MessageBus();
} catch (error) {
  console.error('❌ Failed to create MessageBus:', error);
  
  // Create a minimal fallback message bus
  messageBus = {
    agents: new Map(),
    registerAgent: (agentId, agent) => {
      console.log(`⚠️ Using fallback register for ${agentId}`);
      return false;
    },
    sendMessage: async (receiverId, message) => ({
      reply: `Message bus unavailable. Your message to ${receiverId}: "${message}"`,
      showToUser: true,
      fallback: true
    }),
    sendMessageObject: async (msgObj) => ({
      reply: `System temporarily unavailable.`,
      showToUser: true,
      fallback: true
    }),
    listAgents: () => [],
    getStats: () => ({ error: 'MessageBus failed to initialize' })
  };
}

export { messageBus };

// In messagebus.js - ADD THIS AT THE VERY END

// ==================== GLOBAL EXPOSURE ====================
if (typeof global !== 'undefined') {
  global.messageBus = messageBus;
}
if (typeof window !== 'undefined') {
  window.messageBus = messageBus;
}
if (typeof globalThis !== 'undefined') {
  globalThis.messageBus = messageBus;
}