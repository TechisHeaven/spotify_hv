import { create } from "zustand";
import createSpotifyApi from "../services/spotifyApi";
import useAuthStore from "./authStore";
import {
  SpotifyPlaylist,
  SpotifyTrack,
  SearchResults,
  SpotifyAlbum,
} from "../types/spotify";

interface ContentState {
  // Playlists
  userPlaylists: SpotifyPlaylist[];
  currentPlaylist: SpotifyPlaylist | null;
  playlistTracks: SpotifyTrack[];
  artistAlbums: SpotifyAlbum[]; // Albums by an artist
  albumDetails: SpotifyAlbum | null; // Details of a specific album
  albumTracks: SpotifyTrack[];

  // Recommendations & New Releases
  recommendedTracks: SpotifyTrack[];
  newReleases: SpotifyTrack[];

  // Library
  savedTracks: SpotifyTrack[];

  // Search
  searchResults: SearchResults;
  searchQuery: string;

  // Pagination
  playlistsOffset: number;
  tracksOffset: number;
  latestLoadedCount: number;
  hasMorePlaylists: boolean;
  hasMoreTracks: boolean;

  // Loading states
  isLoadingPlaylists: boolean;
  isLoadingPlaylist: boolean;
  isLoadingRecommendations: boolean;
  isLoadingSearch: boolean;
  isLoadingLibrary: boolean;
  isLoadingMore: boolean;
  isLoadingArtistAlbums: boolean;
  isLoadingAlbumDetails: boolean;
  isLoadingAlbumTracks: boolean;

  // Error handling
  error: string | null;

  // Actions
  fetchUserPlaylists: (loadMore?: boolean) => Promise<void>;
  fetchPlaylist: (
    playlistId: string,
    loadMore?: boolean,
    sortType?: string
  ) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchNewReleases?: () => Promise<void>;
  fetchSavedTracks: (loadMore?: boolean, limit?: number) => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  fetchArtistAlbums: (
    artistId: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
  fetchAlbumDetails: (albumId: string) => Promise<void>;
  fetchAlbumTracks: (
    albumId: string,
    limit?: number,
    offset?: number
  ) => Promise<void>;
}

const ITEMS_PER_PAGE = 20;

const useContentStore = create<ContentState>((set, get) => ({
  // Playlists
  userPlaylists: [],
  currentPlaylist: null,
  playlistTracks: [],
  artistAlbums: [], // Add state for artist albums
  albumDetails: null, // Add state for album details
  albumTracks: [], // Add state for album tracks

  // Recommendations & New Releases
  recommendedTracks: [],
  newReleases: [],

  // Library
  savedTracks: [],

  // Search
  searchResults: {},
  searchQuery: "",

  // Pagination
  playlistsOffset: 0,
  tracksOffset: 0,
  hasMorePlaylists: true,
  hasMoreTracks: true,

  // Loading states
  isLoadingPlaylists: false,
  isLoadingPlaylist: false,
  isLoadingRecommendations: false,
  isLoadingSearch: false,
  isLoadingLibrary: false,
  isLoadingMore: false,
  latestLoadedCount: 0,
  isLoadingArtistAlbums: false,
  isLoadingAlbumDetails: false,
  isLoadingAlbumTracks: false,

  // Error handling
  error: null,

  // Actions
  fetchUserPlaylists: async (loadMore = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const offset = loadMore ? get().playlistsOffset : 0;
      set({
        isLoadingPlaylists: !loadMore,
        isLoadingMore: loadMore,
        error: null,
      });

      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getUserPlaylists(
        ITEMS_PER_PAGE,
        offset
      );

      set((state) => ({
        userPlaylists: loadMore
          ? [...state.userPlaylists, ...response.items]
          : response.items,
        playlistsOffset: offset + ITEMS_PER_PAGE,
        hasMorePlaylists: response.items.length === ITEMS_PER_PAGE,
        isLoadingPlaylists: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      set({
        error: "Failed to fetch your playlists",
        isLoadingPlaylists: false,
        isLoadingMore: false,
      });
    }
  },

  fetchPlaylist: async (
    playlistId: string,
    loadMore = false,
    sortType = "latest"
  ) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const state = get();

      set({
        isLoadingPlaylist: !loadMore,
        isLoadingMore: loadMore,
        error: null,
      });

      const spotifyApi = createSpotifyApi(token);
      const playlist = await spotifyApi.getPlaylist(playlistId);
      const totalTracks = playlist.tracks.total;

      let offset = 0;
      let limit = 50;

      if (sortType === "latest") {
        // how many we've already loaded (starts at 0)
        const loaded = loadMore ? state.latestLoadedCount : 0;

        // next offset is from the end of the playlist
        offset = Math.max(totalTracks - loaded - limit, 0);

        const tracks = await spotifyApi.getPlaylistTracks(
          playlistId,
          limit,
          offset
        );

        const newTracks = tracks.items.map((item) => item.track).reverse(); // reverse to get newest first

        set((prev) => ({
          currentPlaylist: playlist,
          playlistTracks: loadMore
            ? [...prev.playlistTracks, ...newTracks]
            : newTracks,
          latestLoadedCount: loaded + newTracks.length,
          hasMoreTracks: offset > 0,
          isLoadingPlaylist: false,
          isLoadingMore: false,
        }));
      } else {
        // Default behavior (oldest first)
        const offset = loadMore ? state.tracksOffset : 0;

        const tracks = await spotifyApi.getPlaylistTracks(
          playlistId,
          limit,
          offset
        );
        const newTracks = tracks.items.map((item) => item.track);

        set((prev) => ({
          currentPlaylist: playlist,
          playlistTracks: loadMore
            ? [...prev.playlistTracks, ...newTracks]
            : newTracks,
          tracksOffset: offset + newTracks.length,
          hasMoreTracks: newTracks.length === limit,
          isLoadingPlaylist: false,
          isLoadingMore: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
      set({
        error: "Failed to fetch playlist details",
        isLoadingPlaylist: false,
        isLoadingMore: false,
      });
    }
  },

  fetchRecommendations: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      set({ isLoadingRecommendations: true, error: null });

      const spotifyApi = createSpotifyApi(token);
      const topArtists = await spotifyApi.getUserTopItems("artists", 2); // Limit to 2 top artists

      if (Array.isArray(topArtists.items) && topArtists.items.length > 0) {
        const artistIds = (topArtists.items as any[]).map(
          (artist) => artist.id
        );

        const recommendations = await spotifyApi.getRecommendations(
          artistIds,
          [],
          20
        ); // Limit to 10 recommendations

        set({
          recommendedTracks: recommendations.tracks,
          isLoadingRecommendations: false,
        });
      } else {
        const newReleases = await spotifyApi.getNewReleases(10);
        set({
          recommendedTracks: newReleases.albums
            .items as unknown as SpotifyTrack[],
          isLoadingRecommendations: false,
        });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      set({
        error: "Failed to fetch recommendations",
        isLoadingRecommendations: false,
      });
    }
  },

  fetchSavedTracks: async (loadMore = false, limit?: number) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const offset = loadMore ? get().tracksOffset : 0;
      set({
        isLoadingLibrary: !loadMore,
        isLoadingMore: loadMore,
        error: null,
      });

      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getUserSavedTracks(
        limit || ITEMS_PER_PAGE,
        offset
      );

      set((state) => ({
        savedTracks: loadMore
          ? [...state.savedTracks, ...response.items.map((item) => item.track)]
          : response.items.map((item) => item.track),
        tracksOffset: offset + ITEMS_PER_PAGE,
        hasMoreTracks: response.items.length === (limit || ITEMS_PER_PAGE),
        isLoadingLibrary: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error("Error fetching saved tracks:", error);
      set({
        error: "Failed to fetch your saved tracks",
        isLoadingLibrary: false,
        isLoadingMore: false,
      });
    }
  },
  fetchArtistAlbums: async (artistId: string, limit = 20, offset = 0) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      set({ isLoadingArtistAlbums: true, error: null });

      const spotifyApi = createSpotifyApi(token);
      const response = await spotifyApi.getArtistAlbums(
        artistId,
        limit,
        offset
      );

      set((state) => ({
        artistAlbums:
          offset === 0
            ? response.items
            : [...state.artistAlbums, ...response.items],
        isLoadingArtistAlbums: false,
      }));
    } catch (error) {
      console.error("Error fetching artist albums:", error);
      set({
        error: "Failed to fetch artist albums",
        isLoadingArtistAlbums: false,
      });
    }
  },

  fetchAlbumDetails: async (albumId: string) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      set({ isLoadingAlbumDetails: true, error: null });

      const spotifyApi = createSpotifyApi(token);
      const albumData = await spotifyApi.getAlbum(albumId);

      set({
        albumDetails: albumData,
        isLoadingAlbumDetails: false,
      });
    } catch (error) {
      console.error("Error fetching album details:", error);
      set({
        error: "Failed to fetch album details",
        isLoadingAlbumDetails: false,
      });
    }
  },

  fetchAlbumTracks: async (albumId: string, limit = 50, offset = 0) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      set({ isLoadingAlbumTracks: true, error: null });

      const spotifyApi = createSpotifyApi(token);
      const tracksData = await spotifyApi.getAlbumTracks(
        albumId,
        limit,
        offset
      );

      set((state) => ({
        albumTracks:
          offset === 0
            ? (tracksData.items as any[])
            : [...state.albumTracks, ...tracksData.items],
        isLoadingAlbumTracks: false,
      }));
    } catch (error) {
      console.error("Error fetching album tracks:", error);
      set({
        error: "Failed to fetch album tracks",
        isLoadingAlbumTracks: false,
      });
    }
  },

  search: async (query: string) => {
    const token = useAuthStore.getState().token;
    if (!token || !query.trim()) return;

    try {
      set({
        isLoadingSearch: true,
        error: null,
        searchQuery: query,
      });

      const spotifyApi = createSpotifyApi(token);
      const results = await spotifyApi.search(
        query,
        ["track", "artist", "album", "playlist"],
        10
      ); // Limit to 10 results per type

      set({
        searchResults: results,
        isLoadingSearch: false,
      });
    } catch (error) {
      console.error("Error searching:", error);
      set({
        error: "Search failed",
        isLoadingSearch: false,
      });
    }
  },

  clearSearchResults: () => {
    set({
      searchResults: {},
      searchQuery: "",
    });
  },
}));

export default useContentStore;
