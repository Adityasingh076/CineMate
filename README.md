# CineMate – watch party app

## Run
Requires Node 18+ and MongoDB running locally (or put an Atlas URI in server/.env).

Terminal 1:
    cd server && npm install && npm run dev
Terminal 2:
    cd client && npm install && npm run dev

Open http://localhost:5173, register two accounts (use a normal + incognito window),
create a room, share the code, paste a direct .mp4 URL and watch in sync.

Notes
- Video: direct file links only (.mp4/.webm). YouTube/Netflix links won't work in a <video> tag.
- Video calls use WebRTC with a public STUN server; works on LAN/most networks. Camera needs localhost or HTTPS.
- Change JWT_SECRET in server/.env before deploying.
