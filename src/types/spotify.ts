export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    display_name: string;
    id: string;
  };
  public: "Public" | "Private";
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  artists: {
    id: string;
    name: string;
  }[];
  preview_url: string | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  release_date?: string;
  total_tracks?: number;
  artists?: {
    id: string;
    name: string;
  }[];
}

export interface PlaylistTracks {
  items: {
    added_at: string;
    track: SpotifyTrack;
  }[];
  total: number;
  offset: number;
  limit: number;
}

export interface SearchResults {
  tracks?: { items: SpotifyTrack[] };
  artists?: { items: SpotifyArtist[] };
  albums?: { items: SpotifyAlbum[] };
  playlists?: { items: SpotifyPlaylist[] };
}

export interface PlayerState {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SearchResults {
  tracks?: {
    items: SpotifyTrack[];
  };
  artists?: {
    items: SpotifyArtist[];
  };
  albums?: {
    items: SpotifyAlbum[];
  };
  playlists?: {
    items: SpotifyPlaylist[];
  };
}
