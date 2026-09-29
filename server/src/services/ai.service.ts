import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_AI_API_KEY;

export const generateAIResponse = async (question: string, context: string = ''): Promise<{ reply: string, escalate: boolean }> => {
  if (!OPENROUTER_API_KEY) {
    console.error('Missing OPEN_ROUTER_AI_API_KEY in environment variables');
    return { reply: 'AI service is currently unavailable.', escalate: true };
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI logistics assistant for a Smart Cargo Booking Platform. 
            You help answer customer queries.
            Context: ${context}
            If the customer is asking a complex doubt or query that requires manual intervention from the carrier (e.g., specific pricing disputes, undocumented delays), you MUST include the exact phrase "[ESCALATE TO CARRIER]" in your response so the system can forward it. Otherwise, provide a helpful and professional response based on the context.`
          },
          {
            role: 'user',
            content: question
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173', 
          'X-Title': 'LCL Marketplace AI Assistant'
        }
      }
    );

    const aiMessage = response.data.choices[0].message.content;
    const shouldEscalate = aiMessage.includes('[ESCALATE TO CARRIER]');
    const cleanedReply = aiMessage.replace('[ESCALATE TO CARRIER]', '').trim();

    return {
      reply: cleanedReply,
      escalate: shouldEscalate
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return { reply: 'Sorry, I am having trouble processing your request right now.', escalate: true };
  }
};
