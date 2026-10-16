import { io } from "socket.io-client";

const host = window.location.hostname || "localhost";
const socketUrl = `http://${host}:5000`;

const socket = io(socketUrl, { autoConnect: false });
export default socket;