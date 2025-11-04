
import { GoogleGenAI, Modality } from "@google/genai";
import { ImagePart } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // In a real application, you might want to show a friendly error to the user.
    // For this environment, we assume the key is always present.
    console.warn("API_KEY environment variable is not set. The app will not function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });
const identificationModel = 'gemini-2.5-pro';
const segmentationModel = 'gemini-2.5-flash-image';

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:mime/type;base64,..."
            // we want just the "..." part
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Helper to create the Gemini image part
const fileToGenerativePart = async (file: File): Promise<ImagePart> => {
    const base64Data = await fileToBase64(file);
    return {
        inlineData: {
            mimeType: file.type,
            data: base64Data,
        },
    };
};

export const identifyObjectsInImage = async (imageFile: File): Promise<string[]> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: "Identifique os principais objetos nesta imagem. Responda com uma lista de itens separados por vírgula, em português. Por exemplo: 'carro, árvore, céu'. Não adicione nenhuma outra formatação ou texto introdutório.",
    };

    try {
        const response = await ai.models.generateContent({
            model: identificationModel,
            contents: { parts: [imagePart, textPart] },
        });

        const rawText = response.text.trim();
        if (!rawText) {
            return [];
        }
        // Clean up response: remove potential quotes and split
        const cleanedText = rawText.replace(/['"`]/g, '');
        return cleanedText.split(',').map(item => item.trim()).filter(Boolean);
    } catch (error) {
        console.error("Error identifying objects:", error);
        throw new Error("Não foi possível identificar objetos na imagem. Tente novamente.");
    }
};

export const segmentObjectInImage = async (imageFile: File, objectName: string): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `Isole o seguinte objeto da imagem: '${objectName}'. Coloque o objeto isolado sobre um fundo totalmente branco. Retorne apenas a imagem resultante, sem texto adicional.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: segmentationModel,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("A API não retornou uma imagem.");

    } catch (error) {
        console.error("Error segmenting object:", error);
        throw new Error("Não foi possível isolar o objeto. Tente outro objeto ou imagem.");
    }
};
