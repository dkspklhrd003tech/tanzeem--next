import { NextResponse } from "next/server";

export function ApiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function ApiError(message: string, status = 500, errorDetails?: any) {
  // Log the actual detailed error server-side for debugging
  if (errorDetails) {
    console.error(`[API Error] ${status} - ${message}:`, errorDetails);
  }

  // Determine user-friendly message based on status
  let sanitizedMessage = message;
  if (status >= 500 && status < 600) {
     // Never leak stack traces or db errors on 500s
     sanitizedMessage = "An unexpected internal server error occurred.";
  }

  return NextResponse.json(
    { success: false, error: sanitizedMessage },
    { status }
  );
}
