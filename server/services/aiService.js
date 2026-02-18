const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generate a task object from natural language text
 * @param {string} text - User input (e.g., "Fix login bug by Friday high priority")
 * @returns {Object} - { title, description, deadline, priority }
 */
const generateTaskFromText = async (text) => {
    try {
        const prompt = `
            Extract task details from the following text and return a JSON object.
            
            Text: "${text}"
            
            Return JSON with these fields:
            - title: Task title (string)
            - description: Brief description (string, optional)
            - deadline: Date in YYYY-MM-DD format (string, optional, assume future date if relative like "tomorrow")
            - priority: "low", "medium", or "high" (default to "medium" if not specified)
            
            JSON Response:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean up markdown code blocks if present
        const jsonString = textResponse.replace(/^```json\n|\n```$/g, "").trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Task Generation Error:", error);
        throw new Error("Failed to generate task from text");
    }
};

/**
 * Chat with AI Assistant
 * @param {string} message - User message
 * @param {Array} context - List of user's current tasks/projects for context
 * @returns {string} - AI response
 */
const getChatResponse = async (message, context) => {
    try {
        const contextString = JSON.stringify(context);
        const prompt = `
            You are a helpful Task Management Assistant.
            
            User's Current Context (Tasks/Projects):
            ${contextString}
            
            User Message: "${message}"
            
            Respond helpfully and strictly based on the provided context if relevant.
            Keep answers concise and actionable.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw new Error("Failed to process chat message");
    }
};

/**
 * Generate subtasks for a goal
 * @param {string} goal - User's goal
 * @returns {Array} - List of subtask titles
 */
const breakdownGoal = async (goal) => {
    try {
        const prompt = `
            Break down the following goal into 3-5 actionable subtasks.
            Return ONLY a JSON array of strings.
            
            Goal: "${goal}"
            
            JSON Response:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const jsonString = textResponse.replace(/^```json\n|\n```$/g, "").trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("AI Goal Breakdown Error:", error);
        throw new Error("Failed to breakdown goal");
    }
};

module.exports = {
    generateTaskFromText,
    getChatResponse,
    breakdownGoal
};
