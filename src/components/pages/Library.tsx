import React, { useCallback, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import useContentStore from "../../store/contentStore";
import usePlayerStore from "../../store/playerStore";
import TrackItem from "../ui/TrackItem";
import LoadingSpinner from "../ui/LoadingSpinner";

const Library: React.FC = () => {
  const {
    savedTracks,
    isLoadingLibrary,
    fetchSavedTracks,
    isLoadingMore,
    hasMoreTracks,
  } = useContentStore();
  const { setQueue } = usePlayerStore();

  useEffect(() => {
    fetchSavedTracks();
  }, [fetchSavedTracks]);

  useEffect(() => {
    if (savedTracks.length > 0) {
      setQueue(savedTracks);
    }
  }, [savedTracks, setQueue]);

  // Calculate total duration
  const totalDuration = savedTracks.reduce(
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

  const containerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasMoreTracks) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchSavedTracks(true, 50); // Load more tracks
    }
  }, [fetchSavedTracks, isLoadingMore, hasMoreTracks, containerRef.current]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container?.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, containerRef.current, containerRef]);

  if (isLoadingLibrary) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pb-8 h-[calc(100vh-80px)] overflow-y-scroll"
    >
      <div className="flex items-center mb-8">
        <div className="w-60 h-60 mr-6 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg viewBox="0 0 20 20" className="w-20 h-20 text-white">
            <path
              fill="currentColor"
              d="M10 3.22l-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z"
            />
          </svg>
        </div>

        <div>
          <p className="text-sm text-white uppercase font-bold mb-2">
            Playlist
          </p>
          <h1 className="text-5xl font-bold mb-4">Liked Songs</h1>

          <div className="flex items-center text-sm text-gray-400">
            <span className="font-bold text-white">Your Library</span>
            <span className="mx-1">•</span>
            <span>{savedTracks.length} songs</span>
            {totalDuration > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>{formattedDuration()}</span>
              </>
            )}
          </div>
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

        {savedTracks.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">No saved tracks found</p>
            <p>Save some songs to your library</p>
          </div>
        ) : (
          <div>
            {savedTracks.map((track, index) => (
              <TrackItem
                key={`${track.id}-${index}`}
                track={track}
                index={index}
              />
            ))}{" "}
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

export default Library;
