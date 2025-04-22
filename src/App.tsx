import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import Home from "./components/pages/Home";
import Search from "./components/pages/Search";
import Playlist from "./components/pages/Playlist";
import Library from "./components/pages/Library";
import Artist from "./components/pages/Artists";
import Album from "./components/pages/Album";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="playlist/:playlistId" element={<Playlist />} />
          <Route path="album/:albumId" element={<Album />} />
          <Route path="artists/:artistId" element={<Artist />} />
          <Route path="library" element={<Library />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
