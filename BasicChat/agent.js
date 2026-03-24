import { GoogleGenAI, Type } from "@google/genai";
import readlineSync from 'readline-sync';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
const History = [];

const sumDeclarations = {
    name: 'sum',
    description: "Get the sum of 2 numbers",
    parameters: {
        type: Type.OBJECT, // Fixed
        properties: {
            num1: { type: Type.NUMBER, description: 'first number' }, // Fixed
            num2: { type: Type.NUMBER, description: 'second number' }, // Fixed
        },
        required: ['num1', 'num2'],
    }
};

const toolFunctions = {
    sum: ({ num1, num2 }) => num1 + num2,
};

const activateAgent = async (userText) => {
    History.push({ role: 'user', parts: [{ text: userText }] });

    while (true) {
        const result = await ai.models.generateContent({
            model: "gemini-3-flash", 
            contents: History,
            config: {
                systemInstruction: "You are an agent with a sum tool. Use it if numbers need addition.",
                tools: [{ functionDeclarations: [sumDeclarations] }],
            },
        });

        if (result.functionCalls && result.functionCalls.length > 0) {
            const call = result.functionCalls[0];
            const toolResponse = await toolFunctions[call.name](call.args);

            // Fixed: Push the exact model response to preserve the history correctly
            History.push(result.candidates[0].content);
            
            History.push({
                role: "user",
                parts: [{ 
                    functionResponse: { 
                        name: call.name, 
                        response: { result: toolResponse } 
                    } 
                }],
            });
        } else {
            console.log("AI:", result.text);
            History.push({
                role: "model",
                parts: [{ text: result.text }],
            });
            break;
        }
    }
}

const main = async () => {
    while (true) {
        const userText = readlineSync.question("\nAsk me anything (or type 'exit') --> ");
        if (userText.toLowerCase() === 'exit') break;
        
        await activateAgent(userText);
    }
}

main();