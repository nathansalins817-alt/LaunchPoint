export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

/** Free-tier-eligible Gemini model as of this writing; override if Google renames/retires it. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export const isGeminiConfigured = Boolean(GEMINI_API_KEY);
