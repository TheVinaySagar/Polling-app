# 🗳️ Flash Pulse Polls - Live Polling System

A real-time polling system built for educational environments where teachers can create interactive polls and students can respond in real-time. Features a modern React frontend with Socket.io-powered backend for seamless real-time communication.

![Live Polling System](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/Frontend-React-blue) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue) ![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)

## ✨ Features

### 👨‍🏫 Teacher Features
- ✅ **Create Interactive Polls** - Multiple choice questions with customizable options
- ✅ **Real-time Control** - Start and end polls with configurable time limits (10-300 seconds)
- ✅ **Live Results** - View responses as they come in with real-time charts
- ✅ **Student Management** - View all connected students and remove disruptive ones
- ✅ **Poll History** - Access to all past polls and their results
- ✅ **Live Chat** - Communicate with students during sessions
- ✅ **Auto-end Polls** - Automatically end when all students answer or time expires

### 👥 Student Features
- ✅ **Unique Names** - Join with unique names per browser tab
- ✅ **Real-time Participation** - Submit answers to active polls instantly
- ✅ **Live Results** - View polling results after submitting answers
- ✅ **Time Awareness** - Visual countdown timer for each poll
- ✅ **Chat Participation** - Engage in discussions with teacher and peers
- ✅ **Session Persistence** - Maintain connection on page refresh

### 🎨 Modern UI Features
- ✅ **Floating Bubble Interface** - Elegant chat and participants panel
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile
- ✅ **Real-time Notifications** - Visual feedback for all actions
- ✅ **Dark/Light Theme** - Modern UI with shadcn/ui components
- ✅ **Accessibility** - Built with accessibility best practices

### 🔧 System Features
- ✅ **Real-time Communication** - Powered by Socket.io
- ✅ **Connection Recovery** - Automatic reconnection on network issues
- ✅ **Rate Limiting** - Protection against spam and abuse
- ✅ **Input Validation** - Comprehensive server-side validation
- ✅ **Error Handling** - Graceful error handling and user feedback
- ✅ **Environment Configuration** - Flexible configuration for different environments

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheVinaySagar/flash-pulse-polls.git
   cd flash-pulse-polls
   ```

2. **Set up the Backend**
   ```bash
   cd server
   npm install
   cp .env .env.local  # Configure environment variables if needed
   npm run dev  # Starts on http://localhost:3001
   ```

3. **Set up the Frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev  # Starts on http://localhost:8080
   ```

4. **Open your browser**
   - Navigate to `http://localhost:8080`
   - Select your role (Teacher or Student)
   - Start polling!

## 🎯 Usage Guide

### For Teachers
1. **Start a Session**
   - Open the app and select "Teacher"
   - You'll see the teacher dashboard

2. **Create a Poll**
   - Enter your question
   - Add 2-10 multiple choice options
   - Set time limit (10-300 seconds)
   - Click "Create Poll"

3. **Start the Poll**
   - Once students join, click "Start Poll"
   - Watch responses come in real-time

4. **Manage Students**
   - Use the floating bubble to view all participants
   - Remove disruptive students if needed
   - Chat with students during the session

### For Students
1. **Join a Session**
   - Open the app and select "Student"
   - Enter a unique name
   - Wait for the teacher to start a poll

2. **Participate**
   - Answer polls within the time limit
   - View results after submitting
   - Use the chat to ask questions

3. **Stay Engaged**
   - Monitor the countdown timer
   - Participate in discussions
   - See live results and statistics

## 🔧 Configuration

### Backend Environment Variables
```env
# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration  
CORS_ORIGIN=http://localhost:8080
SOCKET_CORS_ORIGIN=http://localhost:8080

# Poll Configuration
MAX_POLL_OPTIONS=10
MIN_POLL_OPTIONS=2
DEFAULT_POLL_TIME_LIMIT=60
MAX_POLL_TIME_LIMIT=300

# Security
RATE_LIMIT_MAX_REQUESTS=100
MAX_STUDENTS_PER_ROOM=100
MAX_MESSAGE_LENGTH=500
```

### Frontend Configuration
The frontend automatically connects to the backend on `http://localhost:3001`. For production, update the socket connection URL in `src/contexts/SocketContext.tsx`.

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev          # Development with hot reload
npm run build        # Build for production
npm run lint         # Run ESLint
npm test            # Run tests (when available)
```

### Frontend Development
```bash
cd client
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📡 API Reference

### Socket.io Events

#### Client to Server Events
```typescript
// Connection
join_as_teacher()
join_as_student(name: string)

// Poll Management
create_poll({ question, options, timeLimit })
start_poll(pollId: string)
end_poll()
submit_answer({ pollId, optionId })

// Communication
send_message(message: string)
remove_student(studentId: string)
```

#### Server to Client Events
```typescript
// Poll Events
poll_created(poll: Poll)
poll_started(poll: Poll)
poll_ended(poll: Poll)
poll_results_updated(poll: Poll)

// Student Events
student_joined(student: Student)
student_left(studentId: string)
students_list(students: Student[])

// Communication
chat_message(message: ChatMessage)
error({ message, code })
```

### HTTP Endpoints
- `GET /health` - Health check
- `GET /api/info` - API information

## 🔒 Security Features

- **Rate Limiting** - Prevents spam and DoS attacks
- **Input Validation** - Server-side validation using Joi schemas
- **Input Sanitization** - Prevents XSS attacks
- **CORS Protection** - Restricts cross-origin requests
- **Connection Limits** - Limits concurrent connections per IP

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)
4. Ensure the frontend can connect to the backend URL

### Frontend Deployment
1. Update the backend URL in SocketContext
2. Build the application: `npm run build`
3. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com
```