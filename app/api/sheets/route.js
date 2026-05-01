import { NextResponse } from 'next/server';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1ftthMubIXik28Qq-Q9pS1icoEkRABEypicWQoeZuPX5MlGfbBJ8MTtu32coF-deg/exec';

export async function GET() {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Google App Script redirects, so we need to follow
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Sheets');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sheets data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { hysteresis } = await request.json();
    
    // Append the hysteresis as a URL parameter to the App Script GET URL
    const url = new URL(SCRIPT_URL);
    url.searchParams.append('hysteresis', hysteresis);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error('Failed to update Google Sheets');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating sheets data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
