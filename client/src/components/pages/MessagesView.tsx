'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { messagesApi } from '@/lib/api/messages';
import { useAuth } from '@/context/AuthContext';
import { uploadUrl } from '@/lib/api/client';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime, formatPrice } from '@/lib/format';
import { connectMessagesHub } from '@/lib/signalr';
import type { Conversation, Message } from '@/types';

const OFFER_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'en attente',
  ACCEPTEE: 'acceptée',
  REFUSEE: 'refusée',
  UTILISEE: 'utilisée',
  EXPIREE: 'expirée',
};

function OfferBubble({ message, isSeller, onRespond }: { message: Message; isSeller: boolean; onRespond: (offerId: number, accept: boolean) => void }) {
  const offer = message.offre;
  if (!offer) return null;
  return (
    <div className="message-offer">
      <div>Offre proposée : <strong>{formatPrice(offer.montant)}</strong></div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
        Statut : {OFFER_STATUS_LABELS[offer.statut] ?? offer.statut}
      </div>
      {isSeller && offer.statut === 'EN_ATTENTE' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={() => onRespond(offer.id, true)}>Accepter</button>
          <button className="btn btn-danger btn-sm" onClick={() => onRespond(offer.id, false)}>Refuser</button>
        </div>
      )}
    </div>
  );
}

// NB : ConversationDto ne porte plus l'annonce/enchère imbriquée ni le dernier
// message (juste idAnnonce/idEnchere/idCommande bruts) — l'en-tête de chat et
// l'aperçu dans la liste sont donc simplifiés en conséquence par rapport à
// l'ancien backend.
function ChatPanel({ conversation, currentUserId }: { conversation: Conversation; currentUserId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    messagesApi
      .messages(conversation.id)
      .then((m) => {
        setMessages(m);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }

  useEffect(() => {
    setLoaded(false);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Remplace le polling 5s de l'ancien client : le hub pousse un événement
  // dès qu'un message/offre est créé ou mis à jour dans cette conversation.
  useEffect(() => {
    const connection = connectMessagesHub();
    connection.on('messageReceived', () => load());
    connection.on('offerUpdated', () => load());
    connection
      .start()
      .then(() => connection.invoke('JoinConversation', conversation.id))
      .catch(() => {
        // SignalR indisponible — la conversation reste consultable, juste
        // sans mise à jour temps réel automatique.
      });
    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function onSendText(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await messagesApi.sendText(conversation.id, text.trim());
    setText('');
    load();
  }

  async function onSendImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    await messagesApi.sendImage(conversation.id, fd);
    if (fileInputRef.current) fileInputRef.current.value = '';
    load();
  }

  async function onMakeOffer(e: React.FormEvent) {
    e.preventDefault();
    await messagesApi.makeOffer(conversation.id, Number(offerAmount));
    setOfferAmount('');
    setShowOffer(false);
    load();
  }

  async function onRespond(offerId: number, accept: boolean) {
    await messagesApi.respondOffer(offerId, accept);
    load();
  }

  if (!loaded) return <LoadingBlock />;

  const isSeller = conversation.vendeur.id === currentUserId;
  const counterpart = isSeller ? conversation.acheteur : conversation.vendeur;
  const canNegotiate = conversation.idAnnonce != null && !isSeller;
  const subject = conversation.idAnnonce != null ? 'Au sujet d’une annonce' : conversation.idEnchere != null ? 'Au sujet d’une enchère' : conversation.idCommande != null ? 'Au sujet d’une commande' : null;

  return (
    <div className="chat-panel">
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-soft)' }}>
        <strong>{counterpart.pseudo}</strong>
        {subject && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subject}</div>}
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`message-bubble ${m.expediteur.id === currentUserId ? 'mine' : ''}`}>
            {m.type === 'TEXTE' && <span>{m.contenu}</span>}
            {m.type === 'IMAGE' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadUrl(m.image) ?? undefined} alt="Photo envoyée" />
            )}
            {m.type === 'OFFRE' && <OfferBubble message={m} isSeller={isSeller} onRespond={onRespond} />}
            <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 3 }}>{formatDateTime(m.dateCreation)}</div>
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

export function MessagesView({ conversationId }: { conversationId?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  useEffect(() => {
    messagesApi.conversations().then(setConversations).catch(() => setConversations([]));
  }, []);

  if (!user) return <LoadingBlock />;

  const activeConversation = conversations?.find((c) => c.id === conversationId) ?? null;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Mes messages</h2>

      {!conversations ? (
        <LoadingBlock />
      ) : conversations.length === 0 ? (
        <EmptyState title="Aucun message" description="Contactez un vendeur depuis une fiche produit pour démarrer une conversation." />
      ) : (
        <div className="messages-layout">
          <div className="conversation-list">
            {conversations.map((c) => {
              const counterpart = c.vendeur.id === user.id ? c.acheteur : c.vendeur;
              return (
                <button
                  key={c.id}
                  className={`conversation-item ${c.id === conversationId ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => router.push(`/compte/messages/${c.id}`)}
                >
                  <div className="conversation-item-name">{counterpart.pseudo}</div>
                  <div className="conversation-item-preview">{formatDateTime(c.dateCreation)}</div>
                </button>
              );
            })}
          </div>
          {activeConversation ? (
            <ChatPanel conversation={activeConversation} currentUserId={user.id} />
          ) : (
            <div className="chat-panel" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sélectionnez une conversation</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
