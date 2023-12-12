import React from "react";
import { SearchSong } from "./SongSelector/SearchSong";
import { QueryClient, QueryClientProvider } from "react-query";
import { SpotifyProvider } from "./Spotify";
import { SpotifyPlayerProvider } from "./SpotifyPlayback";
import { CurrentSongNode } from "./SpotifyTree/CurrentSongNode";
import { ReactQueryDevtools } from 'react-query/devtools'

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
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
export default App;
