import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Header from "./Header";
import useAuthStore from "../../store/authStore";
import Login from "../pages/Login";
import LoadingSpinner from "../ui/LoadingSpinner";

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const isCheckingAuth = React.useRef(false); // Flag to prevent concurrent calls

  React.useEffect(() => {
    const initializeAuth = async () => {
      if (!isCheckingAuth.current) {
        isCheckingAuth.current = true;
        await checkAuth();
        isCheckingAuth.current = false;
      }
    };

    initializeAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (!isCheckingAuth.current) {
        isCheckingAuth.current = true;
        await checkAuth();
        isCheckingAuth.current = false;
      }
    }, 1000 * 60 * 50); // Every 50 minutes

    return () => clearInterval(interval);
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
          <Header />
          <main className="px-8 pb-24">
            <Outlet />
          </main>
        </div>

        <Player />
      </div>
    </div>
  );
};

export default MainLayout;
