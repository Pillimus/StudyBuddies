const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const client = new GoogleGenerativeAI('AIzaSyB40C9rLrzUmG5eweT-ZsLMvIlLi_ljfEM'); // api code

async function summarizeContent(filePath, mimeType, extractedText) {
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error('No text content found in file.');
  }

  const truncated = extractedText.slice(0, 20000);
  const result = await model.generateContent(
    `The following is a student's notes. Please provide a concise summary of the key points covered:\n\n${truncated}`
  );

  return result.response.text();
}

module.exports = summarizeContent;