import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClickSound } from '../utils/useClickSound';
import { useAuth } from '../contexts/AuthContext';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Prompt = {
  id: string;
  title: string;
  description: string;
  content: string;
  price: number;
  seller: string;
  sellerEmail?: string; // Seller's actual email
  category: string;
  language?: string;
  media?: string[]; // URLs for photos/videos
  paymentMethod?: 'conventional' | 'crypto'; // Payment method
  model?: string; // AI model (chatGPT, claude, gemini, etc.)
  ratings?: { userId: string; rating: number }[]; // Array of ratings
  averageRating?: number; // Calculated average rating
};

// SVG Icons
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ChatIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const MarketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const MarketIconSmall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Function to render markdown-like content
const renderMessageContent = (content: string) => {
  // Split by code blocks first
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(
        <span key={`text-${key++}`}>
          {renderTextWithHeadings(textBefore)}
        </span>
      );
    }

    // Add code block
    const language = match[1] || 'code';
    const code = match[2];
    parts.push(
      <div key={`code-${key++}`} className="my-2 bg-gray-100 border-2 border-black p-3 rounded overflow-x-auto">
        <div className="text-xs font-bold text-gray-600 mb-1">{language}</div>
        <pre className="text-sm font-mono text-black">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    parts.push(
      <span key={`text-${key++}`}>
        {renderTextWithHeadings(textAfter)}
      </span>
    );
  }

  return <div>{parts}</div>;
};

// Function to render text with headings
const renderTextWithHeadings = (text: string) => {
  const lines = text.split('\n');
  const parts: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line, idx) => {
    // Check for headings
    const h1Match = line.match(/^# (.+)$/);
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);

    if (h1Match) {
      parts.push(
        <h1 key={`h1-${key++}`} className="text-2xl font-black mt-4 mb-2">
          {renderInlineFormatting(h1Match[1])}
        </h1>
      );
    } else if (h2Match) {
      parts.push(
        <h2 key={`h2-${key++}`} className="text-xl font-black mt-3 mb-2">
          {renderInlineFormatting(h2Match[1])}
        </h2>
      );
    } else if (h3Match) {
      parts.push(
        <h3 key={`h3-${key++}`} className="text-lg font-black mt-2 mb-1">
          {renderInlineFormatting(h3Match[1])}
        </h3>
      );
    } else {
      // Regular line
      parts.push(
        <span key={`line-${key++}`} className="whitespace-pre-wrap">
          {renderInlineFormatting(line)}
          {idx < lines.length - 1 && '\n'}
        </span>
      );
    }
  });

  return parts;
};

// Function to render inline formatting (bold, italic, inline code)
const renderInlineFormatting = (text: string) => {
  const parts: (string | React.ReactElement)[] = [];
  let remaining = text;
  let key = 0;

  // Process all patterns: inline code, bold, italic
  const patterns = [
    { regex: /`([^`]+)`/, type: 'code' },
    { regex: /\*\*(.+?)\*\*/, type: 'bold' },
    { regex: /\*(.+?)\*/, type: 'italic' },
  ];

  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; content: string; type: string } | null = null;

    // Find the earliest match among all patterns
    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index !== undefined) {
        if (!earliestMatch || match.index < earliestMatch.index) {
          earliestMatch = {
            index: match.index,
            length: match[0].length,
            content: match[1],
            type: pattern.type,
          };
        }
      }
    }

    if (earliestMatch) {
      // Add text before the match
      if (earliestMatch.index > 0) {
        parts.push(remaining.substring(0, earliestMatch.index));
      }

      // Add the formatted element
      if (earliestMatch.type === 'code') {
        parts.push(
          <code key={`inline-${key++}`} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono border border-gray-300">
            {earliestMatch.content}
          </code>
        );
      } else if (earliestMatch.type === 'bold') {
        parts.push(<strong key={`bold-${key++}`}>{earliestMatch.content}</strong>);
      } else if (earliestMatch.type === 'italic') {
        parts.push(<em key={`italic-${key++}`}>{earliestMatch.content}</em>);
      }

      // Move to the rest of the string
      remaining = remaining.substring(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add the rest
      parts.push(remaining);
      break;
    }
  }

  return parts.length > 0 ? parts : text;
};

export default function DungeonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const playClick = useClickSound();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'market' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize market prompts from localStorage or default
  const getInitialMarketPrompts = (): Prompt[] => {
    const stored = localStorage.getItem('dungeonMarketPrompts');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      {
        id: '1',
        title: 'Code Optimizer Pro',
        description: 'Advanced prompt for optimizing code performance and reducing complexity',
        content: 'Analyze the following code and optimize it for performance, readability, and best practices...',
        price: 50,
        seller: 'CodeMaster',
        category: 'Development',
        language: 'plaintext',
        model: 'deepseek',
        ratings: [],
        averageRating: 0
      },
      {
        id: '2',
        title: 'Creative Writing Assistant',
        description: 'Generate engaging stories, articles, and creative content',
        content: 'Help me write a compelling and creative piece about...',
        price: 30,
        seller: 'WordSmith',
        category: 'Writing',
        language: 'plaintext',
        model: 'claude',
        ratings: [],
        averageRating: 0
      },
      {
        id: '3',
        title: 'Bug Detector 3000',
        description: 'Find and fix bugs in your code with detailed explanations',
        content: 'Review this code for potential bugs, security issues, and suggest fixes...',
        price: 75,
        seller: 'DebugNinja',
        category: 'Development',
        language: 'plaintext',
        model: 'perplexity',
        ratings: [],
        averageRating: 0
      },
      {
        id: '4',
        title: 'UI/UX Designer',
        description: 'Get design suggestions and improve user experience',
        content: 'Analyze this UI/UX design and provide suggestions for improvement...',
        price: 40,
        seller: 'DesignGuru',
        category: 'Design',
        language: 'plaintext',
        model: 'gemini',
        ratings: [],
        averageRating: 0
      },
      {
        id: '5',
        title: 'Data Analyzer',
        description: 'Analyze data patterns and generate insights',
        content: 'Analyze the following data and provide insights, patterns, and recommendations...',
        price: 60,
        seller: 'DataWizard',
        category: 'Analytics',
        language: 'plaintext',
        model: 'chatGPT',
        ratings: [],
        averageRating: 0
      },
      {
        id: '6',
        title: 'Learning Tutor',
        description: 'Explain complex concepts in simple terms',
        content: 'Explain the following concept in simple terms with examples...',
        price: 35,
        seller: 'TeachMaster',
        category: 'Education',
        language: 'plaintext',
        model: 'claude',
        ratings: [],
        averageRating: 0
      },
      {
        id: '7',
        title: 'JSON API Schema Generator',
        description: 'Generate well-structured JSON schemas for APIs and data models',
        content: `{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "required": ["id", "name", "email"],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "Unique user identifier"
        },
        "name": {
          "type": "string",
          "minLength": 2,
          "maxLength": 100,
          "description": "User's full name"
        },
        "email": {
          "type": "string",
          "format": "email",
          "description": "User's email address"
        },
        "age": {
          "type": "integer",
          "minimum": 0,
          "maximum": 150,
          "description": "User's age"
        },
        "roles": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["admin", "user", "moderator"]
          },
          "description": "User roles"
        }
      }
    }
  }
}`,
        price: 45,
        seller: 'APIArchitect',
        category: 'Development',
        language: 'json',
        model: 'chatGPT',
        ratings: [],
        averageRating: 0
      },
      {
        id: '8',
        title: 'XML Document Builder',
        description: 'Create structured XML documents with proper namespaces and validation',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <book id="bk101" category="technology">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price currency="USD">44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>
      An in-depth look at creating applications with XML.
    </description>
    <metadata>
      <pages>352</pages>
      <language>en-US</language>
      <isbn>978-0-123456-78-9</isbn>
    </metadata>
  </book>
  <book id="bk102" category="fiction">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price currency="USD">5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>
      A former architect battles corporate zombies.
    </description>
    <metadata>
      <pages>256</pages>
      <language>en-US</language>
      <isbn>978-0-987654-32-1</isbn>
    </metadata>
  </book>
</catalog>`,
        price: 40,
        seller: 'XMLExpert',
        category: 'Development',
        language: 'xml',
        model: 'claude',
        ratings: [],
        averageRating: 0
      },
      {
        id: '9',
        title: 'YAML Config Master',
        description: 'Design clean and maintainable YAML configuration files',
        content: `# Application Configuration
server:
  host: localhost
  port: 8080
  environment: production
  
  # SSL Configuration
  ssl:
    enabled: true
    certificate: /path/to/cert.pem
    key: /path/to/key.pem
    port: 443

database:
  primary:
    host: db.example.com
    port: 5432
    name: main_db
    username: admin
    password: \${DB_PASSWORD}
    pool_size: 20
    
  replica:
    host: db-replica.example.com
    port: 5432
    name: main_db
    username: readonly
    password: \${DB_REPLICA_PASSWORD}
    pool_size: 10

# Cache Configuration
cache:
  redis:
    host: redis.example.com
    port: 6379
    database: 0
    ttl: 3600
    max_connections: 50

# Logging
logging:
  level: info
  format: json
  outputs:
    - type: console
    - type: file
      path: /var/log/app.log
      max_size: 100MB
      max_backups: 10`,
        price: 35,
        seller: 'ConfigPro',
        category: 'Development',
        language: 'yaml',
        model: 'grok',
        ratings: [],
        averageRating: 0
      }
    ];
  };

  // Initialize purchased prompts from localStorage
  const getInitialPurchasedPrompts = (): Prompt[] => {
    const stored = localStorage.getItem('dungeonPurchasedPrompts');
    return stored ? JSON.parse(stored) : [];
  };

  // Market state
  const [marketPrompts, setMarketPrompts] = useState<Prompt[]>(getInitialMarketPrompts);
  
  const [sellPromptTitle, setSellPromptTitle] = useState('');
  const [sellPromptDescription, setSellPromptDescription] = useState('');
  const [sellPromptContent, setSellPromptContent] = useState('');
  const [sellPromptPrice, setSellPromptPrice] = useState('');
  const [sellPromptCategory, setSellPromptCategory] = useState('');
  const [sellPromptLanguage, setSellPromptLanguage] = useState('plaintext');
  const [sellPromptPaymentMethod, setSellPromptPaymentMethod] = useState<'conventional' | 'crypto'>('conventional');
  const [sellPromptModel, setSellPromptModel] = useState('chatGPT');
  const [sellPromptMedia, setSellPromptMedia] = useState<string[]>([]);
  const [showSellForm, setShowSellForm] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [marketView, setMarketView] = useState<'browse' | 'yours'>('browse');
  const [purchasedPrompts, setPurchasedPrompts] = useState<Prompt[]>(getInitialPurchasedPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showConfirmBuy, setShowConfirmBuy] = useState<Prompt | null>(null);
  const [showContactDialog, setShowContactDialog] = useState<Prompt | null>(null);
  
  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');

  // Save to localStorage whenever marketPrompts changes
  useEffect(() => {
    localStorage.setItem('dungeonMarketPrompts', JSON.stringify(marketPrompts));
  }, [marketPrompts]);

  // Save to localStorage whenever purchasedPrompts changes
  useEffect(() => {
    localStorage.setItem('dungeonPurchasedPrompts', JSON.stringify(purchasedPrompts));
  }, [purchasedPrompts]);

  // Load forked prompt directly into input if available
  useEffect(() => {
    const state = location.state as { forkedPrompt?: string } | null;
    if (state?.forkedPrompt) {
      setInputMessage(state.forkedPrompt);
      setActiveTab('chat'); // Automatically select chat tab
      // Clear the state to prevent reloading on navigation
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter prompts
  const getFilteredPrompts = () => {
    return marketPrompts.filter(prompt => {
      const categoryMatch = filterCategory === 'all' || prompt.category === filterCategory;
      const languageMatch = filterLanguage === 'all' || (prompt.language || 'plaintext') === filterLanguage;
      const paymentMatch = filterPayment === 'all' || (prompt.paymentMethod || 'conventional') === filterPayment;
      const modelMatch = filterModel === 'all' || (prompt.model || 'chatGPT') === filterModel;
      return categoryMatch && languageMatch && paymentMatch && modelMatch;
    });
  };

  const handleBuyPrompt = (prompt: Prompt) => {
    playClick();
    setShowConfirmBuy(prompt);
  };

  const confirmPurchase = () => {
    if (showConfirmBuy) {
      // Add to purchased prompts
      setPurchasedPrompts([...purchasedPrompts, showConfirmBuy]);
      // Show the prompt details
      setSelectedPrompt(showConfirmBuy);
      setShowConfirmBuy(null);
    }
  };

  const handleSellPrompt = () => {
    if (!sellPromptTitle || !sellPromptDescription || !sellPromptContent || !sellPromptPrice || !sellPromptCategory) {
      alert('Please fill in all fields');
      return;
    }

    playClick();
    
    if (editingPromptId) {
      // Update existing prompt
      const updatedPrompts = marketPrompts.map(p => 
        p.id === editingPromptId
          ? {
              ...p,
              title: sellPromptTitle,
              description: sellPromptDescription,
              content: sellPromptContent,
              price: parseInt(sellPromptPrice),
              category: sellPromptCategory,
              language: sellPromptLanguage,
              paymentMethod: sellPromptPaymentMethod,
              model: sellPromptModel,
              sellerEmail: user?.email || p.sellerEmail,
              media: sellPromptMedia.length > 0 ? sellPromptMedia : undefined
            }
          : p
      );
      setMarketPrompts(updatedPrompts);
      alert(`Successfully updated "${sellPromptTitle}"!`);
      setEditingPromptId(null);
    } else {
      // Create new prompt
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        title: sellPromptTitle,
        description: sellPromptDescription,
        content: sellPromptContent,
        price: parseInt(sellPromptPrice),
        seller: user?.name || 'Anonymous',
        sellerEmail: user?.email,
        category: sellPromptCategory,
        language: sellPromptLanguage,
        paymentMethod: sellPromptPaymentMethod,
        model: sellPromptModel,
        media: sellPromptMedia.length > 0 ? sellPromptMedia : undefined,
        ratings: [],
        averageRating: 0
      };
      setMarketPrompts([newPrompt, ...marketPrompts]);
      alert(`Successfully listed "${newPrompt.title}" for $${newPrompt.price}!`);
    }
    
    // Reset form
    setSellPromptTitle('');
    setSellPromptDescription('');
    setSellPromptContent('');
    setSellPromptPrice('');
    setSellPromptCategory('');
    setSellPromptLanguage('plaintext');
    setSellPromptPaymentMethod('conventional');
    setSellPromptModel('chatGPT');
    setSellPromptMedia([]);
    setShowSellForm(false);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    playClick();
    setSellPromptTitle(prompt.title);
    setSellPromptDescription(prompt.description);
    setSellPromptContent(prompt.content);
    setSellPromptPrice(prompt.price.toString());
    setSellPromptCategory(prompt.category);
    setSellPromptLanguage(prompt.language || 'plaintext');
    setSellPromptPaymentMethod(prompt.paymentMethod || 'conventional');
    setSellPromptModel(prompt.model || 'chatGPT');
    setSellPromptMedia(prompt.media || []);
    setEditingPromptId(prompt.id);
    setShowSellForm(true);
  };

  const handleDelistPrompt = (promptId: string) => {
    playClick();
    if (confirm('Are you sure you want to delist this prompt?')) {
      setMarketPrompts(marketPrompts.filter(p => p.id !== promptId));
      alert('Prompt delisted successfully!');
    }
  };

  const handleRatePrompt = (promptId: string, rating: number) => {
    playClick();
    if (!user) return;

    // Update the market prompts with the new rating
    const updatedMarketPrompts = marketPrompts.map(prompt => {
      if (prompt.id === promptId) {
        const existingRatings = prompt.ratings || [];
        // Check if user already rated
        const userRatingIndex = existingRatings.findIndex(r => r.userId === user.email);
        
        let newRatings;
        if (userRatingIndex !== -1) {
          // Update existing rating
          newRatings = [...existingRatings];
          newRatings[userRatingIndex] = { userId: user.email!, rating };
        } else {
          // Add new rating
          newRatings = [...existingRatings, { userId: user.email!, rating }];
        }
        
        // Calculate average
        const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        
        return {
          ...prompt,
          ratings: newRatings,
          averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
        };
      }
      return prompt;
    });

    setMarketPrompts(updatedMarketPrompts);
    
    // Also update purchased prompts if it's there
    const updatedPurchasedPrompts = purchasedPrompts.map(prompt => {
      if (prompt.id === promptId) {
        const existingRatings = prompt.ratings || [];
        const userRatingIndex = existingRatings.findIndex(r => r.userId === user.email);
        
        let newRatings;
        if (userRatingIndex !== -1) {
          newRatings = [...existingRatings];
          newRatings[userRatingIndex] = { userId: user.email!, rating };
        } else {
          newRatings = [...existingRatings, { userId: user.email!, rating }];
        }
        
        const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        
        return {
          ...prompt,
          ratings: newRatings,
          averageRating: Math.round(averageRating * 10) / 10
        };
      }
      return prompt;
    });

    setPurchasedPrompts(updatedPurchasedPrompts);
    alert('Rating submitted successfully!');
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      
      // Convert files to base64 data URLs for persistence
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setSellPromptMedia(prev => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = sellPromptMedia.filter((_, i) => i !== index);
    setSellPromptMedia(newMedia);
  };

  // Load forked prompt directly into input if available
  useEffect(() => {
    const state = location.state as { forkedPrompt?: string } | null;
    if (state?.forkedPrompt) {
      setInputMessage(state.forkedPrompt);
      // Clear the state to prevent reloading on navigation
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    playClick();
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Xeltra Dungeon',
        },
        body: JSON.stringify({
          model: 'z-ai/glm-4.5-air:free',
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'No response',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const Card = ({ mode, title, description, icon, onSelect }: { mode: 'chat' | 'market', title: string, description: string, icon: React.ReactNode, onSelect: () => void }) => (
    <motion.div
      layoutId={mode}
      onClick={onSelect}
      className="w-full md:w-96 h-80 p-8 bg-white border-4 border-black shadow-brutal cursor-pointer flex flex-col justify-between"
      whileHover={{ scale: 1.03, boxShadow: '10px 10px 0px #000000' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div>
        <div className="text-primary mb-4">{icon}</div>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-black/80">{description}</p>
      </div>
      <p className="font-bold text-right">Enter &rarr;</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-black mb-6 border-b-2 border-primary pb-2">Dungeon</h1>
      <div className="relative" style={{ minHeight: '600px' }}>
        <AnimatePresence>
          {!activeTab ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col md:flex-row gap-8 justify-center items-center"
            >
              <Card mode="chat" title="Chat" description="Talk with AI assistant. Get help, ask questions, and explore ideas in real-time conversation." icon={<ChatIcon />} onSelect={() => { playClick(); setActiveTab('chat'); }} />
              <Card mode="market" title="Market" description="Buy and sell prompts. Discover quality prompts from the community or monetize your own creations." icon={<MarketIcon />} onSelect={() => { playClick(); setActiveTab('market'); }} />
            </motion.div>
          ) : (
            <motion.div
              key="mode"
              layoutId={activeTab}
              className="bg-white p-6 md:p-8 border-4 border-black shadow-brutal"
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <motion.button 
                  onClick={() => { playClick(); setActiveTab(null); }}
                  className="px-4 py-2 border-2 border-black font-bold bg-white text-black hover:bg-primary hover:text-white hover:shadow-brutal mb-6 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <BackIcon /> Back to Modes
                </motion.button>

                {activeTab === 'chat' ? (
                  /* Chat Mode */
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-2xl font-bold">AI Chat</h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          playClick();
                          setMessages([]);
                        }}
                        className="px-4 py-2 border-2 border-black font-bold bg-white text-black hover:bg-red-500 hover:text-white hover:shadow-brutal transition-all"
                      >
                        CLEAR CHAT
                      </motion.button>
                    </div>
                    <div className="bg-gray-50 border-4 border-black overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 && (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <p className="text-gray-400 font-black text-lg">NO MESSAGES</p>
                              <p className="text-sm text-gray-500 font-bold mt-2">Start typing below</p>
                            </div>
                          </div>
                        )}

                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-4 border-2 border-black ${
                                message.role === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-black'
                              }`}
                            >
                              <div className="font-bold">
                                {renderMessageContent(message.content)}
                              </div>
                              <p className="text-xs mt-2 opacity-60">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}

                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-start"
                          >
                            <div className="max-w-[70%] p-4 border-2 border-black bg-white">
                              <div className="flex gap-2">
                                <motion.div
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                  className="w-3 h-3 bg-black rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                  className="w-3 h-3 bg-black rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                  className="w-3 h-3 bg-black rounded-full"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="flex-shrink-0 p-4 border-t-4 border-black bg-white">
                        <div className="flex gap-3">
                          <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="TYPE YOUR MESSAGE..."
                            disabled={isLoading}
                            rows={2}
                            className="flex-1 px-4 py-3 border-2 border-black font-bold text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-200 resize-none"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            className="px-8 py-3 border-2 border-black font-bold bg-primary text-white hover:bg-black hover:shadow-brutal transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
                          >
                            SEND
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Market Mode */
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <h2 className="text-xl sm:text-2xl font-bold">Prompt Market</h2>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              playClick();
                              setMarketView('browse');
                              setSelectedPrompt(null);
                            }}
                            className={`px-3 py-2 sm:px-4 sm:py-2 border-2 border-black font-bold transition-all text-sm sm:text-base ${
                              marketView === 'browse'
                                ? 'bg-primary text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                          >
                            BROWSE
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              playClick();
                              setMarketView('yours');
                              setSelectedPrompt(null);
                            }}
                            className={`px-3 py-2 sm:px-4 sm:py-2 border-2 border-black font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                              marketView === 'yours'
                                ? 'bg-primary text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                          >
                            <span className="hidden sm:inline">YOUR PROMPTS ({purchasedPrompts.length})</span>
                            <span className="sm:hidden">YOURS ({purchasedPrompts.length})</span>
                          </motion.button>
                        </div>
                      </div>
                      {marketView === 'browse' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            playClick();
                            setShowSellForm(!showSellForm);
                          }}
                          className="px-4 py-2 md:px-6 md:py-2 border-2 border-black font-bold bg-white text-black hover:bg-green-500 hover:text-white hover:shadow-brutal transition-all text-sm md:text-base whitespace-nowrap"
                        >
                          {showSellForm ? 'CANCEL' : '+ SELL PROMPT'}
                        </motion.button>
                      )}
                    </div>

                    {/* Filter Section */}
                    {marketView === 'browse' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 sm:p-4 bg-white border-2 border-black"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          <span className="font-bold text-xs sm:text-sm">FILTERS:</span>
                          
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {/* Category Filter */}
                            <select
                              value={filterCategory}
                              onChange={(e) => setFilterCategory(e.target.value)}
                              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border-2 border-black font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="all">All Categories</option>
                              <option value="Development">Development</option>
                              <option value="Writing">Writing</option>
                              <option value="Design">Design</option>
                              <option value="Analytics">Analytics</option>
                              <option value="Education">Education</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Business">Business</option>
                              <option value="Other">Other</option>
                            </select>

                            {/* Language Filter */}
                            <select
                              value={filterLanguage}
                              onChange={(e) => setFilterLanguage(e.target.value)}
                              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border-2 border-black font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="all">All Languages</option>
                              <option value="plaintext">Plain Text</option>
                              <option value="json">JSON</option>
                              <option value="xml">XML</option>
                              <option value="yaml">YAML</option>
                            </select>

                            {/* Payment Filter */}
                            <select
                              value={filterPayment}
                              onChange={(e) => setFilterPayment(e.target.value)}
                              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border-2 border-black font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="all">All Payments</option>
                              <option value="conventional">Conventional ($)</option>
                              <option value="crypto">USDT (Crypto)</option>
                            </select>

                            {/* AI Model Filter */}
                            <select
                              value={filterModel}
                              onChange={(e) => setFilterModel(e.target.value)}
                              className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border-2 border-black font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="all">All Models</option>
                              <option value="chatGPT">ChatGPT</option>
                              <option value="claude">Claude</option>
                              <option value="gemini">Gemini</option>
                              <option value="grok">Grok</option>
                              <option value="deepseek">DeepSeek</option>
                              <option value="perplexity">Perplexity</option>
                            </select>

                            {/* Reset Filters */}
                            {(filterCategory !== 'all' || filterLanguage !== 'all' || filterPayment !== 'all' || filterModel !== 'all') && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setFilterCategory('all');
                                  setFilterLanguage('all');
                                  setFilterPayment('all');
                                  setFilterModel('all');
                                  playClick();
                                }}
                                className="px-3 py-2 border-2 border-black font-bold text-xs sm:text-sm bg-red-500 text-white hover:bg-black transition-all whitespace-nowrap"
                              >
                                RESET
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Confirmation Dialog */}
                    {showConfirmBuy && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowConfirmBuy(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white p-8 border-4 border-black shadow-brutal max-w-md mx-4"
                        >
                          <h3 className="text-2xl font-bold mb-4">Confirm Purchase</h3>
                          <p className="mb-2"><strong>Title:</strong> {showConfirmBuy.title}</p>
                          <p className="mb-2"><strong>Price:</strong> ${showConfirmBuy.price}</p>
                          <p className="mb-6 text-sm text-gray-600">{showConfirmBuy.description}</p>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={confirmPurchase}
                              className="flex-1 py-3 border-2 border-black font-bold bg-primary text-white hover:bg-black hover:shadow-brutal transition-all"
                            >
                              CONFIRM
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowConfirmBuy(null)}
                              className="flex-1 py-3 border-2 border-black font-bold bg-white text-black hover:bg-gray-100 transition-all"
                            >
                              CANCEL
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Contact Dialog */}
                    {showContactDialog && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowContactDialog(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white p-6 sm:p-8 border-4 border-black shadow-brutal max-w-md mx-4 w-full"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold">Contact Seller</h3>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowContactDialog(null)}
                              className="text-2xl font-bold"
                            >
                              ×
                            </motion.button>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                            <div className="p-4 bg-gray-50 border-2 border-black">
                              <p className="text-sm font-bold text-gray-500 mb-1">PROMPT</p>
                              <p className="font-bold text-lg">{showContactDialog.title}</p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 border-2 border-black">
                              <p className="text-sm font-bold text-gray-500 mb-1">SELLER</p>
                              <p className="font-bold text-lg">{showContactDialog.seller}</p>
                            </div>
                            
                            <div className="p-4 bg-blue-50 border-2 border-black">
                              <p className="text-sm font-bold text-gray-500 mb-2">CONTACT INFO</p>
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                </svg>
                                <span className="text-sm font-bold break-all">
                                  {showContactDialog.sellerEmail || `${showContactDialog.seller.toLowerCase().replace(/\s+/g, '')}@example.com`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const email = showContactDialog.sellerEmail || `${showContactDialog.seller.toLowerCase().replace(/\s+/g, '')}@example.com`;
                              navigator.clipboard.writeText(email);
                              playClick();
                              alert('Email copied to clipboard!');
                            }}
                            className="w-full py-3 border-2 border-black font-bold bg-blue-800 text-white hover:bg-black hover:shadow-brutal transition-all text-sm sm:text-base"
                          >
                            COPY EMAIL
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Sell Form */}
                    {marketView === 'browse' && showSellForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-6 bg-yellow-50 border-4 border-black"
                      >
                        <h3 className="text-xl font-bold mb-4">LIST YOUR PROMPT</h3>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Prompt Title"
                            value={sellPromptTitle}
                            onChange={(e) => setSellPromptTitle(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          
                          {/* Category Dropdown */}
                          <div>
                            <label className="block text-sm font-bold mb-2">Category</label>
                            <select
                              value={sellPromptCategory}
                              onChange={(e) => {
                                const category = e.target.value;
                                setSellPromptCategory(category);
                                // Automatically set payment to crypto for injection category
                                if (category === 'Injection') {
                                  setSellPromptPaymentMethod('crypto');
                                }
                              }}
                              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="">Select Category</option>
                              <option value="Development">Development</option>
                              <option value="Writing">Writing</option>
                              <option value="Design">Design</option>
                              <option value="Analytics">Analytics</option>
                              <option value="Education">Education</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Business">Business</option>
                              <option value="Injection">Injection</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          
                          <textarea
                            placeholder="Description"
                            value={sellPromptDescription}
                            onChange={(e) => setSellPromptDescription(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                          <textarea
                            placeholder="Prompt Content (This is what buyers will get)"
                            value={sellPromptContent}
                            onChange={(e) => setSellPromptContent(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                          
                          {/* Language Dropdown */}
                          <div>
                            <label className="block text-sm font-bold mb-2">Prompt Language</label>
                            <select
                              value={sellPromptLanguage}
                              onChange={(e) => setSellPromptLanguage(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="plaintext">Plain Text</option>
                              <option value="json">JSON</option>
                              <option value="xml">XML</option>
                              <option value="yaml">YAML</option>
                            </select>
                          </div>

                          {/* AI Model Dropdown */}
                          <div>
                            <label className="block text-sm font-bold mb-2">AI Model</label>
                            <select
                              value={sellPromptModel}
                              onChange={(e) => setSellPromptModel(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                              <option value="chatGPT">ChatGPT</option>
                              <option value="claude">Claude</option>
                              <option value="gemini">Gemini</option>
                              <option value="grok">Grok</option>
                              <option value="deepseek">DeepSeek</option>
                              <option value="perplexity">Perplexity</option>
                            </select>
                          </div>

                          {/* Payment Method Dropdown */}
                          <div>
                            <label className="block text-sm font-bold mb-2">
                              Payment Method
                              {sellPromptCategory === 'Injection' && (
                                <span className="ml-2 text-xs text-red-600">(Crypto only for Injection)</span>
                              )}
                            </label>
                            <select
                              value={sellPromptPaymentMethod}
                              onChange={(e) => setSellPromptPaymentMethod(e.target.value as 'conventional' | 'crypto')}
                              disabled={sellPromptCategory === 'Injection'}
                              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="conventional">Conventional ($)</option>
                              <option value="crypto">USDT (Crypto)</option>
                            </select>
                          </div>

                          {/* Media Upload */}
                          <div>
                            <label className="block text-sm font-bold mb-2">Upload Photos/Videos (Optional)</label>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={handleMediaUpload}
                              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white file:mr-4 file:py-2 file:px-4 file:border-0 file:font-bold file:bg-primary file:text-white file:cursor-pointer hover:file:bg-black"
                            />
                            {sellPromptMedia.length > 0 && (
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                {sellPromptMedia.map((url, index) => (
                                  <div key={index} className="relative border-2 border-black">
                                    <img 
                                      src={url} 
                                      alt={`Upload ${index + 1}`} 
                                      className="w-full h-24 object-cover"
                                    />
                                    <button
                                      onClick={() => removeMedia(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white font-bold px-2 py-1 text-xs border border-black hover:bg-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <input
                            type="number"
                            placeholder="Price (in $)"
                            value={sellPromptPrice}
                            onChange={(e) => setSellPromptPrice(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSellPrompt}
                            className="w-full py-3 border-2 border-black font-bold bg-green-500 text-white hover:bg-black hover:shadow-brutal transition-all"
                          >
                            {editingPromptId ? 'UPDATE PROMPT' : 'LIST PROMPT FOR SALE'}
                          </motion.button>
                          {editingPromptId && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setEditingPromptId(null);
                                setSellPromptTitle('');
                                setSellPromptDescription('');
                                setSellPromptContent('');
                                setSellPromptPrice('');
                                setSellPromptCategory('');
                                setSellPromptLanguage('plaintext');
                                setSellPromptPaymentMethod('conventional');
                                setSellPromptMedia([]);
                                setShowSellForm(false);
                              }}
                              className="w-full py-3 border-2 border-black font-bold bg-gray-300 text-black hover:bg-gray-400 transition-all"
                            >
                              CANCEL EDIT
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Market Items Grid - Browse View */}
                    {marketView === 'browse' && (
                      <div>
                        {getFilteredPrompts().length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-xl font-bold text-gray-400">No prompts found</p>
                            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getFilteredPrompts().map((prompt) => {
                              const isOwned = purchasedPrompts.some(p => p.id === prompt.id);
                              return (
                                <motion.div
                                  key={prompt.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02, y: -5 }}
                                  className="bg-white border-2 border-black p-5 relative"
                                >
                                  {/* Contact Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      playClick();
                                      setShowContactDialog(prompt);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-blue-500 text-white border-2 border-black hover:bg-black transition-all z-10"
                                    title="Contact Seller"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                  </motion.button>
                                  
                              {/* Media Preview */}
                              {prompt.media && prompt.media.length > 0 && (
                                <div className="mb-3 border-2 border-black">
                                  <img 
                                    src={prompt.media[0]} 
                                    alt={prompt.title}
                                    className="w-full h-32 object-cover"
                                  />
                                  {prompt.media.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold">
                                      +{prompt.media.length - 1}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-block px-3 py-1 bg-primary text-white border-2 border-black text-xs font-bold">
                                    {prompt.category}
                                  </span>
                                  {prompt.language && (
                                    <span className="inline-block px-2 py-1 bg-gray-200 border border-black text-xs font-bold">
                                      {prompt.language.toUpperCase()}
                                    </span>
                                  )}
                                  {prompt.model && (
                                    <span className="inline-block px-2 py-1 bg-blue-500 text-white border border-black text-xs font-bold">
                                      {prompt.model}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{prompt.title}</h3>
                                <p className="text-sm font-bold text-gray-700 mb-3">
                                  {prompt.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-500">
                                    by {prompt.seller}
                                  </p>
                                  {prompt.averageRating !== undefined && prompt.averageRating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-yellow-500">★</span>
                                      <span className="text-xs font-bold">{prompt.averageRating.toFixed(1)}</span>
                                      <span className="text-xs text-gray-500">({prompt.ratings?.length || 0})</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t-2 border-black">
                                <div>
                                  <span className="text-2xl font-bold text-primary">
                                    ${prompt.price}
                                  </span>
                                  {prompt.paymentMethod === 'crypto' && (
                                    <span className="ml-2 text-xs font-bold bg-yellow-400 text-black px-2 py-1 border border-black">
                                      USDT
                                    </span>
                                  )}
                                </div>
                                {prompt.seller === user?.name ? (
                                  // User's own prompt - show Edit/Delist
                                  <div className="flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleEditPrompt(prompt)}
                                      className="px-4 py-2 border-2 border-black font-bold bg-blue-800 text-white hover:bg-black hover:shadow-brutal transition-all text-sm"
                                    >
                                      EDIT
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleDelistPrompt(prompt.id)}
                                      className="px-4 py-2 border-2 border-black font-bold bg-red-800 text-white hover:bg-black hover:shadow-brutal transition-all text-sm"
                                    >
                                      DELIST
                                    </motion.button>
                                  </div>
                                ) : isOwned ? (
                                  <div className="px-5 py-2 border-2 border-black font-bold bg-green-800 text-white">
                                    OWNED
                                  </div>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBuyPrompt(prompt)}
                                    className="px-5 py-2 border-2 border-black font-bold bg-primary text-white hover:bg-black hover:shadow-brutal transition-all"
                                  >
                                    BUY
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Your Prompts View */}
                    {marketView === 'yours' && (
                      <div>
                        {purchasedPrompts.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-xl font-bold text-gray-400">No prompts purchased yet</p>
                            <p className="text-sm text-gray-500 mt-2">Browse the market to buy some!</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchasedPrompts.map((prompt) => (
                              <motion.div
                                key={prompt.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                onClick={() => setSelectedPrompt(prompt)}
                                className="bg-white border-2 border-black p-5 cursor-pointer relative"
                              >
                                {/* Contact Button */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playClick();
                                    setShowContactDialog(prompt);
                                  }}
                                  className="absolute top-2 right-2 p-2 bg-blue-500 text-white border-2 border-black hover:bg-black transition-all z-10"
                                  title="Contact Seller"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                  </svg>
                                </motion.button>
                                
                                {/* Media Preview */}
                                {prompt.media && prompt.media.length > 0 && (
                                  <div className="mb-3 border-2 border-black">
                                    <img 
                                      src={prompt.media[0]} 
                                      alt={prompt.title}
                                      className="w-full h-32 object-cover"
                                    />
                                    {prompt.media.length > 1 && (
                                      <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold">
                                        +{prompt.media.length - 1}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 border border-black">
                                      {prompt.category}
                                    </span>
                                    {prompt.language && (
                                      <span className="text-xs font-bold bg-gray-200 border border-black px-2 py-1">
                                        {prompt.language.toUpperCase()}
                                      </span>
                                    )}
                                    {prompt.model && (
                                      <span className="text-xs font-bold bg-blue-500 text-white border border-black px-2 py-1">
                                        {prompt.model}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold text-gray-500">OWNED</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{prompt.title}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {prompt.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-gray-500">
                                    by {prompt.seller}
                                  </p>
                                  {prompt.averageRating !== undefined && prompt.averageRating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-yellow-500">★</span>
                                      <span className="text-xs font-bold">{prompt.averageRating.toFixed(1)}</span>
                                      <span className="text-xs text-gray-500">({prompt.ratings?.length || 0})</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prompt Preview Window */}
                    {selectedPrompt && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedPrompt(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white border-4 border-black shadow-brutal max-w-3xl w-full max-h-[80vh] flex flex-col"
                        >
                          <div className="p-6 border-b-4 border-black">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{selectedPrompt.title}</h2>
                                <p className="text-sm text-gray-600">{selectedPrompt.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 border border-black">
                                    {selectedPrompt.category}
                                  </span>
                                  {selectedPrompt.language && (
                                    <span className="text-xs font-bold bg-gray-200 border border-black px-2 py-1">
                                      {selectedPrompt.language.toUpperCase()}
                                    </span>
                                  )}
                                  {selectedPrompt.model && (
                                    <span className="text-xs font-bold bg-blue-500 text-white border border-black px-2 py-1">
                                      {selectedPrompt.model}
                                    </span>
                                  )}
                                  <span className="text-xs font-bold text-gray-500">
                                    by {selectedPrompt.seller}
                                  </span>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedPrompt(null)}
                                className="text-2xl font-bold"
                              >
                                ×
                              </motion.button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-6">
                            {/* Media Gallery */}
                            {selectedPrompt.media && selectedPrompt.media.length > 0 && (
                              <div className="mb-4">
                                <h3 className="text-sm font-bold mb-2">Media</h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedPrompt.media.map((url, index) => (
                                    <div key={index} className="border-2 border-black">
                                      <img 
                                        src={url} 
                                        alt={`Media ${index + 1}`}
                                        className="w-full h-32 object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Prompt Content */}
                            <div>
                              <h3 className="text-sm font-bold mb-2">Prompt Content</h3>
                              <div className="bg-black border-2 border-white p-4 font-mono text-sm whitespace-pre-wrap text-gray-100">
                                {selectedPrompt.content}
                              </div>
                            </div>
                          </div>
                          <div className="p-6 border-t-4 border-black space-y-3">
                            {/* Rating Section */}
                            {purchasedPrompts.some(p => p.id === selectedPrompt.id) && (
                              <div className="mb-4">
                                <p className="text-sm font-bold mb-2">Rate this prompt:</p>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                      key={star}
                                      whileHover={{ scale: 1.2 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRatePrompt(selectedPrompt.id, star)}
                                      className="text-3xl focus:outline-none"
                                    >
                                      <span className={
                                        selectedPrompt.ratings?.find(r => r.userId === user?.email)?.rating >= star ||
                                        (selectedPrompt.averageRating && selectedPrompt.averageRating >= star)
                                          ? "text-yellow-500"
                                          : "text-gray-300"
                                      }>
                                        ★
                                      </span>
                                    </motion.button>
                                  ))}
                                  {selectedPrompt.averageRating !== undefined && selectedPrompt.averageRating > 0 && (
                                    <span className="ml-2 text-sm font-bold text-gray-600">
                                      {selectedPrompt.averageRating.toFixed(1)} ({selectedPrompt.ratings?.length || 0} ratings)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                navigator.clipboard.writeText(selectedPrompt.content);
                                playClick();
                                alert('Prompt copied to clipboard!');
                              }}
                              className="w-full py-3 border-2 border-black font-bold bg-blue-800 text-white hover:bg-black hover:shadow-brutal transition-all"
                            >
                              COPY TO CLIPBOARD
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
