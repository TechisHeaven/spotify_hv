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

        try {
          // Check for code in URL
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");

          if (code) {
            // Exchange code for tokens
            const token = await exchangeCodeForToken(code);

            if (token) {
              set({
                token: token.access_token,
                refreshToken: token.refresh_token,
                isAuthenticated: true,
                isLoading: false,
              });

              // Fetch user profile
              await get().fetchUserProfile();

              // Clear the code from the URL
              window.history.replaceState({}, document.title, "/");
              return true;
            } else {
              set({
                error: "Failed to exchange code for tokens",
                isAuthenticated: false,
                isLoading: false,
              });
              window.history.replaceState({}, document.title, "/");
              throw new Error("Failed to exchange code for tokens");
            }
          }

          // Check for token in store
          const storedToken = get().token;

          if (storedToken) {
            // Validate the token
            const spotifyApi = createSpotifyApi(storedToken);
            const response = await spotifyApi.getCurrentUser();

            if (response) {
              set({ isAuthenticated: true, isLoading: false });
              return true;
            } else {
              set({ isAuthenticated: false, isLoading: false });
              throw new Error("Token validation failed");
            }
          }

          // No valid token found
          set({ isAuthenticated: false, isLoading: false });
          return false;
        } catch (error) {
          console.error("Error during authentication check:", error);

          // Attempt to refresh the token if possible
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            try {
              const refreshedToken = await refreshAccessToken();
              if (refreshedToken?.access_token) {
                set({
                  token: refreshedToken.access_token,
                  refreshToken: refreshedToken.refresh_token,
                  isAuthenticated: true,
                  isLoading: false,
                });

                // Fetch user profile
                await get().fetchUserProfile();
                return true;
              }
            } catch (refreshError) {
              set({ isAuthenticated: false, isLoading: false });
              console.error("Error refreshing token:", refreshError);
            }
          }

          // If all else fails, log the user out
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }
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
