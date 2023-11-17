import { Track } from "@spotify/web-api-ts-sdk";
import React, { PropsWithChildren } from "react";

//stolen from the package spotify-web-playback-sdk-for-react/src/interfaces.ts with love
//because it's not exported
interface WebPlaybackTrack {
  uri: string;
  id: string | null;
  type: "track" | "episode" | "ad";
  media_type: "audio" | "video";
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: { url: string }[];
  };
  artists: { uri: string; name: string }[];
}

type Props = {
  track: Track | WebPlaybackTrack;
  duration: number;
  position: number;
  isPaused: boolean;
  showProgress?: boolean;
};

export const TrackTitle: React.FC<Partial<Pick<Props, "track">>> = ({
  track,
}) => {
  return <h3 className="text-center font-bold text-xl">{track?.name}</h3>;
};

export const TrackArtists: React.FC<Partial<Pick<Props, "track">>> = ({
  track,
}) => {
  return (
    <div className="flex justify-center flex-wrap">
      {track?.artists.map((artist, i) => (
        <p className="text-center" key={artist.uri}>
          {artist.name}
          {!!track?.artists[i + 1] && ","}
        </p>
      ))}
    </div>
  );
};
export const TrackVisualizer: React.FC<PropsWithChildren<Partial<Props>>> = (
  props = {}
) => {
  const { track, duration, position, isPaused, showProgress, children } = props;
  if (children && showProgress) {
    throw new Error(
      "cannot pass children and show progress in TrackVisualizer"
    );
  }
  return (
    <AlbumContainer track={track}>
      {children}
      {showProgress && track && (
        <ProgressTracker
          track={track}
          duration={duration || 0}
          position={position || 0}
          isPaused={isPaused || false}
        />
      )}
    </AlbumContainer>
  );
};

const ProgressTracker: React.FC<PropsWithChildren<Props>> = ({
  duration,
  track,
  position,
  isPaused,
}) => {
  return (
    <>
      <style>
        {`
        @keyframes grow {
          from {
            transform:scale(1.0);
          }

          to {
            transform:scale(0.1);
            
          }
        `}
      </style>
      <div
        id="progress-bar"
        className="rounded-full border w-full h-full overflow-hidden"
        key={duration || 0}
        style={{
          backgroundImage: `url(${track.album.images[0].url})`,
          backgroundPosition: `center`,
          backgroundSize: `11rem 11rem`,
          animationName: "grow",
          animationPlayState: isPaused ? "paused" : "running",
          animationDuration: `${Math.floor(duration / 1000)}s`,
          animationTimingFunction: "linear",
          animationDelay: `-${position ? Math.floor(position / 1000) : 0}s`,
        }}
      ></div>
    </>
  );
};
const AlbumContainer: React.FC<
  PropsWithChildren<Partial<Pick<Props, "track">>>
> = ({ track, children }) => {
  return (
    <div
      className="h-44 w-44 bg-background/75 rounded-full flex flex-col justify-center items-center border mx-auto"
      style={
        track && {
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${track?.album.images[0].url})`,
          backgroundPosition: `center`,
          backgroundSize: `cover`,
        }
      }
    >
      {children}
    </div>
  );
};
