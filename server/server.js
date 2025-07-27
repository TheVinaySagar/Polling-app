import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import { dbConnection } from './src/utils/database.js';
import { 
  handlePollEvents, 
  handleStudentEvents, 
  handleTeacherEvents, 
  handleChatEvents 
} from './src/handlers/index.js';
import { 
  pollService, 
  studentService, 
  chatService, 
  teacherService 
} from './src/services/index.js';

dotenv.config();

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: [
    "*"
  ],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: dbConnection.isConnected() ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Polling App Backend',
    version: '1.0.0',
    description: 'Real-time polling system with Socket.io',
    endpoints: {
      health: '/health',
      socket: '/socket.io'
    }
  });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit('connection_established', { 
    socketId: socket.id,
    timestamp: new Date()
  });

  handlePollEvents(socket, io);
  handleStudentEvents(socket, io);
  handleTeacherEvents(socket, io);
  handleChatEvents(socket, io);

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

const setupCleanupTasks = () => {
  const cleanupInterval = setInterval(async () => {
    try {
      console.log('Running cleanup tasks...');
      
      const expiredPolls = await pollService.checkAndEndExpiredPolls();
      if (expiredPolls.length > 0) {
        console.log(`Ended ${expiredPolls.length} expired polls`);
        expiredPolls.forEach(poll => {
          io.emit('poll_ended', poll);
        });
      }
      
      const removedStudents = await studentService.cleanupDisconnectedStudents();
      if (removedStudents > 0) {
        console.log(`Cleaned up ${removedStudents} disconnected students`);
      }
      
      const removedMessages = await chatService.cleanupOldMessages();
      if (removedMessages > 0) {
        console.log(`Cleaned up ${removedMessages} old chat messages`);
      }
      
      const removedTeachers = await teacherService.cleanupDisconnectedTeachers();
      if (removedTeachers > 0) {
        console.log(`Cleaned up ${removedTeachers} disconnected teachers`);
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 30 * 60 * 1000);

  process.on('SIGINT', () => {
    console.log('Received SIGINT, cleaning up...');
    clearInterval(cleanupInterval);
    dbConnection.disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, cleaning up...');
    clearInterval(cleanupInterval);
    dbConnection.disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

const startServer = async () => {
  try {
    await dbConnection.connect();
    
    setupCleanupTasks();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Polling App Backend Ready`);
      console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
      console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();