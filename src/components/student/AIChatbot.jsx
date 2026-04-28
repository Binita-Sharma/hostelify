import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minus, MessageSquare, Sparkles } from 'lucide-react';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your Hostelify AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI Response
    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }, 1000);
  };

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('complaint')) return "To raise a complaint, go to the 'Complaints' section and click 'Raise Complaint'. You can track the status in real-time there.";
    if (q.includes('fee') || q.includes('payment')) return "You can view your pending fees and payment history in the 'Fees' section. Payments can be made via the student portal.";
    if (q.includes('mess') || q.includes('food')) return "The mess menu is updated weekly. Today's menu can be found on your dashboard or the Mess section.";
    if (q.includes('room')) return "Your assigned room details are available in the 'Room' section. To request a change, please submit a formal request through the portal.";
    if (q.includes('rule')) return "Hostel rules include 10 PM curfew, no visitors after 8 PM, and maintaining cleanliness. Check the 'Room' section for the full rulebook.";
    return "I'm not sure about that. Would you like me to connect you with the hostel warden?";
  };

  return (
    <>
      <button className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`} onClick={() => setIsOpen(true)}>
        <Sparkles size={24} />
        <span>Ask AI</span>
      </button>

      {isOpen && (
        <div className="chatbot-window animate-fade-in">
          <div className="chatbot-header">
            <div className="bot-title">
              <div className="bot-icon"><Bot size={20} /></div>
              <div>
                <h4>Hostelify AI</h4>
                <span className="status-online">Online</span>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={() => setIsOpen(false)}><Minus size={20} /></button>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chatbot-input">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}><Send size={18} /></button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
