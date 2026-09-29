import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateAIResponse } from '../services/ai.service';

export const askAi = async (req: AuthRequest, res: Response) => {
  try {
    const { question, context } = req.body;
    
    // Explicitly scope the AI to act as a platform guide
    const platformContext = `You are the AI Assistant for the Smart Cargo Booking Platform.
    Your sole purpose is to explain booking processes, track shipments, handle payments, and provide general platform guidance.
    You DO NOT have access to carrier chats and you cannot contact carriers directly.
    Always be polite and helpful.
    Current context provided by user: ${context || 'None'}
    `;

    const result = await generateAIResponse(question, platformContext);
    
    res.json({ success: true, reply: result.reply });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
