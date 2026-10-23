// Standard JSON error and response helpers for Tuto API

import { NextResponse } from 'next/server';

export interface ApiErrorResponse {
  error: string;
}

export function apiError(message: string, status: number = 400): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}
