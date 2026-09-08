import { NextRequest, NextResponse } from "next/server";

// Simple in-memory server cache: key = `${sourceLang}_${targetLang}_${text}`
const serverTranslationCache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetLang = "en", sourceLang = "auto" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }

    if (targetLang === sourceLang || text.trim() === "") {
      return NextResponse.json({ translatedText: text, fromCache: true });
    }

    const cacheKey = `${sourceLang}_${targetLang}_${text.trim()}`;
    if (serverTranslationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: serverTranslationCache.get(cacheKey),
        fromCache: true,
      });
    }

    let translatedText = text;
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (apiKey) {
      // Official Google Cloud Translation API v2
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang === "auto" ? undefined : sourceLang,
          format: "text",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        translatedText = data.data?.translations?.[0]?.translatedText || text;
      }
    } else {
      // Free fallback translator for dev/demo: Google Translate GTX endpoint
      try {
        const encoded = encodeURIComponent(text);
        const freeUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encoded}`;
        const res = await fetch(freeUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (res.ok) {
          const raw = await res.json();
          // raw is array of arrays: [[["Translated part", "Original part", ...], ...], ...]
          if (Array.isArray(raw?.[0])) {
            translatedText = raw[0].map((chunk: any) => chunk?.[0] || "").join("");
          }
        }
      } catch (err) {
        console.warn("Free translation fallback failed, returning original text:", err);
      }
    }

    // Save to cache (limit cache size to 1000 items to avoid memory leaks)
    if (serverTranslationCache.size > 1000) {
      serverTranslationCache.clear();
    }
    serverTranslationCache.set(cacheKey, translatedText);

    return NextResponse.json({
      originalText: text,
      translatedText,
      targetLang,
      fromCache: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Translation failed", details: error?.message },
      { status: 500 }
    );
  }
}
