import React from "react";
import { TreeContext } from "@app/SpotifyTree/SpotifyTreeProvider";

export const useSpotifyTree = () => {
  const tree = React.useContext(TreeContext);

  if (!tree) {
    throw new Error(
      "cannot access spotify player make sure a spotify player provider is being used"
    );
  }
  return tree;
};
