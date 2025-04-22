import axios from "axios";
import createSpotifyApi from "../services/spotifyApi";
import useAuthStore from "../store/authStore";

const SAAVN_API_URL = "https://saavn.dev/api";

export const fetchSongDetails = async (SpotifySongId: string) => {
  try {
    const token = useAuthStore.getState().token;
    // Step 1: Fetch Saavn song ID using Spotify song ID
    if (!token) return null;

    let saavnSongId = SpotifySongId;
    if (SpotifySongId.length !== 22) {
      // If the SpotifySongId is not a Spotify ID, assume it's already a Saavn ID
      saavnSongId = SpotifySongId;
    } else {
      const api = await createSpotifyApi(token!);
      const sptofyResponse = await api.getTrack(SpotifySongId);

      if (!sptofyResponse) {
        throw new Error("Failed to fetch Saavn song ID");
      }

      saavnSongId = sptofyResponse.id;
    }
    // Step 2: Fetch Saavn song details using Saavn song ID
    const songDetailsResponse = await axios.get(
      `${SAAVN_API_URL}/songs/${saavnSongId}`
    );

    if (songDetailsResponse.data.success) {
      return songDetailsResponse.data.data[0];
    }
    throw new Error("Failed to fetch Saavn song details");
  } catch (error) {
    console.error("Error fetching song details:", error);
    throw error;
  }
};
