const Session = require('./models/Session');
const Question = require('./models/Question');
const Result = require('./models/Result');
const { SessionMock, QuestionMock, ResultMock } = require('./services/mockDb');

const MAX_PLAYERS = 70;

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join_session', async ({ sessionId, username }) => {
            try {
                const session = global.isDbConnected
                    ? await Session.findOne({ sessionId })
                    : await SessionMock.findOne({ sessionId });

                if (!session) {
                    socket.emit('error', 'Session not found');
                    return;
                }

                if (username !== 'Host') {
                    const currentCount = global.isDbConnected
                        ? await Result.countDocuments({ sessionId, username: { $ne: 'Host' } })
                        : (await ResultMock.find({ sessionId })).filter((r) => r.username !== 'Host').length;

                    if (currentCount >= MAX_PLAYERS) {
                        socket.emit('error', {
                            code: 'SESSION_FULL',
                            message: `Session is full (max ${MAX_PLAYERS} players).`
                        });
                        return;
                    }
                }

                socket.join(sessionId);

                // Find existing result or create new one
                let result;
                if (global.isDbConnected) {
                    result = await Result.findOne({ sessionId, userId: socket.id });
                    if (!result) {
                        result = new Result({
                            sessionId,
                            userId: socket.id,
                            username: username || `Player ${socket.id.substr(0, 4)}`,
                            score: 0
                        });
                        await result.save();
                    }
                } else {
                    result = await ResultMock.findOne({ sessionId, userId: socket.id });
                    if (!result) {
                        result = await ResultMock.save({
                            sessionId,
                            userId: socket.id,
                            username: username || `Player ${socket.id.substr(0, 4)}`,
                            score: 0
                        });
                    }
                }

                io.to(sessionId).emit('player_joined', { userId: socket.id, username: result.username });
                console.log(`User ${result.username} joined session ${sessionId}`);

            } catch (error) {
                console.error("Join session error:", error);
            }
        });

        socket.on('push_question', async ({ sessionId, questionIndex }) => {
            try {
                const question = global.isDbConnected
                    ? await Question.findOne({ sessionId, order: questionIndex })
                    : await QuestionMock.findOne({ sessionId, order: questionIndex });

                if (!question) return;

                io.to(sessionId).emit('question_received', {
                    questionId: question._id,
                    text: question.text,
                    options: question.options,
                    order: question.order
                });

                // Broadcast 35-second timer to all clients
                io.to(sessionId).emit('timer_start', {
                    questionId: question._id,
                    duration: 35,
                    startTime: Date.now()
                });

            } catch (error) {
                console.error("Push question error:", error);
            }
        });

        socket.on('submit_answer', async ({ sessionId, questionId, selectedOption }) => {
            try {
                const question = global.isDbConnected
                    ? await Question.findById(questionId)
                    : await QuestionMock.findById(questionId);

                if (!question) return;

                const correctIndex = parseInt(question.correctAnswer);
                const isAnswerCorrect = selectedOption === correctIndex;

                if (isAnswerCorrect) {
                    if (global.isDbConnected) {
                        await Result.findOneAndUpdate(
                            { sessionId, userId: socket.id },
                            { $inc: { score: 10 } }
                        );
                    } else {
                        await ResultMock.findOneAndUpdate(
                            { sessionId, userId: socket.id },
                            { $inc: { score: 10 } }
                        );
                    }
                }

                socket.emit('answer_result', { correct: isAnswerCorrect, correctAnswer: question.correctAnswer });

                // Update leaderboard
                const leaderboard = global.isDbConnected
                    ? await Result.find({ sessionId }).sort({ score: -1 }).limit(10)
                    : (await ResultMock.find({ sessionId })).sort((a, b) => b.score - a.score).slice(0, 10);

                io.to(sessionId).emit('leaderboard_update', leaderboard);

            } catch (error) {
                console.error("Submit answer error:", error);
            }
        });

        
        // Handle final score submission
        socket.on('submit_final_score', async ({ sessionId, username, score, totalQuestions, timeTaken, details }) => {
            try {
                console.log(`Final score submission: ${username} - ${score}/${totalQuestions} in ${timeTaken}s`);
                
                // Update or create final result with time-based score
                let result;
                if (global.isDbConnected) {
                    result = await Result.findOneAndUpdate(
                        { sessionId, userId: socket.id },
                        { 
                            score: Math.round(score * 10),
                            finalScore: score,
                            totalQuestions,
                            timeTaken,
                            details: details || {},
                            completed: true,
                            completedAt: new Date()
                        },
                        { new: true }
                    );
                } else {
                    const existing = await ResultMock.findOne({ sessionId, userId: socket.id });
                    result = await ResultMock.save({
                        ...existing,
                        sessionId,
                        userId: socket.id,
                        username,
                        score: Math.round(score * 10),
                        finalScore: score,
                        totalQuestions,
                        timeTaken,
                        details: details || {},
                        completed: true,
                        completedAt: new Date()
                    });
                }

                // Get updated leaderboard
                const leaderboard = global.isDbConnected
                    ? await Result.find({ sessionId }).sort({ finalScore: -1, timeTaken: 1 }).limit(10)
                    : (await ResultMock.find({ sessionId })).sort((a, b) => {
                        if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
                        return a.timeTaken - b.timeTaken;
                    }).slice(0, 10);

                // Emit to both host and player
                io.to(sessionId).emit('game_finished', {
                    leaderboard,
                    gameEnded: true,
                    finishedBy: username
                });

            } catch (error) {
                console.error('Submit final score error:', error);
            }
        });

        socket.on('end_session', async ({ sessionId }) => {
            try {
                const leaderboard = global.isDbConnected
                    ? await Result.find({ sessionId }).sort({ finalScore: -1, timeTaken: 1 }).limit(10)
                    : (await ResultMock.find({ sessionId })).sort((a, b) => {
                        if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
                        return a.timeTaken - b.timeTaken;
                    }).slice(0, 10);

                io.to(sessionId).emit('game_finished', {
                    leaderboard,
                    gameEnded: true,
                    finishedBy: 'Host'
                });
            } catch (error) {
                console.error('End session error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
