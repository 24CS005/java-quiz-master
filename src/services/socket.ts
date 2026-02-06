import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);

            this.socket.on('connect', () => {
                console.log('Connected to socket server');
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });
        }
        return this.socket;
    }

    joinSession(sessionId: string, username: string) {
        this.socket?.emit('join_session', { sessionId, username });
    }

    pushQuestion(sessionId: string, questionIndex: number) {
        this.socket?.emit('push_question', { sessionId, questionIndex });
    }

    submitAnswer(sessionId: string, questionId: string, selectedOption: number) {
        this.socket?.emit('submit_answer', { sessionId, questionId, selectedOption });
    }

    onQuestionReceived(callback: (data: any) => void) {
        this.socket?.on('question_received', callback);
    }

    onAnswerResult(callback: (data: any) => void) {
        this.socket?.on('answer_result', callback);
    }

    onLeaderboardUpdate(callback: (data: any) => void) {
        this.socket?.on('leaderboard_update', callback);
    }

    onPlayerJoined(callback: (data: any) => void) {
        this.socket?.on('player_joined', callback);
    }

    submitFinalScore(sessionId: string, username: string, score: number, totalQuestions: number, timeTaken: number, details?: any) {
        this.socket?.emit('submit_final_score', {
            sessionId,
            username,
            score,
            totalQuestions,
            timeTaken,
            details
        });
    }

    endSession(sessionId: string) {
        this.socket?.emit('end_session', { sessionId });
    }

    onGameFinished(callback: (data: any) => void) {
        this.socket?.on('game_finished', callback);
    }

    onTimerStart(callback: (data: any) => void) {
        this.socket?.on('timer_start', callback);
    }

    onTimerTick(callback: (data: any) => void) {
        this.socket?.on('timer_tick', callback);
    }

    onError(callback: (data: any) => void) {
        this.socket?.on('error', callback);
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const socketService = new SocketService();
