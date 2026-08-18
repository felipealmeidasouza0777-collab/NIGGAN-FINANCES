import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The Gemini key lives only here, server-side. It is never sent to the
// frontend bundle, unlike a `VITE_`-prefixed variable would be.
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_INSTRUCTION = `Você é o consultor financeiro pessoal dentro do app NIGGAN FINANCES.
Responda sempre em português do Brasil, em tom direto, prático e encorajador, como um mentor financeiro de confiança.
Baseie-se SOMENTE nos dados financeiros fornecidos no contexto (JSON) — nunca invente números.
Se um dado necessário não estiver no contexto, diga isso claramente em vez de chutar.
Seja objetivo: no máximo 2 a 4 frases, foco em números concretos e uma recomendação acionável.`;

app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, context } = req.body ?? {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Campo "question" é obrigatório.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY não configurada no servidor. Usando modo local como alternativa.',
      });
    }

    const prompt = `Contexto financeiro atual (JSON):\n${JSON.stringify(context ?? {}, null, 2)}\n\nPergunta do usuário: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const answer = response.text ?? 'Não consegui gerar uma resposta agora. Tente novamente.';
    res.json({ answer, source: 'gemini' });
  } catch (err) {
    console.error('[server] Erro ao chamar Gemini:', err);
    res.status(500).json({ error: 'Falha ao consultar a IA. Tente novamente em instantes.' });
  }
});

app.get('/api/ai/health', (_req, res) => {
  res.json({ geminiConfigured: Boolean(ai) });
});

app.listen(PORT, () => {
  console.log(`[server] API da IA rodando em http://localhost:${PORT}`);
  if (!ai) {
    console.warn('[server] Aviso: GEMINI_API_KEY não definida no .env — /api/ai/ask vai responder 503.');
  }
});
