export async function verifyRecaptcha(token: string, action: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY is not set. Bypassing recaptcha verification.");
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Missing token" };
  }

  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (data.success) {
      if (data.score < 0.5) {
        return { success: false, error: `Score too low: ${data.score}` };
      }
      if (data.action !== action) {
        return { success: false, error: `Action mismatch. Expected ${action}, got ${data.action}` };
      }
      return { success: true };
    } else {
      return { success: false, error: `Google API rejected: ${JSON.stringify(data["error-codes"] || data)}` };
    }
  } catch (error: any) {
    return { success: false, error: `Network error: ${error.message}` };
  }
}
