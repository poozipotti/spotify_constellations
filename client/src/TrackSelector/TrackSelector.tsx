import React from "react";
import { SearchTray } from "@app/TrackSelector/SearchTray";
import * as TrackSelectorTabs from "./TrackSelectorTabs";
import { useGetHistorySyncStatus } from "@app/HistoryPlaylist/historyPlaylistHooks";

export const TrackSelector: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isCurrentlyPlayingHistoryPlaylist } = useGetHistorySyncStatus();
  if (!isCurrentlyPlayingHistoryPlaylist) {
    return null;
  }
  return (
    <SearchTray isOpen={isOpen} setIsOpen={setIsOpen}>
      <TrackSelectorTabs.SearchAllTracks
        onSuccess={() => {
          setIsOpen(false);
        }}
      />
    </SearchTray>
  );
};
