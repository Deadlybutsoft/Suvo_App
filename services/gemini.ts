import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

interface GenerateImageConfig {
    numberOfImages: number;
    aspectRatio: AspectRatio;
}

export const generateImage = async (prompt: string, config: GenerateImageConfig): Promise<string[]> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                ...config,
                outputMimeType: 'image/jpeg',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("API did not return any images.");
        }
        
        return response.generatedImages.map(img => img.image.imageBytes);

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Image generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};