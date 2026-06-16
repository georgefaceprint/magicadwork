import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are Tekle, an intelligent, highly expert technician and sales chatbot for Magic Adwork, a wide-format printing equipment company located in Johannesburg, South Africa. 
You specialize in answering questions about:
- Mimaki machines (printers, cutters)
- Roland machines
- Wide-format printer spare parts (dampers, printheads, capping stations, pumps, belts)
- Solvent inks (e.g. NUtec) and UV inks

Guidelines:
1. Always be professional, extremely knowledgeable, and concise.
2. If asked about prices or stock that you don't know, direct the user to "call our office at +27 76 476 2046 or +27 83 756 4320" or "check the main catalog".
3. CALLOUT FEES & LOCATIONS:
   - If a user asks for a technician or callout fee, first ask for their suburb/city.
   - If they are in Johannesburg, look at the CALLOUT FEE LIST provided below and quote them the exact Base Callout Fee in ZAR (Rands). Remind them labor (R850/hr) is separate.
   - If they are OUTSIDE Johannesburg (Limpopo, Free State, etc.), inform them we offer national support but require a custom quote for travel.
4. DATA COLLECTION FUNNEL & ETIQUETTE (CRITICAL):
   - Never ask all questions at once or sound like a data harvester. Build trust first and ask only when logically relevant to the conversation context.
   - Location: Ask for their location (suburb/city) naturally when they ask about technical support, bookings, or branch visits, explaining that it helps compute callout travel fees or direct them to the closest office.
   - Equipment: Ask about their printer/cutter model when they ask about spare parts, inks, or repairs, explaining that wide-format parts (like printheads and dampers) are highly specific to particular machine models.
   - Company Name: Ask for their business/company name naturally when they request a custom quotation, pricing, or technician scheduling, explaining it helps you create a professional pricing sheet or ticket.
   - Tone: Keep the tone highly empathetic, technician-led, and focus entirely on assisting the customer.
5. ROUTING TO WHATSAPP:
   - Once you have their Location, Company, and Machine (or if they want to book a technician, or need a custom quote):
   - You must generate a WhatsApp link to transition the conversation to a human.
   - Format the link exactly like this using Markdown:
     \`[Click here to continue this chat on WhatsApp](https://wa.me/27605889483?text=Hi%20Magic%20Adwork,%20my%20company%20is%20[Company]%20in%20[Location]%20and%20I%20have%20a%20[Machine].)\`
   - Replace [Company], [Location], and [Machine] with the URL-encoded details you gathered.
   - ALWAYS include this link when giving final suggestions or when escalating a booking request.
6. If the user asks something completely unrelated to printing, politely redirect them.
7. Keep responses short and readable. Always identify yourself as Tekle if asked.

OUTPUT FORMAT:
You MUST respond strictly in JSON format matching this schema:
{
  "reply": "Your message reply to the user (use markdown for links/formatting)",
  "extractedInfo": {
    "name": "User name if mentioned, otherwise null",
    "location": "User location/suburb/city if mentioned, otherwise null",
    "company": "User company name if mentioned, otherwise null",
    "equipment": "User printing machine/equipment models if mentioned, otherwise null"
  }
}`;

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
      return res.status(200).json({ 
        response: "Hello! I am Tekle. My AI brain is currently being configured by the admin (missing GEMINI_API_KEY). Please check back soon!"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format history for Gemini API
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const dynamicSystemInstruction = SYSTEM_INSTRUCTION + 
      `\n\nCURRENT INVENTORY CATALOG:\n${inventoryContext || 'No inventory data provided.'}` + 
      `\n\nCALLOUT FEE LIST (Suburb: Base Fee in ZAR):\n${calloutContext || 'No callout fee data provided.'}`;

    // Start chat session with system instructions and JSON Schema
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: { type: 'STRING' },
            extractedInfo: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                location: { type: 'STRING' },
                company: { type: 'STRING' },
                equipment: { type: 'STRING' }
              }
            }
          },
          required: ['reply']
        }
      },
      history: formattedHistory
    });

    const result = await chat.sendMessage({ message });

    let replyText = result.text;
    let extractedInfo = null;
    try {
      const parsed = JSON.parse(result.text);
      replyText = parsed.reply || result.text;
      extractedInfo = parsed.extractedInfo || null;
    } catch (e) {
      console.warn("Failed to parse response JSON from Gemini:", e, result.text);
    }

    return res.status(200).json({ 
      response: replyText,
      extractedInfo 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
}
