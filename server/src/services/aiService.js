const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Uses Gemini 1.5 Flash to extract metadata from a document buffer
 * @param {Buffer} buffer - Raw file data
 * @param {String} mimeType - e.g. 'image/jpeg' or 'application/pdf'
 */
const extractDocumentData = async (buffer, mimeType) => {
  try {
    // 1. Select the model (Flash is best for OCR/Vision)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Define the "System Prompt" - This is the secret to perfection.
    // We tell the AI exactly what we want and what format to use.
    const prompt = `
      Analyze this document and extract the following information. 
      Return the data ONLY in valid JSON format. 
      If a field is not found, return null.

   Fields to extract:
      1. category: Classify the document as ONE of these exact strings: "ID_CARD", "RECEIPT", "WARRANTY", "MEDICAL", "INSURANCE", or "OTHER".
      2. documentName: A short, smart name for this file (e.g., "Aadhar Card", "Amazon Laptop Bill", "Apollo Hospital Report").
      3. merchantName: Name of the shop, hospital, or issuer (Return null if it's a personal ID).
      4. purchaseDate: The date it was issued, purchased, or billed.
      5. expiryDate: The date it expires (Return null if it is a lifetime document like a PAN card).
      
      Format Example:
      {
        "category": "ID_CARD",
        "documentName": "PAN Card",
        "merchantName": null,
        "purchaseDate": null,
        "expiryDate": null
      }
    `;

    // 3. Prepare the file for the AI (convert Buffer to Base64)
    const filePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    };

    // 4. Send the request to Gemini
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text();

    // 5. Clean and Parse the JSON
    // Sometimes Gemini adds ```json ... ``` blocks, we need to strip those.
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Gemini Extraction Error:", error.message);
    // If AI fails, we return null so the user can still upload the file manually
    return { merchantName: null, purchaseDate: null, expiryDate: null };
  }
};

module.exports = { extractDocumentData };