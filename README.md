# Spotify Web App

A React-based Spotify web client that allows you to browse your playlists, search for tracks, and listen to music using the Spotify Web API.

## Features

- Spotify OAuth authentication
- Browse featured playlists and your personal library
- Search for tracks, artists, albums, and playlists
- Play song previews with playback controls
- Responsive design for all device sizes

## Setup

1. Create a Spotify Developer application at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)

2. Set your redirect URI in the Spotify Developer Dashboard (e.g., `http://localhost:5173`)

3. Create a `.env` file and add your Spotify Client ID and redirect URI:

```
VITE_SPOTIFY_CLIENT_ID="your_client_id_here"
VITE_REDIRECT_URI="http://localhost:5173"
```

4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

## How it works

This application uses:

- Spotify Web API for authentication and data fetching
- React with TypeScript for the UI
- Zustand for state management
- Tailwind CSS for styling
- React Router for navigation

The application does not require a backend as it communicates directly with the Spotify API from the browser using OAuth implicit grant flow.

## Limitations

- Only song previews are available (30 seconds)
- Some tracks may not have preview URLs available
- Full playback requires Spotify Premium and would need the Spotify Web Playback SDK#   s p o t i f y _ h v  
 #   s p o t i f y _ h v  
 #   s p o t i f y _ h v  
 