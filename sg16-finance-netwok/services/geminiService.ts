
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, DocumentAnalysisResult, CountryCode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Verifies identity by comparing an ID card image with a selfie.
 * Uses gemini-2.5-flash for fast, efficient vision analysis.
 */
export const verifyIdentityWithAI = async (
  idImageBase64: string,
  selfieImageBase64: string,
  country: CountryCode,
  deviceContext: string = "Unknown Device"
): Promise<VerificationResult> => {
  try {
    // Dynamic ID Type Mapping for prompt context
    const idTypes: Record<CountryCode, string> = {
      SG: "Singapore NRIC", MY: "MyKad", TH: "Thai ID Card", ID: "KTP (Kartu Tanda Penduduk)",
      VN: "CCCD (Citizen ID)", PH: "PhilSys ID / UMID",
      IN: "Aadhaar Card / PAN Card", PK: "CNIC (Computerized National ID)",
      BD: "National ID (NID)", LK: "NIC (National Identity Card)", NP: "Citizenship Certificate"
    };

    const prompt = `
      ACT AS A BIOMETRIC SECURITY AI for 'Sg16 Finance' (${country} Region).
      
      Task: Perform strict facial comparison between the provided ID Card and the Live Selfie.
      
      Context: 
      - Image 1: Official Govt ID (${idTypes[country]}).
      - Image 2: Live Camera Capture (Biometric Selfie).
      - Device Fingerprint: ${deviceContext}

      Analysis Required:
      1. OCR: Extract the full name from the ID.
      2. Document Class: Confirm if Image 1 is a valid ${country} ID card (${idTypes[country]}).
      3. Biometric Match: Compare facial landmarks (eyes, nose, jawline) between ID photo and Selfie.
      4. Liveness Check: Analyze the selfie for signs of being a live capture vs a screen photo (moiré patterns, glare).
      
      Output JSON strictly:
      {
        "isMatch": boolean (true if >80% confidence),
        "confidence": number (0-100),
        "reason": "Short technical explanation of the match/mismatch.",
        "extractedName": "Name from ID",
        "idType": "Detected ID Type"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: idImageBase64,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: selfieImageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            extractedName: { type: Type.STRING },
            idType: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as VerificationResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("AI Verification Error:", error);
    return {
      isMatch: false,
      confidence: 0,
      reason: "Biometric analysis failed due to image quality or network error.",
    };
  }
};

/**
 * Analyzes uploaded loan documents for authenticity and content.
 * Uses gemini-2.5-flash for fast document parsing.
 */
export const analyzeLoanDocument = async (
  docImageBase64: string,
  deviceContext: string,
  country: CountryCode
): Promise<DocumentAnalysisResult> => {
  try {
    const prompt = `
      You are a forensic document analyst AI for Sg16 Finance (${country} Region).
      
      Client Device Context: ${deviceContext}
      Country Context: ${country}
      
      Task:
      Analyze the provided image of a financial document (Payslip, Bank Statement, or Utility Bill).
      1. Identify the document type.
      2. Extract the monthly income figure (if applicable, else 0).
      3. Identify the employer or issuing bank name.
      4. Detect signs of digital tampering (font inconsistencies, pixelation).
      5. Calculate a Fraud Risk Score (0-100, where 100 is high risk).
      6. Provide a short analysis of the device context vs the document.

      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: docImageBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAuthentic: { type: Type.BOOLEAN },
            documentType: { type: Type.STRING },
            extractedIncome: { type: Type.NUMBER },
            employerName: { type: Type.STRING },
            fraudRiskScore: { type: Type.NUMBER },
            deviceRiskAnalysis: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DocumentAnalysisResult;
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Document Analysis Error:", error);
    return {
      isAuthentic: false,
      documentType: "Unknown",
      extractedIncome: 0,
      employerName: "Unknown",
      fraudRiskScore: 100,
      deviceRiskAnalysis: "System Error",
      notes: "AI failed to process document.",
    };
  }
};

/**
 * Generates a legal loan agreement based on Specific Country Law.
 * Uses gemini-3-pro-preview for advanced legal reasoning and drafting.
 */
export const generateLoanAgreement = async (
  name: string,
  icNumber: string,
  amount: number,
  months: number,
  monthlyPayment: number,
  country: CountryCode,
  currencySymbol: string
): Promise<string> => {
  try {
    const legalContexts: Record<CountryCode, string> = {
      SG: "Monetary Authority of Singapore (MAS) Act & Moneylenders Act",
      MY: "Moneylenders Act 1951 (Malaysia)",
      TH: "Civil and Commercial Code (Thailand) & Bank of Thailand Regulations",
      ID: "OJK (Otoritas Jasa Keuangan) Regulations",
      VN: "State Bank of Vietnam (SBV) Regulations & Civil Code 2015",
      PH: "Lending Company Regulation Act of 2007 (R.A. 9474)",
      IN: "Reserve Bank of India (RBI) Fair Practices Code & Contract Act 1872",
      PK: "Financial Institutions (Recovery of Finances) Ordinance, 2001",
      BD: "Microcredit Regulatory Authority Act, 2006",
      LK: "Consumer Credit Act & Central Bank of Sri Lanka Directions",
      NP: "Nepal Rastra Bank Act & Banking Offence and Punishment Act"
    };

    const prompt = `
      Generate a formal Financial Facilitation & Agreement Contract for 'Sg16 Finance'.
      
      Parties:
      1. Sg16 Finance (The AI Platform/Intermediary)
      2. ${name} (Applicant, ID: ${icNumber})
      
      Details:
      - Requested Principal: ${currencySymbol} ${amount.toLocaleString()}
      - Tenure: ${months} Months
      - Estimated Repayment: ${currencySymbol} ${monthlyPayment.toFixed(2)}
      - Jurisdiction: ${country}
      - Governing Law: ${legalContexts[country] || 'International Finance Law'}
      
      Key Clauses to Include:
      - Sg16 Finance utilizes Artificial Intelligence to match Applicants with Licensed Lenders. 
      - The Applicant is NOT charged any brokerage fees by Sg16 Finance.
      - Sg16 Finance receives commission strictly from the matched Institution.
      - Data Privacy consent for AI biometric processing.
      
      Tone: Premium, Corporate, Legal.
      Format: Plain text with clear section headers.
      Output ONLY the full agreement text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded to Pro for legal generation
      contents: prompt,
    });

    return response.text || "Error generating agreement. Please contact support.";
  } catch (error) {
    console.error("Agreement Generation Error:", error);
    return "System Error: Unable to generate legal contract at this time.";
  }
};

/**
 * Chat with the financial AI assistant.
 * Uses gemini-3-pro-preview for complex reasoning and natural conversation.
 */
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  country: CountryCode = 'MY'
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview", // Upgraded to Pro for chat
      config: {
        systemInstruction: `You are 'SAIF-AI' (Sg16 Automated Intelligent Finance), a high-level banking assistant for Sg16 Finance. 
        Current User Region: ${country}.
        
        Capabilities:
        - You utilize Gemini 3.0 Pro for advanced financial reasoning.
        - Help users match with loans across South Asia and Southeast Asia.
        - Explain that Sg16 uses AI to match borrowers with licensed banks, charging 0 fees to the borrower.
        
        Tone:
        - Sophisticated, Professional, yet Helpful.
        - Use concise, precise language suitable for a fintech environment.
        - Do not give specific investment advice, but explain platform features.
        
        If asked about technical details:
        - Mention you are powered by Google's Gemini 3.0 Pro model.
        `,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I apologize, I am recalibrating. Please ask again.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "System offline. Please try again later.";
  }
};
