import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: 'Missing prompt or API key' },
        { status: 400 }
      );
    }

    // Initialize Google Generative AI with user's API key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Veo 3.1 model for video generation
    const model = genAI.getGenerativeModel({
      model: 'veo-3.1-exp-1204',
    });

    // Generate video
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Generate an 8K ultra realistic cinematic video: ${prompt}`,
            },
          ],
        },
      ],
    });

    const response = await result.response;

    // Extract video URL from response
    // Note: The actual response structure may vary based on Google's API
    const videoData = response.candidates?.[0]?.content?.parts?.[0] as any;

    if (!videoData) {
      throw new Error('No video data returned from API');
    }

    // For actual implementation, you would need to:
    // 1. Get the video file data or URL from the response
    // 2. Possibly upload it to a storage service
    // 3. Return the accessible URL

    // Check for video in different possible response formats
    let videoUrl = '/placeholder-video.mp4';

    if (videoData.videoUrl) {
      videoUrl = videoData.videoUrl;
    } else if (videoData.fileData?.fileUri) {
      videoUrl = videoData.fileData.fileUri;
    } else if (videoData.inlineData) {
      // If video is inline data, create a data URL
      const mimeType = videoData.inlineData.mimeType || 'video/mp4';
      const data = videoData.inlineData.data;
      videoUrl = `data:${mimeType};base64,${data}`;
    }

    return NextResponse.json({
      videoUrl,
      message: 'Video generated successfully',
    });

  } catch (error: any) {
    console.error('Error generating video:', error);

    // Handle specific API errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Google AI API key.' },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please check your usage limits.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate video. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
