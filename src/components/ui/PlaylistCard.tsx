import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { SpotifyPlaylist } from '../../types/spotify';
import { getImageUrl } from '../../utils/spotify';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  className?: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, className = '' }) => {
  return (
    <Link 
      to={`/playlist/${playlist.id}`} 
      className={`group flex flex-col bg-gray-900 hover:bg-gray-800 p-4 rounded-md transition-all duration-300 ${className}`}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-md shadow-lg">
        {playlist.images && playlist.images.length > 0 ? (
          <img 
            src={getImageUrl(playlist.images, '')} 
            alt={playlist.name}
            className="w-full h-full object-cover transition-all group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Music size={48} className="text-gray-500" />
          </div>
        )}
        
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="bg-green-500 rounded-full p-3 text-black shadow-lg hover:scale-105 transition-transform"
            aria-label="Play playlist"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      
      <h3 className="text-white font-bold truncate">{playlist.name}</h3>
      <p className="text-gray-400 text-sm line-clamp-2 h-10">
        {playlist.description || `By ${playlist.owner.display_name}`}
      </p>
    </Link>
  );
};

export default PlaylistCard;