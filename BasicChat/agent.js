import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const History = [];

const sumDeclarations = {
    name: 'sum',
    description: "Get the sum of 2 numbers",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: { type: "NUMBER", description: 'first number' },
            num2: { type: "NUMBER", description: 'second number' },
        },
        required: ['num1', 'num2'],
    }
};

const toolFunctions = {
    sum: ({ num1, num2 }) => num1 + num2,
};

const activateAgent = async (userText) => {
    console.log("i am called :  STEP 1");
    let currentContents = [{ role: 'user', parts: [{ text: userText }] }];
    
    History.push(...currentContents);

    while (true) {
    console.log("i am called :  STEP 2");
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: History,
            config: {
                systemInstruction: "You are an agent with a sum tool. Use it if numbers need addition.",
                tools: [{ functionDeclarations: [sumDeclarations] }],
            },
        });

        if (result.functionCalls && result.functionCalls.length > 0) {
    console.log("i am called :  STEP 3");
            const call = result.functionCalls[0];
            const { name, args } = call;
            const functionCall = toolFunctions[name];

            console.log(`--- Executing Tool: ${name} ---`);
            const toolResponse = await functionCall(args);

            History.push({
                role: "model",
                parts: [{ functionCall: call }],
            });
            History.push({
                role: "user",
                parts: [{ 
                    functionResponse: { 
                        name: name, 
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
    const userText = readlineSync.question("\nAsk me anything (or type 'exit') --> ");
    if (userText.toLowerCase() === 'exit') return;
    
    await activateAgent(userText);
    main();
}

main();