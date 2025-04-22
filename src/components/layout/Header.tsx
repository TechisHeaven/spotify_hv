import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, User } from "lucide-react";
import useAuthStore from "../../store/authStore";
import Button from "../ui/Button";
import useContentStore from "../../store/contentStore";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { searchQuery, search } = useContentStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      search(searchInput);
      if (location.pathname !== "/search") {
        navigate("/search");
      }
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleForwardClick = () => {
    navigate(1);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header
      className={`sticky top-0 z-10 px-8 py-4 flex items-center justify-between transition-colors ${
        isScrolled ? "bg-gray-900/95 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex items-center">
        <div className="flex space-x-2 mr-6">
          <Button
            variant="secondary"
            size="small"
            onClick={handleBackClick}
            className="rounded-full w-8 h-8 flex items-center justify-center p-0"
          >
            <ChevronLeft size={20} />
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={handleForwardClick}
            className="rounded-full w-8 h-8 flex items-center justify-center p-0"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        {location.pathname === "/search" && (
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/10 rounded-full py-3 pl-10 pr-4 text-white w-80 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </form>
        )}
      </div>

      <div className="flex items-center">
        <div className="relative">
          <button
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full w-8 h-8 transition-colors"
            onClick={toggleUserMenu}
          >
            {user?.images && user.images.length > 0 ? (
              <img
                src={user.images[0].url}
                alt={user.display_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} className="text-white" />
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
              <div className="px-4 py-2 text-sm text-white border-b border-gray-700">
                {user?.display_name}
              </div>

              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
