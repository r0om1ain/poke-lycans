import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { messagesApi } from '../../api/messages.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { uploadUrl } from '../../api/client.js';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { formatDateTime, formatPrice } from '../../lib/format.js';

function OfferBubble({ message, isSeller, onRespond }) {
  const offer = message.priceOffer;
  if (!offer) return null;
  return (
    <div className="message-offer">
      <div>Offre proposée : <strong>{formatPrice(offer.amount)}</strong></div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
        Statut : {{ PENDING: 'en attente', ACCEPTED: 'acceptée', REFUSED: 'refusée', USED: 'utilisée', EXPIRED: 'expirée' }[offer.status]}
      </div>
      {isSeller && offer.status === 'PENDING' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={() => onRespond(offer.id, true)}>Accepter</button>
          <button className="btn btn-danger btn-sm" onClick={() => onRespond(offer.id, false)}>Refuser</button>
        </div>
      )}
    </div>
  );
}

function ChatPanel({ conversationId }) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  function load() {
    messagesApi.messages(conversationId).then((r) => {
      setConversation(r.conversation);
      setMessages(r.messages);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function onSendText(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await messagesApi.sendText(conversationId, text.trim());
    setText('');
    load();
  }

  async function onSendImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    await messagesApi.sendImage(conversationId, fd);
    if (fileInputRef.current) fileInputRef.current.value = '';
    load();
  }

  async function onMakeOffer(e) {
    e.preventDefault();
    await messagesApi.makeOffer(conversationId, Number(offerAmount));
    setOfferAmount('');
    setShowOffer(false);
    load();
  }

  async function onRespond(offerId, accept) {
    await messagesApi.respondOffer(offerId, accept);
    load();
  }

  if (!conversation) return <LoadingBlock />;

  const isSeller = conversation.listing ? conversation.listing.seller.id === user.id : false;
  const canNegotiate = conversation.listing && !isSeller;

  return (
    <div className="chat-panel">
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-soft)' }}>
        <strong>{conversation.counterpart.username}</strong>
        {conversation.listing && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            À propos de : {conversation.listing.product.name} — {formatPrice(conversation.listing.price)}
          </div>
        )}
        {conversation.auction && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            À propos de l’enchère : {conversation.auction.product.name}
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.senderId === user.id ? 'mine' : ''}`}>
            {m.type === 'TEXT' && <span>{m.content}</span>}
            {m.type === 'IMAGE' && <img src={uploadUrl(m.imageUrl)} alt="Photo envoyée" />}
            {m.type === 'OFFER' && <OfferBubble message={m} isSeller={isSeller} onRespond={onRespond} />}
            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 3 }}>{formatDateTime(m.createdAt)}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showOffer && canNegotiate && (
        <form onSubmit={onMakeOffer} style={{ display: 'flex', gap: 6, padding: '0 var(--space-3) var(--space-2)' }}>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input"
            placeholder="Montant proposé (€)"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm">Envoyer</button>
        </form>
      )}

      <form onSubmit={onSendText} className="chat-input-row">
        {canNegotiate && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowOffer((s) => !s)}>
            Négocier
          </button>
        )}
        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          Photo
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onSendImage} style={{ display: 'none' }} />
        </label>
        <input type="text" placeholder="Écrire un message..." value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">Envoyer</button>
      </form>
    </div>
  );
}

export function AccountMessages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    messagesApi.conversations().then((r) => setConversations(r.conversations));
  }, []);

  if (!conversations) return <LoadingBlock />;

  if (conversations.length === 0) {
    return <EmptyState title="Aucun message" description="Contactez un vendeur depuis une fiche produit pour démarrer une conversation." />;
  }

  return (
    <div className="messages-layout">
      <div className="conversation-list">
        {conversations.map((c) => (
          <button
            key={c.id}
            className={`conversation-item ${c.id === conversationId ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate(`/compte/messages/${c.id}`)}
          >
            <div className="conversation-item-name">{c.counterpart.username}</div>
            <div className="conversation-item-preview">
              {c.lastMessage ? (c.lastMessage.type === 'TEXT' ? c.lastMessage.content : `[${c.lastMessage.type}]`) : 'Nouvelle conversation'}
            </div>
          </button>
        ))}
      </div>
      {conversationId ? (
        <ChatPanel conversationId={conversationId} />
      ) : (
        <div className="chat-panel" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <span style={{ color: 'var(--text-muted)' }}>Sélectionnez une conversation</span>
        </div>
      )}
    </div>
  );
}
