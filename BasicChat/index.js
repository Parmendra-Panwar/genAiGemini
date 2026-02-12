import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const ai = new GoogleGenAI({ apiKey: "" });

const History = [];

async function mentor(userProblem) {
    History.push({
        role: 'user',
        parts:[{text: userProblem}]
    })

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        history: History,
        contents: userProblem,

        config: {
            systemInstruction: "You are a monk.",
        },
    });

    History.push({
        role: 'model',
        parts: [{test: response.text}]
    })
    console.log("\n");
    console.log(response.text);
}

async function main(){
   const userProblem = readlineSync.question("Ask me anything--> ");
   await mentor(userProblem);
   main();
}

main();