import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is missing. Fallback responses will be used.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Comforting AI counselor response endpoint
app.post("/api/comfort", async (req, res) => {
  const { worry, emotion } = req.body;

  if (!worry) {
    return res.status(400).json({ error: "고민 내용을 입력해주세요." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Dynamic local fallback if API key is not present (to keep app fully functional in local previews)
    const fallbackResponses = [
      `작성해주신 고민을 읽어보았어요. 마음속에 가득했던 '${worry}'라는 걱정이 밖으로 나오기까지 꽤 힘드셨을 텐데, 용기 내어 털어놓아 주셔서 정말 고마워요. 지금 느끼는 '${emotion || '지침'}'이라는 감정은 마음의 에너지가 조금 부족해졌다는 신호일 뿐, 당신이 잘못한 것이 결코 아니랍니다. 오늘 밤에는 깊은 호흡을 세 번 크게 들이쉬고 내쉬며, 나를 위한 따뜻한 차 한 잔을 선물해보는 건 어떨까요? 혼자서 견뎌내기 어렵다고 느껴질 때는, 언제든 우리 학생상담센터를 찾아주세요. 따뜻한 온기와 함께 늘 여기서 당신을 응원하고 있을게요.`,
      `보내주신 마음의 이야기를 소중히 읽었습니다. 마음속에 '${worry}'라는 무거운 짐을 안고 있으면서, 일상을 지켜내느라 그동안 얼마나 고단하셨을까요. 지금 마음이 많이 '${emotion || '답답함'}'을 느끼고 있다면, 스스로에게 조금 더 너그러운 쉼을 허락해 주어도 괜찮아요. 마음이 헝클어질 땐 자리에서 일어나 가볍게 어깨를 으쓱이며 스트레칭을 해보는 것이 소소한 도움이 된답니다. 이 이야기들을 함께 풀어놓고 따스한 위로를 나누고 싶다면, 편안할 때 언제든 학교 상담센터의 문을 두드려주세요. 당신의 든든한 아지트가 되어드릴게요.`
    ];
    const idx = Math.floor(Math.random() * fallbackResponses.length);
    return res.json({ comfort: fallbackResponses[idx] });
  }

  try {
    const systemInstruction = `너는 대학교 학생상담센터의 친근하고 따뜻하며 공감 능력이 뛰어난 전문 상담사 선생님이야. 
학생들에게 마음의 장벽을 낮추고 위로를 건네는 역할을 맡고 있어.
학생의 고민을 절대 평가하거나 판단하지 말고, 온전히 존중하고 수용하는 태도로 마음의 아지트처럼 따뜻하게 보듬어줘.`;

    const prompt = `대학생 학생이 털어놓은 고민: '${worry}' 
현재 학생이 느끼는 주된 감정: '${emotion || '알 수 없음'}'

위 학생의 이야기를 귀 기울여 듣고, 상담 선생님으로서 따뜻한 손편지 같은 답장을 작성해줘.
다음 [규칙]을 반드시 지켜서 한글로 작성해줘:
1. 3~4문장 내외로 간결하면서도 깊은 공감과 따뜻한 지지를 표할 것.
2. 부드럽고 다정한 존댓말 어조(~였군요, ~해요, ~요)를 사용할 것.
3. 마음의 긴장을 풀 수 있는 아주 소소하고 실천하기 쉬운 마인드풀니스나 행동 요령 한 가지를 권유해줄 것. (예: 5초간 가만히 눈 감아보기, 시원한 물 한 모금 머금기, 편안한 자세로 어깨 내리기 등)
4. '혼자서 마주하기 힘든 무거운 마음이 든다면, 언제든지 우리 학생상담센터에 들러주세요. 따뜻한 차를 마시며 깊이 들어줄게요.' 와 같이, 부담을 전혀 주지 않는 따스하고 친절한 상담실 초대의 말을 마지막 문장 부근에 포함할 것.
5. 마크다운 기호(별표, 샵 등)나 특수 기호 없이 오직 읽기 쉬운 평문 텍스트로만 구성할 것.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    const resultText = response.text || "소중한 마음을 나누어주셔서 감사해요. 비록 지금은 마음이 무겁지만, 이 작은 털어놓음이 당신에게 따뜻한 위로의 시작이 되기를 바랍니다. 혼자 감당하기 힘들 때는 언제든 상담실의 문을 두드려주세요. 늘 여기서 기다릴게요.";
    res.json({ comfort: resultText });

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ error: "상담사 AI가 응답을 준비하는 도중 잠시 지연이 발생했어요. 정성 어린 공감은 언제나 준비되어 있으니 잠시 후 다시 시도해 주세요!" });
  }
});

// Vite server connection
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
