export function parseAIResponse(rawText: string): string[] {
  let cleaned = rawText.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof parsed === 'object' && parsed !== null) {
      // Check common keys like comments, variations, results
      const possibleArray = (parsed as any).comments || (parsed as any).variations || (parsed as any).results;
      if (Array.isArray(possibleArray)) {
        return possibleArray.map((item) => String(item).trim()).filter(Boolean);
      }
    }
  } catch (e) {
    // Fallback: split by lines or numbered lists if JSON parsing fails
  }

  // Fallback splitting by numbered lists or double newlines
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter((line) => line.length > 0);

  if (lines.length > 0) {
    return lines;
  }

  return [rawText.trim()];
}
