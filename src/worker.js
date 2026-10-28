import { onRequestGet as listening } from '../functions/api/listening.js';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/listening') {
      if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
      return listening({ request, env, ctx });
    }

    return env.ASSETS.fetch(request);
  },
};
