import axios from "axios";
import {
  SpotifyUser,
  SpotifyPlaylist,
  PlaylistTracks,
  SearchResults,
  SpotifyTrack,
  SpotifyArtist,
} from "../types/spotify";
import useAuthStore from "../store/authStore";

const BASE_URL = "https://api.spotify.com/v1";
const SAAVN_API_URL = "https://saavn.dev/api";

// Create axios instance with authorization headers
const createSpotifyApi = (token: string) => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const saavnApi = axios.create({
    baseURL: SAAVN_API_URL,
  });

  // Add response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        console.warn("Token expired. Attempting to refresh...");
        const refreshTokenFn = useAuthStore.getState().refreshTokenFn;

        try {
          // Refresh the token
          await refreshTokenFn();

          // Retry the original request with the new token
          const newToken = useAuthStore.getState().token;
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(error.config);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          useAuthStore.getState().logout(); // Log out the user if refresh fails
        }
        // Token expired, redirect to login
        // localStorage.removeItem("spotify_token");
        // window.location.href = "/";
      }
      return Promise.reject(error);
    }
  );

  // Helper function to get song URL from Saavn
  const getSongUrl = async (
    trackName: string,
    artistName: string
  ): Promise<{ id: string; url: string } | null> => {
    try {
      // Search for the song on Saavn
      const searchQuery = `${trackName} ${artistName}`;
      const response = await axios.get(
        `https://185.246.87.210/api.php?__call=autocomplete.get&query=${encodeURIComponent(
          searchQuery
        )}&type=album,artist,playlist,track&limit=10`
      );
      if (response.data.songs.data.length > 0) {
        const bestMatch = response.data.songs.data[0];
        return { id: bestMatch.id, url: bestMatch.url }; // Use the song's URL directly
      }
      return null;
    } catch (error) {
      console.error("Error fetching Saavn URL:", error);
      return null;
    }
  };

  // API methods
  return {
    // User
    getCurrentUser: async (): Promise<SpotifyUser> => {
      const response = await api.get("/me");
      return response.data;
    },

    // Playlists
    getUserPlaylists: async (
      limit = 20,
      offset = 0
    ): Promise<{ items: SpotifyPlaylist[]; total: number }> => {
      const response = await api.get(
        `/me/playlists?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },

    getPlaylist: async (playlistId: string): Promise<SpotifyPlaylist> => {
      const response = await api.get(`/playlists/${playlistId}`);
      return response.data;
    },

    getPlaylistTracks: async (
      playlistId: string,
      limit = 50,
      offset = 0
    ): Promise<PlaylistTracks> => {
      const response = await api.get(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
      );

      // Enhance tracks with Saavn URLs
      const tracks = response.data;
      return tracks;
    },

    // Search
    search: async (
      query: string,
      types: string[] = ["track", "artist", "album", "playlist"],
      limit = 20
    ): Promise<SearchResults> => {
      const response = await api.get(
        `/search?q=${encodeURIComponent(query)}&type=${types.join(
          ","
        )}&limit=${limit}`
      );

      //  const response = await axios.get(
      //    `https://thingproxy.freeboard.io/fetch/https://www.jiosaavn.com/api.php?__call=autocomplete.get&query=${encodeURIComponent(
      //      query
      //    )}&type=${types.join(",")}&limit=${limit}`
      //  );
      // const result = response.data.songs.data.map((song: any) => ({
      //   id: song.id,
      //   name: song.title,
      //   album: song.album,
      //   description: song.description,
      //   image: song.image,
      //   url: song.url,
      //   artists: song.more_info.singers,
      //   more_info: {
      //     singers: song.more_info.singers,
      //     primary_artists: song.more_info.primary_artists,
      //     duration: song.more_info.duration || 0,
      //     vcode: song.more_info.vcode,
      //     vlink: song.more_info.vlink,
      //     language: song.more_info.language,
      //   },
      // }));

      return response.data;
    },

    getNewReleases: async (
      limit = 20
    ): Promise<{ albums: { items: SpotifyTrack[] } }> => {
      const response = await api.get(`/browse/new-releases?limit=${limit}`);
      return response.data;
    },

    getRecommendations: async (
      seedArtists: string[] = [],
      seedTracks: string[] = [],
      limit = 20
    ): Promise<{ tracks: SpotifyTrack[] }> => {
      const allTracks: SpotifyTrack[] = [];
      let response;
      for (const artistId of seedArtists) {
        response = await api.get(`/artists/${artistId}/top-tracks?country=US`);
        allTracks.push(...response.data.tracks.slice(0, limit));
      }

      // Limit the total number of tracks to the specified limit
      response.data = { tracks: allTracks.slice(0, limit) };

      return response.data;
    },

    // Artists
    getArtist: async (artistId: string): Promise<SpotifyArtist> => {
      const response = await api.get(`/artists/${artistId}`);
      return response.data;
    },

    getArtistTopTracks: async (
      artistId: string,
      country = "US"
    ): Promise<{ tracks: SpotifyTrack[] }> => {
      const response = await api.get(
        `/artists/${artistId}/top-tracks?country=${country}`
      );

      return response.data;
    },

    getAlbum: async (albumId: string): Promise<SpotifyPlaylist> => {
      const response = await api.get(`/albums/${albumId}`);
      return response.data;
    },

    getAlbumTracks: async (
      albumId: string,
      limit = 50,
      offset = 0
    ): Promise<PlaylistTracks> => {
      const response = await api.get(
        `/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },

    getArtistAlbums: async (
      artistId: string,
      limit = 20,
      offset = 0
    ): Promise<{ items: SpotifyPlaylist[]; total: number }> => {
      const response = await api.get(
        `/artists/${artistId}/albums?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },

    // User Library
    getUserSavedTracks: async (
      limit = 20,
      offset = 0
    ): Promise<PlaylistTracks> => {
      const response = await api.get(
        `/me/tracks?limit=${limit}&offset=${offset}`
      );

      // Return tracks directly without fetching Saavn URLs
      return response.data;
    },

    getTrack: async (trackId: string): Promise<SpotifyTrack> => {
      const response = await api.get(`/tracks/${trackId}`);

      // Enhance track with Saavn URL
      const track = response.data;
      const saavnUrl = await getSongUrl(track.name, track.artists[0].name);
      if (saavnUrl) {
        track.id = saavnUrl.id;
      }

      return track;
    },

    getUserTopItems: async (
      type: "tracks" | "artists",
      limit = 20,
      time_range: "short_term" | "medium_term" | "long_term" = "medium_term"
    ): Promise<{ items: SpotifyTrack[] | SpotifyArtist[] }> => {
      const response = await api.get(
        `/me/top/${type}?limit=${limit}&time_range=${time_range}`
      );

      return response.data;
    },
  };
};

export default createSpotifyApi;
