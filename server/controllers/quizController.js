const pdfParse = require('pdf-parse');
const { generateQuestions } = require('../services/aiService');
const Session = require('../models/Session');
const Question = require('../models/Question');
const { SessionMock, QuestionMock } = require('../services/mockDb');

exports.uploadContent = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const buffer = req.file.buffer;
        const data = await pdfParse(buffer);
        const text = data.text;
        console.log("Extracted text length:", text?.length || 0);
        console.log("Extracted text sample:", text?.substring(0, 100));

        if (!text || text.trim().length === 0) {
            console.error("No text extracted from PDF");
            return res.status(400).json({ error: 'Could not extract text from PDF' });
        }

        console.log("Generating questions via AI...");
        const questionsData = await generateQuestions(text);
        console.log("Questions generated:", questionsData?.length || 0);

        // Check if valid questions generated
        if (!questionsData || questionsData.length === 0) {
            console.error("AI Service returned zero questions");
            return res.status(500).json({ error: 'Failed to generate questions' });
        }

        res.json({ questions: questionsData });

    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ error: 'Server error processing file' });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { hostId } = req.body;
        // Generate a random 6-character session ID
        const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();

        const sessionData = {
            sessionId,
            hostId,
            status: 'waiting'
        };

        if (global.isDbConnected) {
            const session = new Session(sessionData);
            await session.save();
        } else {
            await SessionMock.save(sessionData);
        }

        res.json({ sessionId, message: 'Session created successfully' });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};

exports.saveQuestions = async (req, res) => {
    try {
        const { sessionId, questions } = req.body;

        if (!sessionId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        // Validate session exists
        const session = global.isDbConnected
            ? await Session.findOne({ sessionId })
            : await SessionMock.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const savedQuestions = await Promise.all(questions.map(async (q, index) => {
            const qData = {
                sessionId,
                text: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                order: index
            };

            if (global.isDbConnected) {
                const newQuestion = new Question(qData);
                return await newQuestion.save();
            } else {
                return await QuestionMock.save(qData);
            }
        }));

        res.json({ message: 'Questions saved', count: savedQuestions.length });

    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).json({ error: 'Failed to save questions' });
    }
}

exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = global.isDbConnected
            ? await Session.findOne({ sessionId })
            : await SessionMock.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}
