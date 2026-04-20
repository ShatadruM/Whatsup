import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import { configureSockets } from './sockets/chatSocket';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to Database
connectDB();

// 2. Setup Routes

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST","PUT", "PATCH", "DELETE"]
  }
});

// Configure Socket.io events
configureSockets(io);

app.get('/', (req: Request, res: Response) => {
  res.send('Messaging API is running');
});


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});