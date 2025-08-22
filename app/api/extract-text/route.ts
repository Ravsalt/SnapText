import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle FormData
  },
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: OCR API key not found' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    
    // Create FormData for OCR.space API
    const ocrFormData = new FormData();
    ocrFormData.append('file', new Blob([imageBuffer]), imageFile.name);
    ocrFormData.append('language', 'eng');
    ocrFormData.append('isOverlayRequired', 'false');
    ocrFormData.append('isTable', 'true');
    ocrFormData.append('scale', 'true');
    ocrFormData.append('OCREngine', '2'); // 1 or 2 (2 is more accurate but slower)

    // Call OCR.space API
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: ocrFormData as any, // Type assertion needed for FormData with fetch
    });

    const ocrData = await ocrResponse.json();

    if (!ocrResponse.ok) {
      console.error('OCR API Error:', ocrData);
      return NextResponse.json(
        { 
          error: 'Error processing image with OCR service',
          details: ocrData?.error || 'Unknown error'
        },
        { status: ocrResponse.status }
      );
    }

    // Extract text from OCR response
    const extractedText = ocrData.ParsedResults
      ?.map((result: any) => result.ParsedText)
      ?.join('\n\n') || 'No text could be extracted';

    return NextResponse.json({ text: extractedText });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add CORS headers
function addCorsHeaders(headers: Headers) {
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

// Handle CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  addCorsHeaders(headers);
  return new Response(null, { headers });
}
