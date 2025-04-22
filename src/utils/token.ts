import useAuthStore from "../store/authStore";

export const refreshAccessToken = async (): Promise<{
  access_token: string | null;
  refresh_token: string | null;
} | null> => {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

  const codeVerifier = localStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) {
    console.error("Code verifier not found");
    return null;
  }

  try {
    const refreshToken = useAuthStore.getState().refreshToken;
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        // refresh_token: codeVerifier,
        refresh_token: refreshToken!,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh access token:", response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("access Token  refresh", data);
    return {
      access_token: data.access_token || null,
      refresh_token: data.refresh_token || null,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};
