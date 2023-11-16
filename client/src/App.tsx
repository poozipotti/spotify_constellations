import React, { PropsWithChildren } from "react";
import { SpotifyTree } from "./SpotifyTree";
import { Loader } from "./Core/Loader";
import { SearchSong } from "./SongSelector/SearchSong";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen overflow-hidden text-foreground bg-background">
        <div className="h-1/2">

        </div>
        <div className="h-1/2">

        <SearchSong />
        </div>
      </div>
    </QueryClientProvider>
  );
};
export default App;
