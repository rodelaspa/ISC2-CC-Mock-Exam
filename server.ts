import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Security and parse middleware
app.use(express.json({ limit: '1mb' }));

// In-memory rate limiter: max 25 calls per 60s window per IP
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

const rateLimiter = (req: Request, res: Response, next: () => void) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (entry.count >= 25) {
    return res.status(429).json({
      error: 'Too many tutor requests. Please wait a minute before asking again.',
    });
  }

  entry.count += 1;
  next();
};

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// AI Tutor Endpoint for Question Explanation
app.post('/api/tutor', rateLimiter, async (req: Request, res: Response) => {
  const { question, userSelected, correctOption, rationale, promptType } = req.body || {};

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Valid question text is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI Tutor service is not configured with a GEMINI_API_KEY on the server.',
      fallbackRationale: rationale || 'Please refer to the comprehensive rationale above.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let userInstruction = `The student is reviewing an ISC2 Certified in Cybersecurity (CC) question:
Question: "${question}"
Student selected: "${userSelected || 'None'}"
Official Correct Answer: "${correctOption || 'A'}"
Curriculum Rationale: "${rationale || ''}"`;

    if (promptType === 'why_wrong') {
      userInstruction += `\nFocus specifically on why "${userSelected}" was incorrect or less optimal than "${correctOption}", highlighting the exact ISC2 CC concept distinction.`;
    } else if (promptType === 'mnemonic') {
      userInstruction += `\nProvide an easy-to-remember mnemonic, memory anchor, or mental model for this exact cybersecurity concept to never forget it on exam day.`;
    } else if (promptType === 'real_world') {
      userInstruction += `\nProvide a concrete, realistic workplace scenario illustrating how this principle is applied in modern enterprise cybersecurity operations.`;
    } else {
      userInstruction += `\nBreak down the concept clearly for an entry-level examinee:
1. Core ISC2 concept tested
2. Why "${correctOption}" is the best answer
3. Common test-taker trap to avoid`;
    }

    // Call Gemini 3.8 Flash with 12s timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tutor request timed out')), 12000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userInstruction,
      config: {
        systemInstruction:
          'You are a senior, encouraging cybersecurity instructor specializing in the ISC2 Certified in Cybersecurity (CC) certification. Provide clear, professional, concise, structured guidance (3-4 short paragraphs or bullet points). Never give misleading answers. Reinforce official ISC2 standards (CIA Triad, IAAA, NIST SP 800-61, ISO 27001, 4 Ethics Canons in strict priority, CSUSAD data lifecycle).',
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    });

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
    const explanation = response.text || 'Unable to generate explanation at this time.';

    return res.json({
      success: true,
      explanation,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating AI explanation:', error);
    const isTimeout = error?.message?.includes('timed out');
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout
        ? 'The AI Tutor request timed out. Please try again.'
        : 'Failed to generate tutor response. Please check the built-in curriculum rationale.',
      details: error?.message || 'Internal server error',
    });
  }
});

// Vite Middleware in Dev or Static Files in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
