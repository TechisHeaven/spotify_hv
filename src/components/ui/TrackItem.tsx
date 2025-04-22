import React from "react";
import { Play, Pause, Music } from "lucide-react";
import { SpotifyTrack } from "../../types/spotify";
import { formatDuration } from "../../utils/spotify";
import usePlayerStore from "../../store/playerStore";
import toast from "react-hot-toast";

interface TrackItemProps {
  track: SpotifyTrack;
  index?: number;
  showAlbum?: boolean;
  showArtist?: boolean;
  addToQueue?: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  showAlbum = true,
  showArtist = true,
}) => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLoading,
    isLoadingId,
  } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = async () => {
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
    <div
      className={`flex items-center px-4 py-2 rounded-md group transition-colors ${
        isCurrentTrack ? "bg-gray-700/40" : "hover:bg-gray-700/40"
      }`}
    >
      <div className="flex items-center w-16 relative">
        {index !== undefined ? (
          <div className="w-8 text-right">
            <span
              className={`text-sm ${
                isCurrentTrack ? "text-green-500" : "text-gray-400"
              }`}
            >
              {index + 1}
            </span>
          </div>
        ) : null}

        <div
          className={`w-8 h-8 ml-2 flex items-center justify-center cursor-pointer relative ${
            isLoading && isLoadingId === track.id ? "cursor-not-allowed" : ""
          }`}
          onClick={handlePlayPause}
        >
          <div
            className={`text-gray-400 group-hover:hidden ${
              isCurrentTrack ? "hidden" : "block"
            }`}
          >
            {!track?.album ? (
              <Music size={16} />
            ) : track?.album?.images && track.album.images.length > 0 ? (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-8 h-8 rounded-sm"
              />
            ) : (
              <Music size={16} />
            )}
          </div>

          <div
            className={`${
              isCurrentTrack && isPlaying ? "block" : "hidden"
            } group-hover:hidden`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="text-green-500"
            >
              <path d="M2 2h4v12H2zm8 0h4v12h-4z" fill="currentColor" />
            </svg>
          </div>

          <div
            className={`hidden group-hover:block ${
              isCurrentTrack && isPlaying ? "hidden" : ""
            }`}
          >
            {isCurrentTrack ? (
              <Pause size={16} className="text-green-500" />
            ) : (
              <Play size={16} className="text-white" />
            )}
          </div>

          {isLoading && isLoadingId === track.id && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-sm">
              <div className="loader border-t-2 border-white w-4 h-4 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-grow min-w-0 ml-3">
        <div className="flex flex-col">
          <span
            className={`truncate font-medium ${
              isCurrentTrack ? "text-green-500" : "text-white"
            }`}
          >
            {track.name}
          </span>

          {showArtist && (
            <span className="text-sm text-gray-400 truncate">
              {track.artists?.map((artist) => artist.name).join(", ")}
            </span>
          )}
        </div>
      </div>

      {showAlbum && (
        <div className="hidden md:block w-1/4 px-4">
          <span className="text-sm text-gray-400 truncate">
            {track.album.name}
          </span>
        </div>
      )}

      {track.duration_ms && (
        <div className="w-16 text-right">
          <span className="text-sm text-gray-400">
            {formatDuration(track.duration_ms)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TrackItem;
