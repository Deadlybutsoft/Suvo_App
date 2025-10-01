import OpenAI from 'openai';

interface GenerateImageOptions {
    numberOfImages: number;
    aspectRatio: string;
}

const getOpenAIImageSize = (aspectRatio: string): '1024x1024' | '1792x1024' | '1024x1792' => {
    switch (aspectRatio) {
        case '16:9':
            return '1792x1024';
        case '9:16':
            return '1024x1792';
        case '1:1':
        default:
            return '1024x1024';
    }
};

export const generateImage = async (
    prompt: string, 
    options: GenerateImageOptions,
    apiKey: string
): Promise<{ mimeType: string; data: string }[]> => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    
    // DALL-E 3 only supports n=1, so we create multiple parallel promises to generate the desired number of images.
    const imagePromises = Array.from({ length: options.numberOfImages }).map(() => 
        openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: getOpenAIImageSize(options.aspectRatio),
            response_format: 'b64_json',
            quality: 'standard', // Use 'hd' for higher quality at a higher cost.
        })
    );

    const responses = await Promise.all(imagePromises);
    
    const imageData = responses.flatMap(response => 
        response.data.map(img => {
            if (!img.b64_json) {
                throw new Error('Image data is missing from the OpenAI response.');
            }
            return {
                data: img.b64_json,
                mimeType: 'image/png', // DALL-E 3 returns PNG images.
            };
        })
    );

    if (imageData.length === 0) {
        throw new Error('No images were generated.');
    }

    return imageData;
};