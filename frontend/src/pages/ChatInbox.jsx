import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import API from '../services/api';
import { Send, User, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import CustomButton from '../components/CustomButton';

const ChatInbox = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const peerId = searchParams.get('peer');

  // Socket reference
  const socketRef = useRef();
  const chatEndRef = useRef();

  // States
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [peerUser, setPeerUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Socket.io connection
  useEffect(() => {
    if (user) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

      // Identify/register this user with Socket server
      socketRef.current.emit('join', user.id);

      // Listen for incoming messages
      socketRef.current.on('messageReceived', (msg) => {
        // Only append message if it belongs to current peer conversation
        if (
          (msg.sender._id === user.id && msg.recipient._id === peerId) ||
          (msg.sender._id === peerId && msg.recipient._id === user.id)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user, peerId]);

  // Load chat logs on peer select
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!peerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch message logs
        const chatRes = await API.get(`/chat/${peerId}`);
        setMessages(chatRes.data.data);

        // Fetch peer user profile details (doctor or patient)
        const userRes = await API.get(`/doctors/${peerId}`).catch(() => {
          // If not a doctor, search public patients/profile stubs if admin or custom.
          // In MERN, we can create a generic user get, but let's fall back to doctor details.
          return API.get(`/patients/profile`); // generic check
        });
        
        // Handle dual structure response
        const details = userRes.data.data.user || userRes.data.data;
        setPeerUser(details);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchChatDetails();
  }, [peerId]);

  // Auto-scroll chat panel to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || !peerId) return;

    // Send payload via WebSockets
    socketRef.current.emit(
      'sendMessage',
      {
        senderId: user.id,
        recipientId: peerId,
        text: text.trim(),
      },
      (response) => {
        if (response?.success) {
          setText('');
        } else {
          console.error('Socket message send failed');
        }
      }
    );
  };

  if (!peerId) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-[60vh] flex items-center justify-center"
      >
        <GlassCard hoverEffect={false} className="p-8 text-center text-customGray flex flex-col items-center gap-4">
          <MessageCircle size={48} className="text-primary" />
          <h2 className="font-bold text-lg">Inbox Chat</h2>
          <p className="text-sm max-w-xs">Select a doctor or patient from your dashboard to initiate a conversation.</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 max-w-4xl mx-auto pb-16"
    >
      <GlassCard hoverEffect={false} className="h-[75vh] flex flex-col justify-between p-0 overflow-hidden border-slate-100/50">
        {/* Header peer card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-4">
          <img
            src={peerUser?.profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${peerUser?.name || 'peer'}`}
            alt="peer"
            className="w-10 h-10 rounded-full object-cover border"
          />
          <div>
            <h4 className="font-bold text-sm leading-none">{peerUser?.name || 'Medicare Member'}</h4>
            <span className="text-[10px] text-customGray mt-1 block capitalize">{peerUser?.role || 'Verified User'}</span>
          </div>
        </div>

        {/* Message Logs Pane */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-customGray py-12">No messages in this chat. Start typing below!</p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender._id === user.id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3.5 rounded-3xl text-sm ${
                      isOwn
                        ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-sm shadow-sm'
                        : 'glass-panel text-slate-800 dark:text-slate-100 rounded-tl-sm border-slate-100'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[9px] block mt-1.5 text-right ${
                        isOwn ? 'text-white/60' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a secure message..."
            className="input-field py-2.5 rounded-full"
            required
          />
          <CustomButton type="submit" className="rounded-full px-5 py-2.5 shrink-0">
            <Send size={16} />
          </CustomButton>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default ChatInbox;
