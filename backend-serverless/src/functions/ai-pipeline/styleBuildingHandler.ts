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
import { ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { Errors } from '../../lib/utils/errors';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Primary models (n8n workflow와 동일)
const GEMINI_PRO_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

// Fallback models (503 에러 시 사용)
const GEMINI_PRO_FALLBACK_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
// 이미지 생성은 fallback 없음 - gemini-2.0-flash-exp는 이미지 생성 미지원
// 대신 primary 모델 재시도 횟수를 늘림

const GEMINI_UPLOAD_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

// Material data (synced with frontend materials.ts - 33 materials)
const MATERIALS: Record<string, { name: string; positive_prompt: string }> = {
  'castol_white_01': { name: 'Castol White', positive_prompt: 'white marble texture, clean surface, bright lighting, luxury interior' },
  'veil_gray_02': { name: 'Veil Gray', positive_prompt: 'gray marble with veil pattern, elegant surface, modern interior' },
  'veil_dark_grey_03': { name: 'Veil Dark Grey', positive_prompt: 'dark gray marble, luxury texture, sophisticated interior, elegant veining' },
  'shahara_light_gray_04': { name: 'Shahara Light Gray', positive_prompt: 'light gray marble, sahara pattern, natural texture, bright interior' },
  'cloud_yellow_05': { name: 'Cloud Yellow', positive_prompt: 'yellow beige marble, cloud pattern, warm tone, elegant interior' },
  'andes_white_06': { name: 'Andes White', positive_prompt: 'white marble, andes stone texture, clean surface, luxury interior' },
  'nile_dark_grey_07': { name: 'Nile Dark Grey', positive_prompt: 'dark gray marble, nile pattern, deep texture, luxury interior' },
  'andes_grey_08': { name: 'Andes Grey', positive_prompt: 'gray marble, andes stone pattern, natural texture, modern interior' },
  'sunis_white_09': { name: 'Sunis White', positive_prompt: 'pure white marble, clean surface, bright texture, luxury interior' },
  'kamu_red_10': { name: 'Kamu Red', positive_prompt: 'red brown marble, kamu texture, warm tone, unique interior' },
  'andes_gray_11': { name: 'Andes Gray', positive_prompt: 'gray marble, andes pattern, natural texture, elegant interior' },
  'cloud_white_12': { name: 'Cloud White', positive_prompt: 'white marble, cloud pattern, soft texture, bright interior' },
  'plain_white_13': { name: 'Plain White', positive_prompt: 'plain white surface, clean texture, minimalist interior, bright' },
  'australia_yellow_14': { name: 'Australia Yellow', positive_prompt: 'yellow beige marble, australia stone, warm tone, luxury interior' },
  'greyish_desert_15': { name: 'Greyish Desert', positive_prompt: 'gray beige marble, desert texture, natural pattern, warm interior' },
  'dark_gray_16': { name: 'Dark Gray', positive_prompt: 'dark gray marble, deep texture, luxury interior, sophisticated' },
  'portoro_17': { name: 'Portoro', positive_prompt: 'black marble with gold veins, portoro texture, luxury interior, elegant' },
  'veil_gray_18': { name: 'Veil Gray', positive_prompt: 'gray marble, veil pattern, elegant texture, modern interior' },
  'nile_light_yellow_19': { name: 'Nile Light Yellow', positive_prompt: 'light yellow marble, nile pattern, warm tone, elegant interior' },
  'castol_white_20': { name: 'Castol White', positive_prompt: 'white marble, castol texture, clean surface, luxury interior' },
  'veil_white_21': { name: 'Veil White', positive_prompt: 'white marble, veil pattern, soft texture, bright interior' },
  'veil_dark_gray_22': { name: 'Veil Dark Gray', positive_prompt: 'dark gray marble, veil pattern, luxury texture, sophisticated interior' },
  'castol_blue_23': { name: 'Castol Blue', positive_prompt: 'blue gray marble, castol texture, elegant pattern, modern interior' },
  'andes_yellow_24': { name: 'Andes Yellow', positive_prompt: 'yellow beige marble, andes texture, warm tone, elegant interior' },
  'blue_grey_25': { name: 'Blue Grey', positive_prompt: 'blue gray marble, cool tone, elegant texture, modern interior' },
  'andes_gold_26': { name: 'Andes Gold', positive_prompt: 'gold beige marble, andes texture, luxury tone, elegant interior' },
  'portoro_27': { name: 'Portoro', positive_prompt: 'black marble with gold veins, portoro luxury, elegant interior' },
  'multi_color_red_28': { name: 'Multi-Color Red', positive_prompt: 'red brown marble, multi color pattern, unique texture, luxury interior' },
  'greyish_desert_29': { name: 'Greyish Desert', positive_prompt: 'gray beige marble, desert pattern, natural texture, warm interior' },
  'andes_white_30': { name: 'Andes White', positive_prompt: 'white marble, andes texture, clean surface, bright interior' },
  'andes_yellow_31': { name: 'Andes Yellow', positive_prompt: 'yellow beige marble, andes pattern, warm tone, elegant interior' },
  'h2_32': { name: 'H2', positive_prompt: 'light gray marble, h2 texture, modern pattern, elegant interior' },
  'h4_33': { name: 'H4', positive_prompt: 'gray marble, h4 texture, elegant pattern, modern interior' },
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
 * Call Gemini API with fallback support
 */
async function callGeminiOnce(url: string, payload: object, timeout: number): Promise<{ response: Response; ok: boolean }> {
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
    return { response, ok: response.ok };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Call Gemini API with retry and fallback logic
 */
async function callGemini(
  url: string,
  payload: object,
  timeout = 120000,
  maxRetries = 2,
  fallbackUrl?: string
): Promise<GeminiResponse> {
  let lastError: Error | null = null;

  // Try primary URL
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini API call (primary) attempt ${attempt}/${maxRetries}: ${url.split('/models/')[1]?.split(':')[0]}`);
      const { response, ok } = await callGeminiOnce(url, payload, timeout);

      if (ok) {
        return await response.json();
      }

      const errorText = await response.text();
      console.error(`Gemini API error (attempt ${attempt}):`, response.status, errorText);

      // Retry on 500/503/429 errors
      if ((response.status === 500 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
        const waitTime = attempt * 3000;
        console.log(`Retrying in ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      lastError = new Error(`Gemini API error: ${response.status}`);
      break; // Exit to try fallback
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries && (error as Error).name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      break;
    }
  }

  // Try fallback URL if provided
  if (fallbackUrl) {
    console.log(`Primary model failed, trying fallback: ${fallbackUrl.split('/models/')[1]?.split(':')[0]}`);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini API call (fallback) attempt ${attempt}/${maxRetries}`);
        const { response, ok } = await callGeminiOnce(fallbackUrl, payload, timeout);

        if (ok) {
          console.log('Fallback model succeeded!');
          return await response.json();
        }

        const errorText = await response.text();
        console.error(`Fallback API error (attempt ${attempt}):`, response.status, errorText);

        if ((response.status === 500 || response.status === 503 || response.status === 429) && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }

        lastError = new Error(`Fallback API error: ${response.status}`);
        break;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All API attempts failed');
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

  const response = await callGemini(GEMINI_PRO_URL, payload, 120000, 2, GEMINI_PRO_FALLBACK_URL);
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

  const response = await callGemini(GEMINI_PRO_URL, payload, 120000, 2, GEMINI_PRO_FALLBACK_URL);
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

  const response = await callGemini(GEMINI_IMAGE_URL, payload, 300000, 5); // 5 min timeout, 5 retries (no fallback - image gen not supported)

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

    // Return success response (no CORS headers - Lambda Function URL handles CORS)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        result_image_url: `data:image/jpeg;base64,${resultImageBase64}`,
        material_name: material.name
      })
    };

  } catch (error) {
    console.error('Style building error:', error);

    // Return error in expected format (no CORS headers - Lambda Function URL handles CORS)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};

// Direct export for Lambda Function URL (CORS handled by Function URL config, not middleware)
export const main = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
  // Parse body if string
  if (typeof event.body === 'string') {
    try {
      event.body = JSON.parse(event.body);
    } catch {
      event.body = {};
    }
  }
  return handler(event as ExtendedAPIGatewayProxyEvent, context);
};
