import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get model info from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/model-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Fallback if backend is not available
      return NextResponse.json({
        provider: 'unknown',
        model: 'unknown',
        environment: process.env.NODE_ENV || 'development'
      });
    }
  } catch {
    // Fallback if backend is not available
    return NextResponse.json({
      provider: 'unknown',
      model: 'unknown',
      environment: process.env.NODE_ENV || 'development'
    });
  }
}
