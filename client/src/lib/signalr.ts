import * as signalR from '@microsoft/signalr';

// Les hubs SignalR sont exposés par l'API .NET sur son origine propre (pas de
// réécriture Next.js pour les websockets) — le cookie de session est envoyé
// via withCredentials, ce qui suppose une policy CORS explicite côté API
// autorisant cette origine avec credentials.
// Variable distincte de NEXT_PUBLIC_API_URL (utilisée par client.ts pour les
// appels REST) : ce dernier doit rester vide pour passer par le proxy Next.js
// same-origin, alors que SignalR a besoin d'une URL absolue cross-origin.
const API_BASE = process.env.NEXT_PUBLIC_SIGNALR_URL ?? 'http://localhost:5009';

function buildConnection(hubPath: string): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}${hubPath}`, { withCredentials: true })
    .withAutomaticReconnect()
    .build();
}

export function connectMessagesHub(): signalR.HubConnection {
  return buildConnection('/hubs/messages');
}

export function connectAuctionsHub(): signalR.HubConnection {
  return buildConnection('/hubs/auctions');
}
