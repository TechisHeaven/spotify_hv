import React, { useEffect } from "react";
import { Clock, Pause, Play } from "lucide-react";
import useContentStore from "../../store/contentStore";
import usePlayerStore from "../../store/playerStore";
import useAuthStore from "../../store/authStore";
import PlaylistCard from "../ui/PlaylistCard";
import TrackItem from "../ui/TrackItem";
import LoadingSpinner from "../ui/LoadingSpinner";
import { SpotifyTrack } from "../../types/spotify";
import toast from "react-hot-toast";

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const {
    userPlaylists,
    recommendedTracks,
    savedTracks,
    fetchUserPlaylists,
    fetchRecommendations,
    fetchSavedTracks,
    isLoadingPlaylists,
    isLoadingRecommendations,
    isLoadingLibrary,
  } = useContentStore();

  const { setQueue } = usePlayerStore();

  useEffect(() => {
    // Load initial data
    fetchUserPlaylists();
    fetchRecommendations();
    fetchSavedTracks(false, 6);
  }, []);

  useEffect(() => {
    if (recommendedTracks.length > 0) {
      setQueue(recommendedTracks);
    }
  }, [recommendedTracks, setQueue]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLoading,
    isLoadingId,
  } = usePlayerStore();

  const handlePlayPause = async (track: SpotifyTrack) => {
    const isCurrentTrack = currentTrack?.id === track.id;

    if (isLoading) {
      toast.loading("Sabun Thoda Slow hai ruk ruk");
      return;
    } // Disable click when loading
    if (isCurrentTrack) {
      togglePlay();
    } else {
      await playTrack(track);
    }
  };
  return (
    <div className="pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          {getGreeting()}, {user?.display_name}
        </h1>

        {isLoadingLibrary ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {savedTracks.slice(0, 6).map((track, index) => (
              <div
                key={`${track.id}-${index}`}
                className={`flex items-center bg-white/10 hover:bg-white/20 transition-colors rounded-md overflow-hidden cursor-pointer group ${
                  isLoading && isLoadingId === track.id
                    ? "cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handlePlayPause(track)}
              >
                {track.album.images && track.album.images.length > 0 ? (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-800 flex items-center justify-center">
                    <Clock size={24} className="text-gray-500" />
                  </div>
                )}
                <span className="pl-4 font-medium truncate">{track.name}</span>

                <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className={`hidden  p-2 rounded-full group-hover:block ${
                      currentTrack?.id === track.id && isPlaying ? "hidden" : ""
                    }`}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause size={16} className="text-green-500" />
                    ) : (
                      <Play
                        size={16}
                        className={
                          currentTrack?.id === track.id
                            ? "text-green-500"
                            : "text-white"
                        }
                      />
                    )}
                  </div>

                  {isLoading && isLoadingId === track.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-sm">
                      <div className="loader border-t-2 border-white w-4 h-4 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Featured Playlists</h2>

        {isLoadingPlaylists ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {userPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommended for you</h2>

        {isLoadingRecommendations ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 grid grid-cols-5 text-sm text-gray-400">
              <div className="col-span-3 flex items-center">
                <div className="w-8 text-center">#</div>
                <div className="ml-4">TITLE</div>
              </div>
              <div className="hidden md:block">ALBUM</div>
              <div className="text-right">
                <Clock size={16} />
              </div>
            </div>

            <div>
              {recommendedTracks.map((track, index) => (
                <TrackItem key={track.id} track={track} index={index} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
