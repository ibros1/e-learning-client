import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export default function VideoPlayer() {
  const videoNode = useRef<HTMLVideoElement | null>(null);
  const player = useRef<videojs.VideoJsPlayer | null>(null);

  useEffect(() => {
    if (!videoNode.current) return;

    player.current = videojs(videoNode.current, {
      controls: true,
      fluid: true, // important for responsive fullscreen
      sources: [
        {
          src: "https://surmadlearning.maxamedsuhayb41.workers.dev/004%20Function%20Declarations%20vs.%20Expressions.mp4",
          type: "video/mp4",
        },
      ],
    });

    return () => {
      if (player.current) {
        player.current.dispose();
        player.current = null;
      }
    };
  }, []);

  return (
    <div
      className="video-container"
      style={{ maxWidth: "640px", margin: "auto", overflow: "visible" }}
    >
      <video
        ref={videoNode}
        className="video-js vjs-big-play-centered"
        playsInline
        controls
        preload="auto"
        style={{ width: "100%", height: "auto" }}
      />
      <button
        onClick={() => player.current?.requestFullscreen()}
        style={{ marginTop: "10px" }}
      >
        Test Fullscreen
      </button>
    </div>
  );
}
