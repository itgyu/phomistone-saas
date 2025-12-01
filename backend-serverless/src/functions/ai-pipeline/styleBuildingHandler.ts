/**
 * Style Building Lambda
 * Replaces n8n workflow - Direct Gemini API integration
 *
 * Flow:
 * 1. Receive building image + material selection
 * 2. Gemini analyzes building structure
 * 3. Gemini generates styling prompt
 * 4. Upload image to Google File API
 * 5. Gemini generates styled image
 * 6. Return result
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';
import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_PRO_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';
const GEMINI_UPLOAD_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

// Material data (embedded to avoid external dependency)
const MATERIALS: Record<string, { name: string; positive_prompt: string }> = {
  'castol_white_01': { name: 'Castol White', positive_prompt: 'white marble texture, clean surface, bright lighting, luxury interior' },
  'veil_gray_02': { name: 'Veil Gray', positive_prompt: 'gray marble with veil pattern, elegant surface, modern interior' },
  'veil_dark_grey_03': { name: 'Veil Dark Grey', positive_prompt: 'dark gray marble, luxury texture, sophisticated interior, elegant veining' },
  'shahara_light_gray_04': { name: 'Shahara Light Gray', positive_prompt: 'light gray marble, sahara pattern, natural texture, bright interior' },
  'cloud_yellow_05': { name: 'Cloud Yellow', positive_prompt: 'yellow beige marble, cloud pattern, warm tone, elegant interior' },
  'andes_white_06': { name: 'Andes White', positive_prompt: 'white marble, andes stone texture, clean surface, luxury interior' },
  'nile_dark_grey_07': { name: 'Nile Dark Grey', positive_prompt: 'dark gray marble, nile pattern, deep texture, luxury interior' },
  'andes_grey_08': { name: 'Andes Grey', positive_prompt: 'gray marble, andes stone pattern, natural texture, modern interior' },
  'arctic_silver_09': { name: 'Arctic Silver', positive_prompt: 'silver gray marble, arctic pattern, cool tone, luxury interior' },
  'terra_brown_10': { name: 'Terra Brown', positive_prompt: 'brown marble, terra pattern, warm earthy tone, natural interior' },
};

interface StyleBuildingRequest {
  image_base64: string;
  material_id: string;
  material_image_base64?: string;
  original_width?: number;
  original_height?: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { data: string; mimeType: string };
        inline_data?: { data: string; mimeType: string };
      }>;
    };
  }>;
}

/**
 * Call Gemini API
 */
async function callGemini(url: string, payload: object, timeout = 120000): Promise<GeminiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Upload image to Google File API
 */
async function uploadImageToGoogle(imageBase64: string): Promise<string> {
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  const response = await fetch(`${GEMINI_UPLOAD_URL}?uploadType=media&key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/jpeg' },
    body: imageBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google File API error:', response.status, errorText);
    throw new Error(`File upload failed: ${response.status}`);
  }

  const result = await response.json() as { file?: { uri?: string } };
  if (!result.file?.uri) {
    throw new Error('No file URI in upload response');
  }

  return result.file.uri;
}

/**
 * Step 1: Analyze building structure
 */
async function analyzeBuildingStructure(imageBase64: string): Promise<string> {
  console.log('Step 1: Analyzing building structure...');

  const payload = {
    contents: [{
      parts: [
        { text: 'ROLE: Architectural Analyst.\nTASK: Analyze building geometry, windows, lighting. Output description only.' },
        { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
      ]
    }],
    generationConfig: { temperature: 0.2 }
  };

  const response = await callGemini(GEMINI_PRO_URL, payload);
  const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!analysisText) {
    return 'Modern architectural structure with clear geometry.';
  }

  console.log('Analysis complete:', analysisText.substring(0, 100) + '...');
  return analysisText;
}

/**
 * Step 2: Generate styling prompt
 */
async function generateStylingPrompt(
  analysisText: string,
  materialName: string,
  materialPrompt: string,
  materialImageBase64?: string
): Promise<string> {
  console.log('Step 2: Generating styling prompt...');

  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    {
      text: `ROLE: Prompt Engineer.

[INPUT ANALYSIS]:
${analysisText}

[TARGET MATERIAL]:
${materialName} (${materialPrompt})

[TASK]:
Write a concise image generation prompt to apply the target material to the analyzed structure.

[OUTPUT]:
Raw prompt text only.`
    }
  ];

  // Add material image if provided
  if (materialImageBase64) {
    parts.push({ inline_data: { mime_type: 'image/png', data: materialImageBase64 } });
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.7 }
  };

  const response = await callGemini(GEMINI_PRO_URL, payload);
  const promptText = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!promptText) {
    throw new Error('Failed to generate styling prompt');
  }

  console.log('Prompt generated:', promptText.substring(0, 100) + '...');
  return promptText;
}

/**
 * Step 3: Generate styled image
 */
async function generateStyledImage(
  fileUri: string,
  stylingPrompt: string,
  materialImageBase64: string | undefined,
  originalWidth: number,
  originalHeight: number
): Promise<string> {
  console.log('Step 3: Generating styled image...');

  const parts: Array<{ text?: string; file_data?: { mime_type: string; file_uri: string }; inline_data?: { mime_type: string; data: string } }> = [
    {
      text: `FINAL TASK: Material Replacement.

[CRITICAL REQUIREMENT]:
⚠️ OUTPUT IMAGE MUST BE EXACTLY ${originalWidth} x ${originalHeight} PIXELS.
⚠️ DO NOT CROP, RESIZE, OR CHANGE ASPECT RATIO.
⚠️ MAINTAIN EXACT DIMENSIONS OF INPUT IMAGE: ${originalWidth}px × ${originalHeight}px

[INSTRUCTION]:
${stylingPrompt}

[INPUTS]:
1. Base Structure: Provided via File URI (Original size: ${originalWidth}x${originalHeight})
2. Style Reference: Provided Inline Image (Apply this texture)

[RULES]:
- OUTPUT DIMENSIONS: ${originalWidth} × ${originalHeight} pixels (EXACT MATCH REQUIRED)
- Maintain Structure exactly (no cropping, no resizing, no aspect ratio changes).
- Apply Material Style from Reference.
- OUTPUT IMAGE ONLY with EXACT dimensions ${originalWidth}×${originalHeight}.`
    },
    { file_data: { mime_type: 'image/jpeg', file_uri: fileUri } }
  ];

  // Add material image for style reference
  if (materialImageBase64) {
    parts.push({ inline_data: { mime_type: 'image/png', data: materialImageBase64 } });
  }

  const payload = {
    contents: [{ parts }],
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ],
    generationConfig: {
      temperature: 0.4,
      candidateCount: 1
    }
  };

  const response = await callGemini(GEMINI_IMAGE_URL, payload, 300000); // 5 min timeout for image gen

  // Log full response for debugging
  console.log('Gemini image response:', JSON.stringify(response, null, 2).substring(0, 1000));

  // Extract image from response - check multiple possible locations
  const candidate = response.candidates?.[0];
  const responseParts = candidate?.content?.parts || [];

  let imageData: string | undefined;
  for (const p of responseParts) {
    if (p?.inlineData?.data) {
      imageData = p.inlineData.data;
      break;
    }
    if (p?.inline_data?.data) {
      imageData = p.inline_data.data;
      break;
    }
  }

  if (!imageData) {
    const textResponse = responseParts[0]?.text;
    console.error('No image in response. Full response:', JSON.stringify(response));
    throw new Error(`Image generation failed: ${textResponse || 'No content'}`);
  }

  console.log('Image generated successfully');
  return imageData;
}

/**
 * Main handler
 */
const handler = async (
  event: ExtendedAPIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('Style Building request received');

  // Validate API key
  if (!GEMINI_API_KEY) {
    throw Errors.internalError('GEMINI_API_KEY not configured');
  }

  const body = event.body as unknown as StyleBuildingRequest;

  // Validate request
  if (!body.image_base64) {
    throw Errors.badRequest('image_base64 is required');
  }
  if (!body.material_id) {
    throw Errors.badRequest('material_id is required');
  }

  // Get material info
  const material = MATERIALS[body.material_id];
  if (!material) {
    throw Errors.badRequest(`Unknown material_id: ${body.material_id}`);
  }

  const originalWidth = body.original_width || 1024;
  const originalHeight = body.original_height || 1024;

  // Clean image data (remove data URL prefix if present)
  const cleanImage = body.image_base64.replace(/^data:image\/\w+;base64,/, '');
  const materialImage = body.material_image_base64?.replace(/^data:image\/\w+;base64,/, '');

  try {
    // Step 1: Analyze building
    const analysisText = await analyzeBuildingStructure(cleanImage);

    // Step 2: Generate prompt
    const stylingPrompt = await generateStylingPrompt(
      analysisText,
      material.name,
      material.positive_prompt,
      materialImage
    );

    // Step 3: Upload image to Google
    console.log('Uploading image to Google File API...');
    const fileUri = await uploadImageToGoogle(cleanImage);
    console.log('Image uploaded:', fileUri);

    // Step 4: Generate styled image
    const resultImageBase64 = await generateStyledImage(
      fileUri,
      stylingPrompt,
      materialImage,
      originalWidth,
      originalHeight
    );

    // Return success response
    return success({
      success: true,
      result_image_url: `data:image/jpeg;base64,${resultImageBase64}`,
      material_name: material.name
    });

  } catch (error) {
    console.error('Style building error:', error);

    // Return error in expected format
    return {
      statusCode: 200, // Return 200 so frontend can parse the error
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};

// Export without auth middleware for public access (like the original n8n webhook)
export const main = createHandler(handler);
