import { NextResponse } from "next/server";

/**
 * Return a JSON success response.
 *
 * @param data   - Payload to serialize as JSON.
 * @param status - HTTP status code (default: 200).
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Return a JSON error response.
 *
 * @param message - Human-readable error description.
 * @param status  - HTTP status code (default: 400).
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}
