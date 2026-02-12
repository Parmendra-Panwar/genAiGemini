import { GoogleGenAI } from "@google/genai";
import readlineSync  from "readline-sync";

const ai = new GoogleGenAI({apiKey: "AIzaSyAkunxxp_PaHGoIuiriNAewGioNfrISmH0"});
var readline = require('linebyline');

const History = [
    {
        role: "user",
        parts: [{ text: "Hello" }],
    },
    {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
];

let response;
async function main(Contents) {
  response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    history: History,
    contents: Contents,

    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
    },
  });
  console.log(response.text);
}

const jadu = async () => {
    var  rl = readline('./somefile.txt');

    const udata = {
        role: "user",
        parts: [{text: ""}]
    };
    const mdata = {
        role: "user",
        parts: [{text: ""}]
    };
    await main();
    jadu();
}

await jadu();

