const express = require('express');
const router = express.Router();
const multer = require('multer');
const quizController = require('../controllers/quizController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.single('file'), quizController.uploadContent);
router.post('/sessions', (req, res) => quizController.createSession(req, res));
router.get('/sessions/:sessionId', quizController.getSession);
router.post('/sessions/:sessionId/questions', (req, res) => quizController.saveQuestions(req, res));

module.exports = router;
