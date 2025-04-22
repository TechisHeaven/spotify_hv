import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Menu } from "lucide-react";
import useContentStore from "../../store/contentStore";
import LoadingSpinner from "../ui/LoadingSpinner";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { userPlaylists, isLoadingPlaylists, fetchUserPlaylists } =
    useContentStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    flex items-center px-4 py-2 my-1 font-medium rounded-md transition-colors
    ${
      isActive(path)
        ? "bg-gray-800 text-white"
        : "text-gray-400 hover:text-white"
    }
  `;

  return (
    <>
      {/* Toggle button - visible only on mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-md"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`
          bg-black w-60 h-full overflow-y-auto pb-24 fixed top-0 left-0 z-40 transition-transform
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:flex-shrink-0
        `}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            {/* Your SVG logo here */}
            <svg
              viewBox="0 0 63 20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMin meet"
              className="w-[130px] text-white"
            >
              <g fill="currentColor">
                {/* [SVG PATH DATA OMITTED FOR BREVITY] */}
              </g>
            </svg>
          </div>

          {/* Nav */}
          <div className="mb-8">
            <nav className="space-y-1">
              <Link to="/" className={navLinkClass("/")}>
                <Home className="mr-3" size={20} />
                Home
              </Link>

              <Link to="/search" className={navLinkClass("/search")}>
                <Search className="mr-3" size={20} />
                Search
              </Link>

              <Link to="/library" className={navLinkClass("/library")}>
                <Library className="mr-3" size={20} />
                Your Library
              </Link>
            </nav>
          </div>

          {/* Playlists */}
          <div className="mt-8">
            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-gray-400 font-medium mb-4 px-2">
                Your Playlists
              </h3>

              {isLoadingPlaylists ? (
                <LoadingSpinner size="small" className="my-4" />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userPlaylists.map((playlist) => (
                    <Link
                      key={playlist.id}
                      to={`/playlist/${playlist.id}`}
                      className={`flex items-center px-2 py-2 text-sm rounded-md ${
                        isActive(`/playlist/${playlist.id}`)
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{playlist.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
