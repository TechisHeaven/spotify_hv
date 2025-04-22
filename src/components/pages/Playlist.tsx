import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Clock, Pause } from "lucide-react";
import useContentStore from "../../store/contentStore";
import usePlayerStore from "../../store/playerStore";
import TrackItem from "../ui/TrackItem";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { getImageUrl } from "../../utils/spotify";

const Playlist: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sortOption, setSortOption] = useState<string>("default");

  const {
    currentPlaylist,
    isLoadingMore,
    playlistTracks,
    hasMoreTracks,
    isLoadingPlaylist,
    fetchPlaylist,
  } = useContentStore();
  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } =
    usePlayerStore();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist(playlistId, false, sortOption);
    }
  }, [playlistId, fetchPlaylist, sortOption]);

  useEffect(() => {
    if (playlistTracks.length > 0) {
      setQueue(playlistTracks);
    }
  }, [playlistTracks, setQueue]);

  const handlePlayPause = () => {
    if (playlistTracks.length === 0) return;

    if (currentTrack && isPlaying && currentTrack.id === playlistTracks[0].id) {
      togglePlay();
    } else {
      playTrack(playlistTracks[0]);
    }
  };
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasMoreTracks) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchPlaylist(playlistId!, true); // Load more tracks
    }
  }, [
    fetchPlaylist,
    playlistId,
    isLoadingMore,
    hasMoreTracks,
    containerRef.current,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container?.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, containerRef.current, containerRef]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  if (isLoadingPlaylist) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
        <p className="text-gray-400">
          The playlist you're looking for doesn't exist or is private.
        </p>
      </div>
    );
  }

  // Calculate total duration
  const totalDuration = playlistTracks.reduce(
    (total, track) => total + track.duration_ms,
    0
  );

  const formattedDuration = () => {
    const minutes = Math.floor(totalDuration / 60000);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  };

  return (
    <div
      ref={containerRef}
      className="pb-8  h-[calc(100vh-80px)] overflow-y-scroll"
    >
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
        <div className="w-48 h-48 md:w-60 md:h-60 flex-shrink-0 shadow-lg">
          {currentPlaylist.images && currentPlaylist.images.length > 0 ? (
            <img
              src={getImageUrl(currentPlaylist.images, "")}
              alt={currentPlaylist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-6xl font-bold text-gray-600">
                {currentPlaylist.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="text-center md:text-left">
          <p className="text-sm text-white uppercase font-bold mb-2">
            {currentPlaylist?.public ? "Public" : "Private"} Playlist
          </p>
          <h1 className="text-5xl font-bold mb-4">{currentPlaylist.name}</h1>

          {currentPlaylist.description && (
            <p className="text-gray-400 mb-2">{currentPlaylist.description}</p>
          )}

          <div className="flex items-center text-sm text-gray-400">
            <span className="font-bold text-white">
              {currentPlaylist.owner.display_name}
            </span>
            <span className="mx-1">•</span>
            <span>{playlistTracks.length} songs</span>
            {totalDuration > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>{formattedDuration()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlayPause}
            className="bg-green-500 hover:bg-green-400 text-black rounded-full w-14 h-14 flex items-center justify-center"
          >
            {currentTrack &&
            isPlaying &&
            playlistTracks.length > 0 &&
            currentTrack.id === playlistTracks[0].id ? (
              <Pause size={28} />
            ) : (
              <Play size={28} className="ml-1" />
            )}
          </Button>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="bg-gray-800 text-white rounded-md px-4 py-2"
          >
            <option value="default">Sort by Default</option>
            <option value="latest">Sort by Latest</option>
          </select>
        </div>
      </div>

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

        {playlistTracks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">This playlist is empty</p>
            <p>Add some songs to get started</p>
          </div>
        ) : (
          <div>
            {playlistTracks
              .filter(
                (track) => track.preview_url !== null || track.name !== ""
              )
              .map((track, index) => (
                <TrackItem key={index} track={track} index={index} />
              ))}
            {isLoadingMore && (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="large" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;
