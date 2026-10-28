import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://127.0.0.1:8787/api/spotify/callback';
const scopes = ['user-read-currently-playing', 'user-read-recently-played'];

if (!clientId || !clientSecret) {
  throw new Error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running this script.');
}

const state = randomBytes(24).toString('hex');
const authorizationUrl = new URL('https://accounts.spotify.com/authorize');
authorizationUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  state,
  scope: scopes.join(' '),
}).toString();

const server = createServer(async (request, response) => {
  const callback = new URL(request.url, redirectUri);
  const code = callback.searchParams.get('code');

  if (callback.pathname !== '/api/spotify/callback') {
    response.writeHead(404).end('Not found');
    return;
  }
  if (callback.searchParams.get('state') !== state || !code) {
    response.writeHead(400).end('Spotify authorization was rejected or could not be verified.');
    server.close();
    return;
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.refresh_token) throw new Error(token.error_description ?? 'No refresh token returned.');

    console.log(`\nAdd this value to Cloudflare as SPOTIFY_REFRESH_TOKEN:\n\n${token.refresh_token}\n`);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<h1>Spotify connected.</h1><p>You can close this tab and copy the refresh token from your terminal into Cloudflare.</p>');
  } catch (error) {
    console.error(error);
    response.writeHead(500).end('Could not exchange the Spotify code. Check the terminal.');
  } finally {
    server.close();
  }
});

server.listen(8787, '127.0.0.1', () => {
  console.log(`Open this URL in your browser to connect Spotify:\n\n${authorizationUrl}\n`);
});
