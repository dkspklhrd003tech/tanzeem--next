export async function verifyRecaptcha(token: string, action: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY is not set. Bypassing recaptcha verification.");
    return true; // Bypass if not configured, or you could return false to enforce it
  }

  if (!token) {
    return false;
  }

  try {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (data.success && data.score >= 0.5 && data.action === action) {
      return true;
    } else {
      console.error("Recaptcha verification failed:", data);
      return false;
    }
  } catch (error) {
    console.error("Error verifying recaptcha:", error);
    return false;
  }
}
