import { useEffect, useRef, useState } from "react";
import socket from "../../socket/socket";
import "./VideoCall.css";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function Tile({ stream, label, muted }) {
  const ref = useRef();
  useEffect(() => { 
    if (ref.current && stream) {
      ref.current.srcObject = stream; 
    }
  }, [stream]);

  return (
    <div className="vc-tile">
      <video ref={ref} autoPlay playsInline muted={muted} />
      <span>{label}</span>
    </div>
  );
}

export default function VideoCall() {
  const [inCall, setInCall] = useState(false);
  const [local, setLocal] = useState(null);
  const [remotes, setRemotes] = useState({});
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [err, setErr] = useState("");
  
  const peers = useRef({});
  const localRef = useRef(null);

  const createPeer = (id) => {
    // Clean up existing peer connection if it already exists
    if (peers.current[id]) {
      peers.current[id].close();
      delete peers.current[id];
    }

    const pc = new RTCPeerConnection(ICE);

    if (localRef.current) {
      localRef.current.getTracks().forEach((t) => pc.addTrack(t, localRef.current));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-ice", { to: id, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      setRemotes((r) => ({ ...r, [id]: e.streams[0] }));
    };

    peers.current[id] = pc;
    return pc;
  };

  const removePeer = (id) => {
    if (peers.current[id]) {
      peers.current[id].close();
      delete peers.current[id];
    }
    setRemotes((r) => { 
      const n = { ...r }; 
      delete n[id]; 
      return n; 
    });
  };
const join = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = stream; 
      setLocal(stream); 
      setInCall(true); 
      setErr("");
      socket.emit("join-call");
    } catch (e) {
      console.error("getUserMedia error:", e);
      // This will show the exact reason (e.g., NotReadableError if hardware is busy)
      setErr(`Error: ${e.name} - ${e.message}`); 
    }
  };

  const leave = () => {
    socket.emit("leave-call");
    Object.keys(peers.current).forEach(removePeer);
    if (localRef.current) {
      localRef.current.getTracks().forEach((t) => t.stop());
      localRef.current = null;
    }
    setLocal(null); 
    setInCall(false);
  };

  useEffect(() => {
    const onUsers = async (ids) => {
      for (const id of ids) {
        const pc = createPeer(id);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { to: id, offer });
        } catch (e) {
          console.error("Error creating offer:", e);
        }
      }
    };

    const onOffer = async ({ from, offer }) => {
      if (!localRef.current) return;
      const pc = createPeer(from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { to: from, answer });
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    };

    const onAnswer = async ({ from, answer }) => {
      const pc = peers.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("Error handling answer:", e);
        }
      }
    };

    const onIce = async ({ from, candidate }) => {
      const pc = peers.current[from];
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      }
    };

    socket.on("call-users", onUsers);
    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice", onIce);
    socket.on("call-left", removePeer);

    return () => {
      socket.off("call-users", onUsers); 
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer); 
      socket.off("webrtc-ice", onIce); 
      socket.off("call-left", removePeer);

      Object.values(peers.current).forEach((p) => p.close());
      peers.current = {};
      if (localRef.current) {
        localRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggle = (kind, state, set) => {
    if (localRef.current) {
      localRef.current.getTracks()
        .filter((t) => t.kind === kind)
        .forEach((t) => (t.enabled = !state));
      set(!state);
    }
  };

  return (
    <div className="vc panel">
      <div className="vc-controls">
        {!inCall ? (
          <button onClick={join}>📹 Join video call</button>
        ) : (
          <>
            <button className="secondary" onClick={() => toggle("audio", mic, setMic)}>
              {mic ? "🎤 Mute" : "🔇 Unmute"}
            </button>
            <button className="secondary" onClick={() => toggle("video", cam, setCam)}>
              {cam ? "📷 Cam off" : "🚫 Cam on"}
            </button>
            <button onClick={leave}>Leave call</button>
          </>
        )}
        {err && <span className="error">{err}</span>}
      </div>
      {inCall && (
        <div className="vc-grid">
          <Tile stream={local} label="You" muted />
          {Object.entries(remotes).map(([id, s]) => (
            <Tile key={id} stream={s} label="Friend" />
          ))}
        </div>
      )}
    </div>
  );
}