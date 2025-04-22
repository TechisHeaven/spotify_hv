import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock, Play, Pause } from "lucide-react";
import usePlayerStore from "../../store/playerStore";
import useContentStore from "../../store/contentStore";
import LoadingSpinner from "../ui/LoadingSpinner";
import TrackItem from "../ui/TrackItem";
import Button from "../ui/Button";
import { formatDuration, getImageUrl } from "../../utils/spotify";

const Album: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const {
    albumDetails,
    albumTracks,
    isLoadingAlbumDetails,
    isLoadingAlbumTracks,
    fetchAlbumDetails,
    fetchAlbumTracks,
  } = useContentStore();
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } =
    usePlayerStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId) return;

      try {
        setError(null);
        await Promise.all([
          fetchAlbumDetails(albumId),
          fetchAlbumTracks(albumId),
        ]);
        setQueue(albumTracks); // Set the album tracks in the queue
      } catch (err) {
        console.error("Error fetching album data:", err);
        setError("Failed to load album");
      }
    };

    fetchAlbumData();
  }, [albumId, fetchAlbumDetails, fetchAlbumTracks, setQueue]);

  const handlePlayPause = () => {
    if (albumTracks.length === 0) return;

    if (currentTrack && isPlaying && currentTrack.id === albumTracks[0].id) {
      togglePlay();
    } else {
      playTrack(albumTracks[0]);
    }
  };

  if (isLoadingAlbumDetails || isLoadingAlbumTracks) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !albumDetails) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Album not found</h2>
        <p className="text-gray-400">
          {error || "The album you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  const totalDuration = albumTracks.reduce(
    (total, track) => total + track.duration_ms,
    0
  );

  return (
    <div className="pb-8">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-48 h-48 md:w-60 md:h-60 flex-shrink-0 shadow-lg">
          {albumDetails.images && albumDetails.images.length > 0 ? (
            <img
              src={getImageUrl(albumDetails.images, "")}
              alt={albumDetails.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-600">
                {albumDetails.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm text-white uppercase font-bold mb-2">Album</p>
          <h1 className="text-5xl font-bold mb-4">{albumDetails.name}</h1>

          <div className="flex items-center text-sm text-gray-400">
            <span className="font-bold text-white">
              {albumDetails?.artists?.map((artist) => artist?.name).join(", ")}
            </span>
            <span className="mx-1">•</span>
            <span>{albumDetails?.release_date?.split("-")[0]}</span>
            <span className="mx-1">•</span>
            <span>{albumTracks.length} songs</span>
            <span className="mx-1">•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Play Button */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlayPause}
            className="bg-green-500 hover:bg-green-400 text-black rounded-full w-14 h-14 flex items-center justify-center"
          >
            {currentTrack &&
            isPlaying &&
            albumTracks.length > 0 &&
            currentTrack.id === albumTracks[0].id ? (
              <Pause size={28} />
            ) : (
              <Play size={28} className="ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Tracks Section */}
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

        {albumTracks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">No tracks available</p>
            <p>This album doesn't have any tracks yet</p>
          </div>
        ) : (
          <div>
            {albumTracks.map((track, index) => (
              <TrackItem
                key={track.id}
                track={track}
                index={index}
                showAlbum={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Album;
