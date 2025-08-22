import { serve } from 'bun';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = parseInt(process.env.PORT || '3000');
const apiKey = process.env.OCR_SPACE_API_KEY;

if (!apiKey) {
  console.error('Error: OCR_SPACE_API_KEY is not set in environment variables');
  process.exit(1);
}

// Serve the API
console.log('Starting server with OCR API Key:', apiKey ? '***' : 'Not set!');

const server = Bun.serve({
  port,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);

    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle API routes
    if (url.pathname === '/api/extract-text' && req.method === 'POST') {
      console.log('Received API request');
      
      try {
        const formData = await req.formData();
        console.log('Form data received:', [...formData.keys()]);
        
        const file = formData.get('image');
        console.log('File received:', file ? 'Yes' : 'No');

        if (!file || !(file instanceof Blob)) {
          console.error('Invalid file format:', file);
          return new Response(
            JSON.stringify({ error: 'No valid image file provided' }),
            { 
              status: 400, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }

        console.log('File size:', file.size, 'bytes');
        console.log('File type:', file.type);

        const ocrFormData = new FormData();
        ocrFormData.append('file', file, 'image.png');
        ocrFormData.append('language', 'eng');
        ocrFormData.append('isOverlayRequired', 'false');
        ocrFormData.append('scale', 'true');
        ocrFormData.append('isCreateSearchablePdf', 'false');
        ocrFormData.append('isSearchablePdfHideTextLayer', 'true');
        ocrFormData.append('detectOrientation', 'true');

        console.log('Sending request to OCR API...');
        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': apiKey,
          },
          body: ocrFormData,
        });

        const responseText = await ocrResponse.text();
        console.log('OCR API Response Status:', ocrResponse.status);
        
        let ocrData;
        try {
          ocrData = JSON.parse(responseText);
          console.log('OCR API Response:', JSON.stringify(ocrData, null, 2).substring(0, 500) + '...');
        } catch (e) {
          console.error('Failed to parse OCR response:', responseText);
          throw new Error(`Invalid response from OCR service: ${responseText.substring(0, 200)}`);
        }

        if (!ocrResponse.ok) {
          console.error('OCR API Error:', ocrData);
          return new Response(
            JSON.stringify({
              error: 'Error processing image with OCR service',
              details: ocrData || 'No details available'
            }),
            { 
              status: ocrResponse.status, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }

        const extractedText = ocrData.ParsedResults?.[0]?.ParsedText?.trim() || '';
        
        return new Response(
          JSON.stringify({ text: extractedText }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            } 
          }
        );

      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
          JSON.stringify({
            error: 'Internal server error',
            details: errorMessage
          }),
          { 
            status: 500, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            } 
          }
        );
      }
    }

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const filePath = join(__dirname, '../dist', url.pathname === '/' ? 'index.html' : url.pathname);
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        }
        // Fallback to index.html for SPA routing
        const indexFile = Bun.file(join(__dirname, '../dist/index.html'));
        return new Response(indexFile);
      } catch (error) {
        return new Response('Not Found', { status: 404 });
      }
    }

    // In development, return 404 for unknown routes
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
