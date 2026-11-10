import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api, API_BASE } from '../../services/api';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';

export default function Messages() {
  const { conversationId } = useParams();
  const { customer } = useCustomer();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const bottom = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const url = user ? '/messages/conversations/provider' : '/messages/conversations/customer';
    api.get(url).then((r) => setConversations(r.data));
  }, [user]);

  useEffect(() => {
    if (!conversationId) return;
    api.get(`/messages/conversations/${conversationId}/messages`).then((r) => setMessages(r.data));

    socketRef.current = io(API_BASE);
    socketRef.current.emit('join', `conv:${conversationId}`);
    socketRef.current.on('new-message', (m) => setMessages((prev) => [...prev, m]));
    return () => socketRef.current?.disconnect();
  }, [conversationId]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() && !file) return;
    const fd = new FormData();
    fd.append('conversation_id', conversationId);
    fd.append('content', text);
    if (file) fd.append('image', file);
    const r = await api.post('/messages/messages', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setMessages((p) => [...p, r.data]);
    setText(''); setFile(null);
  };

  return (
    <div className="messages-layout">
      <aside className="conv-list">
        <h3>Conversations</h3>
        {conversations.map((c) => (
          <a key={c.conversation_id}
             href={`/messages/${c.conversation_id}`}
             className={`conv-item ${c.conversation_id === conversationId ? 'active' : ''}`}>
            <div><strong>{c.provider_name || c.customer_name}</strong></div>
            <div className="muted small">{c.last_message || 'No messages'}</div>
          </a>
        ))}
      </aside>
      <section className="chat-window">
        <div className="messages-list">
          {messages.map((m) => (
            <div key={m.message_id} className={`msg msg-${m.sender_type}`}>
              <div className="msg-bubble">
                {m.content && <p>{m.content}</p>}
                {m.attachments && m.attachments.map((a) => (
                  <img key={a.id} src={`${API_BASE}${a.url}`} alt="attachment" className="msg-img" />
                ))}
                <span className="msg-time">{new Date(m.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <div className="composer">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <input placeholder="Type a message…" value={text}
                 onChange={(e) => setText(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button className="btn btn-primary" onClick={send}>Send</button>
        </div>
      </section>
    </div>
  );
}