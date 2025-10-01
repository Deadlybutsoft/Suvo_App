import { GoogleGenAI } from "@google/genai";

interface GenerateImageOptions {
    numberOfImages: number;
    aspectRatio: string;
}

export const generateImage = async (prompt: string, options: GenerateImageOptions): Promise<{ mimeType: string; data: string }[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: options.numberOfImages,
            outputMimeType: 'image/jpeg',
            aspectRatio: options.aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });
    
    return response.generatedImages.map(img => ({
        data: img.image.imageBytes,
        mimeType: img.image.mimeType,
    }));
};
