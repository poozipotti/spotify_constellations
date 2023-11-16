import React, { PropsWithChildren } from "react";
import { SpotifyTree } from "./SpotifyTree";
import { Loader } from "./Core/Loader";
import { SearchSong } from "./SongSelector/SearchSong";
import { QueryClient, QueryClientProvider } from "react-query";
import { SpotifyProvider } from "./Spotify";
import { SpotifyPlayerProvider } from "./SpotifyPlayback";
import {SpotifyPlayer} from "./SpotifyPlayback/SpotifyPlayer";
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SpotifyProvider>
        <SpotifyPlayerProvider>
          <div className="w-screen h-screen overflow-hidden text-foreground bg-background">
            <div className="h-1/2"></div>
            <div className="h-1/2 flex flex-col justify-center">
              <SpotifyPlayer />
              <SearchSong />
            </div>
          </div>
        </SpotifyPlayerProvider>
      </SpotifyProvider>
    </QueryClientProvider>
  );
};
export default App;
