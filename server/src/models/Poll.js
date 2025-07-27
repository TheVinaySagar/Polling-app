import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const pollSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [pollOptionSchema],
  isActive: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 60 // in seconds
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pollSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Poll = mongoose.model('Poll', pollSchema);
