import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Repeat,
  Shuffle,
  Download,
  Music,
} from "lucide-react";
import usePlayerStore from "../../store/playerStore";
import { getImageUrl } from "../../utils/spotify";
import Button from "../ui/Button";

const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
    playbackError,
  } = usePlayerStore();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume === 0 ? 0.5 : prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (ms: number) => {
    if (isNaN(ms)) return "0:00";

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;

    const percentage = offsetX / width;
    const newProgress = percentage * duration;

    seekTo(newProgress);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width;

    // Keep the progress within 0-100%
    const percentage = Math.min(Math.max(offsetX / width, 0), 1);
    const newProgress = percentage * duration;

    seekTo(newProgress);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener(
        "mousemove",
        handleDrag as unknown as EventListener
      );
      document.addEventListener("mouseup", handleDragEnd);

      return () => {
        document.removeEventListener(
          "mousemove",
          handleDrag as unknown as EventListener
        );
        document.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging]);
  const handleDownload = async () => {
    if (currentTrack?.preview_url) {
      try {
        const response = await fetch(currentTrack.preview_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentTrack.name}.mp3`; // Set the default file name
        document.body.appendChild(link); // Append to the DOM
        link.click();
        document.body.removeChild(link); // Remove after triggering download
        window.URL.revokeObjectURL(url); // Clean up the object URL
      } catch (error) {
        console.error("Error downloading the file:", error);
        alert("Failed to download the track.");
      }
    } else {
      alert("No download URL available for this track.");
    }
  };

  if (!currentTrack) {
    return (
      <div className="bg-gray-900 border-t border-gray-800 w-full h-20 px-4 flex items-center justify-between">
        <div className="text-gray-500 text-sm">Select a track to play</div>
      </div>
    );
  }

  const progressPercentage = (progress / duration) * 100 || 0;

  return (
    <div className="bg-gray-900 border-t border-gray-800 w-full h-24 px-4 flex items-center justify-between">
      {/* Track info */}
      <div className="flex items-center w-1/4">
        <div className="w-14 h-14 mr-3 flex-shrink-0">
          {currentTrack?.album?.images &&
          currentTrack?.album?.images?.length > 0 ? (
            <img
              src={getImageUrl(currentTrack.album.images, "")}
              alt={currentTrack.album.name}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-sm">
              <Music />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-white font-medium truncate">
            {currentTrack.name}
          </div>
          <div className="text-gray-400 text-sm truncate">
            {currentTrack.artists.map((artist) => artist.name).join(", ")}
          </div>
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <Button variant="icon" onClick={handleDownload}>
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* Player controls */}
      <div className="flex flex-col items-center justify-center w-2/4">
        <div className="flex items-center justify-center mb-2">
          <Button variant="icon" className="mx-2">
            <Shuffle size={18} className="text-gray-400" />
          </Button>

          <Button variant="icon" className="mx-2" onClick={previousTrack}>
            <SkipBack size={18} className="text-white" />
          </Button>

          <Button
            variant="icon"
            className="mx-2 bg-white rounded-full p-2 hover:scale-105 text-black hover:bg-white transition-transform"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </Button>

          <Button variant="icon" className="mx-2" onClick={nextTrack}>
            <SkipForward size={18} className="text-white" />
          </Button>

          <Button variant="icon" className="mx-2">
            <Repeat size={18} className="text-gray-400" />
          </Button>
        </div>

        <div className="flex items-center w-full px-4">
          <span className="text-xs text-gray-400 w-10 text-right">
            {formatTime(progress)}
          </span>

          <div
            ref={progressBarRef}
            className="flex-grow mx-2 h-1 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleProgressBarClick}
          >
            <div
              className="h-full bg-gray-400 hover:bg-green-500 rounded-full transition-colors"
              style={{ width: `${progressPercentage}%` }}
            ></div>

            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
              style={{ left: `${progressPercentage}%` }}
              onMouseDown={handleDragStart}
            ></div>
          </div>

          <span className="text-xs text-gray-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {playbackError && (
          <div className="text-red-500 text-xs mt-1">{playbackError}</div>
        )}
      </div>

      {/* Volume controls */}
      <div className="flex items-center justify-end w-1/4">
        <Button variant="icon" onClick={toggleMute}>
          {isMuted || volume === 0 ? (
            <VolumeX size={18} />
          ) : volume < 0.5 ? (
            <Volume1 size={18} />
          ) : (
            <Volume2 size={18} />
          )}
        </Button>

        <div className="w-24">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
