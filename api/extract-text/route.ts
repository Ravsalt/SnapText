import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Get API key from environment variables
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      throw new Error('OCR Space API key not configured');
    }

    // Get file extension from MIME type
    const fileExtension = imageFile.type.split('/').pop()?.toLowerCase() || 'png';
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf'];
    const filetype = validExtensions.includes(fileExtension) ? fileExtension : 'png';

    // Prepare form data for OCR.Space API
    const ocrFormData = new FormData();
    ocrFormData.append('file', new Blob([buffer]), `image.${filetype}`);
    ocrFormData.append('language', 'eng');
    ocrFormData.append('isOverlayRequired', 'false');
    ocrFormData.append('isCreateSearchablePdf', 'false');
    ocrFormData.append('isSearchablePdfHideTextLayer', 'true');
    ocrFormData.append('detectOrientation', 'true');
    ocrFormData.append('scale', 'true');

    // Send to OCR.Space API
    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: ocrFormData,
    });

    const ocrData = await ocrResponse.json();

    if (!ocrResponse.ok) {
      console.error('OCR API Error:', ocrData);
      return NextResponse.json(
        { error: 'Error processing image with OCR service' },
        { status: ocrResponse.status }
      );
    }

    // Extract text from OCR response
    const extractedText = ocrData.ParsedResults?.[0]?.ParsedText || '';

    return NextResponse.json({
      text: extractedText.trim(),
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
