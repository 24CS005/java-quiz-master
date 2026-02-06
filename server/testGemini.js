const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function listModels() {
    console.log("Listing models for key starting with:", process.env.GEMINI_API_KEY.substring(0, 10));

    // Note: To list models, you usually use the Generative AI SDK's listModels method if supported, 
    // but the simplest is to try a few known variations.

    // However, the error "Model not found" is very specific.
    // Let's try one more thing: checking if the project is valid.

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // These are the most common model IDs currently
    const testModels = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    for (const m of testModels) {
        try {
            console.log(`Checking ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            const response = await result.response;
            if (response.text()) {
                console.log(`SUCCESS: ${m} is working!`);
                return;
            }
        } catch (e) {
            console.log(`FAIL: ${m} -> ${e.message}`);
        }
    }
}

listModels();
