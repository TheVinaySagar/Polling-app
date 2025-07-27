import { pollService, studentService } from '../services/index.js';
import { formatPollForClient, formatStudentForClient } from '../utils/helpers.js';

export const handlePollEvents = (socket, io) => {
  socket.on('create_poll', async (data) => {
    try {
      const { question, options, timeLimit } = data;
      
      if (!question || !options || !Array.isArray(options)) {
        socket.emit('error', { message: 'Invalid poll data provided' });
        return;
      }

      const poll = await pollService.createPoll(question, options, timeLimit);
      await studentService.resetStudentAnswers();
      
      io.emit('poll_created', formatPollForClient(poll));
      
      const startedPoll = await pollService.startPoll(poll.id);
      io.emit('poll_started', formatPollForClient(startedPoll));
      
      setTimeout(async () => {
        try {
          const endedPoll = await pollService.endPoll(poll.id);
          io.emit('poll_ended', formatPollForClient(endedPoll));
        } catch (error) {
          console.error('Error auto-ending poll:', error);
        }
      }, startedPoll.timeLimit * 1000);
      
    } catch (error) {
      console.error('Error creating poll:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('start_poll', async (pollId) => {
    try {
      const poll = await pollService.startPoll(pollId);
      
      await studentService.resetStudentAnswers();
      
      io.emit('poll_started', formatPollForClient(poll));
      
      console.log(`Poll started: ${poll.question}`);
      
      setTimeout(async () => {
        try {
          const endedPoll = await pollService.endPoll(pollId);
          io.emit('poll_ended', formatPollForClient(endedPoll));
          console.log(`Poll auto-ended: ${endedPoll.question}`);
        } catch (error) {
          console.error('Error auto-ending poll:', error);
        }
      }, poll.timeLimit * 1000);
      
    } catch (error) {
      console.error('Error starting poll:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('end_poll', async () => {
    try {
      const poll = await pollService.endPoll();
      
      io.emit('poll_ended', formatPollForClient(poll));
      
      console.log(`Poll ended: ${poll.question}`);
    } catch (error) {
      console.error('Error ending poll:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('submit_answer', async (data) => {
    try {
      const { pollId, optionId } = data;
      
      if (!pollId || !optionId) {
        socket.emit('error', { message: 'Poll ID and option ID are required' });
        return;
      }

      const student = await studentService.getStudentBySocketId(socket.id);
      if (!student) {
        socket.emit('error', { message: 'Student not found' });
        return;
      }

      if (student.hasAnswered && student.pollId === pollId) {
        socket.emit('error', { message: 'You have already answered this poll' });
        return;
      }

      const updatedPoll = await pollService.submitAnswer(pollId, optionId);
      
      await studentService.updateStudentAnswer(student.id, optionId, pollId);
      
      const updatedStudent = await studentService.getStudentById(student.id);
      
      io.emit('poll_results_updated', formatPollForClient(updatedPoll));
      
      io.emit('student_answered', formatStudentForClient(updatedStudent));
      
      console.log(`Student ${student.name} answered poll: ${optionId}`);
    } catch (error) {
      console.error('Error submitting answer:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('get_current_poll', async () => {
    try {
      const poll = await pollService.getCurrentActivePoll();
      socket.emit('current_poll', poll ? formatPollForClient(poll) : null);
    } catch (error) {
      console.error('Error getting current poll:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('get_poll_history', async () => {
    try {
      const polls = await pollService.getPollHistory();
      const formattedPolls = polls.map(poll => formatPollForClient(poll));
      socket.emit('poll_history', formattedPolls);
    } catch (error) {
      console.error('Error getting poll history:', error);
      socket.emit('error', { message: error.message });
    }
  });
};
