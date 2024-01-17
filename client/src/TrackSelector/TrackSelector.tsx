import React from "react";
import { SearchTray } from "@app/TrackSelector/SearchTray";
import * as TrackSelectorTabs from "./TrackSelectorTabs";
import { Tab, TabList, TabPanel, Tabs } from "@core/Tabs";

export const TrackSelector: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <SearchTray isOpen={isOpen} setIsOpen={setIsOpen}>
      <Tabs className="h-full">
        <TabList className="border-primary-light border-b">
          <Tab
            className="inline-block p-4 cursor-pointer"
            selectedClassName="border border-primary-light inline-block p-2 border-b-0 drop-shadow-lg"
          >
            All Tracks
          </Tab>
          <Tab
            className="inline-block p-4 cursor-pointer"
            selectedClassName="border border-primary-light inline-block p-2 border-b-0 drop-shadow-lg"
          >
            Liked Songs
          </Tab>
        </TabList>
        <TabPanel selectedClassName="h-full p-6 block">
          <TrackSelectorTabs.SearchAllTracks
            onSuccess={() => {
              setIsOpen(false);
            }}
          />
        </TabPanel>
        <TabPanel selectedClassName="h-full p-6 block">
          <TrackSelectorTabs.SavedTracks
            onSuccess={() => {
              setIsOpen(false);
            }}
          />
        </TabPanel>
      </Tabs>
    </SearchTray>
  );
};
