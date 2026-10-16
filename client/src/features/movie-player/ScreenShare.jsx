import { useEffect, useRef, useState } from "react";
import socket from "../../socket/socket";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// add an ICE candidate now, or queue it until the remote description is set
const addIce = (pc, c) => {
  if (!pc) return;
  if (pc.remoteDescription) pc.addIceCandidate(c).catch(() => {});
  else (pc._q = pc._q || []).push(c);
};
const flushIce = (pc) => { (pc._q || []).forEach((c) => pc.addIceCandidate(c).catch(() => {})); pc._q = []; };

export default function ScreenShare() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [sharerName, setSharerName] = useState("");
  const [err, setErr] = useState("");
  const streamRef = useRef(null);
  const sendPcs = useRef({}); // viewerId -> RTCPeerConnection (when I share)
  const recvPc = useRef(null); // connection to the sharer (when I watch)
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = localStream || remoteStream;
  }, [localStream, remoteStream]);

  const stopSharing = () => {
    if (!streamRef.current) return;
    Object.values(sendPcs.current).forEach((p) => p.close());
    sendPcs.current = {};
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
    socket.emit("screen-stop");
  };

  const startSharing = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      const vt = stream.getVideoTracks()[0];
      vt.contentHint = "motion";
      vt.onended = stopSharing; // browser's own "Stop sharing" button
      streamRef.current = stream;
      setLocalStream(stream);
      socket.emit("screen-start");
    } catch {
      setErr("Screen sharing was cancelled or isn't supported in this browser (use Chrome/Edge on desktop).");
    }
  };

  useEffect(() => {
    // sharer side: a viewer asks for the stream
    const onWatch = async ({ from }) => {
      if (!streamRef.current) return;
      sendPcs.current[from]?.close();
      const pc = new RTCPeerConnection(ICE);
      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current));
      pc.onicecandidate = (e) => e.candidate && socket.emit("screen-ice", { to: from, candidate: e.candidate });
      sendPcs.current[from] = pc;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("screen-offer", { to: from, offer });
    };
    const onAnswer = async ({ from, answer }) => {
      const pc = sendPcs.current[from];
      if (!pc) return;
      await pc.setRemoteDescription(answer);
      flushIce(pc);
    };

    // viewer side
    const onStarted = ({ sharerId, by }) => {
      setSharerName(by || "Someone");
      socket.emit("screen-watch", { to: sharerId });
    };
    const onOffer = async ({ from, offer }) => {
      recvPc.current?.close();
      const pc = new RTCPeerConnection(ICE);
      recvPc.current = pc;
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pc.onicecandidate = (e) => e.candidate && socket.emit("screen-ice", { to: from, candidate: e.candidate });
      await pc.setRemoteDescription(offer);
      flushIce(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("screen-answer", { to: from, answer });
    };
    const onStopped = () => {
      recvPc.current?.close(); recvPc.current = null;
      setRemoteStream(null); setSharerName("");
    };
    const onIce = ({ from, candidate }) => addIce(sendPcs.current[from] || recvPc.current, candidate);
    const onBusy = () => { setErr("Someone else is already sharing their screen."); stopSharing(); };

    socket.on("screen-watch", onWatch);
    socket.on("screen-answer", onAnswer);
    socket.on("screen-started", onStarted);
    socket.on("screen-offer", onOffer);
    socket.on("screen-stopped", onStopped);
    socket.on("screen-ice", onIce);
    socket.on("screen-busy", onBusy);
    socket.emit("screen-query"); // late joiners: is someone already sharing?

    return () => {
      ["screen-watch", "screen-answer", "screen-started", "screen-offer", "screen-stopped", "screen-ice", "screen-busy"]
        .forEach((ev) => socket.off(ev));
      stopSharing();
      recvPc.current?.close();
    };
  }, []);

  const sharing = !!localStream;
  const watching = !!remoteStream;

  return (
    <div className="player">
      {sharing || watching ? (
        <>
          <video ref={videoRef} autoPlay playsInline controls={watching} muted={sharing} />
          <div className="row" style={{ marginTop: 10, alignItems: "center" }}>
            {sharing
              ? <><span className="muted">You are sharing your screen 🔴</span><button onClick={stopSharing}>Stop sharing</button></>
              : <span className="muted">Watching {sharerName}'s screen</span>}
          </div>
        </>
      ) : (
        <div className="panel" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ marginTop: 0 }}>Nobody is sharing yet.</p>
          <button onClick={startSharing}>🖥️ Share my screen</button>
          <p className="muted">
            Tip: choose a <b>Chrome Tab</b> and tick <b>"Also share tab audio"</b> so your partner hears the movie.
            Both of you should wear headphones to avoid echo on the video call.
          </p>
          {err && <span className="error">{err}</span>}
        </div>
      )}
    </div>
  );
}