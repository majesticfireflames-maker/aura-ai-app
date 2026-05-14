import { memoryManager } from './memory';

export class BaseAgent {
  constructor(id, role = 'Assistant') {
    this.id = id;
    this.role = role;
    this.messageBus = null;
    this.currentUserId = null;
     this.currentUserName = null; 
    this.conversationHistory = [];
    
    console.log(`🤖 ${this.id} agent created (${role})`);
  }
   setCurrentUser(userId, userName = null) {
    this.currentUserId = userId;
    this.currentUserName = userName;
    
    console.log(`${this.id} now talking to user: ${userName || 'Anonymous'} (${userId ? userId.substring(0, 8) + '...' : 'anonymous'})`);
    
    // Try to get username from memory if not provided
    if (userId && userId !== 'anonymous' && !userName) {
      this.loadUserNameFromMemory();
    }
  }
  
  // NEW METHOD: Set username
  setUserName(userName) {
    this.currentUserName = userName;
    console.log(`${this.id} knows user as: ${userName}`);
  }
  
  // NEW METHOD: Load username from memory
  async loadUserNameFromMemory() {
    if (!this.currentUserId || this.currentUserId === 'anonymous') {
      return;
    }
    
    try {
      const memory = this.memoryManager.getMemoryForUser(this.currentUserId);
      if (memory && memory.getPreferences) {
        const preferences = await memory.getPreferences('user_profile');
        if (preferences && preferences.user_name) {
          this.currentUserName = preferences.user_name.value;
          console.log(`${this.id} loaded username from memory: ${this.currentUserName}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ ${this.id} error loading username:`, error.message);
    }
  }
  
  // NEW METHOD: Greet user by name
  getPersonalizedGreeting() {
    if (this.currentUserName) {
      return `Hello ${this.currentUserName}! I'm your ${this.role}.`;
    }
    return `Hello! I'm your ${this.role}.`;
  }
  
  // MODIFIED: Include username in cross-agent knowledge
  async getCrossAgentKnowledge() {
    if (!this.currentUserId || !this.memoryManager) {
      return '';
    }
    
    try {
      const memory = this.memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory || !memory.whatUserToldOthers) {
        return '';
      }
      
      const knowledge = memory.whatUserToldOthers(this.id);
      if (!knowledge || knowledge.length === 0) {
        return '';
      }
      
      let context = '\n\n🔍 **What I know from other agents:**\n';
      knowledge.forEach((item, index) => {
        if (index < 3 && item.agent && item.message) {
          const agentName = this.getAgentDisplayName(item.agent);
          const timeAgo = this.getTimeAgo(item.timestamp);
          context += `• From ${agentName} (${timeAgo}): ${item.message.substring(0, 60)}...\n`;
        }
      });
      
      return context;
      
    } catch (error) {
      console.log(`⚠️ ${this.id} cross-agent knowledge error:`, error.message);
      return '';
    }
  }
  
  // === CRITICAL FIX: Make methods match memory.js ===
  async saveToMemory(message, response, type = 'conversation') {
    if (!this.currentUserId || this.currentUserId === 'anonymous') {
      console.log(`📝 ${this.id} skipping memory save - no user`);
      return false;
    }
    
    try {
      // FIXED: Use memoryManager.getMemoryForUser
      const memory = memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory) {
        console.log(`⚠️ ${this.id}: No memory available`);
        return false;
      }
      
      // Save user message
      await memory.userToldAgent(this.id, message, 'user_message');
      
      // Save agent response
      await memory.agentResponded(this.id, response, 'agent_response');
      
      console.log(`💾 ${this.id} saved to memory: "${this.truncate(message, 40)}"`);
      return true;
      
    } catch (error) {
      console.log(`⚠️ ${this.id} memory save error:`, error.message);
      return false;
    }
  }
  
  async getConversationContext() {
    if (!this.currentUserId || this.currentUserId === 'anonymous') {
      return 'No user context available';
    }
    
    try {
      const memory = memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory || !memory.getContextForAgent) {
        return 'Memory system unavailable';
      }
      
      const context = await memory.getContextForAgent(this.id);
      return context || 'No previous conversation';
      
    } catch (error) {
      console.log(`⚠️ ${this.id} context error:`, error.message);
      return 'Error loading context';
    }
  }
  
  async checkWhatUserToldOtherAgent(agentId) {
    if (!this.currentUserId || this.currentUserId === 'anonymous' || !agentId) {
      return [];
    }
    
    try {
      const memory = memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory || !memory.whatUserTold) {
        return [];
      }
      
      // FIXED: Use whatUserTold method
      return memory.whatUserTold(agentId) || [];
      
    } catch (error) {
      console.log(`⚠️ ${this.id} check other agent error:`, error.message);
      return [];
    }
  }
  
  async shareKnowledgeWithOtherAgents(message) {
    if (!this.currentUserId || this.currentUserId === 'anonymous' || !this.messageBus) {
      return;
    }
    
    try {
      const memory = memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory || !memory.addBroadcast) {
        return;
      }
      
      // Determine which agents should know
      const lowerMsg = message.toLowerCase();
      const targetAgents = new Set();
      
      // Nutrition-related
      if (lowerMsg.includes('food') || lowerMsg.includes('eat') || lowerMsg.includes('meal') || 
          lowerMsg.includes('diet') || lowerMsg.includes('hungry') || lowerMsg.includes('snack')) {
        targetAgents.add('nutrition');
        targetAgents.add('fitness');
        targetAgents.add('planner');
      }
      
      // Fitness-related
      if (lowerMsg.includes('exercise') || lowerMsg.includes('workout') || lowerMsg.includes('gym') || 
          lowerMsg.includes('run') || lowerMsg.includes('walk') || lowerMsg.includes('yoga')) {
        targetAgents.add('fitness');
        targetAgents.add('nutrition');
        targetAgents.add('mental');
      }
      
      // Finance-related
      if (lowerMsg.includes('money') || lowerMsg.includes('budget') || lowerMsg.includes('$') || 
          lowerMsg.includes('spend') || lowerMsg.includes('save') || lowerMsg.includes('invest')) {
        targetAgents.add('finance');
        targetAgents.add('planner');
      }
      
      // Mental-related
      if (lowerMsg.includes('stress') || lowerMsg.includes('anxious') || lowerMsg.includes('worried') || 
          lowerMsg.includes('sad') || lowerMsg.includes('happy') || lowerMsg.includes('feel')) {
        targetAgents.add('mental');
        targetAgents.add('planner');
      }
      
      // Remove self
      targetAgents.delete(this.id);
      
      if (targetAgents.size > 0) {
        const agentsArray = Array.from(targetAgents);
        console.log(`📢 ${this.id} sharing with: ${agentsArray.join(', ')}`);
        
        // Store broadcast in memory
        await memory.addBroadcast(
          this.id,
          agentsArray,
          `User told ${this.id}: "${this.truncate(message, 80)}"`,
          'cross_agent_share'
        );
      }
      
    } catch (error) {
      console.log(`⚠️ ${this.id} knowledge sharing error:`, error.message);
    }
  }
  
  // === UTILITY METHODS ===
  truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
  
  getStatus() {
    return {
      id: this.id,
      role: this.role,
      connected: !!this.messageBus,
      currentUser: this.currentUserId ? this.currentUserId.substring(0, 8) + '...' : 'none',
      conversationHistory: this.conversationHistory.length,
      memoryActive: !!this.currentUserId && this.currentUserId !== 'anonymous'
    };
  }
  
  // FIXES #1: Method to recall specific information
  async recallMemory(keyword) {
    if (!this.currentUserId) return null;
    
    try {
      const memory = await this.getMemory();
      if (!memory || !memory.searchMemory) return null;
      
      // If memory has search capability
      if (typeof memory.searchMemory === 'function') {
        return await memory.searchMemory(keyword);
      }
      
      // Fallback: Get context and search locally
      const context = await this.getConversationContext();
      if (context.includes(keyword)) {
        const lines = context.split('\n');
        const relevant = lines.filter(line => 
          line.toLowerCase().includes(keyword.toLowerCase())
        );
        return relevant.length > 0 ? relevant[0] : null;
      }
      
      return null;
    } catch (error) {
      console.log(`⚠️ ${this.id} recallMemory error:`, error.message);
      return null;
    }
  }
  
  // FIXES #5: Clear method implementation
  clearLocalHistory() {
    const count = this.conversationHistory.length;
    this.conversationHistory = [];
    console.log(`🧹 ${this.id} cleared ${count} local messages`);
    return count;
  }
}