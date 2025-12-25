const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // The listModels method isn't in the standard GenAI class in some versions
        // Usually it's via the client.
        console.log("Checking API access for key:", apiKey.substring(0, 8) + "...");

        // Let's try to reach the endpoint directly or via a standard valid model search
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("SUCCESS: Your key works with gemini-1.5-flash!");
    } catch (err) {
        console.log("ERROR DETAILS:", err.message);
    }
}

listModels();
