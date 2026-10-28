# Spotify listening status setup

This project uses a Cloudflare Pages Function at `/api/listening`.

## Required Spotify redirect URIs

- `http://127.0.0.1:8787/api/spotify/callback`
- `https://noah.apexpercentile.xyz/api/spotify/callback`

## Cloudflare environment secrets

In the Pages project dashboard, open **Settings > Environment variables** and add these as encrypted secrets for Production and Preview:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

## Generate the refresh token once

From this project directory, run the authorization helper locally. This starts only on your computer at `127.0.0.1:8787`, prints a Spotify approval URL, then prints the refresh token after approval.

```bash
SPOTIFY_CLIENT_ID="your-client-id" SPOTIFY_CLIENT_SECRET="your-client-secret" node tools/spotify-authorize.mjs
```

Copy the printed refresh token into Cloudflare as `SPOTIFY_REFRESH_TOKEN`, then stop treating it as a value to share. Do not add it to Git.

The function requests no data from visitors. It only returns a public track title, artist, optional album artwork, and Spotify URL from Noah's own account. Results are cached for 60 seconds.

## Important

Do not add real values to `.dev.vars.example`, the website JavaScript, or a Git repository. The refresh token must be generated once through Spotify's Authorization Code flow with `user-read-currently-playing` and `user-read-recently-played`.
