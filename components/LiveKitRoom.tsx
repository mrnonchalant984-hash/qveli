'use client';

import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';

type Props = {
  kind: 'CALL' | 'LIVE';
  id: string;
  mode: 'call' | 'host' | 'viewer';
  title: string;
  onClose: () => void;
  onEnded?: () => void;
};

export default function LiveKitRoom({ kind, id, mode, title, onClose, onEnded }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [mic, setMic] = useState(mode !== 'viewer');
  const [camera, setCamera] = useState(mode !== 'viewer');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    const attach = (track: any) => {
      const el = track.attach();
      el.setAttribute('data-qevli-track', track.sid || 'track');
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.objectFit = 'cover';
      el.style.borderRadius = '16px';
      stageRef.current?.appendChild(el);
    };
    const detach = (track: any) => {
      track.detach().forEach((el: HTMLElement) => el.remove());
    };

    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) attach(track);
    });
    room.on(RoomEvent.TrackUnsubscribed, (track) => detach(track));
    room.on(RoomEvent.Disconnected, () => { if (mounted) setConnected(false); });

    (async () => {
      try {
        const r = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, id, mode }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Unable to create media session.');
        await room.connect(j.url, j.token);
        if (!mounted) return;
        setConnected(true);
        if (mode !== 'viewer') {
          await room.localParticipant.setMicrophoneEnabled(true);
          if (kind === 'CALL' || mode === 'host') await room.localParticipant.setCameraEnabled(true);
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Unable to connect to media service.');
      }
    })();

    return () => {
      mounted = false;
      room.disconnect();
      roomRef.current = null;
    };
  }, [kind, id, mode]);

  const toggleMic = async () => {
    if (!roomRef.current) return;
    const next = !mic;
    await roomRef.current.localParticipant.setMicrophoneEnabled(next);
    setMic(next);
  };
  const toggleCamera = async () => {
    if (!roomRef.current) return;
    const next = !camera;
    await roomRef.current.localParticipant.setCameraEnabled(next);
    setCamera(next);
  };
  const leave = async () => {
    roomRef.current?.disconnect();
    onEnded?.();
    onClose();
  };

  return <div className="mediaRoom">
    <div className="mediaRoomHead"><div><small>{kind === 'LIVE' ? 'QEVLI LIVE' : 'QEVLI CALL'}</small><b>{title}</b></div><span className={connected ? 'mediaOnline' : 'mediaConnecting'}>{connected ? 'Connected' : 'Connecting…'}</span></div>
    <div ref={stageRef} className="mediaStage"><div className="mediaEmpty">{error ? error : connected ? 'Waiting for media…' : 'Connecting to secure media room…'}</div></div>
    {error ? <div className="mediaError">{error}</div> : null}
    <div className="mediaControls">
      {mode !== 'viewer' && <><button onClick={toggleMic} aria-label="Toggle microphone">{mic ? <Mic/> : <MicOff/>}</button><button onClick={toggleCamera} aria-label="Toggle camera">{camera ? <Video/> : <VideoOff/>}</button></>}
      <button className="mediaEnd" onClick={leave} aria-label="Leave room"><PhoneOff/></button>
    </div>
  </div>;
}
