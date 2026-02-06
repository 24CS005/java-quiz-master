const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        ref: 'Session'
    },
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Result', resultSchema);
