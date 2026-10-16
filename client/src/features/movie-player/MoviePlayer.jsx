import { useEffect, useState, useRef } from "react";
import socket from "../../socket/socket";

// Helper to extract YouTube video ID from various link formats
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MoviePlayer({ initialUrl }) {
  const [url, setUrl] = useState(initialUrl || "");
  const [input, setInput] = useState("");
  const videoRef = useRef(null);
  const isRemoteAction = useRef(false);

  useEffect(() => {
    const onState = (state) => {
      if (state.url) setUrl(state.url);
    };

    const onEvent = ({ type, time, url: u }) => {
      if (type === "load") {
        if (u) setUrl(u);
      } else if (videoRef.current) {
        isRemoteAction.current = true;
        if (type === "play") {
          videoRef.current.currentTime = time || 0;
          videoRef.current.play().catch(() => {});
        } else if (type === "pause") {
          videoRef.current.currentTime = time || 0;
          videoRef.current.pause();
        } else if (type === "seek") {
          videoRef.current.currentTime = time || 0;
        }
        setTimeout(() => { isRemoteAction.current = false; }, 300);
      }
    };

    socket.on("room-state", onState);
    socket.on("video-event", onEvent);
    socket.emit("get-state");

    return () => {
      socket.off("room-state", onState);
      socket.off("video-event", onEvent);
    };
  }, []);

  const loadUrl = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setUrl(trimmed);
    socket.emit("video-event", { type: "load", url: trimmed, time: 0 });
    setInput("");
  };

  const handlePlay = () => {
    if (isRemoteAction.current || !videoRef.current) return;
    socket.emit("video-event", { type: "play", time: videoRef.current.currentTime, url });
  };

  const handlePause = () => {
    if (isRemoteAction.current || !videoRef.current) return;
    socket.emit("video-event", { type: "pause", time: videoRef.current.currentTime, url });
  };

  const handleSeek = () => {
    if (isRemoteAction.current || !videoRef.current) return;
    socket.emit("video-event", { type: "seek", time: videoRef.current.currentTime, url });
  };

  const videoId = getYouTubeId(url);

  return (
    <div className="player">
      {url ? (
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
              title="YouTube video player"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={url}
              controls
              playsInline
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeked={handleSeek}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          )}
        </div>
      ) : (
        <div className="panel muted" style={{ padding: 60, textAlign: "center" }}>
          No video yet. Paste a YouTube or direct video link below.
        </div>
      )}
      <form className="row" style={{ marginTop: 10 }} onSubmit={loadUrl}>
        <input 
          placeholder="Paste YouTube or direct video URL" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
        />
        <button type="submit">Load</button>
      </form>
    </div>
  );
}