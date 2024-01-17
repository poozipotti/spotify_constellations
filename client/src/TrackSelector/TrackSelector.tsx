import React from "react";
import { SearchTray } from "@app/TrackSelector/SearchTray";
import * as TrackSelectorTabs from "./TrackSelectorTabs";

export const TrackSelector: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

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
