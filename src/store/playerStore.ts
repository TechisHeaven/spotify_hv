import { create } from "zustand";
import { SpotifyTrack } from "../types/spotify";
import { fetchSongDetails } from "../utils/savan";

interface PlayerState {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  audio: HTMLAudioElement | null;
  queue: SpotifyTrack[];
  playbackError: string | null;
  isLoading: boolean; // New state
  isLoadingId: string | null;
  // Actions
  setTrack: (track: SpotifyTrack) => void;
  playTrack: (track: SpotifyTrack) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (position: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setQueue: (tracks: SpotifyTrack[]) => void;
  addToQueue: (track: SpotifyTrack) => void;
}

const usePlayerStore = create<PlayerState>((set, get) => {
  const savedTrack = JSON.parse(localStorage.getItem("currentTrack") || "null");
  const savedVolume = Number(localStorage.getItem("playerVolume")) || 0.7;

  let initialAudio: HTMLAudioElement | null = null;

  if (savedTrack && savedTrack.preview_url) {
    initialAudio = new Audio(savedTrack.preview_url);
    initialAudio.volume = savedVolume;

    // Set up event listeners for the audio instance
    initialAudio.addEventListener("timeupdate", () => {
      set({
        progress: initialAudio!.currentTime * 1000,
        duration: initialAudio!.duration * 1000,
      });
    });

    initialAudio.addEventListener("ended", () => {
      set({ isPlaying: false });
      const { nextTrack } = get();
      nextTrack();
    });

    initialAudio.addEventListener("error", () => {
      set({ playbackError: "Error playing this track", isPlaying: false });
    });
  }
  return {
    currentTrack: savedTrack, // Initialize from localStorage
    isPlaying: false,
    volume: savedVolume || 0.7,
    progress: 0,
    duration: 0,
    audio: initialAudio,
    queue: [],
    playbackError: null,
    isLoading: false,
    isLoadingId: null,

    setTrack: (track) => {
      const { audio } = get();

      // Set loading state
      set({ isLoading: true, isLoadingId: track.id });

      // Clean up existing audio instance
      if (audio) {
        audio.pause();
        audio.removeEventListener("timeupdate", () => {});
        audio.removeEventListener("ended", () => {});
        audio.removeEventListener("error", () => {});
      }

      // If no preview URL is available
      if (!track.preview_url) {
        set({
          currentTrack: track,
          isPlaying: false,
          playbackError: "No preview available for this track",
          audio: null,
          isLoading: false,
          isLoadingId: null,
        });
        return;
      }

      // Create new audio instance
      const newAudio = new Audio(track.preview_url);
      newAudio.volume = get().volume;

      // Set up event listeners
      newAudio.addEventListener("timeupdate", () => {
        set({
          progress: newAudio.currentTime * 1000,
          duration: newAudio.duration * 1000,
        });
      });

      newAudio.addEventListener("ended", () => {
        set({ isPlaying: false });
        get().nextTrack();
      });

      newAudio.addEventListener("error", () => {
        set({ playbackError: "Error playing this track", isPlaying: false });
      });

      // Set the state
      set({
        currentTrack: track,
        audio: newAudio,
        isPlaying: false,
        playbackError: null,
        isLoading: false,
        isLoadingId: null,
      });
    },

    playTrack: async (track) => {
      try {
        // Save the current track to localStorage

        // Set loading state
        set({ isLoading: true, isLoadingId: track.id });

        const songDetails = await fetchSongDetails(track.id);
        const downloadUrl = songDetails.downloadUrl.find(
          (url: { quality: string }) =>
            url.quality === "160kbps" || url.quality === "96kbps"
        )?.url;

        if (!downloadUrl) {
          set({
            playbackError: "No download URL available for this track",
            isLoading: false,
            isLoadingId: null,
          });
          return;
        }

        const { audio } = get();

        // Clean up existing audio instance
        if (audio) {
          audio.pause();
          audio.removeEventListener("timeupdate", () => {});
          audio.removeEventListener("ended", () => {});
          audio.removeEventListener("error", () => {});
        }

        // Create new audio instance
        const newAudio = new Audio(downloadUrl);
        newAudio.volume = get().volume;
        localStorage.setItem(
          "currentTrack",
          JSON.stringify({
            ...track,
            preview_url: downloadUrl,
            artists: track.artists || songDetails.more_info.primary_artists,
            image:
              track?.album?.images && track?.album?.images?.length > 0
                ? track?.album?.images[0].url || null
                : null,
            // id: songDetails.id,
          })
        );

        // Set up event listeners
        newAudio.addEventListener("timeupdate", () => {
          set({
            progress: newAudio.currentTime * 1000,
            duration: newAudio.duration * 1000,
          });
        });

        newAudio.addEventListener("ended", () => {
          set({ isPlaying: false });
          get().nextTrack();
        });

        newAudio.addEventListener("error", () => {
          set({ playbackError: "Error playing this track", isPlaying: false });
        });

        // Set the state
        set({
          currentTrack: track,
          audio: newAudio,
          isPlaying: false,
          playbackError: null,
          isLoading: false,
          isLoadingId: null,
        });

        // Play the track
        newAudio
          .play()
          .then(() => set({ isPlaying: true }))
          .catch(() => set({ playbackError: "Error playing this track" }));
      } catch (error) {
        set({
          playbackError: "Failed to fetch song details" + error,
          isLoading: false,
          isLoadingId: null,
        });
      }
    },

    togglePlay: () => {
      const { audio, isPlaying } = get();
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio
          .play()
          .then(() => set({ isPlaying: true }))
          .catch(() => set({ playbackError: "Error playing this track" }));
      }
    },

    seekTo: (position) => {
      const { audio } = get();
      if (audio) {
        audio.currentTime = position / 1000;
        set({ progress: position });
      }
    },

    setVolume: (volume) => {
      const { audio } = get();
      if (audio) {
        audio.volume = volume;
      }
      set({ volume });
      // Save volume to localStorage
      localStorage.setItem("playerVolume", volume.toString());
    },

    nextTrack: () => {
      const { currentTrack, queue } = get();

      if (queue.length === 0) return;

      if (!currentTrack) {
        get().playTrack(queue[0]);
        return;
      }

      const currentIndex = queue.findIndex(
        (track) => track.id === currentTrack.id
      );

      if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        get().playTrack(queue[currentIndex + 1]);
      } else if (queue.length > 0) {
        // Loop back to the first track
        get().playTrack(queue[0]);
      }
    },

    previousTrack: () => {
      const { currentTrack, queue, progress } = get();

      // If we're more than 3 seconds into the track, restart it
      if (progress > 3000) {
        get().seekTo(0);
        return;
      }

      if (queue.length === 0 || !currentTrack) return;

      const currentIndex = queue.findIndex(
        (track) => track.id === currentTrack.id
      );

      if (currentIndex > 0) {
        get().playTrack(queue[currentIndex - 1]);
      } else if (queue.length > 0) {
        // Loop to the last track
        get().playTrack(queue[queue.length - 1]);
      }
    },

    setQueue: (tracks) => {
      set({ queue: tracks });
    },

    addToQueue: (track) => {
      set((state) => ({ queue: [...state.queue, track] }));
    },
  };
});

export default usePlayerStore;
