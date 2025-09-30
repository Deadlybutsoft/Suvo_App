import OpenAI from "openai";

export type AspectRatio = "1:1" | "16:9" | "9:16";

interface GenerateImageConfig {
    numberOfImages: number;
    aspectRatio: AspectRatio;
}

const mapAspectRatioToSize = (aspectRatio: AspectRatio): "1024x1024" | "1792x1024" | "1024x1792" => {
    switch (aspectRatio) {
        case "1:1": return "1024x1024";
        case "16:9": return "1792x1024";
        case "9:16": return "1024x1792";
        default: return "1024x1024";
    }
}

export const generateImage = async (prompt: string, config: GenerateImageConfig, apiKey: string): Promise<string[]> => {
    try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        
        const imagePromises = Array.from({ length: config.numberOfImages }).map(() => 
            openai.images.generate({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: mapAspectRatioToSize(config.aspectRatio),
                response_format: 'b64_json',
            })
        );

        const responses = await Promise.all(imagePromises);

        const base64Images = responses.map(response => {
            if (!response.data[0]?.b64_json) {
                throw new Error("API response did not contain image data.");
            }
            return response.data[0].b64_json;
        });
        
        return base64Images;

    } catch (error) {
        console.error("Error generating image with OpenAI:", error);
        if (error instanceof Error) {
            if (error.message.includes('billing')) {
                throw new Error('Image generation failed. Please check your OpenAI billing details.');
            }
            throw new Error(`Image generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};
