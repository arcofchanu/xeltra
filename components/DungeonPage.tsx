import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClickSound } from '../utils/useClickSound';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="h-screen flex flex-col bg-yellow-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b-4 border-black p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black">DUNGEON (A.I. Chat)</h1>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClick();
                setMessages([]);
              }}
              className="px-4 py-2 bg-red-700 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              CLEAR
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClick();
                navigate('/playground');
              }}
              className="px-4 py-2 bg-purple-900 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              BACK
            </motion.button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col p-4">
          <div className="flex-1 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
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
                    className={`max-w-[70%] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      message.role === 'user'
                        ? 'bg-purple-500'
                        : 'bg-white'
                    }`}
                  >
                    <div className="font-bold text-black">
                      {renderMessageContent(message.content)}
                    </div>
                    <p className="text-xs mt-2 font-bold text-black opacity-60">
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
                  <div className="max-w-[70%] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
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
            <div className="flex-shrink-0 p-4 border-t-4 border-black bg-yellow-50">
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
                  className="flex-1 px-4 py-3 border-4 border-black font-bold text-base focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:bg-gray-200 resize-none placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-8 py-3 bg-purple-500 text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  SEND
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

