import { NextResponse } from "next/server";

export function ApiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function ApiError(message: string, status = 500, errorDetails?: any) {
  // Log the actual detailed error server-side for debugging
  if (errorDetails) {
    console.error(`[API Error] ${status} - ${message}:`, errorDetails);
  }

  return NextResponse.json(
    { 
      success: false, 
      error: message, 
      details: errorDetails instanceof Error ? errorDetails.message : String(errorDetails)
    },
    { status }
  );
}
