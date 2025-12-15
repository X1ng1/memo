import { HfInference } from '@huggingface/inference';

// Lazy initialization - client is created on first use after env vars are loaded
let hf = null;

const getHfClient = () => {
    if (!hf) {
        const apiKey = process.env.HUGGINGFACE_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️  HUGGINGFACE_API_KEY not found. Using unauthenticated requests (lower rate limits).');
        } else {
            console.log('✓ HuggingFace API initialized with key:', apiKey.substring(0, 6) + '...');
        }
        
        hf = new HfInference(apiKey);
    }
    return hf;
};

/**
 * Emotion to color mapping based on the model's output labels
 * Model outputs: anger, disgust, fear, joy, neutral, sadness, surprise
 */
const emotionColorMap = {
    'anger': '#dc2626',      // red
    'disgust': '#65a30d',    // green
    'fear': '#7c3aed',       // purple
    'joy': '#fbbf24',        // yellow/gold
    'neutral': '#ffffff',    // white
    'sadness': '#2563eb',    // blue
    'surprise': '#ec4899'    // pink
};

/**
 * Classify emotion from text using HuggingFace model
 * Model: j-hartmann/emotion-english-distilroberta-base
 * 
 * @param {string} text - The journal entry content to classify
 * @returns {Promise<{emotion: string, confidence: number, color: string, allScores: array}>}
 */
export const classifyEmotion = async (text) => {
    try {
        // Handle empty or very short text
        if (!text || text.trim().length < 3) {
            return {
                emotion: 'neutral',
                confidence: 1.0,
                color: emotionColorMap['neutral'],
                allScores: []
            };
        }

        // Call HuggingFace model for emotion classification
        const client = getHfClient();
        const result = await client.textClassification({
            model: 'j-hartmann/emotion-english-distilroberta-base',
            inputs: text
        });

        // Log all emotion scores for debugging
        console.log('Emotion classification results for text:', text.substring(0, 100));
        console.log('All scores:', result);

        // Result is an array of {label, score} objects sorted by score
        const topEmotion = result[0];
        const emotion = topEmotion.label.toLowerCase();
        const confidence = topEmotion.score;
        
        // Smart emotion selection: if top is neutral and confidence is low,
        // consider the second emotion if it's close in score
        let finalEmotion = emotion;
        let finalConfidence = confidence;
        
        if (emotion === 'neutral' && result.length > 1) {
            const secondEmotion = result[1];
            const scoreDiff = confidence - secondEmotion.score;
            
            // If neutral's lead is less than 0.2 (20%), prefer the second emotion
            // This helps capture subtle negative emotions that might be classified as neutral
            if (scoreDiff < 0.2) {
                finalEmotion = secondEmotion.label.toLowerCase();
                finalConfidence = secondEmotion.score;
                console.log(`Switching from neutral (${confidence.toFixed(3)}) to ${finalEmotion} (${finalConfidence.toFixed(3)}) - score diff: ${scoreDiff.toFixed(3)}`);
            }
        }
        
        const color = emotionColorMap[finalEmotion] || '#6b7280';

        console.log(`Final emotion: ${finalEmotion} (confidence: ${finalConfidence.toFixed(3)}, color: ${color})`);

        return {
            emotion: finalEmotion,
            confidence: finalConfidence,
            color,
            allScores: result.map(r => ({
                emotion: r.label.toLowerCase(),
                score: r.score
            }))
        };
    } catch (error) {
        console.error('Emotion classification error:', error);
        
        // Fallback to neutral on error
        return {
            emotion: 'neutral',
            confidence: 0.5,
            color: emotionColorMap['neutral'],
            allScores: [],
            error: error.message
        };
    }
};

/**
 * Get color for a specific emotion
 * @param {string} emotion - The emotion name
 * @returns {string} Hex color code
 */
export const getEmotionColor = (emotion) => {
    return emotionColorMap[emotion.toLowerCase()] || emotionColorMap['neutral'];
};

/**
 * Get all available emotions and their colors
 * @returns {object} Emotion to color mapping
 */
export const getEmotionColorMap = () => {
    return { ...emotionColorMap };
};
