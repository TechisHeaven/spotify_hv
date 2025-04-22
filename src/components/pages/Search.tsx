import React, { useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import useContentStore from "../../store/contentStore";
import PlaylistCard from "../ui/PlaylistCard";
import TrackItem from "../ui/TrackItem";
import usePlayerStore from "../../store/playerStore";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Link } from "react-router-dom";

const Search: React.FC = () => {
  const { searchResults, searchQuery, isLoadingSearch } = useContentStore();

  const { setQueue } = usePlayerStore();

  useEffect(() => {
    if (searchResults.tracks?.items?.length) {
      setQueue(searchResults.tracks.items);
    }
  }, [searchResults, searchQuery, setQueue]);

  // Determine if we have search results
  const hasResults =
    searchResults.tracks?.items?.length ||
    searchResults.artists?.items?.length ||
    searchResults.albums?.items?.length ||
    searchResults.playlists?.items?.length;

  return (
    <div className="pb-8">
      {isLoadingSearch ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {searchQuery && !hasResults ? (
            <div className="flex flex-col items-center justify-center py-20">
              <SearchIcon size={64} className="text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                No results found for "{searchQuery}"
              </h2>
              <p className="text-gray-400">Please try another search.</p>
            </div>
          ) : searchQuery && hasResults ? (
            // Search results view
            <div>
              {searchResults?.tracks &&
                searchResults?.tracks?.items?.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-6">Songs</h2>
                    <div className="bg-gray-900/40 backdrop-blur-sm rounded-md overflow-hidden">
                      {searchResults.tracks.items
                        .slice(0, 5)
                        .map((track, index) => (
                          <TrackItem
                            key={track.id}
                            track={track}
                            index={index}
                          />
                        ))}
                    </div>
                  </section>
                )}

              {searchResults?.artists &&
                searchResults.artists?.items?.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-6">Artists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {searchResults.artists.items.slice(0, 6).map((artist) => (
                        <Link
                          to={`/artists/${artist.id}`}
                          key={artist.id}
                          className="group"
                        >
                          <div className="relative aspect-square mb-3 overflow-hidden rounded-full shadow-lg">
                            {artist.images && artist.images.length > 0 ? (
                              <img
                                src={artist.images[0].url}
                                alt={artist.name}
                                className="w-full h-full object-cover transition-all group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                <span className="text-5xl font-bold">
                                  {artist.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-bold truncate text-center">
                            {artist.name}
                          </h3>
                          <p className="text-gray-400 text-sm text-center">
                            Artist
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {searchResults?.playlists &&
                searchResults.playlists?.items?.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-6">Playlists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {searchResults.playlists?.items
                        .filter((playlist) => playlist !== null)
                        .slice(0, 6)
                        .map((playlist) => (
                          <PlaylistCard
                            key={playlist?.id}
                            playlist={playlist}
                          />
                        ))}
                    </div>
                  </section>
                )}

              {searchResults?.albums &&
                searchResults.albums?.items?.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold mb-6">Albums</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {searchResults.albums.items.slice(0, 6).map((album) => (
                        <Link
                          to={`/album/${album.id}`}
                          key={album.id}
                          className="group flex flex-col bg-gray-900 hover:bg-gray-800 p-4 rounded-md transition-all duration-300"
                        >
                          <div className="relative aspect-square mb-3 overflow-hidden rounded-md shadow-lg">
                            {album.images && album.images.length > 0 ? (
                              <img
                                src={album.images[0].url}
                                alt={album.name}
                                className="w-full h-full object-cover transition-all group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                Album
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-bold truncate">
                            {album.name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {(album.artists ?? [])
                              .map((artist) => artist.name)
                              .join(", ")}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
            </div>
          ) : (
            // Default browse view (no search performed yet)
            <div>
              <h1 className="text-3xl font-bold mb-6">Browse all</h1>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
