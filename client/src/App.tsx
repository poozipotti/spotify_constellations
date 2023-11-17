import React, { PropsWithChildren } from "react";
import { SpotifyTree } from "./SpotifyTree";
import { Loader } from "./Core/Loader";
import { SearchSong } from "./SongSelector/SearchSong";
import { QueryClient, QueryClientProvider } from "react-query";
import { SpotifyProvider } from "./Spotify";
import { SpotifyPlayerProvider } from "./SpotifyPlayback";
import { CurrentSongNode } from "./SpotifyTree/CurrentSongNode";
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SpotifyProvider>
        <SpotifyPlayerProvider>
          <div
            className="grid w-screen h-screen overflow-hidden text-foreground bg-background pt-6"
            style={{ gridTemplateRows: "min-content 1fr" }}
          >
            <div>
              <CurrentSongNode />
            </div>
            <div
              className="flex flex-col justify-end self-end max-w-screen-lg mx-auto"
              style={{ height: "calc(100vh - 300px)" }}
            >
              <SearchSong />
            </div>
          </div>
        </SpotifyPlayerProvider>
      </SpotifyProvider>
    </QueryClientProvider>
  );
};
export default App;
