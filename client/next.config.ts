import type { NextConfig } from 'next';

// En dev/prod, réécrit /api/* et /uploads/* vers l'API .NET — même principe
// que le proxy Vite de l'ancien client (garde les requêtes same-origin pour
// que le cookie de session httpOnly parte sans souci CORS). L'URL de l'API
// se configure via API_PROXY_TARGET (défaut : port ASP.NET Core en dev).
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:5009';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_PROXY_TARGET}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_PROXY_TARGET}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
