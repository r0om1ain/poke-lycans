export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message = 'Ressource introuvable') => new HttpError(404, message);
export const badRequest = (message = 'Requête invalide', details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Authentification requise') => new HttpError(401, message);
export const forbidden = (message = 'Accès refusé') => new HttpError(403, message);
export const conflict = (message = 'Conflit') => new HttpError(409, message);
