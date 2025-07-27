export interface PollOption {
  id: string;
  text: string;
  votes: number;
  isCorrect?: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  timeLimit: number; // in seconds
  startTime?: Date;
  endTime?: Date;
  totalVotes: number;
}

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  answer?: string;
  joinTime: Date;
  isConnected?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isTeacher: boolean;
}

export interface PollState {
  currentPoll: Poll | null;
  students: Student[];
  chatMessages: ChatMessage[];
  pollHistory: Poll[];
}

export type UserRole = 'teacher' | 'student';