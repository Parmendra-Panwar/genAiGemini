import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os'
import 'dotenv/config';

const platform = os.platform();
const asyncExecute = promisify(exec);

// Safety delay function
const sleep = (ms) => new Promise(res => setTimeout(res, ms));
const ai = new GoogleGenAI({ apiKey: "" || process.env.GEMINI_API_KEY }); 
const History = []; 

const executeCommand = async ({command}) => {
    try{
        const {stdout, stderr} = await asyncExecute(command);
        if(stderr) return `Error: ${stderr}`
        return `Success: ${stdout} || Task executed completely`;
    }catch (err){
        return `Error in Executing command ${err}`
    }
}

const executeCommondDeclarations = {
    name: 'executeCommand',
    description: "Execute a single terminal/shell command. A command can be to create a folder, file, write on a file, edit the file or delete the file",
    parameters:{
        type:'OBJECT',
        properties:{
            command:{
                type:'STRING',
                description: 'It will be a single terminal command. Ex: "mkdir calculator"'
            },
        },
        required: ['command']   
    }
};

const availableTools = { executeCommand }

const activateAgent = async (userText) => {
    History.push({ role: "user", parts:[{text: userText}]});
    
    while(true){
        await sleep(1000); 

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite", 
            contents: History,
            config:{
                systemInstruction: `You are an Website builder expert. You have to create the frontend of the website by analysing the user Input.
                    You have access of tool, which can run or execute any shell or terminal command.
                    
                    Current user operation system is: ${platform}
                    Give command to the user according to its operating system support.


                    <-- What is your job -->
                    1: Analyse the user query to see what type of website the want to build
                    2: Give them command one by one , step by step
                    3: Use available tool executeCommand

                    // Now you can give them command in following below
                    1: First create a folder, Ex: mkdir "calulator"
                    2: Inside the folder, create index.html , Ex: touch "calculator/index.html"
                    3: Then create style.css same as above
                    4: Then create script.js
                    5: Then write a code in html file

                    You have to provide the terminal or shell command to user, they will directly execute it
                `,
                tools: [{ functionDeclarations: [executeCommondDeclarations] }],
            }
        });

        if(result.functionCalls && result.functionCalls.length > 0){
            console.log(result.functionCalls[0]);
            const call = result.functionCalls[0];
            const toolRes = await availableTools[call.name](call.args);

            const funResHist = {
                name: call.name,
                response: { result: toolRes }
            }

            History.push({ role: "model", parts: [{ functionCall: call }] });
            History.push({ role: "user", parts: [{ functionResponse: funResHist }] });
        }else{
            History.push({ role: "model", parts: [{ text: result.text }] });
            console.log(result.text);
            break;
        }
    }
}
const main = async () => {
    const userText = readlineSync.question(`\n Chat with your code writer: `);
    await activateAgent(userText)
}
main();