const axios = require('axios');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("AVAILABLE MODELS:");
        response.data.models.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (err) {
        console.error("FAILED TO LIST MODELS:", err.response?.data || err.message);
    }
}

listModels();
