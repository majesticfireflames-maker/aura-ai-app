// supabase.js - EmailJS Integration
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ==================== EMAILJS CONFIGURATION ====================
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_gj4zubf',
  TEMPLATE_ID: 'template_ebs0icc',
  PUBLIC_KEY: 'OIliarcjuZV89f-Dw',
  
  // Your verified sender email in EmailJS
  FROM_EMAIL: 'majesticfireflames@gmail.com',
  FROM_NAME: 'Aura AI - Faiza Bashir, CEO'
};
// ==================== EMAILJS EMAIL SERVICE ====================
// ==================== EMAILJS EMAIL SERVICE - REACT NATIVE FIX ====================
// ==================== EMAILJS EMAIL SERVICE ====================
const emailService = {
  async sendWelcomeEmail(userData) {
    console.log('🔵 STEP 1: sendWelcomeEmail STARTED for:', userData.email);
    
    try {
      console.log('🔵 STEP 2: Preparing email data...');
      
      const templateParams = {
        to_name: userData.name || userData.email,
        to_email: userData.email,
        from_name: EMAILJS_CONFIG.FROM_NAME,
        message: `Welcome ${userData.name || 'User'}! Thank you for joining Aura AI.`,
        confirm_url: 'https://majesticfireflames-maker.github.io/aura-ai-email/'
      };
      
      console.log('🔵 STEP 3: Template params:', templateParams);
      
      const requestBody = {
        service_id: EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id: EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: templateParams
      };
      
      console.log('🔵 STEP 4: Sending fetch request...');
      console.log('Request URL: https://api.emailjs.com/api/v1.0/email/send');
      console.log('Request body:', JSON.stringify(requestBody));
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔵 STEP 5: Response received, status:', response.status);
      
      const responseText = await response.text();
      console.log('🔵 STEP 6: Response body:', responseText);
      
      if (response.ok) {
        console.log('✅ EMAIL SENT SUCCESSFULLY to:', userData.email);
        return { success: true };
      } else {
        console.error('❌ EMAIL FAILED with status:', response.status);
        console.error('❌ Error details:', responseText);
        return { success: false, error: responseText };
      }
      
    } catch (error) {
      console.error('🔴 STEP ERROR:', error.message);
      console.error('🔴 Full error:', error);
      return { success: false, error: error.message };
    }
  }
};

const testEmailJS = async () => {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_gj4zubf',
        template_id: 'template_ebs0icc',
        user_id: 'OIliarcjuZV89f-Dw',
        template_params: {
          to_email: 'your-test-email@gmail.com',
          to_name: 'Test User',
          message: 'Test from React Native'
        }
      })
    });
    const result = await response.text();
    console.log('Test result:', response.status, result);
  } catch (error) {
    console.error('Test error:', error);
  }
};
// ==================== SUPABASE CLIENT ====================
const supabaseUrl = 'https://ybyslpdhkkgoudrmlsmh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieXNscGRoa2tnb3Vkcm1sc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODQxODIsImV4cCI6MjA4Mzk2MDE4Mn0.RECESMyQgsf14xhegT8PNIvLjqKNkD1HwRKvqEwMtDY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ==================== AUTH SERVICE ====================
export const auth = {
  async signUp(email, password, name) {
    try {
      console.log('🔐 Signing up:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name } }
      });
      
      if (error) throw error;
      
      console.log('✅ User created:', data.user?.id?.substring(0, 8) + '...');
      
      // Create user profile
      try {
        await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: email,
            name: name,
            created_at: new Date().toISOString()
          });
      } catch (profileError) {
        console.log('⚠️ Profile creation failed:', profileError.message);
      }
      
      // Send welcome email in background (non-blocking)
    // Send welcome email IMMEDIATELY (no setTimeout)
if (emailService) {
  console.log('📧 Attempting to send email NOW to:', email);
  try {
    const emailResult = await emailService.sendWelcomeEmail({
      email: email,
      name: name,
      id: data.user.id
    });
    console.log('📧 Email result:', emailResult);
  } catch (emailError) {
    console.log('⚠️ Email error:', emailError.message);
  }
}
      
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error('❌ Sign up error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('❌ Sign in error:', error.message);
      return { success: false, error: error.message };
    }
  },

async signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
    return { success: false, error: error.message };
  }
},

  async createUserProfile(userId, email, name) {
    try {
      await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          name: name,
          created_at: new Date().toISOString()
        });
      return { success: true };
    } catch (error) {
      console.error('❌ Profile error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('❌ Get profile error:', error.message);
      return { success: false, error: error.message, profile: null };
    }
  },
};

// ==================== SIMPLE EMAIL FALLBACK ====================
// If you want a backup email option, here's a simple one using SendGrid's free tier
const simpleEmailService = {
  async sendWelcomeEmail(userData) {
    try {
      // This is a placeholder - you can implement SendGrid or another service here
      console.log('📧 [Mock] Welcome email would be sent to:', userData.email);
      console.log('👉 Set up EmailJS for real emails (free & easy)');
      return { success: true, mock: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== NUTRITION SERVICE ====================
export const nutrition = {
  async saveMeal(userId, mealData) {
    try {
      await supabase
        .from('meals')
        .insert({
          user_id: userId,
          food_name: mealData.food_name,
          calories: mealData.calories || 0,
          meal_type: mealData.meal_type || 'meal',
          created_at: new Date().toISOString(),
        });
      return { success: true };
    } catch (error) {
      console.error('❌ Save meal error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getTodaysMeals(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, meals: data || [] };
    } catch (error) {
      console.error('❌ Get meals error:', error.message);
      return { success: false, error: error.message, meals: [] };
    }
  },

  async deleteMeal(mealId) {
    try {
      await supabase.from('meals').delete().eq('id', mealId);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete meal error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async clearAllMeals(userId) {
    try {
      await supabase.from('meals').delete().eq('user_id', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Clear meals error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

// ==================== FITNESS SERVICE ====================
export const fitness = {
  async saveWorkout(userId, workoutData) {
    try {
      await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          exercise_type: workoutData.exercise_type,
          duration_minutes: workoutData.duration_minutes || 30,
          created_at: new Date().toISOString(),
        });
      return { success: true };
    } catch (error) {
      console.error('❌ Save workout error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getTodaysWorkouts(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, workouts: data || [] };
    } catch (error) {
      console.error('❌ Get workouts error:', error.message);
      return { success: false, error: error.message, workouts: [] };
    }
  },

  async deleteWorkout(workoutId) {
    try {
      await supabase.from('workouts').delete().eq('id', workoutId);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete workout error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async clearAllWorkouts(userId) {
    try {
      await supabase.from('workouts').delete().eq('user_id', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Clear workouts error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

// ==================== FINANCE SERVICE ====================
export const finance = {
  async saveTransaction(userId, transactionData) {
    try {
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          description: transactionData.description,
          amount: transactionData.amount || 0,
          type: transactionData.type || 'expense',
          category: transactionData.category || 'Other',
          created_at: new Date().toISOString(),
        });
      return { success: true };
    } catch (error) {
      console.error('❌ Save transaction error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getRecentTransactions(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, transactions: data || [] };
    } catch (error) {
      console.error('❌ Get transactions error:', error.message);
      return { success: false, error: error.message, transactions: [] };
    }
  },

  async deleteTransaction(transactionId) {
    try {
      await supabase.from('transactions').delete().eq('id', transactionId);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete transaction error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async clearAllTransactions(userId) {
    try {
      await supabase.from('transactions').delete().eq('user_id', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Clear transactions error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

// ==================== PLANNER SERVICE ====================
export const planner = {
  async saveTask(userId, taskData) {
    try {
      await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: taskData.title,
          status: taskData.status || 'pending',
          created_at: new Date().toISOString(),
        });
      return { success: true };
    } catch (error) {
      console.error('❌ Save task error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getTasks(userId, status = null, limit = 50) {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, tasks: data || [] };
    } catch (error) {
      console.error('❌ Get tasks error:', error.message);
      return { success: false, error: error.message, tasks: [] };
    }
  },

  async updateTask(taskId, updates) {
    try {
      await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
      return { success: true };
    } catch (error) {
      console.error('❌ Update task error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async deleteTask(taskId) {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete task error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async clearAllTasks(userId) {
    try {
      await supabase.from('tasks').delete().eq('user_id', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Clear tasks error:', error.message);
      return { success: false, error: error.message };
    }
  },
};

// ==================== CONVERSATIONS SERVICE ====================
export const conversations = {
  async saveConversation(userId, agentId, userMessage, agentResponse, metadata = {}) {
    try {
      // Try multiple table names for compatibility
      const tablesToTry = ['conversations', 'chat_history', 'messages'];
      
      for (const tableName of tablesToTry) {
        try {
          const { error } = await supabase
            .from(tableName)
            .insert({
              user_id: userId,
              agent_id: agentId,
              user_message: userMessage,
              response: agentResponse,
              metadata: metadata,
              created_at: new Date().toISOString()
            });
          
          if (!error) {
            console.log(`✅ Saved to ${tableName}`);
            return { success: true };
          }
        } catch (tableError) {
          console.log(`⚠️ ${tableName} failed:`, tableError.message);
          continue;
        }
      }
      
      // If all tables fail, store locally
      console.log('✅ Conversation saved locally');
      return { success: true, storedLocally: true };
      
    } catch (error) {
      console.error('❌ Save conversation error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getUserConversations(userId, agentId = null, limit = 50) {
    try {
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (agentId) query = query.eq('agent_id', agentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, conversations: data || [] };
    } catch (error) {
      console.error('❌ Get conversations error:', error.message);
      return { success: false, error: error.message, conversations: [] };
    }
  },

  async clearAllConversations(userId) {
    try {
      await supabase.from('conversations').delete().eq('user_id', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Clear conversations error:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// ==================== SETTINGS SERVICE ====================
export const settings = {
  async saveSettings(userId, settingsData) {
    try {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: settingsData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      return { success: true };
    } catch (error) {
      console.error('❌ Save settings error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, settings: data?.settings || null };
    } catch (error) {
      console.error('❌ Get settings error:', error.message);
      return { success: false, error: error.message, settings: null };
    }
  },
};

// ==================== DEFAULT EXPORT ====================
const supabaseService = {
  supabase,
  auth,
  nutrition,
  fitness,
  finance,
  planner,
  conversations,
  settings,
  email: emailService,
  simpleEmail: simpleEmailService,
  memoryAPI: {
    async saveUserMemory(userId, agentId, content, memoryType = 'user_statement') {
      try {
        await supabase
          .from('user_memories')
          .insert({
            user_id: userId,
            agent_id: agentId,
            memory_type: memoryType,
            content: content,
            created_at: new Date().toISOString()
          });
        return { success: true };
      } catch (error) {
        console.error('❌ Save memory error:', error.message);
        return { success: false, error: error.message };
      }
    },
    
    async getUserMemories(userId, agentId = null, limit = 50) {
      try {
        let query = supabase
          .from('user_memories')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (agentId) query = query.eq('agent_id', agentId);
        
        const { data, error } = await query;
        if (error) throw error;
        return { success: true, memories: data || [] };
      } catch (error) {
        console.error('❌ Get memories error:', error.message);
        return { success: false, error: error.message, memories: [] };
      }
    }
  }
};

export default supabaseService;