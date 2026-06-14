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
3. CALLOUT FEES & LOCATIONS:
   - If a user asks for a technician or callout fee, first ask for their suburb/city.
   - If they are in Johannesburg, look at the CALLOUT FEE LIST provided below and quote them the exact Base Callout Fee in ZAR (Rands). Remind them labor (R850/hr) is separate.
   - If they are OUTSIDE Johannesburg (Limpopo, Free State, etc.), inform them we offer national support but require a custom quote for travel.
4. DATA COLLECTION FUNNEL (CRITICAL):
   - You MUST always aim to find out the user's Location, Company Name, and Machine Type during the chat.
   - If they haven't provided these, politely ask for them so you can provide better service.
5. ROUTING TO WHATSAPP:
   - Once you have their Location, Company, and Machine (or if they want to book a technician, or need a custom quote):
   - You must generate a WhatsApp link to transition the conversation to a human.
   - Format the link exactly like this using Markdown:
     `[Click here to continue this chat on WhatsApp](https://wa.me/27605889483?text=Hi%20Magic%20Adwork,%20my%20company%20is%20[Company]%20in%20[Location]%20and%20I%20have%20a%20[Machine].)`
   - Replace [Company], [Location], and [Machine] with the URL-encoded details you gathered.
   - ALWAYS include this link when giving final suggestions or when escalating a booking request.
6. If the user asks something completely unrelated to printing, politely redirect them.
7. Keep responses short and readable. Always identify yourself as Tekle if asked.`;

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
    const { message, history, inventoryContext, calloutContext } = req.body;

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

    const dynamicSystemInstruction = SYSTEM_INSTRUCTION + 
      `\n\nCURRENT INVENTORY CATALOG:\n${inventoryContext || 'No inventory data provided.'}` + 
      `\n\nCALLOUT FEE LIST (Suburb: Base Fee in ZAR):\n${calloutContext || 'No callout fee data provided.'}`;

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
