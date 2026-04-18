"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiAssistant, ChatMessage } from "@/lib/ai-service";

interface AIChatProps {
  leads?: any[];
  className?: string;
  isInline?: boolean;
}

export default function AIChat({ leads = [], className = "", isInline = false }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant for JK Properties CRM. I can help you analyze leads, provide insights, and answer questions about your real estate business. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(isInline); // Start expanded if inline
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await aiAssistant.processQuery(input, {
        leads,
        userRole: "agent"
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    "Show me my hottest leads",
    "Analyze my conversion rate",
    "What's my best lead source?",
    "Help me prioritize follow-ups"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: isInline ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`ai-chat-container ${isInline ? 'is-inline' : ''} ${className}`}
    >
      <div className={`ai-chat ${isExpanded ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''} ${isInline ? 'inline-chat' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h4>AI Assistant</h4>
              <span className="ai-status">
                <Sparkles size={12} />
                {aiAssistant.isReady() ? "Online" : "Limited Mode"}
              </span>
            </div>
          </div>
          {!isInline && (
            <div className="ai-chat-header-right">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="ai-chat-btn"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ai-chat-btn"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <Maximize2 size={16} className={isExpanded ? "rotate-180" : ""} />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence>
          {(!isMinimized || isInline) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ai-chat-messages"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`ai-message ${message.role}`}
                >
                  <div className="ai-message-avatar">
                    {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="ai-message-content">
                    <p>{message.content}</p>
                    <span className="ai-message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ai-message assistant"
                >
                  <div className="ai-message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="ai-message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        {(!isMinimized || isInline) && messages.length === 1 && (
          <div className="ai-suggestions">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="ai-suggestion-btn"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <AnimatePresence>
          {(!isMinimized || isInline) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ai-chat-input"
            >
              <div className="ai-input-wrapper">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your leads..."
                  className="ai-input"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="ai-send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .ai-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .ai-chat-container.is-inline {
          position: static;
          z-index: 1;
          margin-bottom: 24px;
        }

        .ai-chat {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          width: 350px;
          height: 500px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .ai-chat.inline-chat {
          width: 100%;
          height: 450px;
          box-shadow: var(--shadow);
          border-radius: 20px;
          overflow: hidden;
        }

        .ai-chat.expanded {
          width: 450px;
          height: 600px;
        }

        .ai-chat.inline-chat.expanded {
          width: 100%;
          height: 450px;
        }

        .ai-chat.minimized {
          height: auto;
        }

        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .ai-chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ai-avatar {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-chat-header-left h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          opacity: 0.9;
        }

        .ai-chat-header-right {
          display: flex;
          gap: 8px;
        }

        .ai-chat-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: white;
          transition: background 0.2s;
        }

        .ai-chat-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-message {
          display: flex;
          gap: 12px;
          max-width: 100%;
        }

        .ai-message.user {
          flex-direction: row-reverse;
        }

        .ai-message-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ai-message.assistant .ai-message-avatar {
          background: #f3f4f6;
          color: #6b7280;
        }

        .ai-message.user .ai-message-avatar {
          background: #667eea;
          color: white;
        }

        .ai-message-content {
          flex: 1;
          background: #f9fafb;
          padding: 12px 16px;
          border-radius: 12px;
          position: relative;
        }

        .ai-message.user .ai-message-content {
          background: #667eea;
          color: white;
        }

        .ai-message-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .ai-message-time {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 4px;
          display: block;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .ai-suggestions {
          padding: 0 16px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ai-suggestion-btn {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #374151;
        }

        .ai-suggestion-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .ai-chat-input {
          padding: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .ai-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .ai-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .ai-input:focus {
          border-color: #667eea;
        }

        .ai-send-btn {
          background: #667eea;
          border: none;
            border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: background 0.2s;
        }

        .ai-send-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .ai-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }
      `}</style>
    </motion.div>
  );
}
