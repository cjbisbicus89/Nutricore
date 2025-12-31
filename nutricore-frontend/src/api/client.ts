import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000'; 

export const api = axios.create({ baseURL: BASE_URL });

export const socket = io(BASE_URL, { 
  autoConnect: true,
  transports: ['websocket'] 
});