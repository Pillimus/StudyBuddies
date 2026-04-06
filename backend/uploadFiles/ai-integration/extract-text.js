<<<<<<< HEAD
const fs = require('fs');
const path = require('path');

// IMPORTANT: pdf-parse version 1.1.1 MUST BE INSTALLED!! (install pdf-parse@1.1.1)
const pdfParse = require('pdf-parse'); 

const mammoth = require('mammoth');

async function extractText(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  switch (mimeType) {
    case 'application/pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;

    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const docData = await mammoth.extractRawText({ buffer });
      return docData.value;

    case 'text/plain':
      return buffer.toString('utf-8');

    default:
      throw new Error('Unsupported file type for text extraction.');
  }
}

=======
const fs = require('fs');
const path = require('path');

// IMPORTANT: pdf-parse version 1.1.1 MUST BE INSTALLED!! (install pdf-parse@1.1.1)
const pdfParse = require('pdf-parse'); 

const mammoth = require('mammoth');

async function extractText(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);

  switch (mimeType) {
    case 'application/pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;

    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const docData = await mammoth.extractRawText({ buffer });
      return docData.value;

    case 'text/plain':
      return buffer.toString('utf-8');

    default:
      throw new Error('Unsupported file type for text extraction.');
  }
}

>>>>>>> d4ba8e118d42e156de840c9d78031b0588a08e1e
module.exports = extractText;