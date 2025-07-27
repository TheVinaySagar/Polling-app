import { Poll } from '../models/index.js';
import { generateId, getCurrentTimestamp, validateRequired, sanitizeString } from '../utils/helpers.js';

class PollService {
  async createPoll(question, options, timeLimit = 60) {
    try {
      validateRequired(['question', 'options'], { question, options });

      if (!Array.isArray(options) || options.length < 2) {
        throw new Error('Poll must have at least 2 options');
      }

      await this.endCurrentActivePoll();

      const pollId = generateId();
      const pollOptions = options.map((option, index) => ({
        id: `option_${index}`,
        text: sanitizeString(option),
        votes: 0,
        isCorrect: false
      }));

      const poll = new Poll({
        id: pollId,
        question: sanitizeString(question),
        options: pollOptions,
        isActive: false,
        timeLimit: parseInt(timeLimit),
        totalVotes: 0
      });

      await poll.save();
      return poll;
    } catch (error) {
      throw new Error(`Failed to create poll: ${error.message}`);
    }
  }

  async startPoll(pollId) {
    try {
      const poll = await Poll.findOne({ id: pollId });
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.isActive) {
        throw new Error('Poll is already active');
      }

      await this.endCurrentActivePoll();

      poll.isActive = true;
      poll.startTime = getCurrentTimestamp();
      poll.endTime = new Date(Date.now() + poll.timeLimit * 1000);

      await poll.save();
      return poll;
    } catch (error) {
      throw new Error(`Failed to start poll: ${error.message}`);
    }
  }

  async endPoll(pollId = null) {
    try {
      let poll;
      
      if (pollId) {
        poll = await Poll.findOne({ id: pollId });
      } else {
        poll = await Poll.findOne({ isActive: true }).sort({ startTime: -1 });
      }

      if (!poll) {
        throw new Error('No active poll found');
      }

      poll.isActive = false;
      poll.endTime = getCurrentTimestamp();

      await poll.save();
      return poll;
    } catch (error) {
      throw new Error(`Failed to end poll: ${error.message}`);
    }
  }

  async endCurrentActivePoll() {
    try {
      const activePoll = await Poll.findOne({ isActive: true });
      if (activePoll) {
        activePoll.isActive = false;
        activePoll.endTime = getCurrentTimestamp();
        await activePoll.save();
      }
    } catch (error) {
      console.error('Error ending current active poll:', error);
    }
  }

  async submitAnswer(pollId, optionId) {
    try {
      const poll = await Poll.findOne({ id: pollId });
      if (!poll) {
        throw new Error('Poll not found');
      }

      if (!poll.isActive) {
        throw new Error('Poll is not active');
      }

      if (poll.endTime && new Date() > poll.endTime) {
        poll.isActive = false;
        await poll.save();
        throw new Error('Poll has expired');
      }

      const optionIndex = poll.options.findIndex(option => option.id === optionId);
      if (optionIndex === -1) {
        throw new Error('Invalid option selected');
      }

      poll.options[optionIndex].votes += 1;
      poll.totalVotes += 1;

      await poll.save();
      return poll;
    } catch (error) {
      throw new Error(`Failed to submit answer: ${error.message}`);
    }
  }

  async getCurrentActivePoll() {
    try {
      const poll = await Poll.findOne({ isActive: true }).sort({ startTime: -1 });
      return poll;
    } catch (error) {
      throw new Error(`Failed to get current poll: ${error.message}`);
    }
  }

  async getPollHistory() {
    try {
      // Only return polls that have been ended (have endTime) to ensure we get complete historical data
      const polls = await Poll.find({
        endTime: { $exists: true, $ne: null }
      })
        .sort({ endTime: -1 })
        .limit(50);
      
      return polls;
    } catch (error) {
      throw new Error(`Failed to get poll history: ${error.message}`);
    }
  }

  async getPollById(pollId) {
    try {
      const poll = await Poll.findOne({ id: pollId });
      return poll;
    } catch (error) {
      throw new Error(`Failed to get poll: ${error.message}`);
    }
  }

  async deletePoll(pollId) {
    try {
      const result = await Poll.deleteOne({ id: pollId });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete poll: ${error.message}`);
    }
  }

  async checkAndEndExpiredPolls() {
    try {
      const now = new Date();
      const expiredPolls = await Poll.find({
        isActive: true,
        endTime: { $lt: now }
      });

      for (const poll of expiredPolls) {
        poll.isActive = false;
        await poll.save();
      }

      return expiredPolls;
    } catch (error) {
      console.error('Error checking expired polls:', error);
      return [];
    }
  }
}

export const pollService = new PollService();