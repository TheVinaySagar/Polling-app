import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isTeacher: {
    type: Boolean,
    required: true
  }
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
