import { v4 as uuidv4 } from 'uuid';

export const generateId = () => {
  return uuidv4();
};

export const getCurrentTimestamp = () => {
  return new Date();
};

export const validateRequired = (fields, data) => {
  const missingFields = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

export const formatStudentForClient = (student) => {
  return {
    id: student.id,
    name: student.name,
    hasAnswered: student.hasAnswered,
    answer: student.answer,
    joinTime: student.joinTime,
    isConnected: student.isConnected
  };
};

export const formatPollForClient = (poll) => {
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map(option => ({
      id: option.id,
      text: option.text,
      votes: option.votes || 0,
      isCorrect: option.isCorrect || false
    })),
    isActive: poll.isActive,
    timeLimit: poll.timeLimit,
    startTime: poll.startTime,
    endTime: poll.endTime,
    totalVotes: poll.totalVotes || 0,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt
  };
};

export const formatChatMessageForClient = (message) => {
  return {
    id: message.id,
    sender: message.sender,
    message: message.message,
    timestamp: message.timestamp,
    isTeacher: message.isTeacher
  };
};
