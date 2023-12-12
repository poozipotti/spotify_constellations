import React from "react";
import { SearchSong } from "./SongSelector/SearchSong";
import { QueryClient, QueryClientProvider } from "react-query";
import { SpotifyProvider, useSpotifyToken } from "./Spotify";
import { SpotifyPlayerProvider } from "./SpotifyPlayback";
import { CurrentSongNode } from "./SpotifyTree/CurrentSongNode";
import { ReactQueryDevtools } from "react-query/devtools";
import {Button} from "./Core/Button";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [appEnabled, setAppEnabled] = React.useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <SpotifyProvider enabled={appEnabled}>
        <SpotifyPlayerProvider>
          <div
            className="grid w-screen h-screen overflow-hidden text-foreground bg-background pt-6"
            style={{ gridTemplateRows: "min-content 1fr" }}
          >
            <AppBody appEnabled={appEnabled} setAppEnabled={setAppEnabled} />
          </div>
        </SpotifyPlayerProvider>
      </SpotifyProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
const AppBody: React.FC<{
  appEnabled: boolean;
  setAppEnabled: (newAppEnabled: boolean) => void;
}> = ({ appEnabled, setAppEnabled }) => {
  const token = useSpotifyToken();
  return appEnabled || !!token ? (
    <>
      <div>
        <CurrentSongNode />
      </div>
      <div
        className="flex flex-col justify-end self-end max-w-screen-lg mx-auto"
        style={{ height: "calc(100vh - 300px)" }}
      >
        <SearchSong />
      </div>
    </>
  ) : (
    <EnableAppButton
      onClick={() => {
        setAppEnabled(true);
      }}
    />
  );
};
const EnableAppButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return <Button onClick={onClick}>enable</Button>;
};
export default App;
