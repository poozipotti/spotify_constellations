import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SpotifyProvider } from "@app/Spotify/SpotifyProvider";
import { Button } from "./Core/Button";
import { SpotifyConstellationGraph } from "./SpotifyConstellationGraph";
import {HistoryPlaylistStatus} from "@app/HistoryPlaylist/HistoryPlaylistStatus.tsx";
import {TrackSelector} from "@app/TrackSelector";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [appEnabled, setAppEnabled] = React.useState(false);

  return (
    <div
      className="grid w-screen h-screen overflow-hidden text-foreground bg-background pt-6"
      style={{ gridTemplateRows: "min-content 1fr" }}
    >
      <QueryClientProvider client={queryClient}>
        {!appEnabled ? (
          <EnableAppButton
            onClick={() => {
              setAppEnabled(true);
            }}
          />
        ) : (
          <SpotifyProvider>
            <div className="flex flex-col gap-8">
              <HistoryPlaylistStatus />
              <SpotifyConstellationGraph />
            </div>
            <div className="flex flex-col justify-end self-end max-w-screen-lg mx-auto">
              <TrackSelector />
            </div>
          </SpotifyProvider>
        )}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  );
};
const EnableAppButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return <Button onClick={onClick}>enable</Button>;
};
export default App;
