import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'; // to load pdf
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'; // to create chunck
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'; // to convert to vector
import { Pinecone } from '@pinecone-database/pinecone'; // initialize Pinecone Client
import { PineconeStore } from '@langchain/pinecone'; // to save/index to vector db

const indexing = async () => {
    const PDF_PATH = './dsa.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();


    // console.log(JSON.stringify(rawDocs, null, 2));
    // console.log(rawDocs.length)

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

    // console.log(JSON.stringify(chunkedDocs.slice(0, 2), null, 2));

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });

    const pinecone = new Pinecone(); // not just setup the Pinecone it also fetch
    // env var to self and connect to region of you vector db
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });
}

indexing();