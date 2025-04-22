import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, Play, Pause } from "lucide-react";
import usePlayerStore from "../../store/playerStore";
import createSpotifyApi from "../../services/spotifyApi";
import useAuthStore from "../../store/authStore";
import TrackItem from "../ui/TrackItem";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import { getImageUrl } from "../../utils/spotify";
import useContentStore from "../../store/contentStore";

const Artist: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const token = useAuthStore((state) => state.token);
  const { artistAlbums, fetchArtistAlbums } = useContentStore();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, togglePlay, setQueue } =
    usePlayerStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!token || !artistId) return;

      try {
        setIsLoading(true);
        setError(null);

        const spotifyApi = createSpotifyApi(token);

        // Fetch artist details, top tracks, and albums concurrently
        const [artistData, topTracksData] = await Promise.all([
          spotifyApi.getArtist(artistId),
          spotifyApi.getArtistTopTracks(artistId),
        ]);

        setArtist(artistData);
        setTopTracks(topTracksData.tracks);
        setQueue(topTracksData.tracks);

        // Fetch artist albums using the content store
        fetchArtistAlbums(artistId);
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Failed to load artist data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId, token, fetchArtistAlbums, setQueue]);

  const handlePlayPause = () => {
    if (topTracks.length === 0) return;

    if (currentTrack && isPlaying && currentTrack.id === topTracks[0].id) {
      togglePlay();
    } else {
      playTrack(topTracks[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <p className="text-gray-400">
          {error || "The artist you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Artist Header */}
      <div className="relative h-96 mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black">
          {artist.images && artist.images.length > 0 && (
            <img
              src={getImageUrl(artist.images, "")}
              alt={artist.name}
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>

        <div className="absolute bottom-0 left-0 p-8">
          <div className="flex items-center gap-4">
            <h1 className="text-6xl font-bold">{artist.name}</h1>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <span>{artist?.followers?.total.toLocaleString()} followers</span>
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
            topTracks.length > 0 &&
            currentTrack.id === topTracks[0].id ? (
              <Pause size={28} />
            ) : (
              <Play size={28} className="ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Popular Tracks Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Popular</h2>

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

          {topTracks.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-lg mb-2">No tracks available</p>
              <p>This artist doesn\'t have any tracks yet</p>
            </div>
          ) : (
            <div>
              {topTracks.map((track, index) => (
                <TrackItem key={track.id} track={track} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Albums Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Albums</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {artistAlbums.map((album) => (
            <Link
              to={`/album/${album.id}`}
              key={album.id}
              className="group flex flex-col bg-gray-900 hover:bg-gray-800 p-4 rounded-md transition-all duration-300"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-md shadow-lg">
                {album.images && album.images.length > 0 ? (
                  <img
                    src={getImageUrl(album.images, "")}
                    alt={album.name}
                    className="w-full h-full object-cover transition-all group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                    Album
                  </div>
                )}

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="bg-green-500 rounded-full p-3 text-black shadow-lg hover:scale-105 transition-transform"
                    aria-label="Play album"
                  >
                    <Play size={24} className="ml-1" />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-bold truncate">{album.name}</h3>
              <p className="text-gray-400 text-sm">
                {album?.release_date?.split("-")[0]} • Album
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Artist;
