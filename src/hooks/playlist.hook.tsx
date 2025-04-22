import { useInfiniteQuery } from "@tanstack/react-query";
import createSpotifyApi from "../services/spotifyApi";
import useAuthStore from "../store/authStore";

const fetchPlaylistTracks = async ({
  playlistId,
  pageParam = 0,
  sortType = "default",
}: {
  playlistId: string;
  pageParam?: number;
  sortType?: string;
}) => {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No token available");

  const spotifyApi = createSpotifyApi(token);

  const limit = 20;
  const offset = pageParam * limit;

  const response = await spotifyApi.getPlaylistTracks(
    playlistId,
    limit,
    offset
  );

  const tracks = response.items.map((item) => ({
    ...item.track,
    added_at: item.added_at,
  }));

  // Sort tracks based on sortType
  if (sortType === "latest") {
    tracks.sort(
      (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    );
  } else if (sortType === "name") {
    tracks.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === "duration") {
    tracks.sort((a, b) => b.duration_ms - a.duration_ms);
  }

  return {
    tracks,
    nextPage: response.items.length === limit ? pageParam + 1 : undefined,
  };
};

export const usePlaylistTracks = (playlistId: string, sortType: string) => {
  return useInfiniteQuery({
    queryKey: ["playlistTracks", playlistId, sortType],
    queryFn: ({ pageParam = 0 }: { pageParam: number }) =>
      fetchPlaylistTracks({ playlistId, pageParam, sortType }),
    getNextPageParam: (lastPage: { nextPage?: number }) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
