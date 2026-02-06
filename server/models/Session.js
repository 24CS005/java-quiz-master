const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    hostId: {
        type: String, // Can be socket ID or other identifier
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'finished'],
        default: 'waiting',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Session', sessionSchema);
