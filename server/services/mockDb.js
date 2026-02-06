// In-memory storage mimics
const storage = {
    sessions: new Map(),
    questions: new Map(),
    results: new Map()
};

const SessionMock = {
    findOne: async ({ sessionId }) => storage.sessions.get(sessionId),
    save: async (data) => {
        storage.sessions.set(data.sessionId, data);
        return data;
    },
    // Mock constructor behavior
    new: function (data) {
        return {
            ...data,
            save: () => SessionMock.save(data)
        };
    }
};

const QuestionMock = {
    find: async ({ sessionId }) => Array.from(storage.questions.values()).filter(q => q.sessionId === sessionId),
    findOne: async ({ sessionId, order }) => Array.from(storage.questions.values()).find(q => q.sessionId === sessionId && q.order === order),
    findById: async (id) => storage.questions.get(id),
    save: async (data) => {
        const id = Math.random().toString(36).substr(2, 9);
        const question = { ...data, _id: id };
        storage.questions.set(id, question);
        return question;
    },
    new: function (data) {
        return {
            ...data,
            save: () => QuestionMock.save(data)
        };
    }
};

const ResultMock = {
    find: async ({ sessionId }) => Array.from(storage.results.values()).filter(r => r.sessionId === sessionId),
    findOne: async ({ sessionId, userId }) => Array.from(storage.results.values()).find(r => r.sessionId === sessionId && r.userId === userId),
    findOneAndUpdate: async ({ sessionId, userId }, update) => {
        let result = Array.from(storage.results.values()).find(r => r.sessionId === sessionId && r.userId === userId);
        if (result) {
            if (update.$inc) result.score += update.$inc.score;
            return result;
        }
    },
    save: async (data) => {
        const id = Math.random().toString(36).substr(2, 9);
        const result = { ...data, _id: id };
        storage.results.set(id, result);
        return result;
    },
    new: function (data) {
        return {
            ...data,
            save: () => ResultMock.save(data)
        };
    }
};

module.exports = { SessionMock, QuestionMock, ResultMock };
