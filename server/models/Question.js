const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        ref: 'Session'
    },
    text: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: String, // Can be the index or the actual text 
        required: true,
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Question', questionSchema);
