import useAuthStore from "../store/authStore";
import { generateCodeChallenge, generateCodeVerifier } from "./code";

// Authorization constants for Spotify API
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || window.location.origin;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-top-read",
  "user-read-recently-played",
];

export const getAuthUrl = async (): Promise<string> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Save the code_verifier in localStorage for later use
  if (!localStorage.getItem("spotify_code_verifier")) {
    localStorage.setItem("spotify_code_verifier", codeVerifier);
  }

  // return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join(
  //   "%20"
  // )}`;
  return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&code_challenge_method=S256&code_challenge=${codeChallenge}&scope=${SCOPES.join(
    "%20"
  )}`;
};

export const exchangeCodeForToken = async (
  code: string
): Promise<{
  access_token: string | null;
  refresh_token: string | null;
} | null> => {
  const token = useAuthStore.getState().token;
  if (token) return null;

  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
  const REDIRECT_URI =
    import.meta.env.VITE_REDIRECT_URI || window.location.origin;
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

  const codeVerifier = localStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) {
    console.error("Code verifier not found");
    return null;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error(
        "Failed to exchange code for token:",
        response.statusText,
        JSON.stringify(data)
      );
      throw Error(
        "Failed to exchange code" + response.statusText + JSON.stringify(data)
      );
    }

    const data = await response.json();
    return {
      access_token: data.access_token || null,
      refresh_token: data.refresh_token || null,
    };
  } catch (error) {
    console.error("Error exchanging code for token:", error);

    throw Error("Error to exchange code" + error);
  }
};

export const getTokenFromUrl = (): {
  access_token: string | null;
  refresh_token: string | null;
} => {
  const hash = window.location.hash;
  if (!hash) return { access_token: null, refresh_token: null };

  const stringAfterHash = hash.substring(1);
  const params = stringAfterHash.split("&");

  const accessTokenParam = params.find((param) =>
    param.startsWith("access_token=")
  );
  const refreshTokenParam = params.find((param) =>
    param.startsWith("refresh_token=")
  );

  const access_token = accessTokenParam ? accessTokenParam.split("=")[1] : null;
  const refresh_token = refreshTokenParam
    ? refreshTokenParam.split("=")[1]
    : null;

  return { access_token, refresh_token };
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getImageUrl = (
  images: { url: string }[] | undefined,
  fallback: string
): string => {
  if (!images || images.length === 0) return fallback;
  return images[0].url;
};
