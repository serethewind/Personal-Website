const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

function asTrack(item, status) {
  return {
    status,
    name: item.name,
    artist: item.artists.map((artist) => artist.name).join(', '),
    album: item.album?.name ?? null,
    artwork: item.album?.images?.[1]?.url ?? item.album?.images?.[0]?.url ?? null,
    url: item.external_urls.spotify,
  };
}

async function refreshAccessToken(env) {
  const authorization = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) throw new Error('Unable to refresh Spotify access token');
  return (await response.json()).access_token;
}

async function spotifyRequest(path, token) {
  return fetch(`${SPOTIFY_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REFRESH_TOKEN) {
    return Response.json({ error: 'Listening status is not configured.' }, { status: 503 });
  }

  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const token = await refreshAccessToken(env);
    const current = await spotifyRequest('/me/player/currently-playing', token);
    let payload;

    if (current.status === 200) {
      const data = await current.json();
      if (data.is_playing && data.item?.type === 'track') payload = asTrack(data.item, 'now_playing');
    }

    if (!payload) {
      const recent = await spotifyRequest('/me/player/recently-played?limit=1', token);
      if (!recent.ok) throw new Error('Unable to read Spotify history');
      const data = await recent.json();
      if (!data.items?.[0]?.track) throw new Error('No listening history available');
      payload = asTrack(data.items[0].track, 'last_played');
    }

    const response = Response.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch {
    return Response.json({ error: 'Listening status is temporarily unavailable.' }, { status: 502 });
  }
}
