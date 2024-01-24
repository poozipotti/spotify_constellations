import { Track } from "@spotify/web-api-ts-sdk";
import React, { PropsWithChildren } from "react";

type Props = {
  track: { name: string; artists: { name: string }[] };
  imageUrl?: string;
  nextTrack?: Track;
  duration: number;
  position: number;
  isPaused: boolean;
  isLoading?: boolean;
  size?: string;
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
    <div className="flex justify-center flex-wrap gap-4">
      {track?.artists.map((artist) => (
        <p className="text-center" key={artist.name}>
          {artist.name}
        </p>
      ))}
    </div>
  );
};
export const TrackVisualizer: React.FC<PropsWithChildren<Partial<Props>>> = (
  props = {}
) => {
  const {
    track,
    duration,
    position,
    isPaused,
    nextTrack,
    children,
    isLoading,
    imageUrl,
    size,
  } = props;
  if (children && nextTrack) {
    throw new Error(
      "cannot pass children and show progress in TrackVisualizer"
    );
  }
  return (
    <AlbumContainer
      track={nextTrack}
      isLoading={isLoading}
      size={size}
      imageUrl={nextTrack?.album.images[0]?.url}
    >
      {children}
      {track && (
        <ProgressTracker
          imageUrl={imageUrl || ""}
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
  position,
  isPaused,
  imageUrl,
}) => {
  const durationSeconds = Math.ceil(duration / 1000);
  const positionSeconds = position
    ? Math.floor((position < duration ? position : duration) / 1000)
    : 0;
  return (
    <>
      <style>
        {`
        @keyframes grow {
          from {
            transform:scale(1.0);
          }
          to {
            transform:scale(0.01);
            
          }
        `}
      </style>
      <div
        id="progress-bar"
        className={`rounded-full 
        ${
          isPaused
            ? "border-4 drop-shadow-md"
            : "border-4 border-primary-light drop-shadow-lg"
        } 
        w-full h-full overflow-hidden
        bg-center 
        `}
        key={duration || 0}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `11rem 11rem`,
          animationName: "grow",
          animationPlayState: isPaused ? "paused" : "running",
          animationTimingFunction: "cubic-bezier(.77,.26,.77,.6)",
          animationDuration: `${durationSeconds + 5}s`,
          animationDelay: `-${positionSeconds}s`,
        }}
      ></div>
    </>
  );
};
export const AlbumContainer: React.FC<
  PropsWithChildren<
    Partial<Pick<Props, "track" | "isLoading" | "size" | "imageUrl">> & {
      onClick?: () => void;
      selected?: boolean;
    }
  >
> = ({ imageUrl, track, isLoading, children, size, onClick, selected }) => {
  return (
    <div
      className={`
      ${size || "h-44 w-44"}
      mx-auto
      bg-background/75 
      rounded-full 
      flex flex-col 
      justify-center items-center 
      border 
      bg-center bg-cover
      ${selected ? "border-primary-light drop-shadow-md" : "border-gray-700"}
      `}
      onClick={onClick}
      style={
        track && {
          backgroundImage: isLoading
            ? undefined
            : `linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${imageUrl})`,
        }
      }
    >
      {isLoading ? (
        <div className="h-full w-full border-b-2 border-double rounded-full animate-spin" />
      ) : (
        children
      )}
    </div>
  );
};
