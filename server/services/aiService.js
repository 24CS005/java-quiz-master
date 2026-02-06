const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateQuestions = async (text) => {
    let questions = [];

    // Prioritize Gemini since the user provided a key
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
        console.log("Attempting question generation with Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-preview-12-2025", "gemini-1.5-flash"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model: ${modelName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });

                const prompt = `Generate 60 multiple-choice questions based on the following text. 
            Cover as many different topics and concepts from the text as possible.
            Format the output as a JSON array of objects. 
            Each object must have:
            - "question": string
            - "options": array of 4 strings
            - "correctAnswer": integer index (0-3)
            
            Text: ${text}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let textResponse = response.text();
                console.log(`Gemini Success with ${modelName}! Response length:`, textResponse.length);
                return JSON.parse(textResponse);
            } catch (error) {
                console.error(`Gemini Failure for ${modelName}:`, error.message);
                lastError = error;
                // If it's a 404, try the next model. Other errors might be fatal.
                if (!error.message.includes("404")) break;
            }
        }

        console.error("All Gemini model attempts failed.");
    }

    // Try OpenAI as secondary
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0) {
        console.log("Attempting question generation with OpenAI...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates multiple-choice questions from text. Output ONLY valid JSON array of objects with keys: question, options (array of 4 strings), correctAnswer (index 0-3)."
                    },
                    {
                        role: "user",
                        content: `Generate 60 multiple-choice questions from the following text. Cover as many different topics as possible:\n\n${text}`
                    }
                ],
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            questions = JSON.parse(content);
            return questions;
        } catch (error) {
            console.error("OpenAI Error:", error.message);
        }
    }

    // Final Fallback: Mock Questions
    console.warn("No functional AI service available. Using mock questions.");
    return [
        {
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Mars", "Venus", "Jupiter", "Saturn"],
            correctAnswer: 0
        },
        {
            question: "Sample Question from PDF (AI simulated)",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 1
        }
    ];
};

module.exports = { generateQuestions };
