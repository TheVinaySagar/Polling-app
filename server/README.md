# Polling App Backend

A real-time polling system backend built with Express.js, Socket.io, and MongoDB.

## Features

- **Real-time Polling**: Create, start, and end polls with live results
- **Student Management**: Students can join/leave sessions with unique names
- **Teacher Controls**: Single teacher can manage polls and remove students
- **Chat System**: Real-time chat between teacher and students
- **Poll History**: Store and retrieve past poll results from MongoDB
- **Auto-expiry**: Polls automatically end after the specified time limit
- **Clean Architecture**: Modular services and handlers for maintainability

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
MONGODB_URI=mongodb+srv://vedant:1234@taskmanager.m1ymg.mongodb.net/InterView-Exp?retryWrites=true&w=majority&appName=TaskManager
PORT=3001
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev

npm start
```

The server will start on `http://localhost:3001`

## Project Structure

```
server/
├── src/
│   ├── models/           
│   │   ├── Poll.js
│   │   ├── Student.js
│   │   ├── ChatMessage.js
│   │   ├── Teacher.js
│   │   └── index.js
│   ├── services/         
│   │   ├── PollService.js
│   │   ├── StudentService.js
│   │   ├── ChatService.js
│   │   ├── TeacherService.js
│   │   └── index.js
│   ├── handlers/         
│   │   ├── pollHandlers.js
│   │   ├── studentHandlers.js
│   │   ├── teacherHandlers.js
│   │   ├── chatHandlers.js
│   │   └── index.js
│   └── utils/           
│       ├── database.js
│       └── helpers.js
├── server.js            
├── package.json
└── .env
```

## API Endpoints

### HTTP Endpoints
- `GET /health` - Health check
- `GET /api/info` - API information

### Socket.io Events

#### Poll Events
- `create_poll` - Create a new poll
- `start_poll` - Start an existing poll
- `end_poll` - End the current active poll
- `submit_answer` - Submit an answer to a poll
- `get_current_poll` - Get current active poll
- `get_poll_history` - Get poll history

#### Student Events
- `join_as_student` - Join as a student
- `remove_student` - Remove a student (teacher only)
- `get_students` - Get all connected students

#### Teacher Events
- `join_as_teacher` - Join as a teacher
- `verify_teacher` - Verify teacher status

#### Chat Events
- `send_message` - Send a chat message
- `get_chat_history` - Get chat history
- `clear_chat` - Clear chat history (teacher only)
- `delete_message` - Delete a message (teacher only)

## Database Schema

### Poll
```javascript
{
  id: String (unique),
  question: String,
  options: [{
    id: String,
    text: String,
    votes: Number,
    isCorrect: Boolean
  }],
  isActive: Boolean,
  timeLimit: Number,
  startTime: Date,
  endTime: Date,
  totalVotes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Student
```javascript
{
  id: String (unique),
  name: String,
  socketId: String,
  hasAnswered: Boolean,
  answer: String,
  joinTime: Date,
  isConnected: Boolean,
  pollId: String
}
```

### ChatMessage
```javascript
{
  id: String (unique),
  sender: String,
  message: String,
  timestamp: Date,
  isTeacher: Boolean
}
```

### Teacher
```javascript
{
  id: String (unique),
  socketId: String,
  joinTime: Date,
  isConnected: Boolean
}
```

## Features Implementation

### Teacher Capabilities
- ✅ Create new polls with multiple options
- ✅ Start and end polls
- ✅ View live polling results
- ✅ Configure poll time limits
- ✅ Remove students from session
- ✅ View past poll results
- ✅ Chat with students

### Student Capabilities
- ✅ Join with unique name (per tab)
- ✅ Submit answers to active polls
- ✅ View live polling results after answering
- ✅ 60-second time limit enforcement
- ✅ Chat with teacher and other students

### System Features
- ✅ Real-time updates via Socket.io
- ✅ MongoDB persistence
- ✅ Automatic poll expiry
- ✅ Clean disconnection handling
- ✅ Error handling and validation
- ✅ Modular, maintainable code structure

## Cleanup Tasks

The server automatically runs cleanup tasks every 30 minutes:
- End expired polls
- Remove disconnected students (after 1 hour)
- Clean up old chat messages (after 24 hours)
- Remove disconnected teachers

## Error Handling

All Socket.io events include proper error handling and emit error events to clients when operations fail. The server logs all errors and continues running.

## Development

For development, use:
```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.
