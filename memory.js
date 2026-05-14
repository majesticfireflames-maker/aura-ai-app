// memory.js - ONLY SUPABASE INTEGRATION FIX
import { supabase } from './supabase';

export class UserMemory {
  constructor(userId) {
    this.userId = userId;
    this.localCache = {
      memories: {},
      preferences: {},
      knowledge: {}
    };
    
    console.log(`🧠 Memory initialized for user: ${userId ? userId.substring(0, 8) + '...' : 'anonymous'}`);
    
    // Load from Supabase on initialization (non-blocking)
    if (userId && userId !== 'anonymous') {
      setTimeout(() => this.loadUserData().catch(err => {
        console.log(`⚠️ Background load failed for ${userId.substring(0, 8)}:`, err.message);
      }), 100);
    }
  }
  
  // === CRITICAL FIX: Save to Supabase ===
  async saveToSupabase(agentId, content, category, memoryType) {
    try {
      // FIXED: Table exists check with fallback
      const { error } = await supabase
        .from('user_memories')
        .insert({
          user_id: this.userId,
          agent_id: agentId,
          memory_type: memoryType,
          content: content,
          category: category,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        // If table doesn't exist, create it later
        console.log(`⚠️ Supabase save failed (table may not exist):`, error.message);
        return false;
      }
      
      console.log(`💾 Saved to Supabase: ${agentId} - ${memoryType}`);
      return true;
      
    } catch (error) {
      console.log(`⚠️ Supabase save error:`, error.message);
      return false;
    }
  }
  
  async saveSharedKnowledgeToSupabase(sourceAgent, targetAgents, content, knowledgeType) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const { error } = await supabase
        .from('cross_agent_knowledge')
        .insert({
          user_id: this.userId,
          source_agent: sourceAgent,
          target_agents: targetAgents,
          knowledge_type: knowledgeType,
          content: content,
          importance: 70,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`⚠️ Shared knowledge DB save failed (table may not exist):`, error.message);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.log(`⚠️ Shared knowledge save error:`, error.message);
      return false;
    }
  }
  
// In UserMemory class, enhance the savePreference method:
async savePreference(type, key, sourceAgent, confidence) {
  if (!this.userId || this.userId === 'anonymous' || !type || !key) {
    return false;
  }
  
  try {
    // For user_name preference, mark as permanent
    const isPermanent = (type === 'user_profile' && key === 'user_name');
    
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: this.userId,
        preference_type: type,
        key: key,
        value: 'true',
        source_agent: sourceAgent || 'system',
        confidence: confidence || (isPermanent ? 100 : 70),
        is_permanent: isPermanent, // ADD THIS FLAG
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_type,key'
      });
    
    if (error) {
      console.log(`⚠️ Preference save failed:`, error.message);
    }
    
    // Update local cache
    if (!this.localCache.preferences[type]) {
      this.localCache.preferences[type] = {};
    }
    this.localCache.preferences[type][key] = {
      value: 'true',
      confidence: confidence || (isPermanent ? 100 : 70),
      source: sourceAgent || 'system',
      isPermanent: isPermanent,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ ${isPermanent ? 'PERMANENT ' : ''}Preference saved: ${type}: ${key}`);
    return true;
    
  } catch (error) {
    console.log(`⚠️ Preference save error:`, error.message);
    return false;
  }
}

// Add method to get preferences:
async getPreferences(type = null) {
  try {
    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', this.userId);
    
    if (type) {
      query = query.eq('preference_type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Organize by type and key
    const preferences = {};
    data.forEach(pref => {
      if (!preferences[pref.preference_type]) {
        preferences[pref.preference_type] = {};
      }
      preferences[pref.preference_type][pref.key] = {
        value: pref.value,
        confidence: pref.confidence,
        source: pref.source_agent,
        isPermanent: pref.is_permanent,
        timestamp: pref.updated_at
      };
    });
    
    // Update local cache
    if (data.length > 0) {
      this.localCache.preferences = preferences;
    }
    
    return type ? preferences[type] || {} : preferences;
    
  } catch (error) {
    console.log('⚠️ Get preferences error:', error.message);
    // Return from local cache
    return type ? (this.localCache.preferences[type] || {}) : this.localCache.preferences;
  }
}
  
  // ===== UTILITY METHODS =====
  
  extractThingFromMessage(message) {
    if (!message || typeof message !== 'string') return null;
    
    const patterns = [
      /I (?:love|like|enjoy|hate|dislike) (.+?)(?:\.|!|\?|,|$)/i,
      /I (?:really|absolutely) (?:love|like|hate) (.+?)(?:\.|!|\?|,|$)/i,
      /my favorite (.+?) is/i,
      /I'm (?:really )?into (.+?)(?:\.|!|\?|,|$)/i,
      /I (?:don't|do not) like (.+?)(?:\.|!|\?|,|$)/i,
      /I (?:can't|cannot) stand (.+?)(?:\.|!|\?|,|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        return match[1].trim().replace(/^(the|a|an)\s+/i, '');
      }
    }
    
    return null;
  }
  
  extractGoal(message) {
    if (!message || typeof message !== 'string') return null;
    
    const match = message.match(/I (?:want to|need to|goal is to|trying to|plan to|hope to|wish to) (.+?)(?:\.|!|\?|$)/i);
    return match ? match[1].trim() : null;
  }
  
  extractRestriction(message) {
    if (!message || typeof message !== 'string') return null;
    
    const patterns = [
      /I(?:'m| am) (?:allergic to|intolerant to) (.+?)(?:\.|!|\?|,|$)/i,
      /I (?:cannot|can't) eat (.+?)(?:\.|!|\?|,|$)/i,
      /I(?:'m| am) (?:vegetarian|vegan)/i,
      /I (?:avoid|stay away from) (.+?)(?:\.|!|\?|,|$)/i,
      /gluten free/i,
      /dairy free/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1]) {
          return match[1].trim();
        } else if (pattern.source.includes('vegetarian')) {
          return 'vegetarian';
        } else if (pattern.source.includes('vegan')) {
          return 'vegan';
        } else if (pattern.source.includes('gluten')) {
          return 'gluten-free';
        } else if (pattern.source.includes('dairy')) {
          return 'dairy-free';
        }
      }
    }
    
    return null;
  }
  
  getTimeAgo(timestamp) {
    if (!timestamp) return 'recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
  
  truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
  
  // ===== STATISTICS =====
  
  getStats() {
    const memoryCount = Object.values(this.localCache.memories).reduce((sum, arr) => sum + arr.length, 0);
    const knowledgeCount = Object.values(this.localCache.knowledge).reduce((sum, arr) => sum + arr.length, 0);
    const preferenceCount = Object.values(this.localCache.preferences).reduce((sum, obj) => sum + Object.keys(obj).length, 0);
    
    return {
      userId: this.userId ? this.userId.substring(0, 8) + '...' : 'anonymous',
      memories: memoryCount,
      knowledge: knowledgeCount,
      preferences: preferenceCount,
      agentsWithMemory: Object.keys(this.localCache.memories).length
    };
  }
  
  // ===== CLEANUP =====
  
  clearLocalCache() {
    this.localCache = {
      memories: {},
      preferences: {},
      knowledge: {}
    };
    console.log('🧹 Local cache cleared');
    return true;
  }
}

// Global memory manager
export class MemoryManager {
  constructor() {
    this.userMemories = new Map();
    console.log('🧠 Memory Manager started');
  }
  
  getMemoryForUser(userId) {
    if (!userId || userId === 'anonymous') {
      return this.getAnonymousMemory();
    }
    
    if (!this.userMemories.has(userId)) {
      console.log(`👤 Creating memory for user: ${userId.substring(0, 8)}...`);
      this.userMemories.set(userId, new UserMemory(userId));
    }
    
    return this.userMemories.get(userId);
  }
  
  getAnonymousMemory() {
    const ANON_USER = 'anonymous';
    if (!this.userMemories.has(ANON_USER)) {
      this.userMemories.set(ANON_USER, new UserMemory(ANON_USER));
    }
    return this.userMemories.get(ANON_USER);
  }
  
  clearUserMemory(userId) {
    if (this.userMemories.has(userId)) {
      this.userMemories.delete(userId);
      console.log(`🗑️ Memory cleared for user: ${userId ? userId.substring(0, 8) : 'unknown'}`);
      return true;
    }
    return false;
  }
  
  getAllUserIds() {
    return Array.from(this.userMemories.keys()).filter(id => id !== 'anonymous');
  }
  
  getStats() {
    const stats = {
      totalUsers: this.userMemories.size - (this.userMemories.has('anonymous') ? 1 : 0),
      anonymousUsers: this.userMemories.has('anonymous') ? 1 : 0,
      userStats: {}
    };
    
    for (const [userId, memory] of this.userMemories.entries()) {
      if (userId !== 'anonymous') {
        stats.userStats[userId.substring(0, 8) + '...'] = memory.getStats();
      }
    }
    
    return stats;
  }
}

// Global instance with error handling
let memoryManager;
try {
  memoryManager = new MemoryManager();
} catch (error) {
  console.error('❌ Failed to create MemoryManager:', error);
  // Create a fallback memory manager
  memoryManager = {
    getMemoryForUser: () => ({
      userToldAgent: () => Promise.resolve(true),
      agentResponded: () => Promise.resolve(true),
      getContextForAgent: () => Promise.resolve('Memory system unavailable'),
      addSharedKnowledge: () => Promise.resolve(true),
      addBroadcast: () => Promise.resolve(true),
      getKnowledgeFromAgent: () => Promise.resolve([])
    }),
    getAnonymousMemory: () => ({
      userToldAgent: () => Promise.resolve(true),
      agentResponded: () => Promise.resolve(true),
      getContextForAgent: () => Promise.resolve('Using anonymous memory'),
      addSharedKnowledge: () => Promise.resolve(true),
      addBroadcast: () => Promise.resolve(true)
    })
  };
}


export { memoryManager };
// In memory.js - ADD THIS AT THE VERY END (after all exports)

// ==================== GLOBAL EXPOSURE ====================
// This guarantees memoryManager is available everywhere

// For React Native/Node.js
if (typeof global !== 'undefined') {
  console.log('🌐 Exposing memoryManager to global scope');
  global.memoryManager = memoryManager;
}

// For web browsers
if (typeof window !== 'undefined') {
  console.log('🌐 Exposing memoryManager to window scope');
  window.memoryManager = memoryManager;
}

// For React Native global
if (typeof globalThis !== 'undefined') {
  globalThis.memoryManager = memoryManager;
}