import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SpotifyUser } from "../types/spotify";
import createSpotifyApi from "../services/spotifyApi";
import {
  exchangeCodeForToken,
  getAuthUrl,
  getTokenFromUrl,
} from "../utils/spotify";
import { refreshAccessToken } from "../utils/token";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: SpotifyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<boolean>;
  login: () => void;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  refreshTokenFn: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        set({ isLoading: true });

        // Check for token in URL (after redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          try {
            // Exchange the code for an access token
            const token = await exchangeCodeForToken(code);

            if (token) {
              // Save the token and mark the user as authenticated
              set({
                token: token.access_token,
                refreshToken: token.refresh_token,
                isAuthenticated: true,
                isLoading: false,
              });

              // Fetch user profile
              get().fetchUserProfile();

              // Clear the code from the URL
              window.history.replaceState({}, document.title, "/");
              return true;
            } else {
              set({ isAuthenticated: false, isLoading: false });
              return false;
            }
          } catch (error) {
            console.error("Error exchanging code for token:", error);
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }
        }

        // Check for token in store
        const storedToken = get().token;

        if (storedToken) {
          set({ isAuthenticated: true, isLoading: false });
          get().fetchUserProfile();
          return true;
        }

        set({ isAuthenticated: false, isLoading: false });
        return false;
        // const { access_token, refresh_token } = getTokenFromUrl();
        // if (access_token && refresh_token) {
        //   // Remove token from URL
        //   window.location.hash = "";

        //   // Save token
        //   set({
        //     token: access_token,
        //     refreshToken: refresh_token,
        //     isAuthenticated: true,
        //     isLoading: false,
        //   });

        //   // Fetch user data
        //   get().fetchUserProfile();
        //   return true;
        // } else {
        //   // Check for token in store
        //   const storedToken = get().token;

        //   if (storedToken) {
        //     set({ isAuthenticated: true, isLoading: false });
        //     get().fetchUserProfile();
        //     return true;
        //   }

        //   set({ isAuthenticated: false, isLoading: false });
        //   return false;
        // }
      },

      login: async () => {
        try {
          const authUrl = await getAuthUrl(); // Await the resolved URL
          window.location.href = authUrl; // Redirect to the resolved URL
        } catch (error) {
          console.error("Error generating auth URL:", error);
          set({
            isAuthenticated: false,
            isLoading: false,
            error: "Failed to generate auth URL " + error,
          });
        }
        // Redirect to Spotify auth
        // window.location.href = import.meta.env.VITE_AUTH_URL || getAuthUrl();
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem("spotify-auth"); // Clear the persisted state
        localStorage.removeItem("spotify_code_verifier"); // Clear the persisted state
      },

      fetchUserProfile: async () => {
        try {
          const token = get().token;

          if (!token) {
            set({ error: "No authentication token found" });
            return;
          }

          const spotifyApi = createSpotifyApi(token);
          const user = await spotifyApi.getCurrentUser();

          if (user) {
            set({ user, error: null });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          set({
            error: "Failed to fetch user profile",
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
      refreshTokenFn: async () => {
        try {
          const token = await refreshAccessToken();

          if (token) {
            set({
              token: token.access_token,
              refreshToken: token.refresh_token,
              isAuthenticated: true,
            });
          } else {
            set({
              error: "Failed to refresh token",
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          set({
            error: "Failed to refresh token",
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "spotify-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
