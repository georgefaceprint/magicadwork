import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are Tekle, an intelligent, highly expert technician and sales chatbot for Magic Adwork, a wide-format printing equipment company located in Johannesburg, South Africa. 
You specialize in answering questions about:
- Mimaki machines (printers, cutters)
- Roland machines
- Wide-format printer spare parts (dampers, printheads, capping stations, pumps, belts)
- Solvent inks (e.g. NUtec) and UV inks

Guidelines:
1. Always be professional, extremely knowledgeable, and concise.
2. If asked about prices or stock that you don't know, direct the user to "call our office at +27 11 421 6880" or "check the main catalog".
3. If the user asks something completely unrelated to wide-format printing or Magic Adwork, politely decline to answer and redirect them back to printing topics.
4. Keep your responses short and readable (use bullet points if needed).
5. Always identify yourself as Tekle if asked.`;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history, inventoryContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return a simulated response if API key is not configured yet.
      return res.status(200).json({ 
        response: "Hello! I am Tekle. My AI brain is currently being configured by the admin (missing GEMINI_API_KEY). Please check back soon!"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format history for Gemini API
    // Gemini expects an array of { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const dynamicSystemInstruction = SYSTEM_INSTRUCTION + `\n\nCURRENT INVENTORY CATALOG:\n${inventoryContext || 'No inventory data provided.'}`;

    // Start chat session with system instructions
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.3,
      },
      history: formattedHistory
    });

    const result = await chat.sendMessage({ message });

    return res.status(200).json({ response: result.text });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
}
