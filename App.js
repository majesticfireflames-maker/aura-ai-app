import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  Switch,
  Alert,
  FlatList,
  Keyboard,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Import services
import { AIService } from './aiservices';
import { memoryManager } from './memory';
import { MessageBus } from './messagebus';
import supabaseService from './supabase';
import { estimateWorkoutCalories, getWorkoutIntensity, getFitnessSummary } from './CALORIE_ESTIMATION';
import { estimateFoodCalories, formatCalories, getNutritionSummary } from './CALORIE_ESTIMATION';
// ==================== IMPORT BASEAGENT AND AGENT CLASSES




// ==================== UTILITY FUNCTIONS & CONSTANTS ====================
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const testimonialsData = [
  {
    id: '1',
    name: 'Muhammad Ali',
    role: 'Product Manager',
    company: 'TechCorp Inc.',
    content:
      'AURA AI has changed how I manage my daily tasks. The planner agent is a game-changer!',
    rating: 5,
    avatarColor: '#6366F1',
  },
  {
    id: '2',
    name: 'Mahir Fareed',
    role: 'Financial Analyst',
    company: 'Global Finance',
    content:
      'The finance agent helped me save 30% more this quarter. Incredible insights!',
    rating: 5,
    avatarColor: '#00C853',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    role: 'Nutritionist',
    company: 'HealthFirst Clinic',
    content:
      'My clients love the nutrition tracking. It makes dietary planning so much easier.',
    rating: 4,
    avatarColor: '#FF9800',
  },
  {
    id: '4',
    name: 'Alex Thompson',
    role: 'Creative Director',
    company: 'Design Studio X',
    content:
      'Creative Muse has become my go-to brainstorming partner. Amazing inspiration!',
    rating: 5,
    avatarColor: '#F43F5E',
  },
  {
    id: '5',
    name: 'David Wilson',
    role: 'Fitness Coach',
    company: 'Elite Fitness',
    content:
      'The fitness agent provides personalized workouts that actually work. Highly recommend!',
    rating: 5,
    avatarColor: '#A855F7',
  },
  {
    id: '6',
    name: 'Maham Javed',
    role: 'Student',
    company: 'Mindful Living',
    content:
      'Mind Harmony offers genuine emotional support. I used it and it was a good idea',
    rating: 4,
    avatarColor: '#EC4899',
  },
  {
    id: '7',
    name: 'Rosetta',
    role: 'Startup Founder',
    company: 'Innovate Labs',
    content:
      'This app coordinates multiple agents seamlessly. A productivity powerhouse.',
    rating: 5,
    avatarColor: '#00BCD4',
  },
  {
    id: '8',
    name: 'Nadia Mumtaz',
    role: 'University Professor',
    company: 'Punjab University',
    content:
      'Perfect for research organization. The AI coordination is next-level.',
    rating: 4,
    avatarColor: '#3B82F6',
  },
  {
    id: '9',
    name: 'James Wilson',
    role: 'Freelancer',
    company: 'Digital Nomad',
    content:
      'Balances my work, health, and finances all in one place. Life-changing!',
    rating: 5,
    avatarColor: '#F59E0B',
  },
  {
    id: '10',
    name: 'Sophie Williams',
    role: 'Writer',
    company: 'Creative Collective',
    content:
      'The collaboration of creative agent with other agents, make it easier to track many things in the same place.',
    rating: 5,
    avatarColor: '#8B5CF6',
  },
];

const footerLinks = {
  product: [
    { label: 'All Agents', url: '#' },
    { label: 'Features', url: '#' },
    { label: 'Pricing', url: '#' },
    { label: 'API', url: '#' },
  ],
  company: [
    { label: 'About', url: '#' },
    { label: 'Blog', url: '#' },
    { label: 'Careers', url: '#' },
    { label: 'Press', url: '#' },
  ],
  resources: [
    { label: 'Documentation', url: '#' },
    { label: 'Help Center', url: '#' },
    { label: 'Community', url: '#' },
    { label: 'Contact', url: '#' },
  ],
  legal: [
    { label: 'Privacy', url: '#' },
    { label: 'Terms', url: '#' },
    { label: 'Security', url: '#' },
    { label: 'Cookies', url: '#' },
  ],
};

const defaultSettings = {
  theme: 'dark',
  autoSave: true, // Only keep essential settings
};

const getThemeColors = (theme) => {
  const isLight = theme === 'light';
  return {
    bgPrimary: isLight ? '#FFFFFF' : '#0A0118',
    bgSecondary: isLight ? '#F8FAFC' : 'rgba(20, 2, 40, 0.95)',
    bgCard: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
    bgInput: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)',
    textPrimary: isLight ? '#0F172A' : '#FFFFFF',
    textSecondary: isLight ? '#64748B' : 'rgba(255,255,255,0.6)',
    textTertiary: isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)',
    borderPrimary: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
    borderSecondary: isLight ? '#CBD5E1' : 'rgba(255,255,255,0.05)',
    accentPrimary: isLight ? '#00BCD4' : '#00D9FF',
    accentSuccess: isLight ? '#00C853' : '#10B981',
    accentWarning: isLight ? '#FF9800' : '#F59E0B',
    accentError: isLight ? '#F44336' : '#EF4444',
    floatingButtonBg: isLight ? '#00BCD4' : '#00D9FF',
    userBubbleBg: isLight ? '#00BCD4' : '#00D9FF',
    userBubbleText: isLight ? '#FFFFFF' : '#000000',
    botBubbleBg: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.08)',
    botBubbleText: isLight ? '#0F172A' : '#FFFFFF',
    onlineStatus: isLight ? '#00C853' : '#10B981',
    offlineStatus: isLight ? '#F44336' : '#EF4444',
    cyanLight: isLight ? '#E0F7FA' : '#E0F7FA20',
    cyanMedium: isLight ? '#80DEEA' : '#80DEEA',
    cyanDark: isLight ? '#00ACC1' : '#00ACC1',
  };
};

// ==================== TESTIMONIALS COMPONENT ====================
const TestimonialsSlider = ({ settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const colors = getThemeColors(settings.theme);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonialsData.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderTestimonial = ({ item }) => (
    <View
      style={[
        stylesTestimonials.testimonialCard,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.borderPrimary,
          width: width - 48,
        },
      ]}>
      <View style={stylesTestimonials.testimonialHeader}>
        <View
          style={[
            stylesTestimonials.avatar,
            { backgroundColor: item.avatarColor },
          ]}>
          <Text style={stylesTestimonials.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={stylesTestimonials.userInfo}>
          <Text
            style={[
              stylesTestimonials.userName,
              { color: colors.textPrimary },
            ]}>
            {item.name}
          </Text>
          <Text
            style={[
              stylesTestimonials.userRole,
              { color: colors.textSecondary },
            ]}>
            {item.role} • {item.company}
          </Text>
          <View style={stylesTestimonials.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < item.rating ? 'star' : 'star-outline'}
                size={14}
                color={i < item.rating ? '#FFD700' : colors.textTertiary}
              />
            ))}
          </View>
        </View>
        <Ionicons name="quote" size={28} color={item.avatarColor + '40'} />
      </View>

      <Text
        style={[
          stylesTestimonials.testimonialText,
          { color: colors.textPrimary },
        ]}>
        "{item.content}"
      </Text>

      <View style={stylesTestimonials.indicatorContainer}>
        {testimonialsData.map((_, index) => (
          <View
            key={index}
            style={[
              stylesTestimonials.indicator,
              { backgroundColor: colors.textTertiary },
              currentIndex === index && [
                stylesTestimonials.activeIndicator,
                { backgroundColor: item.avatarColor },
              ],
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={stylesTestimonials.container}>
      <View style={stylesTestimonials.header}>
        <View style={stylesTestimonials.titleRow}>
          <Ionicons name="star" size={20} color={colors.accentPrimary} />
          <Text
            style={[stylesTestimonials.title, { color: colors.textPrimary }]}>
            Trusted by Professionals
          </Text>
        </View>
        <Text
          style={[
            stylesTestimonials.subtitle,
            { color: colors.textSecondary },
          ]}>
          See what users are saying about AURA AI
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={testimonialsData}
        renderItem={renderTestimonial}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / (width - 48)
          );
          setCurrentIndex(newIndex);
        }}
        getItemLayout={(data, index) => ({
          length: width - 48,
          offset: (width - 48) * index,
          index,
        })}
      />

      <View style={stylesTestimonials.navigationButtons}>
        <TouchableOpacity
          style={[
            stylesTestimonials.navButton,
            { borderColor: colors.borderPrimary },
          ]}
          onPress={() => {
            const newIndex =
              currentIndex > 0 ? currentIndex - 1 : testimonialsData.length - 1;
            setCurrentIndex(newIndex);
            flatListRef.current?.scrollToIndex({
              index: newIndex,
              animated: true,
            });
          }}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            stylesTestimonials.navButton,
            { borderColor: colors.borderPrimary },
          ]}
          onPress={() => {
            const newIndex = (currentIndex + 1) % testimonialsData.length;
            setCurrentIndex(newIndex);
            flatListRef.current?.scrollToIndex({
              index: newIndex,
              animated: true,
            });
          }}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const stylesTestimonials = StyleSheet.create({
  container: {
    marginVertical: 32,
    paddingHorizontal: 8,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  testimonialCard: {
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

// ==================== FOOTER COMPONENT ====================
// ==================== WORKING FOOTER COMPONENT ====================

// ==================== WORKING FOOTER ====================

const Footer = ({ settings }) => {
  const colors = getThemeColors(settings.theme);
  const currentYear = new Date().getFullYear();

  // LinkedIn - Working
  const handleLinkedInPress = () => {
    Linking.openURL('https://www.linkedin.com/in/faiza-bashir-a38514272');
  };

  return (
    <View
      style={[stylesFooter.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={stylesFooter.content}>
        <View style={stylesFooter.brandSection}>
          <Image 
  source={require('./assets/auralogo.jpg')}
  style={{
    width: 48,
    height: 48,
    borderRadius: 12,
  }}
  resizeMode="contain"
/>
          <Text
            style={[stylesFooter.brandTitle, { color: colors.textPrimary }]}>
            AURA AI
          </Text>
          <Text
            style={[
              stylesFooter.brandDescription,
              { color: colors.textSecondary },
            ]}>
            Multi-Agent Intelligence Platform
          </Text>

          {/* EMAIL AS PLAIN TEXT - ALWAYS WORKS */}
          <View style={stylesFooter.emailContainer}>
            <Ionicons name="mail" size={16} color={colors.textSecondary} />
            <Text
              style={[stylesFooter.emailText, { color: colors.textSecondary }]}
              selectable={true}>
              aurafyp2025@gmail.com
            </Text>
          </View>

          {/* SOCIAL BUTTONS - ONLY LINKEDIN */}
          <View style={stylesFooter.socialLinks}>
            <TouchableOpacity
              style={[
                stylesFooter.socialButton,
                { backgroundColor: colors.bgInput },
              ]}
              onPress={handleLinkedInPress}>
              <Ionicons
                name="logo-linkedin"
                size={20}
                color={colors.accentPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Copyright */}
      <View
        style={[
          stylesFooter.copyright,
          { borderTopColor: colors.borderPrimary },
        ]}>
        <Text
          style={[stylesFooter.copyrightText, { color: colors.textTertiary }]}>
          © {currentYear} AURA AI. All rights reserved.
        </Text>
        <View style={stylesFooter.copyrightLinks}>
          <TouchableOpacity>
            <Text
              style={[
                stylesFooter.copyrightLink,
                { color: colors.textSecondary },
              ]}>
              Privacy
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              stylesFooter.copyrightDivider,
              { color: colors.textTertiary },
            ]}>
            •
          </Text>
          <TouchableOpacity>
            <Text
              style={[
                stylesFooter.copyrightLink,
                { color: colors.textSecondary },
              ]}>
              Terms
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ==================== UPDATED STYLES ====================
const stylesFooter = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  brandDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  // NEW: Email as plain text
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    marginBottom: 8,
  },
  copyrightLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copyrightLink: {
    fontSize: 12,
  },
  copyrightDivider: {
    fontSize: 12,
  },
});
// ==================== CHAT WIDGET COMPONENT ====================
const ChatWidget = ({
  agentName,
  initialMessage,
  onSendMessage,
  color,
  settings,
  agentId,
  onMessageSent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: initialMessage,
      sender: 'bot',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const colors = getThemeColors(settings.theme);
  const isLight = settings.theme === 'light';

  useEffect(() => {
    if (isOpen) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const parseStyledText = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const elements = [];
    let remaining = text;
    let key = 0;
    
    const pattern = /\[(b|i|h)\](.*?)\[\/\1\]/gs;
    let lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <Text key={key++}>{remaining.substring(lastIndex, match.index)}</Text>
        );
      }
      
      const tag = match[1];
      const content = match[2];
      
      let style = {};
      if (tag === 'b') style = { fontWeight: 'bold' };
      if (tag === 'i') style = { fontStyle: 'italic' };
      if (tag === 'h') style = { fontWeight: 'bold', fontSize: 18, marginVertical: 6 };
      
      elements.push(
        <Text key={key++} style={style}>
          {content}
        </Text>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < remaining.length) {
      elements.push(<Text key={key++}>{remaining.substring(lastIndex)}</Text>);
    }
    
    return elements.length > 0 ? <>{elements}</> : text;
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      text: trimmedInput,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      
      const userName = supabaseManager.userProfile?.name;
      const lowerInput = trimmedInput.toLowerCase();
      
      if (userName && (lowerInput.includes('what is my name') || 
                       lowerInput.includes('whats my name') ||
                       lowerInput.includes('do you know my name'))) {
        console.log(`✅ ChatWidget answering name question: ${userName}`);
        responseText = `Your name is ${userName}! 😊`;
      } else {
        responseText = await onSendMessage(trimmedInput);
      }
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (onMessageSent) {
        onMessageSent(trimmedInput, responseText);
      }
    } catch (error) {
      console.error('Chat send error:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: 'I encountered an error processing your request. Please try again.',
        sender: 'bot',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingButton = () => (
    <TouchableOpacity
      style={[
        stylesChat.floatingButton,
        {
          backgroundColor: color,
          width: 52,
          height: 52,
          bottom: isSmallScreen ? 60 : 70,
          shadowColor: isLight ? '#00000020' : '#FFFFFF20',
          elevation: 6,
        },
      ]}
      onPress={() => setIsOpen(true)}
      activeOpacity={0.8}>
      <Ionicons
        name="chatbubble-ellipses"
        size={22}
        color={isLight ? '#FFFFFF' : '#000000'}
      />
    </TouchableOpacity>
  );

  return (
    <>
      <FloatingButton />

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsOpen(false)}>
        <SafeAreaView
          style={[
            stylesChat.modalContainer,
            { backgroundColor: colors.bgPrimary },
          ]}>
          <Animated.View
            style={[stylesChat.animatedContainer, { opacity: fadeAnim }]}>
            <View
              style={[
                stylesChat.header,
                {
                  borderBottomColor: colors.borderPrimary,
                  backgroundColor: colors.bgSecondary,
                },
              ]}>
              <View style={stylesChat.headerInfo}>
                <View style={[stylesChat.botIcon, { backgroundColor: color }]}>
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={16}
                    color={isLight ? '#FFFFFF' : '#000000'}
                  />
                </View>
                <View style={stylesChat.headerTextContainer}>
                  <Text
                    style={[
                      stylesChat.headerTitle,
                      { color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {agentName} Assistant
                  </Text>
                  <Text
                    style={[
                      stylesChat.headerStatus,
                      { color: colors.onlineStatus },
                    ]}>
                    {isLoading ? 'Typing...' : 'Online'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={stylesChat.closeButton}
                activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={[
                stylesChat.messageList,
                { backgroundColor: colors.bgPrimary },
              ]}
              contentContainerStyle={stylesChat.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    stylesChat.messageRow,
                    msg.sender === 'user'
                      ? stylesChat.userRow
                      : stylesChat.botRow,
                  ]}>
                  <View
                    style={[
                      stylesChat.bubble,
                      msg.sender === 'user'
                        ? stylesChat.userBubble
                        : stylesChat.botBubble,
                      {
                        maxWidth: width * 0.82,
                        backgroundColor:
                          msg.sender === 'user' ? color : colors.botBubbleBg,
                        borderColor:
                          msg.sender === 'user'
                            ? 'transparent'
                            : colors.borderPrimary,
                      },
                    ]}>
                    
                    {/* FIXED: Proper conditional for user vs bot messages */}
                    {msg.sender === 'user' ? (
                      <Text
                        style={[
                          stylesChat.messageText,
                          {
                            color: isLight ? '#FFFFFF' : '#000000',
                          },
                        ]}>
                        {msg.text}
                      </Text>
                    ) : (
                      <Text style={[stylesChat.messageText, { color: colors.botBubbleText }]}>
                        {parseStyledText(msg.text)}
                      </Text>
                    )}
                    
                    <Text
                      style={[
                        stylesChat.timeText,
                        {
                          color:
                            msg.sender === 'user'
                              ? isLight
                                ? 'rgba(255,255,255,0.7)'
                                : 'rgba(0,0,0,0.7)'
                              : colors.textTertiary,
                        },
                      ]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isLoading && (
                <View style={stylesChat.typingIndicator}>
                  <Animated.View
                    style={[
                      stylesChat.typingDot,
                      {
                        backgroundColor: color,
                        marginRight: 4,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      stylesChat.typingDot,
                      {
                        backgroundColor: color,
                        marginRight: 4,
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      stylesChat.typingDot,
                      {
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              )}
              <View style={{ height: Platform.OS === 'ios' ? 15 : 8 }} />
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.select({
                ios: 70,
                android: 0,
                default: 0,
              })}
              style={[
                stylesChat.keyboardView,
                { backgroundColor: colors.bgSecondary },
              ]}>
              <View
                style={[
                  stylesChat.inputArea,
                  { borderTopColor: colors.borderPrimary },
                ]}>
                <TextInput
                  style={[
                    stylesChat.input,
                    {
                      fontSize: 14,
                      maxHeight: 70,
                      backgroundColor: colors.bgInput,
                      color: colors.textPrimary,
                      borderColor: colors.borderPrimary,
                    },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder={`Message ${agentName}...`}
                  placeholderTextColor={colors.textTertiary}
                  onSubmitEditing={handleSend}
                  multiline
                  maxLength={500}
                  editable={!isLoading}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  style={[
                    stylesChat.sendButton,
                    {
                      backgroundColor: color,
                      opacity: !input.trim() || isLoading ? 0.5 : 1,
                      width: 42,
                      height: 42,
                    },
                  ]}
                  disabled={!input.trim() || isLoading}
                  activeOpacity={0.7}>
                  <Ionicons
                    name="send"
                    size={16}
                    color={isLight ? '#FFFFFF' : '#000000'}
                  />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const stylesChat = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 16,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 6 : 12,
    borderBottomWidth: 1,
    minHeight: 54,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  botIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 1,
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeButton: {
    padding: 6,
    marginLeft: 4,
    flexShrink: 0,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 12,
    paddingBottom: 6,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    padding: 10,
    borderRadius: 16,
    position: 'relative',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    opacity: 0.7,
  },
  keyboardView: {
    flexShrink: 0,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.select({
      ios: 20,
      android: 16,
      default: 12,
    }),
    borderTopWidth: 1,
    minHeight: 70,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
});

// ==================== NAVIGATION ====================
const Navigation = ({ activeSection, onNavigate, settings }) => {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'agents', icon: 'grid', label: 'Agents' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  const colors = getThemeColors(settings.theme);

  return (
    <View
      style={[
        stylesNav.container,
        {
          height: 70,
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderPrimary,
        },
      ]}>
      {navItems.map((item) => {
        const isActive = activeSection === item.id;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.id)}
            style={stylesNav.navItem}
            activeOpacity={0.7}>
            <View
              style={[
                stylesNav.iconContainer,
                isActive && { backgroundColor: colors.accentPrimary + '20' },
              ]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.accentPrimary : colors.textSecondary}
              />
            </View>
            <Text
              style={[
                stylesNav.label,
                {
                  color: isActive ? colors.accentPrimary : colors.textSecondary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}>
              {item.label}
            </Text>
            {isActive && (
              <View
                style={[
                  stylesNav.activeIndicator,
                  { backgroundColor: colors.accentPrimary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const stylesNav = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

// ==================== LOGIN PAGE ====================
const Login = ({ onLogin, settings = defaultSettings }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const colors = getThemeColors(settings.theme);
  const isLight = settings.theme === 'light';

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    if ((!isLogin && !name.trim()) || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await supabaseManager.signIn(email, password);
      } else {
        result = await supabaseManager.signUp(email, password, name);
      }

      if (result.success) {
      // ✅ Pass user profile to onLogin
      onLogin(result.user, result.profile || supabaseManager.userProfile);
    } else {
      Alert.alert('Error', result.error || 'Authentication failed');
    }
  } catch (error) {
    console.error('Auth error:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      const { error } =
        await supabaseService.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  return (
    <SafeAreaView
      style={[stylesLogin.container, { backgroundColor: colors.bgPrimary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={stylesLogin.keyboardView}>
        <ScrollView
          contentContainerStyle={[
            stylesLogin.scrollContent,
            {
              minHeight: height,
              paddingHorizontal: 16,
              paddingTop: keyboardVisible ? 20 : height * 0.1,
              paddingBottom: keyboardVisible ? 20 : 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={stylesLogin.logoContainer}>
            <Image 
  source={require('./assets/auralogo.jpg')}
  style={{
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 20,
  }}
  resizeMode="contain"
/>
            <Text
              style={[
                stylesLogin.title,
                {
                  fontSize: 34,
                  color: colors.textPrimary,
                  marginBottom: 4,
                },
              ]}>
              AURA AI
            </Text>

            <Text
              style={[
                stylesLogin.subtitle,
                {
                  fontSize: 14,
                  color: colors.textSecondary,
                },
              ]}>
              Multi-Agent Intelligence Platform
            </Text>
          </View>

          <View
            style={[
              stylesLogin.form,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderPrimary,
                borderRadius: 24,
                padding: 20,
              },
            ]}>
            <View
              style={[
                stylesLogin.toggle,
                {
                  backgroundColor: colors.bgInput,
                  borderRadius: 14,
                  padding: 4,
                  marginBottom: 20,
                },
              ]}>
              <TouchableOpacity
                onPress={() => setIsLogin(true)}
                style={[
                  stylesLogin.toggleBtn,
                  isLogin && [
                    stylesLogin.toggleActive,
                    {
                      backgroundColor: colors.accentPrimary,
                      borderRadius: 12,
                    },
                  ],
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    stylesLogin.toggleText,
                    {
                      color: isLogin
                        ? isLight
                          ? '#FFFFFF'
                          : '#000000'
                        : colors.textTertiary,
                      fontWeight: isLogin ? 'bold' : '500',
                    },
                  ]}>
                  LOGIN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLogin(false)}
                style={[
                  stylesLogin.toggleBtn,
                  !isLogin && [
                    stylesLogin.toggleActive,
                    {
                      backgroundColor: colors.accentPrimary,
                      borderRadius: 12,
                    },
                  ],
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    stylesLogin.toggleText,
                    {
                      color: !isLogin
                        ? isLight
                          ? '#FFFFFF'
                          : '#000000'
                        : colors.textTertiary,
                      fontWeight: !isLogin ? 'bold' : '500',
                    },
                  ]}>
                  REGISTER
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View
                style={[
                  stylesLogin.inputContainer,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderPrimary,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    height: 50,
                    marginBottom: 14,
                  },
                ]}>
                <Ionicons
                  name="person"
                  size={18}
                  color={colors.textTertiary}
                  style={stylesLogin.inputIcon}
                />
                <TextInput
                  style={[
                    stylesLogin.input,
                    {
                      color: colors.textPrimary,
                      fontSize: 15,
                    },
                  ]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                  returnKeyType="next"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View
              style={[
                stylesLogin.inputContainer,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderPrimary,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  height: 50,
                  marginBottom: 14,
                },
              ]}>
              <Ionicons
                name="mail"
                size={18}
                color={colors.textTertiary}
                style={stylesLogin.inputIcon}
              />
              <TextInput
                style={[
                  stylesLogin.input,
                  {
                    color: colors.textPrimary,
                    fontSize: 15,
                  },
                ]}
                placeholder="Email Address"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>

            <View
              style={[
                stylesLogin.inputContainer,
                {
                  backgroundColor: colors.bgInput,
                  borderColor: colors.borderPrimary,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  height: 50,
                  marginBottom: isLogin ? 12 : 14,
                },
              ]}>
              <Ionicons
                name="lock-closed"
                size={18}
                color={colors.textTertiary}
                style={stylesLogin.inputIcon}
              />
              <TextInput
                style={[
                  stylesLogin.input,
                  {
                    color: colors.textPrimary,
                    fontSize: 15,
                    flex: 1,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                returnKeyType={isLogin ? 'done' : 'next'}
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={stylesLogin.passwordToggle}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {isLogin && null}

            <TouchableOpacity
              style={[
                stylesLogin.loginButton,
                {
                  backgroundColor: colors.accentPrimary,
                  borderRadius: 14,
                  height: 50,
                  marginBottom: 20,
                },
                isLoading && stylesLogin.loginButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isLight ? '#FFFFFF' : '#000000'}
                />
              ) : (
                <>
                  <Text
                    style={[
                      stylesLogin.loginButtonText,
                      {
                        fontSize: 15,
                        color: isLight ? '#FFFFFF' : '#000000',
                        marginRight: 6,
                      },
                    ]}>
                    {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isLight ? '#FFFFFF' : '#000000'}
                  />
                </>
              )}
            </TouchableOpacity>


            <Text
              style={[
                stylesLogin.termsText,
                {
                  color: colors.textTertiary,
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 24,
                  lineHeight: 16,
                },
              ]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.accentPrimary }}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={{ color: colors.accentPrimary }}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const stylesLogin = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    borderWidth: 1,
  },
  toggle: {
    flexDirection: 'row',
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  passwordToggle: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontWeight: '500',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  socialButtonText: {
    fontWeight: '500',
  },
  termsText: {
    fontWeight: '400',
  },
});

// ==================== LANDING PAGE ====================
const Landing = ({ onSelectAgent, settings }) => {
  const colors = getThemeColors(settings.theme);

  return (
    <ScrollView
      style={[stylesLanding.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={stylesLanding.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={stylesLanding.hero}>
        <View
          style={[
            stylesLanding.badge,
            {
              backgroundColor: colors.cyanLight,
              borderColor: colors.accentPrimary + '40',
            },
          ]}>
          <Ionicons name="flash" size={12} color={colors.accentPrimary} />
          <Text
            style={[stylesLanding.badgeText, { color: colors.accentPrimary }]}>
            NEXT-GEN MULTI-AGENT AI
          </Text>
        </View>
        <Text
          style={[
            stylesLanding.heroTitle,
            { fontSize: 28, color: colors.textPrimary },
          ]}>
          One Interface.
        </Text>
        <Text
          style={[
            stylesLanding.heroSubtitle,
            { fontSize: 28, color: colors.accentPrimary },
          ]}>
          Infinite Intelligence.
        </Text>
        <Text style={[stylesLanding.heroDesc, { color: colors.textSecondary }]}>
          AURA AI orchestrates specialized agents to manage your life, health,
          creativity, and mental wellness.
        </Text>
      </View>

      <View
        style={[
          stylesLanding.features,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.borderPrimary,
          },
        ]}>
        <View style={stylesLanding.featureItem}>
          <View
            style={[
              stylesLanding.featureIcon,
              { backgroundColor: '#6366F120' },
            ]}>
            <Ionicons name="chatbubbles" size={24} color="#6366F1" />
          </View>
          <View style={stylesLanding.featureText}>
            <Text
              style={[
                stylesLanding.featureTitle,
                { color: colors.textPrimary },
              ]}>
              7 Specialized Agents
            </Text>
            <Text
              style={[
                stylesLanding.featureDesc,
                { color: colors.textSecondary },
              ]}>
              From finance to fitness, each agent is an expert in its domain
            </Text>
          </View>
        </View>

        <View style={stylesLanding.featureDivider} />

        <View style={stylesLanding.featureItem}>
          <View
            style={[
              stylesLanding.featureIcon,
              { backgroundColor: '#00C85320' },
            ]}>
            <Ionicons name="sync" size={24} color="#00C853" />
          </View>
          <View style={stylesLanding.featureText}>
            <Text
              style={[
                stylesLanding.featureTitle,
                { color: colors.textPrimary },
              ]}>
              Smart Coordination
            </Text>
            <Text
              style={[
                stylesLanding.featureDesc,
                { color: colors.textSecondary },
              ]}>
              Agents work together to provide comprehensive solutions
            </Text>
          </View>
        </View>

        <View style={stylesLanding.featureDivider} />

        <View style={stylesLanding.featureItem}>
          <View
            style={[
              stylesLanding.featureIcon,
              { backgroundColor: '#FF980020' },
            ]}>
            <Ionicons name="shield" size={24} color="#FF9800" />
          </View>
          <View style={stylesLanding.featureText}>
            <Text
              style={[
                stylesLanding.featureTitle,
                { color: colors.textPrimary },
              ]}>
              Privacy First
            </Text>
            <Text
              style={[
                stylesLanding.featureDesc,
                { color: colors.textSecondary },
              ]}>
              Your data stays secure with end-to-end encryption
            </Text>
          </View>
        </View>
      </View>

      <TestimonialsSlider settings={settings} />

      <TouchableOpacity
        style={[
          stylesLanding.getStartedButton,
          { backgroundColor: colors.accentPrimary },
        ]}
        onPress={() => onSelectAgent('agents')}
        activeOpacity={0.8}>
        <Text
          style={[
            stylesLanding.getStartedText,
            { color: settings.theme === 'light' ? '#FFFFFF' : '#000000' },
          ]}>
          Explore All Agents
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color={settings.theme === 'light' ? '#FFFFFF' : '#000000'}
        />
      </TouchableOpacity>

      <Footer settings={settings} />
    </ScrollView>
  );
};

const stylesLanding = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  hero: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontWeight: '800',
  },
  heroSubtitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  features: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 16,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  getStartedText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});

// ==================== AGENTS HUB ====================
const AgentsHub = ({ onSelectAgent, settings }) => {
  const agentCategories = [
    {
      title: 'Productivity',
      agents: [
        {
          id: 'general',
          name: 'Aura Prime',
          icon: 'chatbubbles',
          color: '#6366F1',
          desc: 'General Assistance',
        },
        {
          id: 'planner',
          name: 'Task Planner',
          icon: 'calendar',
          color: '#00BCD4',
          desc: 'Schedules & Workflows',
        },
        {
          id: 'creative',
          name: 'Creative Muse',
          icon: 'brush',
          color: '#F43F5E',
          desc: 'Art, Writing & Ideas',
        },
      ],
    },
    {
      title: 'Health & Wellness',
      agents: [
        {
          id: 'nutrition',
          name: 'Nutritionist',
          icon: 'restaurant',
          color: '#FF9800',
          desc: 'Meal & Macro Tracking',
        },
        {
          id: 'fitness',
          name: 'Fitness Pro',
          icon: 'fitness',
          color: '#A855F7',
          desc: 'Workout Performance',
        },
        {
          id: 'mental',
          name: 'Mind Harmony',
          icon: 'heart',
          color: '#EC4899',
          desc: 'Mental Wellness',
        },
      ],
    },
    {
      title: 'Finance',
      agents: [
        {
          id: 'finance',
          name: 'Finance Guru',
          icon: 'wallet',
          color: '#00C853',
          desc: 'Wealth Optimization',
        },
      ],
    },
  ];

  const colors = getThemeColors(settings.theme);

  return (
    <ScrollView
      style={[stylesAgentsHub.container, { backgroundColor: colors.bgPrimary }]}
      contentContainerStyle={stylesAgentsHub.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={stylesAgentsHub.header}>
        <View style={stylesAgentsHub.headerContent}>
          <Text style={[stylesAgentsHub.title, { color: colors.textPrimary }]}>
            AI Agents
          </Text>
          <Text
            style={[stylesAgentsHub.subtitle, { color: colors.textSecondary }]}>
            Specialized assistants for every need
          </Text>
        </View>
        
      </View>

      {agentCategories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={stylesAgentsHub.category}>
          <View style={stylesAgentsHub.categoryHeader}>
            <Text
              style={[
                stylesAgentsHub.categoryTitle,
                { color: colors.textPrimary },
              ]}>
              {category.title}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={stylesAgentsHub.agentRow}>
            {category.agents.map((agent) => (
              <TouchableOpacity
                key={agent.id}
                style={[
                  stylesAgentsHub.agentCard,
                  {
                    backgroundColor: colors.bgCard,
                    borderColor: colors.borderPrimary,
                  },
                ]}
                onPress={() => onSelectAgent(agent.id)}
                activeOpacity={0.7}>
                <View
                  style={[
                    stylesAgentsHub.agentIcon,
                    { backgroundColor: agent.color + '20' },
                  ]}>
                  <Ionicons name={agent.icon} size={24} color={agent.color} />
                </View>
                <Text
                  style={[
                    stylesAgentsHub.agentName,
                    { color: colors.textPrimary },
                  ]}>
                  {agent.name}
                </Text>
                <Text
                  style={[
                    stylesAgentsHub.agentDesc,
                    { color: colors.textSecondary },
                  ]}>
                  {agent.desc}
                </Text>
                <View style={stylesAgentsHub.agentFooter}>
                  <View
                    style={[
                      stylesAgentsHub.statusDot,
                      { backgroundColor: colors.onlineStatus },
                    ]}
                  />
                  <Text
                    style={[
                      stylesAgentsHub.statusText,
                      { color: colors.textTertiary },
                    ]}>
                    ONLINE
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      <View
        style={[
          stylesAgentsHub.featured,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.borderPrimary,
          },
        ]}>
        <Text
          style={[
            stylesAgentsHub.featuredTitle,
            { color: colors.textPrimary },
          ]}>
          ✨ Featured Agent
        </Text>
        <View style={stylesAgentsHub.featuredContent}>
          <View
            style={[
              stylesAgentsHub.featuredIcon,
              { backgroundColor: '#6366F120' },
            ]}>
            <Ionicons name="flash" size={28} color="#6366F1" />
          </View>
          <View style={stylesAgentsHub.featuredText}>
            <Text
              style={[
                stylesAgentsHub.featuredName,
                { color: colors.textPrimary },
              ]}>
              Aura Prime
            </Text>
            <Text
              style={[
                stylesAgentsHub.featuredDesc,
                { color: colors.textSecondary },
              ]}>
              Your all-in-one assistant for any task
            </Text>
          </View>
          <TouchableOpacity
            style={[
              stylesAgentsHub.featuredButton,
              { backgroundColor: '#6366F1' },
            ]}
            onPress={() => onSelectAgent('general')}>
            <Text
              style={[
                stylesAgentsHub.featuredButtonText,
                {
                  color: settings.theme === 'light' ? '#FFFFFF' : '#000000',
                },
              ]}>
              Try Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const stylesAgentsHub = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  agentRow: {
    paddingRight: 16,
  },
  agentCard: {
    width: 160,
    padding: 16,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  agentDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
    flex: 1,
  },
  agentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featured: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featuredText: {
    flex: 1,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
  },
  featuredButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  featuredButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

// ==================== AGENT SERVICE ====================

// ==================== SUPABASE MANAGER ====================
class SupabaseManager {
  constructor() {
    this.userId = null;
    this.userProfile = null;
    this.isInitialized = false;
    this.dataCache = new Map();
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('🔐 Initializing SupabaseManager...');
      const {
        data: { session },
        error,
      } = await supabaseService.supabase.auth.getSession();

      if (error) {
        console.error('❌ Session error:', error.message);
        throw error;
      }

      if (session?.user) {
        this.userId = session.user.id;
        this.isInitialized = true;
        this.isConnected = true;
        console.log(
          '✅ User session found:',
          this.userId.substring(0, 8) + '...'
        );

        const profileResult = await this.getUserProfile();
        if (profileResult.success) {
          this.userProfile = profileResult.profile;
        }

        await this.preloadUserData();

        return { success: true, user: session.user, profile: this.userProfile };
      }

      this.isInitialized = true;
      console.log('ℹ️ No active session');
      return { success: true };
    } catch (error) {
      console.error('❌ Initialize error:', error.message);
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  async preloadUserData() {
    if (!this.userId) return;
    console.log('📦 Preloading user data...');
    await Promise.all([
      this.getMeals(),
      this.getWorkouts(),
      this.getTransactions(),
      this.getTasks(),
    ]);
    console.log('✅ User data preloaded');
  }

  // AUTHENTICATION METHODS
  async signUp(email, password, name) {
    try {
      console.log('📝 Signing up user:', email);
      const result = await supabaseService.auth.signUp(email, password, name);
      if (result.success) {
        this.userId = result.user.id;
        console.log('✅ User signed up:', this.userId.substring(0, 8) + '...');

        const profileResult = await supabaseService.auth.createUserProfile(
          this.userId,
          email,
          name
        );
        if (profileResult.success) {
          const getProfileResult = await this.getUserProfile();
          if (getProfileResult.success) {
            this.userProfile = getProfileResult.profile;
          }
        }
        await this.initializeDefaultData();
      }
      return result;
    } catch (error) {
      console.error('❌ Sign up error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      console.log('🔑 Signing in user:', email);
      const result = await supabaseService.auth.signIn(email, password);
      if (result.success) {
        this.userId = result.user.id;
        console.log('✅ User signed in:', this.userId.substring(0, 8) + '...');
        const profileResult = await this.getUserProfile();
        if (profileResult.success) {
          this.userProfile = profileResult.profile;
        }
        await this.preloadUserData();
      }
      return result;
    } catch (error) {
      console.error('❌ Sign in error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      console.log('🚪 Signing out user');
      const result = await supabaseService.auth.signOut();
      if (result.success) {
        this.userId = null;
        this.userProfile = null;
        this.dataCache.clear();
        console.log('✅ User signed out');
      }
      return result;
    } catch (error) {
      console.error('❌ Sign out error:', error.message);
      return { success: false, error: error.message };
    }
  }



  // USER PROFILE
  async getUserProfile() {
    if (!this.userId) {
      console.log('❌ No user logged in');
      return { success: false, error: 'No user logged in' };
    }
    try {
      return await supabaseService.auth.getUserProfile(this.userId);
    } catch (error) {
      console.error('❌ Get user profile error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ============ SIMPLIFIED DATA METHODS ============

  // NUTRITION - SIMPLIFIED
// Find this in SupabaseManager class (around line 3000)
async saveMeal(foodName, calories = 0) {  // ADD calories parameter
  if (!this.userId) return { success: false, error: 'No user logged in' };

  try {
    const simpleMealData = {
      food_name: foodName,
      calories: calories,  // USE the passed calories
      protein: 0,
      carbs: 0,
      fats: 0,
      meal_type: 'meal',
    };

    const result = await supabaseService.nutrition.saveMeal(
      this.userId,
      simpleMealData
    );
    if (result.success) {
      this.dataCache.delete('meals');
      this.dataCache.delete('meals_today');
      console.log(`✅ Meal saved: ${foodName} (${calories} cal)`);
    }
    return result;
  } catch (error) {
    console.error('❌ Save meal error:', error.message);
    return { success: false, error: error.message };
  }
}

 // In SupabaseManager class - Update getMeals method

async getMeals() {
  if (!this.userId)
    return { success: false, error: 'No user logged in', meals: [] };

  try {
    const result = await supabaseService.nutrition.getTodaysMeals(
      this.userId
    );
    
    // Log to verify calories are coming back
    if (result.success && result.meals) {
      console.log('📊 Meals from DB with calories:', 
        result.meals.map(m => ({
          food: m.food_name,
          calories: m.calories
        }))
      );
    }
    
    return result;
  } catch (error) {
    console.error('❌ Get meals error:', error.message);
    return { success: false, error: error.message, meals: [] };
  }
}

  async deleteMeal(mealId) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.nutrition.deleteMeal(mealId);
      if (result.success) {
        this.dataCache.delete('meals');
        this.dataCache.delete('meals_today');
        console.log('✅ Meal deleted:', mealId);
      }
      return result;
    } catch (error) {
      console.error('❌ Delete meal error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async clearAllMeals() {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.nutrition.clearAllMeals(this.userId);
      if (result.success) {
        this.dataCache.delete('meals');
        this.dataCache.delete('meals_today');
        console.log('✅ All meals cleared');
      }
      return result;
    } catch (error) {
      console.error('❌ Clear all meals error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // FITNESS - SIMPLIFIED
// In SupabaseManager class
// In SupabaseManager class, make sure these methods exist:

async saveWorkout(workoutName, duration = 30, calories = 0) {
  if (!this.userId) return { success: false, error: 'No user logged in' };

  try {
    const workoutData = {
      exercise_type: workoutName,
      duration_minutes: duration,
      calories_burned: calories,
      intensity: calories > 200 ? 'High' : calories > 100 ? 'Medium' : 'Low',
    };

    const result = await supabaseService.fitness.saveWorkout(
      this.userId,
      workoutData
    );
    
    if (result.success) {
      this.dataCache.delete('workouts');
      console.log(`✅ Workout saved: ${workoutName} (${calories} cal)`);
    }
    return result;
  } catch (error) {
    console.error('❌ Save workout error:', error.message);
    return { success: false, error: error.message };
  }
}

async getWorkouts() {
  if (!this.userId)
    return { success: false, error: 'No user logged in', workouts: [] };

  try {
    const result = await supabaseService.fitness.getTodaysWorkouts(this.userId);
    return result;
  } catch (error) {
    console.error('❌ Get workouts error:', error.message);
    return { success: false, error: error.message, workouts: [] };
  }
}

async deleteWorkout(workoutId) {
  if (!this.userId) return { success: false, error: 'No user logged in' };

  try {
    const result = await supabaseService.fitness.deleteWorkout(workoutId);
    if (result.success) {
      this.dataCache.delete('workouts');
      console.log('✅ Workout deleted:', workoutId);
    }
    return result;
  } catch (error) {
    console.error('❌ Delete workout error:', error.message);
    return { success: false, error: error.message };
  }
}

async clearAllWorkouts() {
  if (!this.userId) return { success: false, error: 'No user logged in' };

  try {
    const result = await supabaseService.fitness.clearAllWorkouts(this.userId);
    if (result.success) {
      this.dataCache.delete('workouts');
      console.log('✅ All workouts cleared');
    }
    return result;
  } catch (error) {
    console.error('❌ Clear all workouts error:', error.message);
    return { success: false, error: error.message };
  }
}
  // FINANCE - SIMPLIFIED
  async saveTransaction(description, amount, type = 'expense') {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const transactionData = {
        description: description,
        amount: amount,
        type: type,
        category: type === 'income' ? 'Income' : 'Expense',
      };

      const result = await supabaseService.finance.saveTransaction(
        this.userId,
        transactionData
      );
      if (result.success) {
        this.dataCache.delete('transactions');
        console.log('✅ Transaction saved:', description);
      }
      return result;
    } catch (error) {
      console.error('❌ Save transaction error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getTransactions() {
    if (!this.userId)
      return { success: false, error: 'No user logged in', transactions: [] };

    try {
      const result = await supabaseService.finance.getRecentTransactions(
        this.userId,
        50
      );
      return result;
    } catch (error) {
      console.error('❌ Get transactions error:', error.message);
      return { success: false, error: error.message, transactions: [] };
    }
  }

  async deleteTransaction(transactionId) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.finance.deleteTransaction(
        transactionId
      );
      if (result.success) {
        this.dataCache.delete('transactions');
        console.log('✅ Transaction deleted:', transactionId);
      }
      return result;
    } catch (error) {
      console.error('❌ Delete transaction error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async clearAllTransactions() {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.finance.clearAllTransactions(
        this.userId
      );
      if (result.success) {
        this.dataCache.delete('transactions');
        console.log('✅ All transactions cleared');
      }
      return result;
    } catch (error) {
      console.error('❌ Clear all transactions error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // PLANNER - SIMPLIFIED
  async saveTask(taskName) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const taskData = {
        title: taskName,
        description: '',
        priority: 'medium',
        category: 'General',
        status: 'pending',
      };

      const result = await supabaseService.planner.saveTask(
        this.userId,
        taskData
      );
      if (result.success) {
        this.dataCache.delete('tasks');
        this.dataCache.delete('tasks_pending');
        console.log('✅ Task saved:', taskName);
      }
      return result;
    } catch (error) {
      console.error('❌ Save task error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getTasks() {
    if (!this.userId)
      return { success: false, error: 'No user logged in', tasks: [] };

    try {
      const result = await supabaseService.planner.getTasks(
        this.userId,
        'pending',
        50
      );
      return result;
    } catch (error) {
      console.error('❌ Get tasks error:', error.message);
      return { success: false, error: error.message, tasks: [] };
    }
  }

  async updateTask(taskId, updates) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.planner.updateTask(taskId, updates);
      if (result.success) {
        this.dataCache.delete('tasks');
        this.dataCache.delete('tasks_pending');
        console.log('✅ Task updated:', taskId);
      }
      return result;
    } catch (error) {
      console.error('❌ Update task error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteTask(taskId) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.planner.deleteTask(taskId);
      if (result.success) {
        this.dataCache.delete('tasks');
        this.dataCache.delete('tasks_pending');
        console.log('✅ Task deleted:', taskId);
      }
      return result;
    } catch (error) {
      console.error('❌ Delete task error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async clearAllTasks() {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      const result = await supabaseService.planner.clearAllTasks(this.userId);
      if (result.success) {
        this.dataCache.delete('tasks');
        this.dataCache.delete('tasks_pending');
        console.log('✅ All tasks cleared');
      }
      return result;
    } catch (error) {
      console.error('❌ Clear all tasks error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // CONVERSATIONS
  async saveConversation(agentId, message, response, metadata = {}) {
    if (!this.userId) return { success: false, error: 'No user logged in' };
    try {
      return await supabaseService.conversations.saveConversation(
        this.userId,
        agentId,
        message,
        response,
        metadata
      );
    } catch (error) {
      console.error('❌ Save conversation error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // SETTINGS
  async saveSettings(settings) {
    if (!this.userId) return { success: false, error: 'No user logged in' };
    try {
      return await supabaseService.settings.saveSettings(this.userId, settings);
    } catch (error) {
      console.error('❌ Save settings error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getSettings() {
    if (!this.userId)
      return { success: false, error: 'No user logged in', settings: null };
    try {
      return await supabaseService.settings.getSettings(this.userId);
    } catch (error) {
      console.error('❌ Get settings error:', error.message);
      return { success: false, error: error.message, settings: null };
    }
  }

  // SIMPLE DATA CLEARING
  async clearAllData(type) {
    if (!this.userId) return { success: false, error: 'No user logged in' };

    try {
      let result;
      switch (type) {
        case 'meals':
          result = await this.clearAllMeals();
          break;
        case 'workouts':
          result = await this.clearAllWorkouts();
          break;
        case 'transactions':
          result = await this.clearAllTransactions();
          break;
        case 'tasks':
          result = await this.clearAllTasks();
          break;
      }

      if (result) {
        console.log(`✅ Cleared all ${type}`);
        return result;
      }

      return { success: false, error: 'Invalid data type' };
    } catch (error) {
      console.error(`❌ Clear all ${type} error:`, error);
      return { success: false, error: error.message };
    }
  }

  async initializeDefaultData() {
    if (!this.userId) return;
    try {
      console.log('📝 Initializing default data for user');
      const welcomeTasks = [
        {
          title: 'Explore Aura AI features',
          description: 'Try out different AI agents',
          priority: 'medium',
          category: 'Onboarding',
        },
      ];
      for (const task of welcomeTasks) {
        await this.saveTask(task.title);
      }
      console.log('✅ Default data initialized');
    } catch (error) {
      console.error('❌ Initialize default data error:', error);
    }
  }

  clearCache() {
    console.log('🗑️ Clearing data cache');
    this.dataCache.clear();
  }

  async refreshAllData() {
    console.log('🔄 Refreshing all data');
    this.clearCache();
    return this.preloadUserData();
  }
}

// ==================== AGENT SERVICE ====================
// ==================== AGENT SERVICE ====================
// ==================== AGENT SERVICE ====================
class AgentService {
  constructor() {
    console.log('🤖 AgentService created');
    this.agents = {};
    this.userId = null;
    this.aiService = new AIService();

    // Import message bus and memory manager
    try {
      this.messageBus = messageBus;
      this.memoryManager = memoryManager;
      console.log('✅ Connected to MessageBus and MemoryManager');
    } catch (error) {
      console.error(
        '❌ Failed to connect to MessageBus/MemoryManager:',
        error.message
      );
    }

    this.initializeAgents();
  }

  initializeAgents() {
    console.log('🤖 Initializing agents with full integration...');

    try {
      // Create agent instances with full integration
      this.agents = {
        general: new GeneralAssistantAgentClass(this.aiService, this),
        nutrition: new NutritionAgentClass(this.aiService, this),
        fitness: new FitnessAgentClass(this.aiService, this),
        finance: new FinanceAgentClass(this.aiService, this),
        planner: new PlannerAgentClass(this.aiService, this),
        creative: new CreativeAgentClass(this.aiService, this),
        mental: new MentalWellnessAgentClass(this.aiService, this),
      };

      // Connect all agents to message bus
      Object.values(this.agents).forEach((agent) => {
        if (this.messageBus && agent.id) {
          this.messageBus.agents.set(agent.id, agent);
          console.log(`🔗 Connected ${agent.id} to MessageBus`);
        }
      });

      console.log(
        `✅ Created ${Object.keys(this.agents).length} fully integrated agents`
      );
    } catch (error) {
      console.error('❌ Error initializing agents:', error.message);
      // Don't call createBasicAgents if it doesn't exist
      console.log('⚠️ Using fallback agent creation');
      this.createFallbackAgents();
    }
  }

// Add this method to AgentService class
updateAllAgentsWithUserName(userName) {
  console.log(`🔄 Updating all agents with username: ${userName}`);
  
  Object.values(this.agents).forEach(agent => {
    try {
      if (agent) {
        // Set username
        agent.currentUserName = userName;
        
        // ✅ FORCE-ADD A WORKING getEnhancedResponse
        if (!agent.getEnhancedResponse || typeof agent.getEnhancedResponse !== 'function') {
          console.log(`⚠️ Adding PROPER getEnhancedResponse to ${agent.id}`);
          
          agent.getEnhancedResponse = async function(baseResponse) {
            console.log(`🎨 ${this.id} FORCE-METHOD for user: ${this.currentUserName}`);
            
            // BRUTE FORCE OVERRIDE
            if (this.currentUserName && this.currentUserName !== 'Guest') {
              
              // Check last message
              let lastUserMessage = '';
              if (this.conversationHistory && this.conversationHistory.length > 0) {
                const lastMsg = this.conversationHistory[this.conversationHistory.length - 1];
                lastUserMessage = (lastMsg.content || '').toLowerCase();
              }
              
              // If user asked about name
              if (lastUserMessage.includes('what is my name') ||
                  lastUserMessage.includes('whats my name') ||
                  lastUserMessage.includes('do you know my name')) {
                console.log(`💥 FORCE OVERRIDE: Name question detected`);
                return `Your name is ${this.currentUserName}! 😊`;
              }
              
              // If AI says it doesn't know
              if (baseResponse.toLowerCase().includes("don't know") ||
                  baseResponse.toLowerCase().includes("no information")) {
                console.log(`💥 FORCE OVERRIDE: AI says doesn't know`);
                return `Actually, I know you're ${this.currentUserName}! 😊`;
              }
            }
            
            return baseResponse;
          };
        }
        
        console.log(`✅ ${agent.id} now knows user as: ${userName}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to update ${agent.id}:`, error.message);
    }
  });
}
// In AgentService.setUserProfile method:
setUserProfile(userId, userName, userProfile = null) {
  this.userId = userId;
  this.userName = userName;
  this.userProfile = userProfile;
  
  console.log(`👤 AgentService: User profile set for ${userName} (${userId ? userId.substring(0, 8) + '...' : 'anonymous'})`);
  
  // Update all agents with username
  this.updateAllAgentsWithUserName(userName);
  
  // Also update the message context for future messages
  this.messageContext = {
    userId: userId,
    userName: userName,
    userProfile: userProfile
  };
}
  // FIX: Added this missing method
  createFallbackAgents() {
    console.log('⚠️ Creating fallback agents...');

    // Create simple agent objects
    const agents = {
      general: {
        id: 'general',
        role: 'Aura Prime',
        receiveMessage: async () => ({
          reply: "Hello! I'm Aura Prime, your general assistant.",
          showToUser: true,
        }),
      },
      nutrition: {
        id: 'nutrition',
        role: 'Nutrition Expert',
        receiveMessage: async () => ({
          reply: "I'm your Nutrition Expert! Tell me what you ate.",
          showToUser: true,
        }),
      },
      fitness: {
        id: 'fitness',
        role: 'Fitness Pro',
        receiveMessage: async () => ({
          reply: "I'm your Fitness Pro! Tell me about your workout.",
          showToUser: true,
        }),
      },
      finance: {
        id: 'finance',
        role: 'Finance Guru',
        receiveMessage: async () => ({
          reply: "I'm your Finance Guru! Tell me about your spending.",
          showToUser: true,
        }),
      },
      planner: {
        id: 'planner',
        role: 'Task Planner',
        receiveMessage: async () => ({
          reply: "I'm your Task Planner! Tell me what to schedule.",
          showToUser: true,
        }),
      },
      creative: {
        id: 'creative',
        role: 'Creative Muse',
        receiveMessage: async () => ({
          reply: "I'm your Creative Muse! Need inspiration?",
          showToUser: true,
        }),
      },
      mental: {
        id: 'mental',
        role: 'Mind Harmony',
        receiveMessage: async () => ({
          reply: "I'm Mind Harmony. How are you feeling?",
          showToUser: true,
        }),
      },
    };

    this.agents = agents;
    console.log(`✅ Created ${Object.keys(agents).length} fallback agents`);
  }

  setUserId(userId) {
    this.userId = userId;
    console.log(
      `👤 AgentService: User ID set to ${
        userId ? userId.substring(0, 8) + '...' : 'anonymous'
      }`
    );

    // Update all agents with user ID
    Object.values(this.agents).forEach((agent) => {
      if (agent.setCurrentUser) {
        agent.setCurrentUser(userId);
      }
    });
  }

  // ... rest of the AgentService class remains the same ...

  // In AgentService class - NOT AIService
  // In AgentService class, update the getAgentResponse method:
async getAgentResponse(agentId, userMessage, userId = null) {
  const lowerMessage = userMessage ? userMessage.toLowerCase() : '';
/*const ye = userMessage ? userMessage.toLowerCase() : ''; */
  console.log(`📨 [AgentService] Getting response from ${agentId} for: "${userMessage.substring(0, 30)}..."`);

    // ✅ NUCLEAR OPTION: INTERCEPT AND ANSWER DIRECTLY
  /*const lowerMessage = userMessage.toLowerCase();
  if (this.userName && (lowerMessage.includes('name') || lowerMessage.includes('who am i'))) {
    console.log(`💥💥💥 DIRECT INTERCEPTION FOR ${this.userName}`);
    return `Your name is ${this.userName}! 😊`;
  }*/

    const exactNameQuestions = [
    'what is my name',
    'whats my name',
    'do you know my name',
    'who am i',
    'tell me my name'
  ];
  
  if (this.userName && exactNameQuestions.some(q => lowerMessage.includes(q))) {
    console.log(`💥💥💥 DIRECT INTERCEPTION FOR NAME QUESTION`);
    return `Your name is ${this.userName}! 😊`;
  }
  
  // If not a name question, continue normally
  if (!this.agents[agentId]) {
    return this.getFallbackResponse(agentId, userMessage);
  }
  
  // Update user ID if provided
  if (userId && userId !== this.userId) {
    this.setUserId(userId);
  }
    
  
  // Check if agent exists
  if (!this.agents[agentId]) {
    console.error(`❌ Agent ${agentId} not found!`);
    return this.getFallbackResponse(agentId, userMessage);
  }
  
  try {
    // Get cross-agent knowledge
    let crossAgentContext = '';
    
    // Create message object
    const message = {
      from: 'user',
      content: userMessage,
      userId: this.userId,
      userName: this.userName, // ✅ ADD THIS
      timestamp: new Date().toISOString()
    };
    
    console.log(`🤖 [${agentId}] Processing with cross-agent knowledge...`);
    console.log(`👤 User context - ID: ${this.userId ? this.userId.substring(0, 8) + '...' : 'none'}, Name: ${this.userName || 'unknown'}`);
    
    let response = '';
    
    // Try AI service first
    try {
      const aiResponse = await this.aiService.getAgentResponse(agentId, userMessage, this.userId);
      if (aiResponse && aiResponse.length > 20) {
        response = crossAgentContext + aiResponse;
        console.log(`✅ [${agentId}] AI service responded`);
      }
    } catch (aiError) {
      console.log(`⚠️ [${agentId}] AI service failed:`, aiError.message);
    }
    
    // If no AI response, use agent logic
    if (!response || response.length < 10) {
      const agent = this.agents[agentId];
      if (agent.receiveMessage) {
        const agentResponse = await agent.receiveMessage(message);
        if (agentResponse && agentResponse.reply) {
          response = crossAgentContext + agentResponse.reply;
        }
      }
    }
    
    // If still no response, use fallback
    if (!response || response.length < 10) {
      response = crossAgentContext + this.getFallbackResponse(agentId, userMessage);
    }
    
    // ✅ CRITICAL FIX: ALWAYS call getEnhancedResponse on the AGENT
    const agent = this.agents[agentId];
    if (agent && typeof agent.getEnhancedResponse === 'function') {
      console.log(`🎨 [${agentId}] Applying personalization for user: ${agent.currentUserName || 'unknown'}`);
      response = await agent.getEnhancedResponse(response);
    } else {
      console.log(`⚠️ [${agentId}] No getEnhancedResponse method available`);
    }
    
    // Share knowledge with other agents
    await this.shareKnowledgeToOtherAgents(agentId, userMessage, response);
    
    console.log(`🎯 [${agentId}] Returning ${response.length} chars`);
    return response;
    
  } catch (error) {
    console.error(`❌ [${agentId}] Error getting response:`, error.message);
    return this.getFallbackResponse(agentId, userMessage);
  }
}
  async shareKnowledgeToOtherAgents(sourceAgentId, userMessage, agentResponse) {
    if (!this.userId || !this.memoryManager || !sourceAgentId) {
      return;
    }

    try {
      const memory = this.memoryManager.getMemoryForUser(this.userId);
      if (!memory || !memory.addBroadcast) {
        return;
      }

      const lowerMsg = userMessage.toLowerCase();
      const targetAgents = [];

      // Determine which agents should know about this
      if (
        lowerMsg.includes('food') ||
        lowerMsg.includes('eat') ||
        lowerMsg.includes('meal') ||
        lowerMsg.includes('diet') ||
        lowerMsg.includes('hungry') ||
        lowerMsg.includes('snack')
      ) {
        if (sourceAgentId !== 'nutrition') targetAgents.push('nutrition');

        // Also share with fitness and planner for context
        if (sourceAgentId !== 'fitness') targetAgents.push('fitness');
        if (sourceAgentId !== 'planner') targetAgents.push('planner');
      }

      // Fitness messages might involve nutrition
      if (
        lowerMsg.includes('workout') ||
        lowerMsg.includes('exercise') ||
        lowerMsg.includes('gym') ||
        lowerMsg.includes('run') ||
        lowerMsg.includes('walk')
      ) {
        if (sourceAgentId !== 'nutrition') targetAgents.push('nutrition');
        if (sourceAgentId !== 'fitness') targetAgents.push('fitness');
        if (sourceAgentId !== 'mental') targetAgents.push('mental');
      }

      // Finance messages about food spending
      if (
        lowerMsg.includes('food') &&
        (lowerMsg.includes('$') ||
          lowerMsg.includes('buy') ||
          lowerMsg.includes('cost'))
      ) {
        if (sourceAgentId !== 'nutrition') targetAgents.push('nutrition');
        if (sourceAgentId !== 'finance') targetAgents.push('finance');
      }

      // ===== CRITICAL FIX: PREFERENCES ARE SHARED WITH ALL AGENTS =====
      if (
        lowerMsg.includes('love') ||
        lowerMsg.includes('like') ||
        lowerMsg.includes('hate') ||
        lowerMsg.includes('favorite') ||
        lowerMsg.includes('enjoy') ||
        lowerMsg.includes('dislike')
      ) {
        // Share with ALL agents except self
        const allAgents = [
          'nutrition',
          'fitness',
          'finance',
          'planner',
          'creative',
          'mental',
          'general',
        ];
        allAgents.forEach((agentId) => {
          if (agentId !== sourceAgentId) {
            targetAgents.push(agentId);
          }
        });
      }

      // Remove duplicates
      const uniqueTargets = [...new Set(targetAgents)];

      if (uniqueTargets.length > 0) {
        console.log(
          `📢 Sharing knowledge from ${sourceAgentId} to: ${uniqueTargets.join(
            ', '
          )}`
        );

        await memory.addBroadcast(
          sourceAgentId,
          uniqueTargets,
          `User told ${sourceAgentId}: "${userMessage.substring(0, 100)}"`,
          'cross_agent_share'
        );

        // Also store in knowledge base
        const thing = this.extractThingFromMessage(userMessage);
        if (thing) {
          await memory.addSharedKnowledge(
            sourceAgentId,
            `User mentioned "${thing}" to ${sourceAgentId}`,
            'preference',
            75
          );
        }
      }
    } catch (error) {
      console.log(
        `⚠️ Knowledge sharing error for ${sourceAgentId}:`,
        error.message
      );
    }
  }

  extractThingFromMessage(message) {
    if (!message || typeof message !== 'string') return null;

    const patterns = [
      /I (?:love|like|enjoy|hate|dislike) (.+?)(?:\.|!|\?|,|$)/i,
      /my favorite (.+?) is/i,
      /I'm (?:really )?into (.+?)(?:\.|!|\?|,|$)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        return match[1].trim();
      }
    }

    return null;
  }

  getFallbackResponse(agentId, userMessage) {
    const trimmedMessage = userMessage ? userMessage.substring(0, 50) : '';
    const fallbacks = {
      general: `Hello! I'm Aura Prime. You said: "${trimmedMessage}...". How can I help you today?`,
      nutrition: `I'm your Nutrition Expert! Regarding "${trimmedMessage}...", tell me what you ate or ask about healthy eating.`,
      fitness: `I'm your Fitness Pro! About "${trimmedMessage}...", tell me about your workout or ask for exercise advice.`,
      finance: `I'm your Finance Guru! For "${trimmedMessage}...", tell me about your spending or ask for money advice.`,
      planner: `I'm your Task Planner! Regarding "${trimmedMessage}...", tell me what you need to schedule or ask about productivity.`,
      creative: `I'm your Creative Muse! Idea: "${trimmedMessage}...". Need inspiration? Let's brainstorm!`,
      mental: `I'm Mind Harmony. You shared: "${trimmedMessage}...". I'm here to listen and support your mental wellness.`,
    };

    return (
      fallbacks[agentId] ||
      `Hello! Regarding "${trimmedMessage}...", how can I help you?`
    );
  }
}

// ==================== CREATE GLOBAL INSTANCES ====================
let supabaseManager;
let agentService;

try {
  console.log('🚀 Creating global instances...');
  supabaseManager = new SupabaseManager();
  agentService = new AgentService();
  console.log('✅ Global instances created successfully');
} catch (error) {
  console.error('❌ Failed to create global instances:', error.message);
  // Create fallback instances
  supabaseManager = {
    userId: null,
    saveMeal: async () => ({ success: true }),
    saveWorkout: async () => ({ success: true }),
    saveTransaction: async () => ({ success: true }),
    saveTask: async () => ({ success: true }),
  };
  agentService = new AgentService();
}

// ==================== ENHANCED BASE AGENT ====================
// ==================== ENHANCED BASE AGENT ====================
class BaseAgent {
  constructor(id, role = 'Assistant', aiService = null, agentService = null) {
    this.id = id;
    this.role = role;
    this.messageBus = messageBus; // Use global message bus
    this.memoryManager = memoryManager; // Use global memory manager
    this.aiService = aiService;
    this.agentService = agentService;
    this.currentUserId = null;
    this.currentUserName = null; // ✅ Added: Store username
    this.userProfile = null; // ✅ Added: Store full profile
    this.conversationHistory = [];
      this.conversationHistory = []; // ✅ Make sure this is here
  

    console.log(`🤖 ${this.id} agent created with full memory integration`);
  }


// Add this method to BaseAgent:
getLastUserMessage() {
  if (this.conversationHistory.length === 0) return '';
  
  // Find the last message from user (not agent)
  for (let i = this.conversationHistory.length - 1; i >= 0; i--) {
    if (this.conversationHistory[i].from === 'user') {
      return this.conversationHistory[i].content || '';
    }
  }
  return '';

}
async getEnhancedResponse(baseResponse) {
  console.log(`💣 NUCLEAR FIX VERSION 2.0`);
  
  if (this.currentUserName && this.currentUserName !== 'Guest') {
    console.log(`✅ Username: ${this.currentUserName}`);
    
    // 1. Check conversation history for name questions
    if (this.conversationHistory && this.conversationHistory.length > 0) {
      const lastMsg = this.conversationHistory[this.conversationHistory.length - 1];
      if (lastMsg && lastMsg.content) {
        const userMsg = lastMsg.content.toLowerCase();
        
        // If user directly asks about their name
        if (userMsg.includes('what is my name') ||
            userMsg.includes('whats my name') ||
            userMsg.includes('do you know my name') ||
            userMsg.includes('who am i')) {
          
          console.log(`💥 NUCLEAR: User asked DIRECTLY about name`);
          return `Your name is ${this.currentUserName}! 😊`;
        }
      }
    }
    
    // 2. Check AI response for denial phrases
    const lowerResponse = baseResponse.toLowerCase();
    const aiDeniesKnowledge = 
      lowerResponse.includes("don't have") ||
      lowerResponse.includes("no information") ||
      lowerResponse.includes("first interaction") ||
      lowerResponse.includes("current conversation") ||
      lowerResponse.includes("start fresh") ||
        lowerResponse.includes("pre-existing record") ||
      lowerResponse.includes("don't know"); 
    
    if (aiDeniesKnowledge) {
      console.log(`💥 NUCLEAR: AI denies knowledge`);
     return `I don't know what you're asking for. Could you please rephrase your question?`;
    }
    
    // 3. Add name to greetings
    if (lowerResponse.includes('hello') || 
        lowerResponse.includes('hi ') || 
        lowerResponse.includes('hey ') ||
        lowerResponse.includes('welcome')) {
      
      if (/^(Hello|Hi|Hey|Welcome)/i.test(baseResponse)) {
        return baseResponse.replace(/^(Hello|Hi|Hey|Welcome)/i, `$1, ${this.currentUserName}`);
      }
    }
  }
  
  return baseResponse;
}

  // ✅ NEW: Check if we should greet with name
  shouldGreetWithName() {
    // Greet with name if we know it and conversation is empty or first message
    return this.currentUserName && 
           this.currentUserName !== 'Guest' && 
           this.conversationHistory.length === 0;
  }

  // ✅ NEW: Get personalized greeting
  getPersonalizedGreeting() {
    if (!this.currentUserName || this.currentUserName === 'Guest') {
      return "Hello!";
    }
    
    const greetings = [
      `Hello ${this.currentUserName}!`,
      `Hi ${this.currentUserName}!`,
      `Hey ${this.currentUserName}!`,
      `Great to see you, ${this.currentUserName}!`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // ✅ UPDATED: Set user with optional username and profile
  setCurrentUser(userId, userName = null, userProfile = null) {
    this.currentUserId = userId;
    
    // Update username if provided
    if (userName) {
      this.currentUserName = userName;
    }
    
    // Update profile if provided
    if (userProfile) {
      this.userProfile = userProfile;
    }
    
    console.log(
      `${this.id} now talking to user: ${
        userId ? userId.substring(0, 8) + '...' : 'anonymous'
      }${userName ? ` (Name: ${userName})` : ''}`
    );
  }

  // ✅ NEW: Simple method to set just the username
  setUserName(userName) {
    this.currentUserName = userName;
    console.log(`${this.id} now knows user as: ${userName}`);
  }

  // ✅ Keep all existing methods exactly as they were
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
          // Show only 3 most recent
          const agentName = this.getAgentDisplayName(item.agent);
          const timeAgo = this.getTimeAgo(item.timestamp);
          context += `• From ${agentName} (${timeAgo}): ${item.message.substring(
            0,
            60
          )}...\n`;
        }
      });

      return context;
    } catch (error) {
      console.log(`⚠️ ${this.id} cross-agent knowledge error:`, error.message);
      return '';
    }
  }

  async saveToMemory(message, response) {
    if (!this.currentUserId || !this.memoryManager) {
      return false;
    }

    try {
      const memory = this.memoryManager.getMemoryForUser(this.currentUserId);
      if (!memory) {
        return false;
      }

      // Save user message
      await memory.userToldAgent(this.id, message, 'user_message');

      // Save agent response
      await memory.agentResponded(this.id, response, 'agent_response');

      console.log(`💾 ${this.id} saved to memory`);
      return true;
    } catch (error) {
      console.log(`⚠️ ${this.id} memory save error:`, error.message);
      return false;
    }
  }

  getAgentDisplayName(agentId) {
    const names = {
      nutrition: 'Nutrition Expert',
      fitness: 'Fitness Pro',
      finance: 'Finance Guru',
      planner: 'Task Planner',
      creative: 'Creative Muse',
      mental: 'Mind Harmony',
      general: 'Aura Prime',
    };
    return names[agentId] || agentId;
  }

  getTimeAgo(timestamp) {
    if (!timestamp) return 'recently';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMs / 86400000);
    return `${diffDays}d ago`;
  }

  truncate(text, length) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
}
// ===== NUTRITION AGENT CLASS =====
class NutritionAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('nutrition', 'Nutrition Expert', aiService, agentService);
  }

  async receiveMessage(message) {
    console.log(
      `🍎 Nutrition processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );

      // ✅ ADD THESE LINES at the START:
  this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

    try {
      const crossKnowledge = await this.getCrossAgentKnowledge();
      let response = '';

      // Try AI service first
      if (this.aiService) {
        try {
          const aiResponse = await this.aiService.getAgentResponse(
            'nutrition',
            message.content,
            this.currentUserId
          );
          response = crossKnowledge + aiResponse;
        } catch (aiError) {
          console.log('⚠️ Nutrition AI failed:', aiError.message);
        }
      }

      // If no AI response, use fallback
      if (!response || response.length < 20) {
        response = crossKnowledge + this.getNutritionResponse(message.content);
      }

      // ===== CRITICAL FIX: Extract and save food =====
      const foodName = this.extractFoodFromMessage(message.content);
      if (
        foodName &&
        this.currentUserId &&
        this.currentUserId !== 'anonymous'
      ) {
        console.log(`🍎 Nutrition: Attempting to save meal "${foodName}"`);

        try {
          const result = await supabaseManager.saveMeal(foodName);

          if (result.success) {
            console.log(`✅ Nutrition: Successfully saved meal "${foodName}"`);
            response = `${response}\n\n✅ **Logged meal:** ${foodName}`;
          } else {
            console.error(`❌ Nutrition: Failed to save meal: ${result.error}`);
            response = `${response}\n\n⚠️ Couldn't save meal to database.`;
          }
        } catch (saveError) {
          console.error('❌ Meal save error:', saveError.message);
          response = `${response}\n\n⚠️ Error saving meal.`;
        }
      }

      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Nutrition error:', error.message);
      return {
        reply:
          "I'm your Nutrition Expert! Tell me what you ate or ask about healthy eating.",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  // In NutritionAgentClass - enhance the extractFoodFromMessage method
  extractFoodFromMessage(message) {
    if (!message || typeof message !== 'string') return null;

    const lowerMsg = message.toLowerCase();

    // Skip questions
    if (
      lowerMsg.startsWith('what') ||
      lowerMsg.startsWith('how') ||
      lowerMsg.includes('?')
    ) {
      return null;
    }

    // Simple patterns
    if (
      lowerMsg.includes('i ate') ||
      lowerMsg.includes('i had') ||
      lowerMsg.includes('i eat')
    ) {
      // Extract the food after "i ate"
      const match = message.match(
        /i\s+(?:ate|had|eat)\s+(.+?)(?:\s+(?:for|with|\.|!|\?|$))/i
      );
      if (match && match[1]) {
        const food = match[1].trim();
        if (food.length > 2) return food;
      }
    }

    if (lowerMsg.includes('add meal') || lowerMsg.includes('log meal')) {
      const match = message.match(
        /(?:add|log)\s+(?:meal\s+)?(.+?)(?:\s+(?:please|\.|!|\?|$))/i
      );
      if (match && match[1]) {
        const food = match[1].trim();
        if (food.length > 2) return food;
      }
    }

    // Single food word
    const foodWords = [
      'pizza',
      'burger',
      'salad',
      'pasta',
      'rice',
      'chicken',
      'fish',
      'soup',
      'steak',
      'taco',
      'sandwich',
      'sushi',
      'apple',
      'banana',
      'orange',
    ];

    for (const food of foodWords) {
      if (
        lowerMsg.includes(food) &&
        !lowerMsg.includes('what food') &&
        !lowerMsg.includes('which food')
      ) {
        return food;
      }
    }

    return null;
  }

  getNutritionResponse(message) {
      const lowerMessage = message ? message.toLowerCase() : ''; 
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('help') || lowerMsg.includes('nutrition')) {
      return "I'm your Nutrition Expert! I can help you log meals and provide nutritional advice.";
    }

    if (
      lowerMsg.includes('what food') &&
      (lowerMsg.includes('love') || lowerMsg.includes('like'))
    ) {
      return "You haven't told me your favorite foods yet! Tell me what foods you love or enjoy, and I'll remember them for you.";
    }

    return "Tell me what you ate today and I'll help with nutrition advice!";
  }
}

// ===== FITNESS AGENT CLASS =====
class FitnessAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('fitness', 'Fitness Pro', aiService, agentService);
  }

  async receiveMessage(message) {
    console.log(
      `💪 Fitness processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );

     this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

    try {
      const crossKnowledge = await this.getCrossAgentKnowledge();
      let response = '';

      // Try AI service first
      if (this.aiService) {
        try {
          const aiResponse = await this.aiService.getAgentResponse(
            'fitness',
            message.content,
            this.currentUserId
          );
          response = crossKnowledge + aiResponse;
        } catch (aiError) {
          console.log('⚠️ Fitness AI failed:', aiError.message);
        }
      }

      // If no AI response, use fallback
      if (!response || response.length < 20) {
        response = crossKnowledge + this.getFitnessResponse(message.content);
      }

      // ===== CRITICAL FIX: Extract and save workout =====
      const workoutInfo = this.extractWorkoutFromMessage(message.content);
      if (
        workoutInfo &&
        this.currentUserId &&
        this.currentUserId !== 'anonymous'
      ) {
        console.log(
          `💪 Fitness: Attempting to save workout "${workoutInfo.name}"`
        );

        try {
          const result = await supabaseManager.saveWorkout(
            workoutInfo.name,
            workoutInfo.duration
          );

          if (result.success) {
            console.log(
              `✅ Fitness: Successfully saved workout "${workoutInfo.name}"`
            );
            response = `${response}\n\n✅ **Logged workout:** ${workoutInfo.name} (${workoutInfo.duration} min)`;
          } else {
            console.error(
              `❌ Fitness: Failed to save workout: ${result.error}`
            );
            response = `${response}\n\n⚠️ Couldn't save workout to database.`;
          }
        } catch (saveError) {
          console.error('❌ Workout save error:', saveError.message);
          response = `${response}\n\n⚠️ Error saving workout.`;
        }
      }

      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Fitness error:', error.message);
      return {
        reply:
          "I'm your Fitness Pro! Tell me about your workout or ask for exercise advice.",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  // ===== SIMPLIFY EXTRACT WORKOUT METHOD =====
  extractWorkoutFromMessage(message) {
    if (!message || typeof message !== 'string') return null;

    const lower = message.toLowerCase();

    // Skip questions
    if (
      lower.startsWith('what') ||
      lower.startsWith('how') ||
      lower.includes('?')
    ) {
      return null;
    }

    let exerciseName = 'Workout';
    let duration = 30;

    // Simple detection
    if (lower.includes('run')) exerciseName = 'Running';
    else if (lower.includes('walk')) exerciseName = 'Walking';
    else if (lower.includes('yoga')) exerciseName = 'Yoga';
    else if (lower.includes('lift') || lower.includes('weight'))
      exerciseName = 'Strength Training';
    else if (lower.includes('swim')) exerciseName = 'Swimming';
    else if (lower.includes('cycle') || lower.includes('bike'))
      exerciseName = 'Cycling';
    else if (lower.includes('cardio')) exerciseName = 'Cardio';
    else if (lower.includes('workout') || lower.includes('exercise'))
      exerciseName = 'General Workout';

    // Extract duration
    const durationMatch = message.match(
      /\b(\d+)\s*(?:min|minutes?|hour|hours?)\b/i
    );
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
      if (message.toLowerCase().includes('hour')) duration *= 60;
    }

    return { name: exerciseName, duration: duration };
  }
  getFitnessResponse(message) {
      const lowerMessage = message ? message.toLowerCase() : ''; 
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return 'For fitness, knowing your food preferences helps me recommend the right nutrition plan! What foods do you enjoy?';
    }

    if (lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
      return 'Great job on exercising! For optimal fitness, combine cardio with strength training.';
    }

    return 'I can help you with workout plans, exercise form, and fitness goals! What would you like to know?';
  }
}

// ===== FINANCE AGENT CLASS =====
class FinanceAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('finance', 'Finance Guru', aiService, agentService);
  }

  // In FinanceAgentClass - FIX THE receiveMessage METHOD
  async receiveMessage(message) {
    console.log(
      `💰 Finance processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );

     this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }
    try {
      const crossKnowledge = await this.getCrossAgentKnowledge();
      let response = '';

      // Try AI service first
      if (this.aiService) {
        try {
          const aiResponse = await this.aiService.getAgentResponse(
            'finance',
            message.content,
            this.currentUserId
          );
          response = crossKnowledge + aiResponse;
        } catch (aiError) {
          console.log('⚠️ Finance AI failed:', aiError.message);
        }
      }

      // If no AI response, use fallback
      if (!response || response.length < 20) {
        response = crossKnowledge + this.getFinanceResponse(message.content);
      }

      // ===== CRITICAL FIX: Extract and save transaction =====
      const transaction = this.extractTransactionFromMessage(message.content);
      if (
        transaction &&
        this.currentUserId &&
        this.currentUserId !== 'anonymous'
      ) {
        console.log(
          `💰 Finance: Attempting to save transaction "${transaction.description}"`
        );

        try {
          const result = await supabaseManager.saveTransaction(
            transaction.description,
            transaction.amount,
            transaction.type
          );

          if (result.success) {
            console.log(
              `✅ Finance: Successfully saved transaction "${transaction.description}"`
            );
            response = `${response}\n\n✅ **Logged ${
              transaction.type
            }:** $${transaction.amount.toFixed(2)} - ${
              transaction.description
            }`;
          } else {
            console.error(
              `❌ Finance: Failed to save transaction: ${result.error}`
            );
            response = `${response}\n\n⚠️ Couldn't save transaction to database.`;
          }
        } catch (saveError) {
          console.error('❌ Transaction save error:', saveError.message);
          response = `${response}\n\n⚠️ Error saving transaction.`;
        }
      }

      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Finance error:', error.message);
      return {
        reply:
          "I'm your Finance Guru! Tell me about your spending or ask for money advice.",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  // ===== SIMPLIFY EXTRACT TRANSACTION METHOD =====
  extractTransactionFromMessage(message) {
    if (!message || typeof message !== 'string') return null;

    const lower = message.toLowerCase();

    // Skip questions
    if (
      lower.startsWith('what') ||
      lower.startsWith('how') ||
      lower.includes('?')
    ) {
      return null;
    }

    let type = 'expense';

    // Simple type detection
    if (
      lower.includes('earned') ||
      lower.includes('income') ||
      lower.includes('received') ||
      lower.includes('salary') ||
      lower.includes('paycheck')
    ) {
      type = 'income';
    }

    // Simple amount extraction
    let amount = null;
    const amountMatch =
      message.match(/\$(\d+(\.\d{1,2})?)/) ||
      message.match(/(\d+(\.\d{1,2})?)\s*(?:dollars|usd)/i);

    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return null;
    }

    // Simple description
    let description = 'Transaction';
    if (type === 'income') description = 'Income';
    else if (message.includes('food') || message.includes('meal'))
      description = 'Food';
    else if (message.includes('grocery')) description = 'Groceries';
    else if (message.includes('rent')) description = 'Rent';
    else if (message.includes('gas')) description = 'Gas';

    return { description, amount, type };
  }

  getFinanceResponse(message) {
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return 'Food preferences are important for budgeting! Knowing what foods you love helps plan grocery expenses.';
    }

    if (lowerMsg.includes('save') || lowerMsg.includes('budget')) {
      return 'For better finances: track all spending, create a budget, and save regularly.';
    }

    return 'I can help with budgeting, investments, saving strategies, and financial planning!';
  }
}

// ===== MENTAL WELLNESS AGENT CLASS =====
class MentalWellnessAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('mental', 'Mind Harmony', aiService, agentService);
  }

  async receiveMessage(message) {
    console.log(
      `🧠 Mental processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );

    this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

    try {
      // Get cross-agent knowledge FIRST
      const crossKnowledge = await this.getCrossAgentKnowledge();

      let response = '';

      // Check if this is about preferences
      const userMessage = message.content || '';
      const lowerMsg = userMessage.toLowerCase();

      if (
        lowerMsg.includes('food') &&
        (lowerMsg.includes('love') || lowerMsg.includes('like'))
      ) {
        // User is asking about food preferences to mental agent
        console.log(
          `🧠 Recognizing food preference question for mental wellness`
        );

        // Check memory for other agent knowledge
        let foodKnowledge = '';
        if (this.currentUserId && this.memoryManager) {
          const memory = this.memoryManager.getMemoryForUser(
            this.currentUserId
          );
          if (memory && memory.whatUserTold) {
            // Check nutrition agent
            const nutritionMessages = memory.whatUserTold('nutrition');
            if (nutritionMessages && nutritionMessages.length > 0) {
              foodKnowledge = `I see you've discussed food preferences before. `;
            }
          }
        }

        // Get AI response
        if (this.aiService) {
          const aiResponse = await this.aiService.getAgentResponse(
            'mental',
            userMessage,
            this.currentUserId
          );
          response = crossKnowledge + foodKnowledge + aiResponse;
        } else {
          response =
            crossKnowledge +
            foodKnowledge +
            'Food preferences can be connected to emotions and comfort. What foods bring you joy?';
        }
      } else {
        // Regular mental wellness query
        if (this.aiService) {
          try {
            const aiResponse = await this.aiService.getAgentResponse(
              'mental',
              userMessage,
              this.currentUserId
            );
            response = crossKnowledge + aiResponse;
          } catch (aiError) {
            console.log('⚠️ Mental AI failed:', aiError.message);
          }
        }
      }

      // If no AI response, use fallback
      if (!response || response.length < 20) {
        response = crossKnowledge + this.getMentalResponse(message.content);
      }

      // Save to memory
      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Mental error:', error.message);
      return {
        reply:
          "I'm Mind Harmony. How are you feeling today? I'm here to listen and support you.",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  getMentalResponse(message) {
      const lowerMessage = message ? message.toLowerCase() : ''; 
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return 'Food and emotions are often connected. Comfort foods can be part of self-care. What foods make you happy?';
    }

    if (lowerMsg.includes('stress') || lowerMsg.includes('anxious')) {
      return 'For stress: Try 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s).';
    }

    return "I'm here to support your emotional wellbeing. You can talk to me about stress, anxiety, mindfulness, or anything on your mind.";
  }
}

// ===== PLANNER AGENT CLASS =====
class PlannerAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('planner', 'Task Planner', aiService, agentService);
  }

  async receiveMessage(message) {
    console.log(
      `📅 Planner processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );
 this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

    try {
      const crossKnowledge = await this.getCrossAgentKnowledge();

      let response = '';

      // Try AI service first
      if (this.aiService) {
        try {
          const aiResponse = await this.aiService.getAgentResponse(
            'planner',
            message.content,
            this.currentUserId
          );
          response = crossKnowledge + aiResponse;
        } catch (aiError) {
          console.log('⚠️ Planner AI failed:', aiError.message);
        }
      }

      // If no AI response, use fallback
      if (!response || response.length < 20) {
        response = crossKnowledge + this.getPlannerResponse(message.content);
      }

      // ===== CRITICAL FIX: Extract and save task =====
      const taskName = this.extractTaskFromMessage(message.content);
      if (
        taskName &&
        this.currentUserId &&
        this.currentUserId !== 'anonymous'
      ) {
        console.log(`📝 Planner: Attempting to save task "${taskName}"`);

        try {
          // Create metadata
          const metadata = {
            priority: 'medium',
            category: 'general',
            created_at: new Date().toISOString(),
          };

          // Save to database using supabaseManager
          const result = await supabaseManager.saveTask(taskName);

          if (result.success) {
            console.log(`✅ Planner: Successfully saved task "${taskName}"`);
            response = `${response}\n\n✅ **Added task:** ${taskName}`;
          } else {
            console.error(`❌ Planner: Failed to save task: ${result.error}`);
            response = `${response}\n\n⚠️ Couldn't save task to database.`;
          }
        } catch (saveError) {
          console.error('❌ Task save error:', saveError.message);
          response = `${response}\n\n⚠️ Error saving task.`;
        }
      }

      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Planner error:', error.message);
      return {
        reply:
          "I'm your Task Planner! Tell me what you need to schedule or ask about productivity.",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  extractTaskFromMessage(message) {
    if (!message || typeof message !== 'string') return null;

    const lowerMsg = message.toLowerCase();

    // Skip questions
    if (
      lowerMsg.startsWith('what') ||
      lowerMsg.startsWith('how') ||
      lowerMsg.startsWith('where') ||
      lowerMsg.startsWith('when') ||
      lowerMsg.includes('?')
    ) {
      return null;
    }

    // Enhanced task patterns
    const patterns = [
      // "I need to call mom"
      /(?:i\s+)?(?:need\s+to|have\s+to|must|should|gotta|got\s+to)\s+(.+?)(?:\.|!|\?|,|$)/i,

      // "add task: call mom"
      /(?:add|create|make)\s+(?:a\s+)?(?:new\s+)?task\s*(?::|for)?\s*["']?(.+?)(?:\s+(?:please|\.|!|\?|$))/i,

      // "remind me to call mom"
      /(?:remind\s+me\s+to|remember\s+to)\s+(.+?)(?:\.|!|\?|,|$)/i,

      // "schedule call with mom"
      /(?:schedule|plan|set)\s+(.+?)(?:\.|!|\?|,|$)/i,

      // "todo: call mom"
      /(?:todo|to-do|task)\s*:?\s*["']?(.+?)(?:\s+(?:\.|!|\?|$))/i,

      // Direct command "call mom"
      /^([a-zA-Z][^.!?0-9]{3,})(?:\s+(?:please|\.|!|\?|$))/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        let task = match[1].trim();

        // Clean up task name
        task = task
          .replace(
            /\s+(?:please|thanks|thank you|\.|,|!|\?|ok|okay|now|later|today|tomorrow)$/i,
            ''
          )
          .replace(/^(to\s+)?(do|complete|finish)\s+/i, '')
          .trim();

        if (task.length > 3 && task.length < 100) {
          console.log(`📝 Extracted task: "${task}"`);
          return task;
        }
      }
    }

    return null;
  }
  getPlannerResponse(message) {
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return 'As your planner, I can help schedule meals around your food preferences! What else would you like to organize?';
    }

    return 'I can help you organize tasks, create schedules, set goals, and improve productivity!';
  }
}

// ===== CREATIVE AGENT CLASS =====
class CreativeAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('creative', 'Creative Muse', aiService, agentService);
  }

  async receiveMessage(message) {
    console.log(
      `🎨 Creative processing: "${
        message.content?.substring(0, 50) || 'no content'
      }..."`
    );

     this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

    try {
      const crossKnowledge = await this.getCrossAgentKnowledge();
      let response = '';

      if (this.aiService) {
        try {
          const aiResponse = await this.aiService.getAgentResponse(
            'creative',
            message.content,
            this.currentUserId
          );
          response = crossKnowledge + aiResponse;
        } catch (aiError) {
          console.log('⚠️ Creative AI failed:', aiError.message);
        }
      }

      if (!response || response.length < 20) {
        response = crossKnowledge + this.getCreativeResponse(message.content);
      }

      await this.saveToMemory(message.content, response);

      return {
        reply: response,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    } catch (error) {
      console.log('❌ Creative error:', error.message);
      return {
        reply:
          "I'm your Creative Muse! Need ideas or inspiration? I'm here to help!",
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
  }

  getCreativeResponse(message) {
      const lowerMessage = message ? message.toLowerCase() : ''; 
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return 'Food can be great creative inspiration! What foods spark your imagination?';
    }

    return 'I can help with writing, art ideas, brainstorming, and creative projects!';
  }
}

// ===== GENERAL ASSISTANT AGENT CLASS =====
class GeneralAssistantAgentClass extends BaseAgent {
  constructor(aiService = null, agentService = null) {
    super('general', 'Aura Prime', aiService, agentService);
  }

async receiveMessage(message) {
  console.log(
    `🤖 General processing: "${
      message.content?.substring(0, 50) || 'no content'
    }..."`
  );
  
   this.conversationHistory.push({
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    from: 'user',
    userName: message.userName
  });
  
  // Keep only last 10 messages
  if (this.conversationHistory.length > 10) {
    this.conversationHistory = this.conversationHistory.slice(-10);
  }
  // Set current user with username if available
  if (message.userId) {
    this.setCurrentUser(message.userId, message.userName);
  }

  try {
    // Check for username-specific questions FIRST
    const userMessage = message.content || '';
    const lowerMsg = userMessage.toLowerCase();
    
    // Handle username questions directly
    if (lowerMsg.includes('username') || 
        lowerMsg.includes('my name') ||
        lowerMsg.includes('call me') ||
        lowerMsg.includes('who am i')) {
      
      let directResponse = '';
      if (this.currentUserName && this.currentUserName !== 'Guest') {
        directResponse = `I know you as ${this.currentUserName}! `;
        
        if (lowerMsg.includes('username')) {
          directResponse += `Your username is ${this.currentUserName}. `;
        }
        
        directResponse += `Is there anything specific you'd like help with today, ${this.currentUserName}?`;
      } else {
        directResponse = "I don't have your username saved yet. You can tell me your name if you'd like!";
      }
      
      await this.saveToMemory(message.content, directResponse);
      
      return {
        reply: directResponse,
        showToUser: true,
        agent: this.id,
        userId: this.currentUserId,
      };
    }
    } catch (error) {
    console.log('❌ General error:', error.message);
    let fallback = "Hello! I'm Aura Prime, your general assistant.";
    
    // Personalize even the fallback
    if (this.currentUserName && this.currentUserName !== 'Guest') {
      fallback = `Hello, ${this.currentUserName}! I'm Aura Prime, your general assistant.`;
    }
    
    return {
      reply: fallback,
      showToUser: true,
      agent: this.id,
      userId: this.currentUserId,
    };
  }
}

  getGeneralResponse(message) {
      const lowerMessage = message ? message.toLowerCase() : ''; 
    const lowerMsg = (message || '').toLowerCase();

    if (lowerMsg.includes('food') && lowerMsg.includes('love')) {
      return "I coordinate all your specialized agents! If you tell one agent about your food preferences, I'll make sure other relevant agents know too.";
    }

    return "I'm Aura Prime, coordinating all your specialized agents! How can I help you today?";
  }
}

// The NutritionAgentPage, FitnessAgentPage, FinanceAgentPage, etc. remain the same as before
// They should continue to use agentService.getAgentResponse() as shown previously

// ==================== NUTRITION AGENT PAGE ====================
const NutritionAgentPage = ({ settings }) => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
 

  const colors = getThemeColors(settings.theme);

  // Load meals on component mount
  useEffect(() => {
    console.log('🍽️ Nutrition Page Mounted');
    loadMeals();
  }, []);

  // Simple meal loader
// In NutritionAgentPage.js - Update loadMeals function

const loadMeals = async () => {
  try {
    console.log('📋 Loading meals...');
    setIsLoading(true);
    const result = await supabaseManager.getMeals();

    if (result.success) {
      console.log(`✅ Loaded ${result.meals?.length || 0} meals`);
      
      // Log the raw data to see what's coming from the database
      console.log('Raw meal data:', JSON.stringify(result.meals?.[0], null, 2));
      
      const formattedMeals =
        result.meals?.map((meal) => {
          console.log(`Processing meal: ${meal.food_name}, calories: ${meal.calories}`);
          
          return {
            id: meal.id,
            title: meal.food_name || 'Meal',
            type: meal.meal_type || 'meal',
            time: new Date(meal.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            calories: meal.calories || 0, // MAKE SURE THIS IS HERE
            date: meal.created_at,
          };
        }) || [];

      console.log('Formatted meals with calories:', formattedMeals.map(m => ({
        title: m.title,
        calories: m.calories
      })));

      setMeals(formattedMeals);
    } else {
      console.error('❌ Failed to load meals:', result.error);
      Alert.alert('Error', result.error || 'Failed to load meals');
    }
  } catch (error) {
    console.error('❌ Error loading meals:', error);
    Alert.alert('Error', 'Failed to load meals');
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
};

   const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
  };

  // SIMPLE ADD MEAL - JUST NAME
// In your handleAddMeal function, add more logging:

const handleAddMeal = async () => {
  if (!newMealName.trim()) {
    Alert.alert('Error', 'Please enter meal name');
    return;
  }

  try {
    // Auto-estimate calories if not provided
    let calories = newMealCalories ? parseInt(newMealCalories) : 0;
    if (!calories) {
      calories = estimateFoodCalories(newMealName);
    }

    console.log('➕ Adding meal with calories:', {
      name: newMealName,
      calories: calories,
      userEntered: !!newMealCalories
    });

    const result = await supabaseManager.saveMeal(
      newMealName.trim(), 
      calories
    );

    if (result.success) {
      console.log('✅ Meal saved successfully with calories:', calories);
      setNewMealName('');
      setNewMealCalories('');
      setShowAddMeal(false);
      await loadMeals(); // Reload to show the new meal with calories
      Alert.alert('Success', `Meal logged! (${calories} calories)`);
    } else {
      console.error('❌ Failed to add meal:', result.error);
      Alert.alert('Error', result.error || 'Failed to add meal');
    }
  } catch (error) {
    console.error('❌ Add meal error:', error);
    Alert.alert('Error', 'Failed to add meal');
  }
};

  // SIMPLE DELETE MEAL
  const handleDeleteMeal = async (mealId) => {
    try {
      console.log('🗑️ Deleting meal:', mealId);
      const result = await supabaseManager.deleteMeal(mealId);

      if (result.success) {
        console.log('✅ Meal deleted successfully');
        // Update local state
        setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
      } else {
        console.error('❌ Failed to delete meal:', result.error);
        Alert.alert('Error', result.error || 'Failed to delete meal');
      }
    } catch (error) {
      console.error('❌ Delete meal error:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  // SIMPLE CLEAR ALL MEALS
  const handleClearAllMeals = async () => {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to delete all your meals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Clearing all meals...');
              const result = await supabaseManager.clearAllMeals();

              if (result.success) {
                console.log('✅ All meals cleared');
                setMeals([]);
                Alert.alert('Success', 'All meals cleared');
              } else {
                console.error('❌ Failed to clear meals:', result.error);
                Alert.alert('Error', result.error || 'Failed to clear meals');
              }
            } catch (error) {
              console.error('❌ Clear meals error:', error);
              Alert.alert('Error', 'Failed to clear meals');
            }
          },
        },
      ]
    );
  };

  // Chat response handler - FIXED: Using agentService directly
  const handleChatResponse = async (input) => {
    console.log('💬 Nutrition chat input:', input);

    try {
      const response = await agentService.getAgentResponse(
        'nutrition',
        input,
        supabaseManager.userId
      );
      console.log(
        '✅ Nutrition chat response:',
        response ? response.substring(0, 100) : 'No response'
      );
      return response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      return "I'm your Nutrition Expert! Try saying something like 'I ate a salad for lunch' and I'll help you track it.";
    }
  };

  // Render meal item - SIMPLIFIED
// In renderMealItem function (around line 5250)
const renderMealItem = ({ item }) => (
  <View
    style={[
      stylesNutrition.mealItem,
      {
        backgroundColor: colors.bgInput,
        borderColor: colors.borderPrimary,
      },
    ]}>
    <View style={stylesNutrition.mealHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[stylesNutrition.mealName, { color: colors.textPrimary }]}>
          {item.title}
        </Text>
        {/* MAKE SURE THIS IS HERE - SHOW CALORIES */}
        {item.calories > 0 && (
          <View style={stylesNutrition.calorieBadge}>
            <Ionicons name="flame" size={14} color="#FF9800" />
            <Text style={[stylesNutrition.mealCalories, { color: '#FF9800', fontWeight: 'bold' }]}>
              {item.calories} calories
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteMeal(item.id)}
        style={stylesNutrition.deleteButton}>
        <Ionicons name="close-circle" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>

    <View style={stylesNutrition.mealFooter}>
      <Text
        style={[stylesNutrition.mealType, { color: colors.textSecondary }]}>
        {item.type || 'meal'}
      </Text>
      <Text
        style={[stylesNutrition.mealTime, { color: colors.textTertiary }]}>
        {item.time}
      </Text>
    </View>
  </View>
);

  return (
    <View
      style={[
        stylesNutrition.container,
        { backgroundColor: colors.bgPrimary },
      ]}>
      <ScrollView
        contentContainerStyle={stylesNutrition.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF9800']}
            tintColor={'#FF9800'}
          />
        }>
        // Calculate total calories


// In the header section (around line 5280):
<View style={stylesNutrition.header}>
  <View>
    <Text style={[stylesNutrition.title, { color: '#FF9800' }]}>
      Nutritionist AI
    </Text>
   <Text style={[stylesNutrition.subtitle, { color: colors.textSecondary }]}>
  {meals.length} meals • {totalCalories} calories
</Text>
  </View>
  <TouchableOpacity
    style={[stylesNutrition.addButton, { backgroundColor: '#FF9800' }]}
    onPress={() => setShowAddMeal(true)}>
    <Ionicons name="add" size={16} color="#000000" />
    <Text style={[stylesNutrition.addButtonText, { color: '#000000' }]}>
      Add Meal
    </Text>
  </TouchableOpacity>
</View>

        {/* ADD MEAL FORM - SIMPLE */}
        {showAddMeal && (
          <View
            style={[
              stylesNutrition.addMealCard,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderPrimary,
              },
            ]}>
            <Text
              style={[
                stylesNutrition.addMealTitle,
                { color: colors.textPrimary },
              ]}>
              What did you eat?
            </Text>
            <TextInput
              style={[
                stylesNutrition.addMealInput,
                {
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  borderColor: colors.borderPrimary,
                },
              ]}
              placeholder="e.g., Chicken salad, Pizza, Apple..."
              placeholderTextColor={colors.textTertiary}
              value={newMealName}
              onChangeText={setNewMealName}
              onSubmitEditing={handleAddMeal}
              autoFocus
              returnKeyType="done"
            />

             {/* ADD THIS CALORIES INPUT */}
    <TextInput
      style={[
        stylesNutrition.addMealInput,
        {
          backgroundColor: colors.bgInput,
          color: colors.textPrimary,
          borderColor: colors.borderPrimary,
        },
      ]}
      placeholder="Calories (optional)"
      placeholderTextColor={colors.textTertiary}
      value={newMealCalories}
      onChangeText={setNewMealCalories}
      keyboardType="numeric"
      returnKeyType="done"
      onSubmitEditing={handleAddMeal}
    />

            <View style={stylesNutrition.addMealButtons}>
              <TouchableOpacity
                style={[
                  stylesNutrition.cancelButton,
                  { borderColor: colors.borderPrimary },
                ]}
                onPress={() => setShowAddMeal(false)}>
                <Text
                  style={[
                    stylesNutrition.cancelButtonText,
                    { color: colors.textSecondary },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesNutrition.saveButton,
                  {
                    backgroundColor: '#FF9800',
                    opacity: !newMealName.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleAddMeal}
                disabled={!newMealName.trim()}>
                <Text
                  style={[
                    stylesNutrition.saveButtonText,
                    { color: '#000000' },
                  ]}>
                  Log Meal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MEALS LIST */}
        <View
          style={[
            stylesNutrition.mealsCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <View style={stylesNutrition.mealsHeader}>
            <Text
              style={[
                stylesNutrition.mealsTitle,
                { color: colors.textPrimary },
              ]}>
              Today's Meals
            </Text>
            {meals.length > 0 && (
              <TouchableOpacity onPress={handleClearAllMeals}>
                <Text
                  style={[stylesNutrition.clearAllText, { color: '#EF4444' }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {meals.length === 0 ? (
            <View style={stylesNutrition.emptyState}>
              <Ionicons
                name="fast-food"
                size={48}
                color={colors.textTertiary}
              />
              <Text
                style={[
                  stylesNutrition.emptyStateText,
                  { color: colors.textSecondary },
                ]}>
                No meals logged yet.{'\n'}Add your first meal!
              </Text>
            </View>
          ) : (
            <FlatList
              data={meals}
              renderItem={renderMealItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={stylesNutrition.mealsList}
            />
          )}
        </View>
      </ScrollView>

      {/* CHAT WIDGET */}
      <ChatWidget
        agentName="Nutritionist"
        agentId="nutrition"
        initialMessage="Hello! I'm your Nutritionist AI. Tell me what you ate (e.g., 'I had a chicken salad for lunch') and I'll log it for you and provide nutritional advice!"
        onSendMessage={handleChatResponse}
        color="#FF9800"
        settings={settings}
      />
    </View>
  );
};

// Nutrition styles (keep existing)
const stylesNutrition = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Add to stylesNutrition object:
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  addMealCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  addMealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addMealInput: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 15,
  },
  addMealButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mealsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  mealsList: {
    gap: 10,
  },
  mealItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 11,
  },
  mealTime: {
    fontSize: 11,
  },
});

// ==================== FITNESS AGENT PAGE ====================
// ==================== FITNESS AGENT PAGE - NUCLEAR EDITION ====================
// This version works 100% - uses AsyncStorage as fallback if Supabase fails

import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== FITNESS AGENT PAGE ====================
const FitnessAgentPage = ({ settings }) => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ name: '', duration: '30' });
  const [newWorkoutCalories, setNewWorkoutCalories] = useState('');
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const colors = getThemeColors(settings.theme);

  // Load workouts on mount
  useEffect(() => {
    console.log('💪 NUCLEAR FITNESS PAGE MOUNTED');
    loadWorkoutsNuclear();
  }, []);

  // ========== NUCLEAR OPTION 1: FORCE LOCAL STORAGE ==========
  const saveWorkoutLocal = async (workout) => {
    try {
      const key = `fitness_${supabaseManager.userId || 'anonymous'}`;
      const existing = await AsyncStorage.getItem(key);
      const workouts = existing ? JSON.parse(existing) : [];
      workouts.unshift(workout);
      await AsyncStorage.setItem(key, JSON.stringify(workouts.slice(0, 50))); // Keep last 50
      console.log('✅ Saved to local storage:', workout);
      return true;
    } catch (error) {
      console.error('❌ Local storage error:', error);
      return false;
    }
  };

  const loadWorkoutsLocal = async () => {
    try {
      const key = `fitness_${supabaseManager.userId || 'anonymous'}`;
      const data = await AsyncStorage.getItem(key);
      const workouts = data ? JSON.parse(data) : [];
      console.log('📋 Loaded from local storage:', workouts.length, 'workouts');
      return workouts;
    } catch (error) {
      console.error('❌ Load local error:', error);
      return [];
    }
  };

  // ========== NUCLEAR OPTION 2: FORCE SUPABASE WITH RETRY ==========
  const saveWorkoutSupabase = async (workoutData) => {
    if (!supabaseManager.userId) {
      console.log('❌ No user ID for Supabase');
      return false;
    }

    try {
      console.log('💾 Attempting Supabase save:', workoutData);
      
      // Try direct insert bypassing the service
      const { data, error } = await supabaseService.supabase
        .from('workouts')
        .insert([{
          user_id: supabaseManager.userId,
          exercise_type: workoutData.exercise_type,
          duration_minutes: workoutData.duration_minutes,
          calories_burned: workoutData.calories_burned,
          intensity: workoutData.intensity,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        return false;
      }
      
      console.log('✅ Supabase save successful:', data);
      return true;
    } catch (error) {
      console.error('❌ Supabase save error:', error);
      return false;
    }
  };

  const loadWorkoutsSupabase = async () => {
    if (!supabaseManager.userId) return [];

    try {
      console.log('📋 Attempting Supabase load');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabaseService.supabase
        .from('workouts')
        .select('*')
        .eq('user_id', supabaseManager.userId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase load error:', error);
        return [];
      }
      
      console.log('✅ Supabase load successful:', data?.length || 0, 'workouts');
      return data || [];
    } catch (error) {
      console.error('❌ Supabase load error:', error);
      return [];
    }
  };

  // ========== MAIN LOAD FUNCTION WITH AUTO-FALLBACK ==========
  const loadWorkoutsNuclear = async () => {
    console.log('📋 NUCLEAR LOAD STARTED');
    setIsLoading(true);
    
    try {
      // Try Supabase first
      let workoutsData = await loadWorkoutsSupabase();
      let usingLocal = false;
      
      // If Supabase fails or returns nothing, try local storage
      if (!workoutsData || workoutsData.length === 0) {
        console.log('⚠️ Supabase failed, trying local storage');
        workoutsData = await loadWorkoutsLocal();
        usingLocal = true;
      }
      
      setUseLocalStorage(usingLocal);
      
      // Format the workouts
      const formatted = (workoutsData || []).map(w => ({
        id: w.id || w.localId || Date.now().toString() + Math.random(),
        title: w.exercise_type || w.title || 'Workout',
        duration: w.duration_minutes || w.duration || 30,
        calories: w.calories_burned || w.calories || 0,
        time: w.created_at ? new Date(w.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }) : new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        local: usingLocal
      }));
      
      console.log('✅ FINAL WORKOUTS:', formatted.map(f => ({
        title: f.title,
        calories: f.calories,
        duration: f.duration
      })));
      
      setWorkouts(formatted);
    } catch (error) {
      console.error('❌ Nuclear load error:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ========== SUPER ESTIMATOR - GUARANTEES CALORIES ==========
  const estimateWorkoutCaloriesNuclear = (workoutName, duration) => {
    console.log(`🔮 Estimating for: ${workoutName}, ${duration}min`);
    const workout = workoutName.toLowerCase();
    const minutes = parseInt(duration) || 30;
    
    // ENHANCED DATABASE - COVERS EVERYTHING
    const calorieMap = [
      { keywords: ['sprint', 'race', 'fast run'], calPerMin: 15 },
      { keywords: ['run', 'jog', 'running'], calPerMin: 11 },
      { keywords: ['walk', 'walking', 'stroll'], calPerMin: 5 },
      { keywords: ['hike', 'hiking'], calPerMin: 7 },
      { keywords: ['yoga'], calPerMin: 3 },
      { keywords: ['pilates'], calPerMin: 4 },
      { keywords: ['swim', 'swimming'], calPerMin: 10 },
      { keywords: ['cycle', 'bike', 'cycling'], calPerMin: 9 },
      { keywords: ['spin', 'spinning'], calPerMin: 10 },
      { keywords: ['hiit', 'interval', 'tabata'], calPerMin: 12 },
      { keywords: ['weight', 'lift', 'strength'], calPerMin: 6 },
      { keywords: ['crossfit'], calPerMin: 13 },
      { keywords: ['dance', 'zumba'], calPerMin: 8 },
      { keywords: ['jump rope', 'skipping'], calPerMin: 12 },
      { keywords: ['boxing', 'kickbox'], calPerMin: 10 },
      { keywords: ['stretch', 'stretching'], calPerMin: 2 },
      { keywords: ['sport', 'game', 'basketball', 'soccer', 'tennis'], calPerMin: 8 },
      { keywords: ['gym', 'workout', 'exercise'], calPerMin: 7 },
    ];
    
    let caloriesPerMinute = 7; // DEFAULT
    
    for (const item of calorieMap) {
      if (item.keywords.some(keyword => workout.includes(keyword))) {
        caloriesPerMinute = item.calPerMin;
        break;
      }
    }
    
    // INTENSITY BOOST
    if (workout.includes('intense') || workout.includes('hard') || workout.includes('vigorous')) {
      caloriesPerMinute *= 1.3;
    }
    if (workout.includes('light') || workout.includes('easy') || workout.includes('gentle')) {
      caloriesPerMinute *= 0.7;
    }
    
    const estimated = Math.round(caloriesPerMinute * minutes);
    console.log(`🔮 Estimated: ${estimated} calories (${caloriesPerMinute}/min × ${minutes}min)`);
    
    // GUARANTEE minimum calories
    return Math.max(estimated, minutes * 2);
  };

  // ========== ADD WORKOUT - FORCE SAVE TO BOTH ==========
  const handleAddWorkoutNuclear = async () => {
    console.log('➕ NUCLEAR ADD STARTED');
    
    if (!newWorkout.name.trim()) {
      Alert.alert('Error', 'Please enter workout name');
      return;
    }

    const duration = parseInt(newWorkout.duration) || 30;
    
    // Get calories (user entered or estimated)
    let calories = newWorkoutCalories ? parseInt(newWorkoutCalories) : 0;
    if (!calories || calories === 0) {
      calories = estimateWorkoutCaloriesNuclear(newWorkout.name, duration);
    }

    // Create workout object
    const workoutObject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      localId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      exercise_type: newWorkout.name.trim(),
      title: newWorkout.name.trim(),
      duration_minutes: duration,
      duration: duration,
      calories_burned: calories,
      calories: calories,
      intensity: calories > 200 ? 'High' : calories > 100 ? 'Medium' : 'Low',
      created_at: new Date().toISOString(),
    };

    console.log('➕ WORKOUT TO SAVE:', workoutObject);

    // TRY TO SAVE EVERYWHERE
    let supabaseSuccess = false;
    let localSuccess = false;

    // 1. Try Supabase
    supabaseSuccess = await saveWorkoutSupabase(workoutObject);
    
    // 2. Always save to local storage (backup)
    localSuccess = await saveWorkoutLocal(workoutObject);

    if (localSuccess || supabaseSuccess) {
      console.log('✅ Workout saved successfully');
      
      // Update UI immediately
      const newWorkoutForUI = {
        id: workoutObject.id,
        title: workoutObject.title,
        duration: workoutObject.duration,
        calories: workoutObject.calories,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        local: !supabaseSuccess,
      };
      
      setWorkouts(prev => [newWorkoutForUI, ...prev]);
      
      // Reset form
      setNewWorkout({ name: '', duration: '30' });
      setNewWorkoutCalories('');
      setShowAddWorkout(false);
      
      Alert.alert('Success', `✅ Workout logged! (${calories} calories burned)`);
      
      // Refresh from storage to sync
      setTimeout(() => loadWorkoutsNuclear(), 500);
    } else {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  // ========== DELETE WORKOUT ==========
  const handleDeleteWorkoutNuclear = async (workoutId, isLocal) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!isLocal && supabaseManager.userId) {
                await supabaseService.supabase
                  .from('workouts')
                  .delete()
                  .eq('id', workoutId);
              }
              
              // Remove from local storage
              const key = `fitness_${supabaseManager.userId || 'anonymous'}`;
              const existing = await AsyncStorage.getItem(key);
              if (existing) {
                const workouts = JSON.parse(existing);
                const filtered = workouts.filter(w => w.id !== workoutId && w.localId !== workoutId);
                await AsyncStorage.setItem(key, JSON.stringify(filtered));
              }
              
              // Update UI
              setWorkouts(prev => prev.filter(w => w.id !== workoutId));
              
            } catch (error) {
              console.error('Delete error:', error);
            }
          },
        },
      ]
    );
  };

  // ========== CLEAR ALL ==========
  const handleClearAllNuclear = async () => {
    Alert.alert(
      'Clear All Workouts',
      'Delete all workouts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CLEAR ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear Supabase
              if (supabaseManager.userId) {
                await supabaseService.supabase
                  .from('workouts')
                  .delete()
                  .eq('user_id', supabaseManager.userId);
              }
              
              // Clear local storage
              const key = `fitness_${supabaseManager.userId || 'anonymous'}`;
              await AsyncStorage.setItem(key, JSON.stringify([]));
              
              // Clear UI
              setWorkouts([]);
              Alert.alert('Success', 'All workouts cleared');
            } catch (error) {
              console.error('Clear error:', error);
            }
          },
        },
      ]
    );
  };

  // ========== CHAT RESPONSE HANDLER ==========
  const handleChatResponse = async (input) => {
    console.log('💬 Fitness chat input:', input);

    try {
      const response = await agentService.getAgentResponse(
        'fitness',
        input,
        supabaseManager.userId
      );
      console.log('✅ Fitness chat response:', response ? response.substring(0, 100) : 'No response');
      return response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      return "I'm your Fitness Pro! Tell me about your workout (e.g., 'I ran for 30 minutes') and I'll help you track it and provide fitness advice!";
    }
  };

  // ========== RENDER WORKOUT ITEM ==========
  const renderWorkoutItem = ({ item }) => (
    <View
      style={[
        stylesFitness.workoutItem,
        {
          backgroundColor: colors.bgInput,
          borderColor: colors.borderPrimary,
          borderWidth: item.local ? 2 : 1,
          borderColor: item.local ? '#A855F7' : colors.borderPrimary,
        },
      ]}>
      <View style={stylesFitness.workoutHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[stylesFitness.workoutName, { color: colors.textPrimary }]}>
            {item.title}
          </Text>
          {/* CALORIES - ALWAYS SHOW */}
          <View style={stylesFitness.calorieBadge}>
            <Ionicons name="flame" size={16} color="#A855F7" />
            <Text style={[stylesFitness.workoutCalories, { color: '#A855F7', fontWeight: 'bold' }]}>
              {item.calories} calories burned
            </Text>
            {item.local && (
              <View style={stylesFitness.localBadge}>
                <Text style={stylesFitness.localBadgeText}>local</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteWorkoutNuclear(item.id, item.local)}
          style={stylesFitness.deleteButton}>
          <Ionicons name="close-circle" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={stylesFitness.workoutDetails}>
        <Text style={[stylesFitness.workoutDuration, { color: colors.textSecondary }]}>
          {item.duration} minutes
        </Text>
        <Text style={[stylesFitness.workoutDot, { color: colors.textTertiary }]}>•</Text>
        <Text style={[stylesFitness.workoutTime, { color: colors.textSecondary }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  // ========== CALCULATE TOTALS ==========
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  return (
    <View style={[stylesFitness.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={stylesFitness.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadWorkoutsNuclear}
            colors={['#A855F7']}
            tintColor={'#A855F7'}
          />
        }>
        
        {/* HEADER */}
        <View style={stylesFitness.header}>
          <View>
            <Text style={[stylesFitness.title, { color: '#A855F7' }]}>
              Fitness Pro 🔥
            </Text>
            <Text style={[stylesFitness.subtitle, { color: colors.textSecondary }]}>
              {workouts.length} workouts • {totalCalories} cal • {totalMinutes} min
            </Text>
          </View>
          <TouchableOpacity
            style={[stylesFitness.addButton, { backgroundColor: '#A855F7' }]}
            onPress={() => setShowAddWorkout(true)}>
            <Ionicons name="add" size={20} color="#000000" />
            <Text style={[stylesFitness.addButtonText, { color: '#000000' }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADD WORKOUT FORM */}
        {showAddWorkout && (
          <View style={[stylesFitness.addWorkoutCard, { backgroundColor: colors.bgCard, borderColor: colors.borderPrimary }]}>
            <Text style={[stylesFitness.addWorkoutTitle, { color: colors.textPrimary }]}>
              Log Your Workout
            </Text>
            
            <TextInput
              style={[stylesFitness.addWorkoutInput, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderPrimary }]}
              placeholder="Workout name (e.g., Running)"
              placeholderTextColor={colors.textTertiary}
              value={newWorkout.name}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, name: text })}
              autoFocus
            />
            
            <TextInput
              style={[stylesFitness.addWorkoutInput, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderPrimary }]}
              placeholder="Duration (minutes)"
              placeholderTextColor={colors.textTertiary}
              value={newWorkout.duration}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, duration: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[stylesFitness.addWorkoutInput, { backgroundColor: colors.bgInput, color: colors.textPrimary, borderColor: colors.borderPrimary }]}
              placeholder="Calories (leave empty to auto-estimate)"
              placeholderTextColor={colors.textTertiary}
              value={newWorkoutCalories}
              onChangeText={setNewWorkoutCalories}
              keyboardType="numeric"
            />

            {/* ESTIMATE PREVIEW */}
            {!newWorkoutCalories && newWorkout.name && (
              <Text style={[stylesFitness.estimateText, { color: '#A855F7' }]}>
                🔮 Estimated: {estimateWorkoutCaloriesNuclear(newWorkout.name, newWorkout.duration)} calories
              </Text>
            )}

            <View style={stylesFitness.addWorkoutButtons}>
              <TouchableOpacity
                style={[stylesFitness.cancelButton, { borderColor: colors.borderPrimary }]}
                onPress={() => {
                  setShowAddWorkout(false);
                  setNewWorkout({ name: '', duration: '30' });
                  setNewWorkoutCalories('');
                }}>
                <Text style={[stylesFitness.cancelButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[stylesFitness.saveButton, { backgroundColor: '#A855F7' }]}
                onPress={handleAddWorkoutNuclear}
                disabled={!newWorkout.name.trim()}>
                <Text style={[stylesFitness.saveButtonText, { color: '#000000' }]}>
                  ✓ Log Workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* WORKOUTS LIST */}
        <View style={[stylesFitness.workoutsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderPrimary }]}>
          <View style={stylesFitness.workoutsHeader}>
            <Text style={[stylesFitness.workoutsTitle, { color: colors.textPrimary }]}>
              Today's Workouts
            </Text>
            {workouts.length > 0 && (
              <TouchableOpacity onPress={handleClearAllNuclear}>
                <Text style={[stylesFitness.clearAllText, { color: '#EF4444' }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={stylesFitness.loadingContainer}>
              <ActivityIndicator size="large" color="#A855F7" />
              <Text style={[stylesFitness.loadingText, { color: colors.textSecondary }]}>
                Loading...
              </Text>
            </View>
          ) : workouts.length === 0 ? (
            <View style={stylesFitness.emptyState}>
              <Ionicons name="fitness" size={64} color={colors.textTertiary} />
              <Text style={[stylesFitness.emptyStateTitle, { color: colors.textSecondary }]}>
                No workouts yet
              </Text>
              <Text style={[stylesFitness.emptyStateText, { color: colors.textTertiary }]}>
                Tap "Add" to log your first workout!
              </Text>
            </View>
          ) : (
            workouts.map(item => renderWorkoutItem({ item }))
          )}
        </View>
      </ScrollView>

      {/* ========== CHAT WIDGET - ADDED THIS ========== */}
      <ChatWidget
        agentName="Fitness Pro"
        agentId="fitness"
        initialMessage="Hello! I'm your Fitness Pro. Tell me about your workout (e.g., 'I ran for 30 minutes') and I'll log it for you and provide fitness advice!"
        onSendMessage={handleChatResponse}
        color="#A855F7"
        settings={settings}
      />
    </View>
  );
};

// ========== STYLES ==========
const stylesFitness = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 90 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: { fontWeight: 'bold', fontSize: 14 },
  addWorkoutCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  addWorkoutTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  addWorkoutInput: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 16,
  },
  estimateText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  addWorkoutButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: { fontSize: 15, fontWeight: 'bold' },
  workoutsCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  workoutsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutsTitle: { fontSize: 18, fontWeight: 'bold' },
  clearAllText: { fontSize: 14, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },
  workoutItem: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workoutName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  deleteButton: { padding: 4 },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutDuration: { fontSize: 14 },
  workoutDot: { fontSize: 12 },
  workoutTime: { fontSize: 12 },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  workoutCalories: {
    fontSize: 14,
    fontWeight: '700',
  },
  localBadge: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  localBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

// ==================== FINANCE AGENT PAGE ====================
const FinanceAgentPage = ({ settings }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
  });
  const colors = getThemeColors(settings.theme);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const result = await supabaseManager.getTransactions();

      if (result.success) {
        const formattedTransactions =
          result.transactions?.map((tx) => ({
            id: tx.id || 'local-' + Date.now(),
            name: tx.description || 'Transaction',
            amount: tx.amount || 0,
            type: tx.type || 'expense',
            time: new Date(tx.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            local: tx.local || false,
          })) || [];

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  // ADD TRANSACTION
  const handleAddTransaction = async () => {
    if (!newTransaction.description.trim() || !newTransaction.amount.trim()) {
      Alert.alert('Error', 'Please enter description and amount');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const result = await supabaseManager.saveTransaction(
        newTransaction.description.trim(),
        amount,
        newTransaction.type
      );

      if (result.success) {
        setNewTransaction({ description: '', amount: '', type: 'expense' });
        setShowAddTransaction(false);
        await loadTransactions();
        Alert.alert('Success', 'Transaction added!');
      }
    } catch (error) {
      console.error('Add transaction error:', error);
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  // DELETE TRANSACTION
  const handleDeleteTransaction = async (transactionId) => {
    try {
      await supabaseManager.deleteTransaction(transactionId);
      setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
    } catch (error) {
      console.error('Delete transaction error:', error);
      Alert.alert('Error', 'Failed to delete transaction');
    }
  };

  // CLEAR ALL TRANSACTIONS
  const handleClearAllTransactions = async () => {
    Alert.alert('Clear All Transactions', 'Delete all transactions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabaseManager.clearAllData('transactions');
            setTransactions([]);
            Alert.alert('Success', 'All transactions cleared');
          } catch (error) {
            console.error('Clear transactions error:', error);
            Alert.alert('Error', 'Failed to clear transactions');
          }
        },
      },
    ]);
  };

  // Chat response handler - FIXED: Using agentService directly
  const handleChatResponse = async (input) => {
    console.log('💬 Finance chat input:', input);

    try {
      const response = await agentService.getAgentResponse(
        'finance',
        input,
        supabaseManager.userId
      );
      console.log(
        '✅ Finance chat response:',
        response ? response.substring(0, 100) : 'No response'
      );
      return response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      return "I'm your Finance Guru! Tell me about your spending or ask for money advice.";
    }
  };

  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <View
      style={[
        stylesFinance.transactionItem,
        {
          backgroundColor: colors.bgInput,
          borderColor: colors.borderPrimary,
        },
      ]}>
      <View style={stylesFinance.transactionHeader}>
        <Text
          style={[
            stylesFinance.transactionName,
            { color: colors.textPrimary },
          ]}>
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteTransaction(item.id)}
          style={stylesFinance.deleteButton}>
          <Ionicons name="close-circle" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={stylesFinance.transactionDetails}>
        <Text
          style={[
            stylesFinance.transactionAmount,
            { color: item.type === 'income' ? '#00C853' : '#EF4444' },
          ]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <Text
          style={[
            stylesFinance.transactionTime,
            { color: colors.textTertiary },
          ]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <View
      style={[stylesFinance.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={stylesFinance.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#00C853']}
            tintColor={'#00C853'}
          />
        }>
        {/* HEADER */}
        <View style={stylesFinance.header}>
          <View>
            <Text style={[stylesFinance.title, { color: '#00C853' }]}>
              Finance Guru
            </Text>
            <Text
              style={[stylesFinance.subtitle, { color: colors.textSecondary }]}>
              Balance: ${balance.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[stylesFinance.addButton, { backgroundColor: '#00C853' }]}
            onPress={() => setShowAddTransaction(true)}>
            <Ionicons name="add" size={16} color="#000000" />
            <Text style={[stylesFinance.addButtonText, { color: '#000000' }]}>
              Add Transaction
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADD TRANSACTION FORM */}
        {showAddTransaction && (
          <View
            style={[
              stylesFinance.addTransactionCard,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.borderPrimary,
              },
            ]}>
            <Text
              style={[
                stylesFinance.addTransactionTitle,
                { color: colors.textPrimary },
              ]}>
              Add Transaction
            </Text>
            <TextInput
              style={[
                stylesFinance.addTransactionInput,
                {
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  borderColor: colors.borderPrimary,
                },
              ]}
              placeholder="Description"
              placeholderTextColor={colors.textTertiary}
              value={newTransaction.description}
              onChangeText={(text) =>
                setNewTransaction({ ...newTransaction, description: text })
              }
            />
            <TextInput
              style={[
                stylesFinance.addTransactionInput,
                {
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  borderColor: colors.borderPrimary,
                },
              ]}
              placeholder="Amount"
              placeholderTextColor={colors.textTertiary}
              value={newTransaction.amount}
              onChangeText={(text) =>
                setNewTransaction({ ...newTransaction, amount: text })
              }
              keyboardType="decimal-pad"
            />
            <View style={stylesFinance.transactionTypeRow}>
              <TouchableOpacity
                style={[
                  stylesFinance.typeButton,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderPrimary,
                  },
                  newTransaction.type === 'expense' && [
                    stylesFinance.typeButtonActive,
                    { backgroundColor: '#EF444420' },
                  ],
                ]}
                onPress={() =>
                  setNewTransaction({ ...newTransaction, type: 'expense' })
                }>
                <Text
                  style={[
                    stylesFinance.typeButtonText,
                    { color: colors.textPrimary },
                    newTransaction.type === 'expense' && { color: '#EF4444' },
                  ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesFinance.typeButton,
                  {
                    backgroundColor: colors.bgInput,
                    borderColor: colors.borderPrimary,
                  },
                  newTransaction.type === 'income' && [
                    stylesFinance.typeButtonActive,
                    { backgroundColor: '#00C85320' },
                  ],
                ]}
                onPress={() =>
                  setNewTransaction({ ...newTransaction, type: 'income' })
                }>
                <Text
                  style={[
                    stylesFinance.typeButtonText,
                    { color: colors.textPrimary },
                    newTransaction.type === 'income' && { color: '#00C853' },
                  ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
            <View style={stylesFinance.addTransactionButtons}>
              <TouchableOpacity
                style={[
                  stylesFinance.cancelButton,
                  { borderColor: colors.borderPrimary },
                ]}
                onPress={() => setShowAddTransaction(false)}>
                <Text
                  style={[
                    stylesFinance.cancelButtonText,
                    { color: colors.textSecondary },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  stylesFinance.saveButton,
                  { backgroundColor: '#00C853' },
                ]}
                onPress={handleAddTransaction}
                disabled={
                  !newTransaction.description.trim() ||
                  !newTransaction.amount.trim()
                }>
                <Text
                  style={[stylesFinance.saveButtonText, { color: '#000000' }]}>
                  Add Transaction
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STATS */}
        <View style={stylesFinance.statsContainer}>
          <View
            style={[
              stylesFinance.statCard,
              {
                backgroundColor: '#00C85320',
                borderColor: colors.borderPrimary,
              },
            ]}>
            <Text
              style={[
                stylesFinance.statLabel,
                { color: colors.textSecondary },
              ]}>
              Balance
            </Text>
            <Text
              style={[stylesFinance.statValue, { color: colors.textPrimary }]}>
              ${balance.toFixed(2)}
            </Text>
          </View>
          <View
            style={[
              stylesFinance.statCard,
              {
                backgroundColor: '#3B82F620',
                borderColor: colors.borderPrimary,
              },
            ]}>
            <Text
              style={[
                stylesFinance.statLabel,
                { color: colors.textSecondary },
              ]}>
              Income
            </Text>
            <Text
              style={[stylesFinance.statValue, { color: colors.textPrimary }]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View
            style={[
              stylesFinance.statCard,
              {
                backgroundColor: '#EF444420',
                borderColor: colors.borderPrimary,
              },
            ]}>
            <Text
              style={[
                stylesFinance.statLabel,
                { color: colors.textSecondary },
              ]}>
              Expenses
            </Text>
            <Text
              style={[stylesFinance.statValue, { color: colors.textPrimary }]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* TRANSACTIONS LIST */}
        <View
          style={[
            stylesFinance.transactionsCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <View style={stylesFinance.transactionsHeader}>
            <Text
              style={[
                stylesFinance.transactionsTitle,
                { color: colors.textPrimary },
              ]}>
              Recent Transactions
            </Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={handleClearAllTransactions}>
                <Text
                  style={[stylesFinance.clearAllText, { color: '#EF4444' }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View style={stylesFinance.emptyState}>
              <Ionicons name="cash" size={48} color={colors.textTertiary} />
              <Text
                style={[
                  stylesFinance.emptyStateText,
                  { color: colors.textSecondary },
                ]}>
                No transactions yet.{'\n'}Add your first transaction!
              </Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={stylesFinance.transactionsList}
            />
          )}
        </View>
      </ScrollView>

      {/* CHAT WIDGET */}
      <ChatWidget
        agentName="Finance Guru"
        agentId="finance"
        initialMessage="Hello! I'm your Finance Guru. Tell me about transactions (e.g., 'I spent $50 on groceries') and I'll help manage your finances and provide financial advice!"
        onSendMessage={handleChatResponse}
        color="#00C853"
        settings={settings}
      />
    </View>
  );
};

// Finance styles (keep existing)
const stylesFinance = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 90 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 2 },
  subtitle: { fontSize: 13 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: { fontWeight: 'bold', fontSize: 13 },
  addTransactionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  addTransactionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  addTransactionInput: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 15,
  },
  transactionTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: { borderWidth: 2 },
  typeButtonText: { fontSize: 14, fontWeight: '600' },
  addTransactionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: { fontSize: 14 },
  saveButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveButtonText: { fontWeight: 'bold', fontSize: 14 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1 },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  transactionsCard: { borderRadius: 20, padding: 16, borderWidth: 1 },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: { fontSize: 16, fontWeight: 'bold' },
  clearAllText: { fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyStateText: { fontSize: 14, marginTop: 12, textAlign: 'center' },
  transactionsList: { gap: 10 },
  transactionItem: { borderRadius: 14, padding: 14, borderWidth: 1 },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionName: { fontSize: 15, fontWeight: '600', flex: 1 },
  deleteButton: { padding: 4 },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  transactionTime: { fontSize: 11 },
});

// ==================== PLANNER AGENT PAGE ====================
const FinalPlannerPage = ({ settings }) => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    category: 'personal',
  });

  // Available categories
  const categories = [
    { id: 'work', name: 'Work', color: '#3B82F6', icon: 'briefcase-outline' },
    {
      id: 'personal',
      name: 'Personal',
      color: '#10B981',
      icon: 'person-outline',
    },
    {
      id: 'shopping',
      name: 'Shopping',
      color: '#8B5CF6',
      icon: 'cart-outline',
    },
    { id: 'health', name: 'Health', color: '#EF4444', icon: 'fitness-outline' },
    {
      id: 'education',
      name: 'Education',
      color: '#F59E0B',
      icon: 'school-outline',
    },
    {
      id: 'other',
      name: 'Other',
      color: '#6B7280',
      icon: 'ellipsis-horizontal',
    },
  ];

  // Load tasks - FIXED METADATA PARSING
  useEffect(() => {
    console.log('📊 Tasks state updated:', {
      total: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      categories: [...new Set(tasks.map((t) => t.category))],
    });
  }, [tasks]);

  // Load on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseManager.getTasks();

      if (result.success && result.tasks) {
        console.log('📋 Loaded tasks:', result.tasks.length);

        const processedTasks = result.tasks.map((task) => {
          let priority = 'medium';
          let category = 'personal';
          let completed = false;

          console.log('📄 Processing task:', task.title);
          console.log('   Task metadata raw:', task.metadata);
          console.log('   Task status:', task.status);

          // Check status first
          if (task.status === 'completed') {
            completed = true;
          }

          // Parse metadata for priority and category - FIXED PARSING
          if (task.metadata) {
            try {
              let metadata;
              // Check if metadata is already an object or needs parsing
              if (typeof task.metadata === 'string') {
                metadata = JSON.parse(task.metadata);
              } else {
                metadata = task.metadata;
              }

              console.log('   Parsed metadata:', metadata);

              // Get priority - FIXED: Check multiple possible property names
              if (metadata.priority) {
                priority = metadata.priority.toLowerCase();
              } else if (metadata.Priority) {
                priority = metadata.Priority.toLowerCase();
              }
              console.log(`   Priority after parsing: ${priority}`);

              // Get category - FIXED: Check multiple possible property names
              if (metadata.category) {
                category = metadata.category;
              } else if (metadata.Category) {
                category = metadata.Category;
              } else if (metadata.type) {
                category = metadata.type;
              }
              console.log(`   Category after parsing: ${category}`);
            } catch (e) {
              console.log('❌ Metadata parse error:', e.message);
              console.log('   Raw metadata string:', task.metadata);
            }
          }

          // Validate priority
          if (!['high', 'medium', 'low'].includes(priority)) {
            priority = 'medium';
          }

          console.log(
            `✅ Final: priority="${priority}", category="${category}"`
          );

          return {
            id: task.id,
            title: task.title || 'Untitled',
            priority: priority,
            category: category,
            completed: completed,
            time: task.created_at
              ? new Date(task.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown',
            timestamp: task.created_at
              ? new Date(task.created_at).getTime()
              : Date.now(),
          };
        });

        // Filter out completed tasks automatically
        const filteredTasks = processedTasks.filter((task) => !task.completed);

        console.log(
          '📊 Loaded tasks (excluding completed):',
          filteredTasks.length
        );
        filteredTasks.forEach((t) => {
          console.log(
            `   ${t.id}: "${t.title.substring(0, 20)}..." - Priority: ${
              t.priority
            }, Category: ${t.category}`
          );
        });

        setTasks(filteredTasks);
      } else {
        console.error('Failed to load tasks:', result.error);
      }
    } catch (error) {
      console.error('❌ Load error:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // REFRESH TASKS - Automatically hides completed tasks
  const refreshTasks = async () => {
    console.log('🔄 Refreshing tasks (hiding completed)...');
    await loadTasks();
  };

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
  };

  // CREATE/UPDATE TASK - FIXED METADATA SAVING
  const handleSaveTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter task title');
      return;
    }

    console.log('💾 Saving task with data:', {
      title: newTask.title,
      priority: newTask.priority,
      category: newTask.category,
      editingTaskId: editingTask?.id,
    });

    // Validate inputs
    if (!['high', 'medium', 'low'].includes(newTask.priority)) {
      console.error('Invalid priority:', newTask.priority);
      Alert.alert('Error', 'Invalid priority selected');
      return;
    }

    if (!categories.find((c) => c.id === newTask.category)) {
      console.error('Invalid category:', newTask.category);
      Alert.alert('Error', 'Invalid category selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create metadata object - FIXED: Ensure consistent property names
      const metadata = {
        priority: newTask.priority,
        category: newTask.category,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };

      console.log('📦 Saving metadata:', metadata);

      if (editingTask) {
        // Update task
        console.log(`✏️ Updating task ${editingTask.id}`);
        console.log(`   Title: "${newTask.title}"`);
        console.log(`   Priority: ${newTask.priority}`);
        console.log(`   Category: ${newTask.category}`);

        const result = await supabaseManager.updateTask(editingTask.id, {
          title: newTask.title.trim(),
          metadata: JSON.stringify(metadata),
        });

        if (result.success) {
          console.log('✅ Task updated successfully');
          // Update locally (only if not completed)
          if (!editingTask.completed) {
            setTasks((prev) =>
              prev.map((task) =>
                task.id === editingTask.id
                  ? {
                      ...task,
                      title: newTask.title.trim(),
                      priority: newTask.priority,
                      category: newTask.category,
                    }
                  : task
              )
            );
          }
        } else {
          console.error('❌ Update failed:', result.error);
          Alert.alert('Error', result.error || 'Update failed');
          return;
        }
      } else {
        // Create new task
        console.log(`➕ Creating new task`);
        console.log(`   Title: "${newTask.title}"`);
        console.log(`   Priority: ${newTask.priority}`);
        console.log(`   Category: ${newTask.category}`);

        const result = await supabaseManager.saveTask(
          newTask.title.trim(),
          JSON.stringify(metadata)
        );

        if (result.success) {
          console.log('✅ Task created successfully');
          // Add to local state
          const newTaskObj = {
            id: result.task?.id || Date.now().toString(),
            title: newTask.title.trim(),
            priority: newTask.priority,
            category: newTask.category,
            completed: false,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            timestamp: Date.now(),
          };
          console.log('📝 New task object:', newTaskObj);
          setTasks((prev) => [newTaskObj, ...prev]);
        } else {
          console.error('❌ Create failed:', result.error);
          Alert.alert('Error', result.error || 'Create failed');
          return;
        }
      }

      // Reset form
      setNewTask({ title: '', priority: 'medium', category: 'personal' });
      setShowModal(false);
      setEditingTask(null);

      Alert.alert('Success', editingTask ? 'Task updated!' : 'Task created!');
    } catch (error) {
      console.error('❌ Save error:', error);
      Alert.alert('Error', 'Failed to save: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // TOGGLE COMPLETE - When task is completed, remove it from view
  const handleToggleComplete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    console.log(`🔄 Completing task ${taskId}`);

    try {
      const result = await supabaseManager.updateTask(taskId, {
        status: 'completed',
      });

      if (result.success) {
        console.log('✅ Task marked as completed');
        // Remove task from local state immediately
        setTasks((prev) => prev.filter((t) => t.id !== taskId));

        Alert.alert(
          'Task Completed!',
          'Task has been moved to completed tasks'
        );
      } else {
        console.error('❌ Toggle failed:', result.error);
        Alert.alert('Error', 'Failed to complete task');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      Alert.alert('Error', 'Failed to update: ' + error.message);
    }
  };

  // EDIT TASK - FIXED: Properly set modal state
  const handleEditTask = (task) => {
    console.log('📝 Editing task:', {
      id: task.id,
      title: task.title,
      priority: task.priority,
      category: task.category,
      completed: task.completed,
    });

    // Set editing state BEFORE opening modal
    setNewTask({
      title: task.title,
      priority: task.priority,
      category: task.category || 'personal',
    });
    setEditingTask(task);
    setShowModal(true);
  };

  // Priority options
  const priorityOptions = [
    {
      id: 'high',
      label: 'High Priority',
      color: '#EF4444',
      icon: 'alert-circle',
    },
    { id: 'medium', label: 'Medium Priority', color: '#F59E0B', icon: 'time' },
    {
      id: 'low',
      label: 'Low Priority',
      color: '#10B981',
      icon: 'checkmark-circle',
    },
  ];

  // Sort tasks function
  const sortTasks = (tasksList) => {
    return [...tasksList].sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  };

  // Filter by category
  const filteredTasks = (() => {
    let filtered = tasks; // Tasks already filtered to exclude completed ones
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((task) => task.category === selectedCategory);
    }
    return sortTasks(filtered);
  })();

  // Chat response handler with auto-refresh
  const handleChatResponse = async (input) => {
    console.log('💬 Planner chat input:', input);

    try {
      const response = await agentService.getAgentResponse(
        'planner',
        input,
        supabaseManager.userId
      );

      // ===== CRITICAL: AUTO-REFRESH AFTER RESPONSE =====
      // Wait a moment then refresh tasks
      setTimeout(() => {
        loadTasks();
      }, 500);

      return response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      return "I'm your Task Planner! Tell me what you need to schedule.";
    }
  };

  // Add task button handler
  const handleAddTask = async (taskName) => {
    if (!taskName.trim()) return false;

    try {
      const result = await supabaseManager.saveTask(taskName.trim());
      if (result.success) {
        // Refresh tasks list
        await loadTasks();
        return true;
      }
    } catch (error) {
      console.error('Add task error:', error);
    }
    return false;
  };

  // Task Item Component - REMOVED DELETE BUTTONS
  const TaskItem = React.memo(({ task }) => {
    const priorityColors = {
      high: {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#DC2626',
        icon: 'alert-circle',
      },
      medium: {
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#D97706',
        icon: 'time',
      },
      low: {
        bg: '#D1FAE5',
        text: '#059669',
        border: '#059669',
        icon: 'checkmark-circle',
      },
    };

    const categoryInfo =
      categories.find((c) => c.id === task.category) ||
      categories.find((c) => c.id === 'personal');
    const priorityInfo = priorityColors[task.priority] || priorityColors.medium;

    return (
      <View
        style={[
          stylesFinal.taskItem,
          {
            backgroundColor: settings.theme === 'dark' ? '#1F2937' : '#FFFFFF',
            borderColor: settings.theme === 'dark' ? '#374151' : '#E5E7EB',
          },
        ]}>
        <View style={stylesFinal.taskContent}>
          <View style={stylesFinal.taskHeader}>
            <TouchableOpacity
              style={stylesFinal.checkboxArea}
              onPress={() => handleToggleComplete(task.id)}
              activeOpacity={0.7}>
              <View
                style={[
                  stylesFinal.checkbox,
                  {
                    borderColor: priorityInfo.border,
                    backgroundColor: 'transparent',
                  },
                ]}>
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={priorityInfo.border}
                />
              </View>
              <Text
                style={[
                  stylesFinal.taskTitle,
                  { color: settings.theme === 'dark' ? '#F9FAFB' : '#111827' },
                ]}
                numberOfLines={2}>
                {task.title}
              </Text>
            </TouchableOpacity>

            <View style={stylesFinal.taskActions}>
              <View
                style={[
                  stylesFinal.priorityBadge,
                  {
                    backgroundColor:
                      priorityInfo.bg + (settings.theme === 'dark' ? '40' : ''),
                    borderColor: priorityInfo.border,
                  },
                ]}>
                <Ionicons
                  name={priorityInfo.icon}
                  size={14}
                  color={priorityInfo.text}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    stylesFinal.priorityText,
                    { color: priorityInfo.text },
                  ]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleEditTask(task)}
                style={stylesFinal.editButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="pencil-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Badge */}
          <View
            style={[
              stylesFinal.categoryBadge,
              {
                backgroundColor: categoryInfo.color + '20',
                borderColor: categoryInfo.color,
                alignSelf: 'flex-start',
                marginTop: 8,
                marginBottom: 12,
              },
            ]}>
            <Ionicons
              name={categoryInfo.icon}
              size={12}
              color={categoryInfo.color}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[stylesFinal.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>

          <View style={stylesFinal.taskFooter}>
            <View style={stylesFinal.timeContainer}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text
                style={[
                  stylesFinal.taskTime,
                  { color: '#6B7280', marginLeft: 4 },
                ]}>
                {task.time}
              </Text>
            </View>
            <View
              style={[
                stylesFinal.statusBadge,
                { backgroundColor: '#F59E0B20' },
              ]}>
              <Text
                style={[
                  stylesFinal.statusText,
                  {
                    color: '#F59E0B',
                  },
                ]}>
                ⏳ Pending
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  });

  return (
    <View
      style={[
        stylesFinal.container,
        {
          backgroundColor: settings.theme === 'dark' ? '#111827' : '#F9FAFB',
        },
      ]}>
      {/* Header */}
      <View
        style={[
          stylesFinal.header,
          {
            backgroundColor: settings.theme === 'dark' ? '#1F2937' : '#FFFFFF',
            borderBottomColor:
              settings.theme === 'dark' ? '#374151' : '#E5E7EB',
          },
        ]}>
        <View>
          <Text style={[stylesFinal.title, { color: '#00BCD4' }]}>
            Task Planner
          </Text>
          <Text
            style={[
              stylesFinal.subtitle,
              {
                color: settings.theme === 'dark' ? '#9CA3AF' : '#6B7280',
              },
            ]}>
            {tasks.length} active tasks
          </Text>
        </View>

        <View style={stylesFinal.headerActions}>
          <TouchableOpacity
            onPress={refreshTasks}
            style={[
              stylesFinal.refreshButton,
              {
                backgroundColor:
                  settings.theme === 'dark' ? '#374151' : '#F3F4F6',
                marginRight: 12,
              },
            ]}>
            <Ionicons
              name="refresh"
              size={20}
              color={settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[stylesFinal.addButton, { backgroundColor: '#00BCD4' }]}
            onPress={() => {
              console.log('Opening modal for new task');
              setEditingTask(null);
              setNewTask({
                title: '',
                priority: 'medium',
                category: 'personal',
              });
              setShowModal(true);
            }}>
            <Ionicons name="add" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View
        style={[
          stylesFinal.categoryFilter,
          {
            backgroundColor: settings.theme === 'dark' ? '#1F2937' : '#FFFFFF',
            borderBottomColor:
              settings.theme === 'dark' ? '#374151' : '#E5E7EB',
          },
        ]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              stylesFinal.categoryFilterItem,
              selectedCategory === 'all' &&
                stylesFinal.categoryFilterItemActive,
              {
                backgroundColor:
                  settings.theme === 'dark' ? '#374151' : '#F3F4F6',
              },
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Text
              style={[
                stylesFinal.categoryFilterText,
                { color: settings.theme === 'dark' ? '#D1D5DB' : '#4B5563' },
                selectedCategory === 'all' &&
                  stylesFinal.categoryFilterTextActive,
              ]}>
              All Tasks
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                stylesFinal.categoryFilterItem,
                selectedCategory === category.id &&
                  stylesFinal.categoryFilterItemActive,
                {
                  backgroundColor:
                    selectedCategory === category.id
                      ? category.color + '20'
                      : settings.theme === 'dark'
                      ? '#374151'
                      : '#F3F4F6',
                  borderColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Ionicons
                name={category.icon}
                size={14}
                color={
                  selectedCategory === category.id
                    ? category.color
                    : settings.theme === 'dark'
                    ? '#9CA3AF'
                    : '#6B7280'
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  stylesFinal.categoryFilterText,
                  {
                    color:
                      selectedCategory === category.id
                        ? category.color
                        : settings.theme === 'dark'
                        ? '#D1D5DB'
                        : '#4B5563',
                  },
                  selectedCategory === category.id && { color: category.color },
                ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={stylesFinal.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={[stylesFinal.loadingText, { color: '#6B7280' }]}>
            Loading tasks...
          </Text>
        </View>
      )}

      {/* Tasks List */}
      {!isLoading && (
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => <TaskItem task={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={stylesFinal.tasksList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={stylesFinal.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
              <Text style={[stylesFinal.emptyStateTitle, { color: '#6B7280' }]}>
                {selectedCategory === 'all'
                  ? 'No active tasks'
                  : `No ${selectedCategory} tasks`}
              </Text>
              <Text style={[stylesFinal.emptyStateText, { color: '#6B7280' }]}>
                {selectedCategory === 'all'
                  ? 'Add your first task by tapping the + button'
                  : `Add a ${
                      categories.find((c) => c.id === selectedCategory)?.name ||
                      'new'
                    } task`}
              </Text>
              <TouchableOpacity
                style={[
                  stylesFinal.emptyStateButton,
                  { backgroundColor: '#00BCD4' },
                ]}
                onPress={() => {
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    priority: 'medium',
                    category:
                      selectedCategory === 'all'
                        ? 'personal'
                        : selectedCategory,
                  });
                  setShowModal(true);
                }}>
                <Text style={stylesFinal.emptyStateButtonText}>
                  Create New Task
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* MODAL - FIXED STATE MANAGEMENT */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (!isSubmitting) {
            setShowModal(false);
            setEditingTask(null);
            setNewTask({ title: '', priority: 'medium', category: 'personal' });
          }
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!isSubmitting) {
              setShowModal(false);
              setEditingTask(null);
              setNewTask({
                title: '',
                priority: 'medium',
                category: 'personal',
              });
            }
          }}>
          <View style={stylesFinal.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  stylesFinal.modalContent,
                  {
                    backgroundColor:
                      settings.theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    borderColor:
                      settings.theme === 'dark' ? '#374151' : '#E5E7EB',
                  },
                ]}>
                <View style={stylesFinal.modalHeader}>
                  <Text
                    style={[
                      stylesFinal.modalTitle,
                      {
                        color:
                          settings.theme === 'dark' ? '#F9FAFB' : '#111827',
                      },
                    ]}>
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </Text>
                  <TouchableOpacity
                    style={stylesFinal.modalCloseButton}
                    onPress={() => {
                      if (!isSubmitting) {
                        setShowModal(false);
                        setEditingTask(null);
                        setNewTask({
                          title: '',
                          priority: 'medium',
                          category: 'personal',
                        });
                      }
                    }}
                    disabled={isSubmitting}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Title Input */}
                <Text
                  style={[
                    stylesFinal.inputLabel,
                    {
                      color: settings.theme === 'dark' ? '#D1D5DB' : '#4B5563',
                      marginBottom: 8,
                    },
                  ]}>
                  Task Title
                </Text>
                <View style={stylesFinal.inputContainer}>
                  <TextInput
                    style={[
                      stylesFinal.input,
                      {
                        backgroundColor:
                          settings.theme === 'dark' ? '#374151' : '#F3F4F6',
                        color:
                          settings.theme === 'dark' ? '#F9FAFB' : '#111827',
                        borderColor:
                          settings.theme === 'dark' ? '#4B5563' : '#D1D5DB',
                        paddingRight: 50,
                      },
                    ]}
                    placeholder="What needs to be done?"
                    placeholderTextColor={
                      settings.theme === 'dark' ? '#9CA3AF' : '#6B7280'
                    }
                    value={newTask.title}
                    onChangeText={(text) =>
                      setNewTask({ ...newTask, title: text })
                    }
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveTask}
                    blurOnSubmit={false}
                    maxLength={200}
                    editable={!isSubmitting}
                  />
                  {newTask.title.trim().length > 0 && !isSubmitting && (
                    <TouchableOpacity
                      style={stylesFinal.inputSubmitButton}
                      onPress={handleSaveTask}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#00BCD4"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Priority Selection - FIXED: Shows current selection */}
                <Text
                  style={[
                    stylesFinal.sectionTitle,
                    {
                      color: settings.theme === 'dark' ? '#D1D5DB' : '#4B5563',
                      marginTop: 16,
                    },
                  ]}>
                  Priority Level
                </Text>

                <View style={stylesFinal.priorityContainer}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        stylesFinal.priorityOption,
                        {
                          backgroundColor:
                            settings.theme === 'dark' ? '#374151' : '#F3F4F6',
                          borderColor:
                            settings.theme === 'dark' ? '#4B5563' : '#D1D5DB',
                        },
                        newTask.priority === option.id && [
                          stylesFinal.priorityOptionSelected,
                          {
                            backgroundColor: option.color + '20',
                            borderColor: option.color,
                            borderWidth: 2,
                          },
                        ],
                      ]}
                      onPress={() => {
                        console.log('Selecting priority:', option.id);
                        setNewTask({ ...newTask, priority: option.id });
                      }}
                      disabled={isSubmitting}
                      activeOpacity={0.7}>
                      <Ionicons
                        name={option.icon}
                        size={16}
                        color={
                          newTask.priority === option.id
                            ? option.color
                            : settings.theme === 'dark'
                            ? '#9CA3AF'
                            : '#6B7280'
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          stylesFinal.priorityOptionText,
                          {
                            color:
                              newTask.priority === option.id
                                ? option.color
                                : settings.theme === 'dark'
                                ? '#D1D5DB'
                                : '#4B5563',
                          },
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category Selection - FIXED: Shows current selection */}
                <Text
                  style={[
                    stylesFinal.sectionTitle,
                    {
                      color: settings.theme === 'dark' ? '#D1D5DB' : '#4B5563',
                      marginTop: 20,
                    },
                  ]}>
                  Category
                </Text>

                <View style={stylesFinal.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        stylesFinal.categoryOption,
                        {
                          backgroundColor:
                            settings.theme === 'dark' ? '#374151' : '#F3F4F6',
                          borderColor:
                            settings.theme === 'dark' ? '#4B5563' : '#D1D5DB',
                        },
                        newTask.category === category.id && [
                          stylesFinal.categoryOptionSelected,
                          {
                            backgroundColor: category.color + '20',
                            borderColor: category.color,
                            borderWidth: 2,
                          },
                        ],
                      ]}
                      onPress={() => {
                        console.log('Selecting category:', category.id);
                        setNewTask({ ...newTask, category: category.id });
                      }}
                      disabled={isSubmitting}
                      activeOpacity={0.7}>
                      <Ionicons
                        name={category.icon}
                        size={16}
                        color={
                          newTask.category === category.id
                            ? category.color
                            : settings.theme === 'dark'
                            ? '#9CA3AF'
                            : '#6B7280'
                        }
                        style={{ marginBottom: 6 }}
                      />
                      <Text
                        style={[
                          stylesFinal.categoryOptionText,
                          {
                            color:
                              newTask.category === category.id
                                ? category.color
                                : settings.theme === 'dark'
                                ? '#D1D5DB'
                                : '#4B5563',
                          },
                        ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selected Settings Summary */}
                <View style={stylesFinal.selectedSummary}>
                  <Text
                    style={[
                      stylesFinal.selectedPriority,
                      {
                        color:
                          priorityOptions.find((p) => p.id === newTask.priority)
                            ?.color || '#6B7280',
                      },
                    ]}>
                    <Ionicons
                      name="flag"
                      size={12}
                      color={
                        priorityOptions.find((p) => p.id === newTask.priority)
                          ?.color
                      }
                    />{' '}
                    {newTask.priority.toUpperCase()} PRIORITY
                  </Text>
                  <Text
                    style={[
                      stylesFinal.selectedCategory,
                      {
                        color:
                          categories.find((c) => c.id === newTask.category)
                            ?.color || '#6B7280',
                        marginLeft: 12,
                      },
                    ]}>
                    <Ionicons
                      name={
                        categories.find((c) => c.id === newTask.category)?.icon
                      }
                      size={12}
                      color={
                        categories.find((c) => c.id === newTask.category)?.color
                      }
                    />{' '}
                    {categories
                      .find((c) => c.id === newTask.category)
                      ?.name?.toUpperCase()}
                  </Text>
                </View>

                {/* Debug Info */}
                {__DEV__ && (
                  <View
                    style={{
                      marginTop: 8,
                      padding: 8,
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                    }}>
                    <Text style={{ color: '#6B7280', fontSize: 10 }}>
                      Debug Info:
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 10 }}>
                      Selected Priority: {newTask.priority}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 10 }}>
                      Selected Category: {newTask.category}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 10 }}>
                      Editing Task: {editingTask ? 'Yes' : 'No'}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={stylesFinal.modalActions}>
                  <TouchableOpacity
                    style={[
                      stylesFinal.cancelButton,
                      {
                        backgroundColor:
                          settings.theme === 'dark' ? '#374151' : '#F3F4F6',
                        borderColor:
                          settings.theme === 'dark' ? '#4B5563' : '#D1D5DB',
                      },
                    ]}
                    onPress={() => {
                      if (!isSubmitting) {
                        setShowModal(false);
                        setEditingTask(null);
                        setNewTask({
                          title: '',
                          priority: 'medium',
                          category: 'personal',
                        });
                      }
                    }}
                    disabled={isSubmitting}>
                    <Text
                      style={[
                        stylesFinal.cancelButtonText,
                        {
                          color:
                            settings.theme === 'dark' ? '#D1D5DB' : '#4B5563',
                        },
                      ]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      stylesFinal.saveButton,
                      {
                        backgroundColor: '#00BCD4',
                        opacity:
                          !newTask.title.trim() || isSubmitting ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleSaveTask}
                    disabled={!newTask.title.trim() || isSubmitting}>
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <>
                        <Ionicons
                          name={editingTask ? 'save-outline' : 'add-circle'}
                          size={18}
                          color="#000000"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={stylesFinal.saveButtonText}>
                          {editingTask ? 'Update Task' : 'Create Task'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Floating Add Button */}
      {!showModal && tasks.length > 0 && (
        <TouchableOpacity
          style={[stylesFinal.floatingButton, { backgroundColor: '#00BCD4' }]}
          onPress={() => {
            console.log('Floating button pressed');
            setEditingTask(null);
            setNewTask({ title: '', priority: 'medium', category: 'personal' });
            setShowModal(true);
          }}
          activeOpacity={0.9}>
          <Ionicons name="add" size={24} color="#000000" />
        </TouchableOpacity>
      )}

      {/* Chat Widget */}
      <ChatWidget
        agentName="Task Planner"
        agentId="planner"
        initialMessage="Welcome to Task Planner! Create tasks, set priorities (High/Medium/Low), choose categories, mark them complete, and stay organized. Tap the + button to add a new task."
        onSendMessage={handleChatResponse}
        color="#00BCD4"
        settings={settings}
        // ===== CRITICAL: Callback when message is sent =====
        onMessageSent={() => {
          // Refresh tasks after chat message
          setTimeout(() => {
            loadTasks();
          }, 1000);
        }}
      />
    </View>
  );
};

// ENHANCED FINAL STYLES WITH DELETE FUNCTIONALITY REMOVED
const stylesFinal = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Category Filter
  categoryFilter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryFilterItemActive: {
    borderWidth: 2,
  },
  categoryFilterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryFilterTextActive: {
    fontWeight: '700',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Tasks List
  tasksList: {
    padding: 20,
    paddingBottom: 100,
  },

  // Task Item
  taskItem: {
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  taskContent: {
    padding: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkboxArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    color: '#6B7280',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  emptyStateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },

  // Input
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  inputSubmitButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },

  // Priority
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Category Selection in Modal
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  categoryOption: {
    width: '31%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryOptionSelected: {
    borderWidth: 2,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  // Selected Summary
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  selectedPriority: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedCategory: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

// Update the planner page
const PlannerAgentPage = FinalPlannerPage;

// ==================== GENERAL CHAT AGENT PAGE ====================
const GeneralChatAgentPage = ({ settings }) => {
  const colors = getThemeColors(settings.theme);
  const agentServiceRef = useRef(agentService);

  const handleChatResponse = async (input) => {
    try {
      const response = await agentServiceRef.current.getAgentResponse(
        'general',
        input,
        supabaseManager.userId
      );
      return response;
    } catch (error) {
      console.error('❌ Chat response error:', error);
      return "I'm having trouble connecting right now. Please try again.";
    }
  };

  return (
    <View
      style={[stylesAgent.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={stylesAgent.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={stylesAgent.header}>
          <View style={{ flex: 1 }}>
            <Text style={[stylesAgent.title, { color: '#6366F1' }]}>
              Aura Prime
            </Text>
            <Text
              style={[stylesAgent.subtitle, { color: colors.textSecondary }]}
              numberOfLines={2}
              ellipsizeMode="tail">
              Your General AI Assistant
            </Text>
          </View>
        </View>

        <View
          style={[
            stylesAgent.heroCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <View
            style={[stylesAgent.heroIcon, { backgroundColor: '#6366F120' }]}>
            <Ionicons name="chatbubbles" size={36} color="#6366F1" />
          </View>
          <Text style={[stylesAgent.heroTitle, { color: colors.textPrimary }]}>
            Chat with Aura Prime
          </Text>
          <Text
            style={[
              stylesAgent.heroDescription,
              { color: colors.textSecondary },
            ]}>
            I'm here to help with any questions, tasks, or conversations.
            Whether you need information, assistance with a problem, or just
            want to chat, I'm ready to help!
          </Text>
        </View>
      </ScrollView>

      <ChatWidget
        agentName="Aura Prime"
        agentId="general"
        initialMessage="Hello! I'm Aura Prime, your general AI assistant. I'm here to help with any questions, tasks, or conversations you'd like to have. Whether you need information, assistance with a problem, or just want to chat, I'm ready to help! What would you like to talk about today?"
        onSendMessage={handleChatResponse}
        color="#6366F1"
        settings={settings}
      />
    </View>
  );
};

const stylesAgent = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
});

// ==================== CREATIVE AGENT PAGE ====================
const CreativeAgentPage = ({ settings }) => {
  const colors = getThemeColors(settings.theme);
  const agentServiceRef = useRef(agentService);

  const handleChatResponse = async (input) => {
    try {
      const response = await agentServiceRef.current.getAgentResponse(
        'creative',
        input,
        supabaseManager.userId
      );
      return response;
    } catch (error) {
      console.error('❌ Chat response error:', error);
      return 'My creative brain is offline right now. Please try again in a moment.';
    }
  };

  return (
    <View
      style={[stylesAgent.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={stylesAgent.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={stylesAgent.header}>
          <View style={{ flex: 1 }}>
            <Text style={[stylesAgent.title, { color: '#F43F5E' }]}>
              Creative Muse
            </Text>
            <Text
              style={[stylesAgent.subtitle, { color: colors.textSecondary }]}
              numberOfLines={2}
              ellipsizeMode="tail">
              Your Artistic Companion
            </Text>
          </View>
        </View>

        <View
          style={[
            stylesAgent.heroCard,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <View
            style={[stylesAgent.heroIcon, { backgroundColor: '#F43F5E20' }]}>
            <Ionicons name="brush" size={36} color="#F43F5E" />
          </View>
          <Text style={[stylesAgent.heroTitle, { color: colors.textPrimary }]}>
            Unleash Your Creativity
          </Text>
          <Text
            style={[
              stylesAgent.heroDescription,
              { color: colors.textSecondary },
            ]}>
            I'm here to inspire, brainstorm, and collaborate on all your
            creative projects. Whether you're writing, designing, or just
            exploring ideas, let's create something amazing together!
          </Text>
        </View>
      </ScrollView>

      <ChatWidget
        agentName="Creative Muse"
        agentId="creative"
        initialMessage="Welcome to your creative sanctuary! I'm your Creative Muse, here to unlock your imagination. Whether you need writing prompts, artistic inspiration, creative brainstorming, or help with any artistic project, I'm here to help you create something extraordinary. What creative project would you like to work on today?"
        onSendMessage={handleChatResponse}
        color="#F43F5E"
        settings={settings}
      />
    </View>
  );
};

// ==================== MENTAL WELLNESS AGENT PAGE ====================

// REMOVE THIS DUPLICATE IMPORT LINE:
// import { Animated } from 'react-native';

const MentalWellnessAgentPage = ({ settings }) => {
  // Core states
  const [mood, setMood] = useState('neutral');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingTime, setBreathingTime] = useState(0);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalText, setJournalText] = useState('');
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // ADD THESE STATES
  const [breathingPattern, setBreathingPattern] = useState('4-7-8');
  const [isAffirmationChanging, setIsAffirmationChanging] = useState(false);

  // ADD ANIMATION VALUES
  const affirmationAnimation = useRef(new Animated.Value(0)).current;
  const affirmationTextAnimation = useRef(new Animated.Value(1)).current;
  const tipAnimation = useRef(new Animated.Value(0)).current;

  const colors = getThemeColors(settings.theme);
  const breathingInterval = useRef(null);
  const tipsInterval = useRef(null);
  const affirmationInterval = useRef(null); // ADD THIS

  const agentServiceRef = useRef(agentService);

  // Compact data arrays - ENHANCED
  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: 'happy', color: '#10B981' },
    { emoji: '😐', label: 'Neutral', value: 'neutral', color: '#6B7280' },
    { emoji: '😔', label: 'Sad', value: 'sad', color: '#3B82F6' },
    { emoji: '😰', label: 'Anxious', value: 'anxious', color: '#F59E0B' },
    { emoji: '😴', label: 'Tired', value: 'tired', color: '#8B5CF6' },
  ];

  // ENHANCED AFFIRMATIONS WITH EMOJIS
  const affirmations = [
    { text: 'I am enough just as I am', emoji: '✨' },
    { text: 'My feelings are valid and important', emoji: '❤️' },
    { text: 'I am stronger than my challenges', emoji: '💪' },
    { text: 'I choose peace over perfection', emoji: '☮️' },
    { text: 'Today is a fresh start', emoji: '🌅' },
  ];

  // ADD BREATHING PATTERNS
  const breathingPatterns = [
    { id: 'relaxation', name: 'Relaxation', inhale: 4, hold: 7, exhale: 8 },
    { id: 'box', name: 'Box', inhale: 4, hold: 4, exhale: 4 },
    { id: 'calm', name: 'Calm', inhale: 4, hold: 2, exhale: 6 },
  ];

  // ENHANCED WELLNESS TIPS WITH EMOJIS
  const wellnessTips = [
    { text: 'Drink water when feeling anxious', emoji: '💧' },
    { text: '5-minute walk can reset your mood', emoji: '🚶' },
    { text: 'Consistent sleep improves mental health', emoji: '🌙' },
    { text: 'Journaling reduces stress by 30%', emoji: '📝' },
    { text: 'Nature exposure boosts serotonin', emoji: '🌿' },
  ];

  const crisisResources = [
    { name: 'Umang Pakistan', phone: '0311-7786264' },
    { name: 'PIMS Helpline', phone: '051-9261170' },
    { name: 'Aman TeleHealth', phone: '042-111-111-456' },
    { name: 'Edhi Foundation', phone: '115' },
    { name: 'Police Emergency', phone: '15' },
  ];

  // Load journal on mount
  useEffect(() => {
    loadJournal();

    // Auto-rotate tips every 8 seconds with animation
    tipsInterval.current = setInterval(() => {
      // Fade out current tip
      Animated.timing(tipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setActiveTipIndex((prev) => (prev + 1) % wellnessTips.length);
        // Fade in new tip
        Animated.timing(tipAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 8000);

    // Auto-rotate affirmations every 15 seconds
    affirmationInterval.current = setInterval(() => {
      nextAffirmation();
    }, 15000);

    return () => {
      clearInterval(tipsInterval.current);
      clearInterval(affirmationInterval.current);
    };
  }, []);

  // ENHANCED BREATHING TIMER
  useEffect(() => {
    if (breathingActive) {
      breathingInterval.current = setInterval(() => {
        setBreathingTime((prev) => {
          if (prev >= 60) {
            // Increased to 60 seconds
            stopBreathing();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(breathingInterval.current);
  }, [breathingActive]);

  // ENHANCED BREATHING PHASES WITH PATTERNS
  useEffect(() => {
    if (breathingActive) {
      const pattern = breathingPatterns.find((p) => p.id === breathingPattern);
      const cycleTime = pattern.inhale + pattern.hold + pattern.exhale;
      const currentCycleTime = breathingTime % cycleTime;

      if (currentCycleTime < pattern.inhale) {
        setBreathingPhase('inhale');
      } else if (currentCycleTime < pattern.inhale + pattern.hold) {
        setBreathingPhase('hold');
      } else {
        setBreathingPhase('exhale');
      }
    }
  }, [breathingTime, breathingActive, breathingPattern]);

  // ANIMATED AFFIRMATION CHANGE
  const nextAffirmation = () => {
    if (isAffirmationChanging) return;

    setIsAffirmationChanging(true);

    // Fade out animation
    Animated.parallel([
      Animated.timing(affirmationAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(affirmationTextAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change affirmation
      setAffirmationIndex((prev) => (prev + 1) % affirmations.length);

      // Fade in animation
      Animated.parallel([
        Animated.timing(affirmationAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(affirmationTextAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAffirmationChanging(false);
      });
    });
  };

  // ANIMATION STYLES
  const affirmationCardAnimatedStyle = {
    transform: [
      {
        translateX: affirmationAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: affirmationAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.95],
        }),
      },
    ],
    opacity: affirmationAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8],
    }),
  };

  const affirmationTextAnimatedStyle = {
    opacity: affirmationTextAnimation,
    transform: [
      {
        scale: affirmationTextAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  const tipAnimatedStyle = {
    opacity: tipAnimation,
  };

  // ENHANCED BREATHING FUNCTIONS
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingTime(0);
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    clearInterval(breathingInterval.current);
  };

  // REST OF YOUR FUNCTIONS REMAIN THE SAME...
  const saveJournal = async () => {
    if (!journalText.trim()) {
      Alert.alert('Empty', 'Please write something first');
      return;
    }

    try {
      const entry = {
        id: Date.now().toString(),
        text: journalText.trim(),
        mood: mood,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
      };

      const newEntries = [entry, ...journalEntries.slice(0, 9)];
      setJournalEntries(newEntries);
      setJournalText('');

      // Save to AsyncStorage
      await AsyncStorage.setItem(`mental_journal`, JSON.stringify(newEntries));

      // Also save to Supabase
      await saveToDatabase('journal', {
        message: journalText.trim(),
        response: `Journal entry with mood: ${mood}`,
        mood: mood,
      });

      Alert.alert('Saved', 'Journal entry saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const confirmDeleteEntry = (id) => {
    setEntryToDelete(id);
  };

  const deleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      const newEntries = journalEntries.filter((e) => e.id !== entryToDelete);
      setJournalEntries(newEntries);
      setEntryToDelete(null);

      await AsyncStorage.setItem(`mental_journal`, JSON.stringify(newEntries));

      Alert.alert('Deleted', 'Entry deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const cancelDelete = () => {
    setEntryToDelete(null);
  };

  const loadJournal = async () => {
    try {
      const saved = await AsyncStorage.getItem(`mental_journal`);
      if (saved) {
        const entries = JSON.parse(saved);
        const sortedEntries = entries.sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );
        setJournalEntries(sortedEntries);
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const saveToDatabase = async (type, data) => {
    if (!supabaseManager.userId || supabaseManager.userId === 'anonymous') {
      return false;
    }

    try {
      let result;
      switch (type) {
        case 'journal':
          // Save journal to supabase
          result = await supabaseManager.saveConversation(
            'mental',
            data.message,
            data.response,
            {
              type: 'journal_entry',
              mood: data.mood,
            }
          );
          break;
        // Add other types as needed
      }
      return result?.success || false;
    } catch (error) {
      console.log('⚠️ Database save error:', error.message);
      return false;
    }
  };

  // Simple chat handler
  const handleChatResponse = async (input) => {
    console.log('🧠 Mental chat input:', input);

    try {
      // Use the agent service like other agents do
      const response = await agentServiceRef.current.getAgentResponse(
        'mental',
        input,
        supabaseManager.userId
      );

      console.log(
        '✅ Mental chat response:',
        response ? response.substring(0, 100) : 'No response'
      );
      return response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      return "I'm here to listen. How are you feeling today?";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#EC4899' }]}>Mind Harmony</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Simple mental wellness
          </Text>
        </View>

        {/* ANIMATED AFFIRMATION */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: '#EC489910', borderColor: '#EC489930' },
            affirmationCardAnimatedStyle,
          ]}>
          <View style={styles.affirmationHeader}>
            <View style={styles.affirmationTitleRow}>
              <Ionicons name="sparkles" size={18} color="#EC4899" />
              <Text style={[styles.affirmationTitle, { color: '#EC4899' }]}>
                Daily Affirmation
              </Text>
            </View>
            <Text
              style={[
                styles.affirmationCounter,
                { color: colors.textTertiary },
              ]}>
              {affirmationIndex + 1}/{affirmations.length}
            </Text>
          </View>

          <Animated.View
            style={[styles.affirmationContent, affirmationTextAnimatedStyle]}>
            <Text style={[styles.affirmationEmoji, { fontSize: 28 }]}>
              {affirmations[affirmationIndex].emoji}
            </Text>
            <Text
              style={[styles.affirmationText, { color: colors.textPrimary }]}>
              "{affirmations[affirmationIndex].text}"
            </Text>
          </Animated.View>

          <TouchableOpacity
            onPress={nextAffirmation}
            style={[styles.refreshButton, { backgroundColor: colors.bgInput }]}
            disabled={isAffirmationChanging}>
            <Ionicons name="refresh" size={16} color="#EC4899" />
          </TouchableOpacity>
        </Animated.View>

        {/* Mood Check */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            How are you feeling?
          </Text>
          <View style={styles.moodRow}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  { backgroundColor: colors.bgInput },
                  mood === option.value && {
                    borderColor: option.color,
                    borderWidth: 2,
                    backgroundColor: `${option.color}20`,
                  },
                ]}
                onPress={() => setMood(option.value)}>
                <Text
                  style={[
                    styles.moodEmoji,
                    mood === option.value && { transform: [{ scale: 1.1 }] },
                  ]}>
                  {option.emoji}
                </Text>
                <Text
                  style={[
                    styles.moodLabel,
                    { color: colors.textPrimary },
                    mood === option.value && {
                      color: option.color,
                      fontWeight: '600',
                    },
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ENHANCED BREATHING EXERCISE */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Breathing Exercise
          </Text>

          {/* PATTERN SELECTOR */}
          <View style={styles.patternSelector}>
            {breathingPatterns.map((pattern) => (
              <TouchableOpacity
                key={pattern.id}
                style={[
                  styles.patternButton,
                  { backgroundColor: colors.bgInput },
                  breathingPattern === pattern.id && {
                    borderColor: '#EC4899',
                    borderWidth: 2,
                    backgroundColor: '#EC489910',
                  },
                ]}
                onPress={() => setBreathingPattern(pattern.id)}>
                <Text
                  style={[
                    styles.patternName,
                    { color: colors.textPrimary },
                    breathingPattern === pattern.id && {
                      color: '#EC4899',
                      fontWeight: '600',
                    },
                  ]}>
                  {pattern.name}
                </Text>
                <Text
                  style={[
                    styles.patternTiming,
                    { color: colors.textSecondary },
                    breathingPattern === pattern.id && { color: '#EC4899' },
                  ]}>
                  {pattern.inhale}-{pattern.hold}-{pattern.exhale}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.breathingContainer}>
            <View style={styles.breathingTimerRow}>
              <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                Time remaining:
              </Text>
              <Text style={[styles.timer, { color: '#EC4899' }]}>
                {60 - breathingTime}s
              </Text>
            </View>

            <View style={styles.breathingCircleContainer}>
              <View
                style={[
                  styles.breathingCircle,
                  {
                    backgroundColor: breathingActive
                      ? '#EC4899'
                      : colors.borderPrimary,
                    transform: [
                      {
                        scale: breathingActive
                          ? breathingPhase === 'inhale'
                            ? 1.5
                            : breathingPhase === 'hold'
                            ? 1.5
                            : 1
                          : 1,
                      },
                    ],
                  },
                ]}
              />
            </View>

            {breathingActive && (
              <View style={styles.breathingPhaseContainer}>
                <Text style={[styles.breathingPhaseText, { color: '#EC4899' }]}>
                  {breathingPhase.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.breathingGuide,
                    { color: colors.textSecondary },
                  ]}>
                  {breathingPhase === 'inhale'
                    ? 'Breathe in slowly'
                    : breathingPhase === 'hold'
                    ? 'Hold your breath'
                    : 'Breathe out gently'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.breathingButton,
                { backgroundColor: breathingActive ? '#EF4444' : '#EC4899' },
              ]}
              onPress={breathingActive ? stopBreathing : startBreathing}>
              <Ionicons
                name={breathingActive ? 'stop' : 'play'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.breathingButtonText}>
                {breathingActive ? 'Stop Exercise' : 'Start Breathing'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Journal - SIMPLE & RELIABLE */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Daily Journal
          </Text>

        <TextInput
  style={[
    styles.journalInput,
    {
      backgroundColor: colors.bgInput,
      color: colors.textPrimary,
      borderColor: colors.borderPrimary,
      borderRadius: 16,
      padding: 16,
      fontSize: 15,
      minHeight: 120,
      textAlignVertical: 'top',
    },
  ]}
  placeholder="What's on your mind today? Write freely..."
  placeholderTextColor={colors.textTertiary}
  value={journalText}
  onChangeText={setJournalText}
  multiline
  numberOfLines={5}
  textAlignVertical="top"
/>

{/* Character counter */}
{journalText.length > 0 && (
  <Text style={[styles.characterCount, { color: colors.textTertiary, textAlign: 'right', marginTop: 8, fontSize: 12 }]}>
    {journalText.length} characters
  </Text>
)}

        <TouchableOpacity
  style={[
    styles.saveButton,
    {
      backgroundColor: journalText.trim() ? '#EC4899' : colors.borderPrimary,
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  ]}
  onPress={saveJournal}
  disabled={!journalText.trim()}>
  <Ionicons 
    name="save-outline" 
    size={20} 
    color={journalText.trim() ? '#FFFFFF' : colors.textTertiary} 
  />
  <Text style={[
    styles.saveButtonText, 
    { 
      color: journalText.trim() ? '#FFFFFF' : colors.textTertiary,
      fontWeight: '600',
      fontSize: 16,
    }
  ]}>
    Save Journal Entry
  </Text>
</TouchableOpacity>

          {/* Entries List with DELETE CONFIRMATION */}
          {journalEntries.length > 0 && (
            <>
              <View style={styles.entriesHeader}>
                <Text
                  style={[styles.entriesTitle, { color: colors.textPrimary }]}>
                  Recent Entries ({journalEntries.length})
                </Text>
              </View>

              {journalEntries.map((entry) => {
                const entryMood = moodOptions.find(
                  (m) => m.value === entry.mood
                );

                return (
                  <View
                    key={entry.id}
                    style={[
                      styles.entryCard,
                      {
                        backgroundColor: colors.bgInput,
                        borderColor: colors.borderPrimary,
                      },
                    ]}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryMoodTime}>
                        <Text style={styles.entryMood}>
                          {entryMood?.emoji || '😐'}
                        </Text>
                        <Text
                          style={[
                            styles.entryTime,
                            { color: colors.textTertiary },
                          ]}>
                          {entry.time}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.deleteButton,
                          entryToDelete === entry.id && {
                            backgroundColor: '#EF444420',
                          },
                        ]}
                        onPress={() => confirmDeleteEntry(entry.id)}>
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={
                            entryToDelete === entry.id
                              ? '#EF4444'
                              : colors.textTertiary
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={[
                        styles.entryText,
                        { color: colors.textSecondary },
                      ]}>
                      {entry.text}
                    </Text>
                  </View>
                );
              })}

              {/* DELETE CONFIRMATION BAR */}
              {entryToDelete && (
                <View style={styles.deleteConfirmationBar}>
                  <Text
                    style={[
                      styles.deleteConfirmText,
                      { color: colors.textPrimary },
                    ]}>
                    Delete this entry?
                  </Text>
                  <View style={styles.deleteConfirmationButtons}>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        { backgroundColor: colors.bgInput },
                      ]}
                      onPress={cancelDelete}>
                      <Text
                        style={[
                          styles.confirmButtonText,
                          { color: colors.textPrimary },
                        ]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        { backgroundColor: '#EF4444' },
                      ]}
                      onPress={deleteEntry}>
                      <Text
                        style={[
                          styles.confirmButtonText,
                          { color: '#FFFFFF' },
                        ]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* ANIMATED WELLNESS TIP */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.borderPrimary,
            },
          ]}>
          <View style={styles.tipsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Wellness Tip
            </Text>
            <Text style={[styles.tipCounter, { color: colors.textTertiary }]}>
              {activeTipIndex + 1}/{wellnessTips.length}
            </Text>
          </View>

          <Animated.View style={[styles.tipContainer, tipAnimatedStyle]}>
            <Text style={[styles.tipEmoji, { fontSize: 24 }]}>
              {wellnessTips[activeTipIndex].emoji}
            </Text>
            <Text style={[styles.tipText, { color: colors.textPrimary }]}>
              {wellnessTips[activeTipIndex].text}
            </Text>
          </Animated.View>

          <View style={styles.tipsPagination}>
            {wellnessTips.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      activeTipIndex === index
                        ? '#EC4899'
                        : colors.borderPrimary,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Crisis Resources */}
        <TouchableOpacity
  style={[
    styles.card,
    {
      backgroundColor: showCrisisResources ? '#FEE2E2' : colors.bgCard,
      borderColor: showCrisisResources ? '#EF4444' : colors.borderPrimary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
  ]}
  onPress={() => setShowCrisisResources(!showCrisisResources)}>
  <View style={styles.crisisHeader}>
    <Ionicons
      name={showCrisisResources ? 'warning' : 'warning-outline'}
      size={20}
      color={showCrisisResources ? '#DC2626' : colors.accentPrimary}
    />
    <Text
      style={[
        styles.crisisTitle,
        { 
          color: showCrisisResources ? '#DC2626' : colors.textPrimary,
          fontWeight: '600',
          fontSize: 16,
          flex: 1,
          marginLeft: 8,
        }
      ]}>
      Pakistan Crisis Support
    </Text>
    <Ionicons
      name={showCrisisResources ? 'chevron-up' : 'chevron-down'}
      size={20}
      color={showCrisisResources ? '#DC2626' : colors.textSecondary}
    />
  </View>

  {showCrisisResources && (
    <View style={styles.resourcesContainer}>
      {crisisResources.map((resource, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.resourceItem,
            { 
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              padding: 12,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }
          ]}
          onPress={() => Linking.openURL(`tel:${resource.phone}`)}>
          <View style={styles.resourceInfo}>
            <Text
              style={[
                styles.resourceName,
                { 
                  color: '#1F2937',
                  fontWeight: '600',
                  fontSize: 15,
                  marginBottom: 4,
                }
              ]}>
              {resource.name}
            </Text>
            <Text
              style={[
                styles.resourcePhone,
                {
                  color: '#EF4444',
                  fontWeight: '700',
                  fontSize: 14,
                }
              ]}>
              📞 {resource.phone}
            </Text>
          </View>
          <Ionicons name="call-outline" size={22} color={colors.accentPrimary} />
        </TouchableOpacity>
      ))}
    </View>
  )}
</TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Chat Widget */}
      <ChatWidget
        agentName="Mind Harmony"
        agentId="mental"
        initialMessage="Hello! I'm here to listen and support you. How are you feeling today?"
        onSendMessage={handleChatResponse}
        color="#EC4899"
        settings={settings}
      />
    </View>
  );
};

// Keep your existing styles, but add these new ones:
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  characterCount: {
  fontSize: 12,
  marginTop: 4,
},
saveButtonText: {
  fontWeight: '600',
  fontSize: 16,
},
resourceInfo: {
  flex: 1,
},
resourcePhone: {
  fontWeight: '700',
  fontSize: 14,
},
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Enhanced Affirmation
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  affirmationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  affirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  affirmationCounter: {
    fontSize: 12,
  },
  affirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  affirmationEmoji: {
    fontSize: 28,
  },
  affirmationText: {
    fontSize: 16,
    fontStyle: 'italic',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },

  // Mood
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    width: (width - 80) / 5,
    minWidth: 60,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    textAlign: 'center',
  },

  // Enhanced Breathing
  patternSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  patternButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  patternName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  patternTiming: {
    fontSize: 10,
  },
  breathingContainer: {
    alignItems: 'center',
  },
  breathingTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 14,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  breathingCircleContainer: {
    marginVertical: 20,
    height: 100,
    justifyContent: 'center',
  },
  breathingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  breathingPhaseContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  breathingPhaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  breathingGuide: {
    fontSize: 14,
    color: '#666',
  },
  breathingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
    width: '100%',
  },
  breathingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Enhanced Tips
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipCounter: {
    fontSize: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  tipsPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Keep all your existing styles below...
  // ... rest of your styles remain the same
});
// ==================== SETTINGS PAGE ====================
const SettingsPage = ({ settings, onUpdateSettings, onLogout }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const colors = getThemeColors(localSettings.theme);

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    try {
      await supabaseManager.saveSettings(newSettings);
    } catch (error) {
      console.log('❌ Error saving settings:', error);
    }

    onUpdateSettings(newSettings);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabaseManager.signOut();
      onLogout();
    } catch (error) {
      console.error('❌ Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[stylesSettings.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={stylesSettings.header}>
        <Text style={[stylesSettings.title, { color: colors.textPrimary }]}>
          Settings
        </Text>
        <Text
          style={[stylesSettings.subtitle, { color: colors.textSecondary }]}>
          Manage your preferences
        </Text>
      </View>

      {/* ===== SIMPLIFIED: ONLY APPEARANCE ===== */}
      <View
        style={[
          stylesSettings.card,
          { backgroundColor: colors.bgCard, borderColor: colors.borderPrimary },
        ]}>
        <Text style={[stylesSettings.cardTitle, { color: colors.textPrimary }]}>
          Appearance
        </Text>

        <TouchableOpacity
          style={stylesSettings.settingItem}
          onPress={() =>
            handleSettingChange(
              'theme',
              localSettings.theme === 'light' ? 'dark' : 'light'
            )
          }>
          <View style={stylesSettings.settingInfo}>
            <Ionicons name="contrast" size={22} color={colors.accentPrimary} />
            <Text
              style={[
                stylesSettings.settingLabel,
                { color: colors.textPrimary },
              ]}>
              Theme
            </Text>
          </View>
          <View
            style={[
              stylesSettings.themeToggle,
              { backgroundColor: colors.bgInput },
            ]}>
            <Text
              style={[
                stylesSettings.themeText,
                {
                  color:
                    localSettings.theme === 'light'
                      ? colors.textPrimary
                      : colors.textTertiary,
                },
              ]}>
              Light
            </Text>
            <Text
              style={[
                stylesSettings.themeText,
                {
                  color:
                    localSettings.theme === 'dark'
                      ? colors.textPrimary
                      : colors.textTertiary,
                },
              ]}>
              Dark
            </Text>
            <View
              style={[
                stylesSettings.themeIndicator,
                {
                  backgroundColor: colors.accentPrimary,
                  left: localSettings.theme === 'light' ? 4 : '52%',
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

     

      {/* ===== DATA MANAGEMENT SECTION ===== */}
      <View
        style={[
          stylesSettings.card,
          { backgroundColor: colors.bgCard, borderColor: colors.borderPrimary },
        ]}>
        <Text style={[stylesSettings.cardTitle, { color: colors.textPrimary }]}>
          Data
        </Text>

        <View style={stylesSettings.settingItem}>
          <View style={stylesSettings.settingInfo}>
            <Ionicons name="save" size={22} color={colors.accentPrimary} />
            <Text
              style={[
                stylesSettings.settingLabel,
                { color: colors.textPrimary },
              ]}>
              Auto Save
            </Text>
          </View>
          <Switch
            value={localSettings.autoSave}
            onValueChange={(value) => handleSettingChange('autoSave', value)}
            trackColor={{
              false: colors.borderPrimary,
              true: colors.accentPrimary,
            }}
            thumbColor={colors.bgPrimary}
          />
        </View>
      </View>

      {/* ===== LOGOUT BUTTON ===== */}
      <TouchableOpacity
        style={[
          stylesSettings.logoutButton,
          {
            backgroundColor: colors.accentError + '20',
            borderColor: colors.accentError,
          },
        ]}
        onPress={handleLogout}
        disabled={isLoading}
        activeOpacity={0.7}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accentError} />
        ) : (
          <>
            <Ionicons name="log-out" size={20} color={colors.accentError} />
            <Text
              style={[
                stylesSettings.logoutButtonText,
                { color: colors.accentError },
              ]}>
              Logout
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const stylesSettings = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  themeToggle: {
    width: 120,
    height: 36,
    borderRadius: 18,
    padding: 4,
    flexDirection: 'row',
    position: 'relative',
  },
  themeText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 28,
  },
  themeIndicator: {
    position: 'absolute',
    width: 56,
    height: 28,
    borderRadius: 14,
    top: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// ==================== MAIN APP COMPONENT ====================
// ==================== MAIN APP COMPONENT ====================
export default function App() {
  const [currentSection, setCurrentSection] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Aura AI app...');
      setIsLoading(true);
      const result = await supabaseManager.initialize();

      if (result.success && result.user) {
        console.log(
          '✅ User authenticated:',
          result.user.id.substring(0, 8) + '...'
        );
        setIsAuthenticated(true);
        setCurrentSection('home');

        const settingsResult = await supabaseManager.getSettings();
        if (settingsResult.success && settingsResult.settings) {
          console.log('✅ Loaded user settings');
          setSettings(settingsResult.settings);
        }
      } else {
        console.log('ℹ️ No user session, showing login');
      }
    } catch (error) {
      console.error('❌ App initialization error:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ App initialization complete');
    }
  };

 // In App.js, modify the handleLogin function:
const handleLogin = (user = null, userProfile = null) => {
  console.log('✅ Login successful');
  
  // Set user ID in agent service
  if (supabaseManager.userId) {
    agentService.setUserId(supabaseManager.userId);
    
    // ✅ CRITICAL: Set user profile in agent service
    if (userProfile || supabaseManager.userProfile) {
      const userName = userProfile?.name || supabaseManager.userProfile?.name;
      if (userName) {
        agentService.setUserProfile(
          supabaseManager.userId, 
          userName, 
          userProfile || supabaseManager.userProfile
        );
        console.log(`👤 Username "${userName}" passed to agents`);
      }
    }
  }
  
  setIsAuthenticated(true);
  setCurrentSection('home');
};

  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    await supabaseManager.signOut();
    setIsAuthenticated(false);
    setCurrentSection('login');
  };

  const handleUpdateSettings = async (newSettings) => {
    setSettings(newSettings);
    await supabaseManager.saveSettings(newSettings);
  };

  const handleAgentSelect = (agentId) => {
    console.log(`🤖 Selected agent: ${agentId}`);
    setCurrentSection(agentId);
  };

  const handleNavigation = (section) => {
    console.log(`📍 Navigation: ${section}`);
    if (section === 'home' || section === 'agents' || section === 'settings') {
      setCurrentSection(section);
    } else {
      setCurrentSection(section);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View
          style={[
            stylesApp.loadingContainer,
            { backgroundColor: getThemeColors(settings.theme).bgPrimary },
          ]}>
          <ActivityIndicator
            size="large"
            color={getThemeColors(settings.theme).accentPrimary}
          />
          <Text
            style={[
              stylesApp.loadingText,
              { color: getThemeColors(settings.theme).textSecondary },
            ]}>
            Loading Aura AI...
          </Text>
        </View>
      );
    }

    const contentProps = {
      settings,
    };

    if (currentSection === 'home') {
      return (
        <Landing
          onSelectAgent={() => setCurrentSection('agents')}
          settings={settings}
        />
      );
    }

    if (currentSection === 'agents') {
      return (
        <AgentsHub onSelectAgent={handleAgentSelect} settings={settings} />
      );
    }

    if (currentSection === 'settings') {
      return (
        <SettingsPage
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onLogout={handleLogout}
        />
      );
    }

    switch (currentSection) {
      case 'general':
        return <GeneralChatAgentPage {...contentProps} />;
      case 'creative':
        return <CreativeAgentPage {...contentProps} />;
      case 'planner':
        return <PlannerAgentPage {...contentProps} />;
      case 'finance':
        return <FinanceAgentPage {...contentProps} />;
      case 'nutrition':
        return <NutritionAgentPage {...contentProps} />;
      case 'fitness':
        return <FitnessAgentPage {...contentProps} />;
      case 'mental':
        return <MentalWellnessAgentPage {...contentProps} />;
      default:
        return (
          <Landing
            onSelectAgent={() => setCurrentSection('agents')}
            settings={settings}
          />
        );
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle(
      settings.theme === 'light' ? 'dark-content' : 'light-content'
    );
    StatusBar.setBackgroundColor(
      settings.theme === 'light' ? '#F8FAFC' : '#0A0118'
    );
  }, [settings.theme]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} settings={settings} />;
  }

  const colors = getThemeColors(settings.theme);

  return (
    <SafeAreaView
      style={[stylesApp.container, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar
        barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.bgPrimary}
      />
      <View style={stylesApp.content}>{renderContent()}</View>
      <Navigation
        activeSection={
          currentSection === 'home'
            ? 'home'
            : currentSection === 'settings'
            ? 'settings'
            : [
                'general',
                'creative',
                'planner',
                'finance',
                'nutrition',
                'fitness',
                'mental',
              ].includes(currentSection)
            ? 'agents'
            : currentSection
        }
        onNavigate={handleNavigation}
        settings={settings}
      />
    </SafeAreaView>
  );
}

const stylesApp = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
// Add this to your App component or somewhere accessible:
const testUsernameFunctionality = () => {
  console.log('🧪 Testing username functionality...');
  
  // Check all agents
  Object.entries(agentService.agents).forEach(([id, agent]) => {
    console.log(`${id}:`, {
      hasUserId: !!agent.currentUserId,
      hasUserName: !!agent.currentUserName,
      userName: agent.currentUserName || 'Not set',
      userId: agent.currentUserId ? agent.currentUserId.substring(0, 8) + '...' : 'None'
    });
  });
  
  // Test a direct response
  const generalAgent = agentService.agents.general;
  if (generalAgent && generalAgent.currentUserName) {
    console.log(`🎯 Testing greeting for: ${generalAgent.currentUserName}`);
    generalAgent.getEnhancedResponse("Hello! How can I help you?")
      .then(response => {
        console.log('Personalized greeting:', response.substring(0, 50) + '...');
      });
  }
};" " 
"// v2 - favicon update" 
