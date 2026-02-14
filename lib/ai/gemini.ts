type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

export async function generatePromptBuddy({
  goal,
  style,
  constraints,
  locale
}: {
  goal: string;
  style: string;
  constraints: string;
  locale: "th" | "en";
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const system =
    "You are a senior prompt engineer. Generate ONE English prompt only, suitable for most AI image models.";

  const userParts = [
    `User request: ${goal}`,
    "Infer missing details to make the scene coherent and realistic.",
    "Be highly detailed: subject, environment, props, lighting, camera angle, shot size, lens, mood, and composition.",
    "Output English only."
  ].join("\n");

  const body = {
    contents: [
      { role: "user", parts: [{ text: `${system}\n\n${userParts}` }] }
    ]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Gemini request failed");
  }

  let text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  text = text.trim();

  if (/[\u0E00-\u0E7F]/.test(text)) {
    const translateBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Translate the following prompt to English only. " +
                "Return a single English prompt, no extra text.\n\n" +
                text
            }
          ]
        }
      ]
    };
    const translateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translateBody)
      }
    );
    const translateJson = (await translateRes.json()) as GeminiResponse;
    if (translateRes.ok) {
      const translated =
        translateJson.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
      text = translated.trim();
    }
  }

  return text;
}

export async function generatePictureToPrompt({
  imageBase64,
  focus
}: {
  imageBase64: string;
  focus: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const instructions = [
    "You are a senior prompt engineer.",
    "Analyze the image and write ONE English prompt suitable for most AI image models.",
    "Goal: replicate the image as close as possible in BOTH style and every visible detail.",
    "If focus text is provided, prioritize those elements; otherwise describe the full image faithfully.",
    "Do NOT invent elements that are not visible in the image.",
    "Prompt must be highly detailed and exhaustive: subject(s), pose, facial expression, clothing, materials, textures, colors, background, environment, props, composition, framing, camera angle, lens, depth of field, lighting direction/quality, shadows, reflections, atmosphere, time of day, and overall mood.",
    "Ensure realism if the source is realistic; if the source is illustration/cartoon, match that style precisely.",
    "Also provide a Thai explanation of what this image style is called and how to recreate it next time.",
    "Return JSON with keys: prompt, styleName, explanation.",
    "Keep prompt in English only. Explanation in Thai only."
  ].join(" ");

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `FOCUS: ${focus || "(none)"}\n${instructions}` },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ]
      }
    ]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Gemini request failed");
  }

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as { prompt: string; styleName: string; explanation: string };
    return {
      prompt: parsed.prompt?.trim() ?? "",
      styleName: parsed.styleName?.trim() ?? "",
      explanation: parsed.explanation?.trim() ?? ""
    };
  } catch {
    return {
      prompt: "",
      styleName: "",
      explanation: "Gemini ตอบกลับไม่ใช่ JSON ที่กำหนด กรุณาลองใหม่"
    };
  }
}

export async function generateCharacterBuilder(input: {
  name: string;
  gender: string;
  age: string;
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  bodyType: string;
  outfit: string;
  pose: string;
  cameraAngle: string;
  shotSize: string;
  timeOfDay: string;
  location: string;
  cameraType: string;
  lens: string;
  aspectRatio: string;
  notes: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ageText = input.age?.trim() ?? "";
  const ageMatch = ageText.match(/\d+/);
  const ageNum = ageMatch ? Number(ageMatch[0]) : null;

  const ageGuidance = (() => {
    if (!ageNum) return "";
    if (ageNum < 18) {
      return `Age is ${ageNum}. Depict a teenager with youthful facial proportions, smooth skin, no visible wrinkles or mature features, and age-appropriate, non-sexual styling.`;
    }
    if (ageNum <= 25) {
      return `Age is ${ageNum}. Depict a young adult with smooth, youthful skin and minimal lines.`;
    }
    return `Age is ${ageNum}. Depict age-appropriate realism with subtle skin texture and lines consistent with that age.`;
  })();

  const promptParts = [
    "You are a senior prompt engineer for hyper realistic character images.",
    "Write ONE English prompt only.",
    "Translate any non-English user inputs into English in the final prompt.",
    "Do NOT include any non-English words or characters in the output.",
    "Use all provided fields; if any field is missing, infer reasonable details.",
    "Focus on ultra-realistic human details: skin texture appropriate to stated age, pores, hair strands, fabric weave, realistic lighting and shadows.",
    "Include camera and lens, shot size, angle, environment, time of day, and aspect ratio.",
    ageGuidance,
    "Return plain text only, no JSON."
  ];

  const fields = [
    `Name: ${input.name}`,
    `Gender: ${input.gender}`,
    `Age: ${input.age}`,
    `Skin tone: ${input.skinTone}`,
    `Hair color: ${input.hairColor}`,
    `Hair style: ${input.hairStyle}`,
    `Body type: ${input.bodyType}`,
    `Outfit: ${input.outfit}`,
    `Pose: ${input.pose}`,
    `Camera angle: ${input.cameraAngle}`,
    `Shot size: ${input.shotSize}`,
    `Time of day: ${input.timeOfDay}`,
    `Location: ${input.location}`,
    `Camera type: ${input.cameraType}`,
    `Lens: ${input.lens}`,
    `Aspect ratio: ${input.aspectRatio}`,
    `Notes: ${input.notes}`
  ].join("\n");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${promptParts.join(" ")}\n\n${fields}` }]
      }
    ]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Gemini request failed");
  }

  let text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  text = text.trim();

  // If output still contains Thai characters, force-translate to English.
  if (/[\\u0E00-\\u0E7F]/.test(text)) {
    const translateBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Translate the following prompt to English only. " +
                "Return a single English prompt, no extra text.\\n\\n" +
                text
            }
          ]
        }
      ]
    };
    const translateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translateBody)
      }
    );
    const translateJson = (await translateRes.json()) as GeminiResponse;
    if (translateRes.ok) {
      const translated =
        translateJson.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
      text = translated.trim();
    }
  }

  return { prompt: text };
}

export async function generateSceneBuilding(story: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const instructions = [
    "You are a film scene breakdown assistant and prompt engineer.",
    "Analyze the story, identify the genre and tone.",
    "Decide an appropriate number of scenes to tell the story coherently.",
    "Maintain strict continuity across scenes: same character appearance, wardrobe, props, location, time progression, color palette, and lighting direction/quality unless the story explicitly changes them.",
    "For each scene, provide:",
    "1) a short scene title,",
    "2) an English prompt (for AI image/video generation),",
    "3) a Thai explanation describing why this scene exists and how lighting, camera angle, and shot size support the narrative and continuity.",
    "Prompts must include camera angle, shot size, lens, lighting (direction/quality), mood, and key visual details.",
    "Explicitly state continuity constraints in each prompt (e.g., same time of day, same lighting direction, same color palette).",
    "Return JSON ONLY with keys: genre (string), scenes (array).",
    "Each scene object: title, prompt, explanation."
  ].join(" ");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${instructions}\n\nSTORY:\n${story}` }]
      }
    ]
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Gemini request failed");
  }

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as {
      genre: string;
      scenes: Array<{ title: string; prompt: string; explanation: string }>;
    };
    return {
      genre: parsed.genre ?? "",
      scenes: Array.isArray(parsed.scenes) ? parsed.scenes : []
    };
  } catch {
    return {
      genre: "",
      scenes: []
    };
  }
}
