import journalModel from "../models/journalModel.js";
import userModel from "../models/userModel.js";
import { classifyEmotion } from "../services/emotionService.js";

export const createEntry = async(req, res) => {
    const {title, date, user_email, content} = req.body;
    if (!title || !date || !user_email || !content) {
        return res.json({success: false, message: 'Missing details'});
    }
    try {
        // Auto-classify emotion from journal content
        const emotionData = await classifyEmotion(content);

        const finalEmotionColor = emotionData.color;
        
        const entry = new journalModel({
            title, 
            date, 
            user_email, 
            emotionColor: finalEmotionColor, 
            content,
            emotion: emotionData.emotion,
        });
        
        await entry.save();
        
        return res.json({
            success: true,
            emotionData: {
                emotion: emotionData.emotion,
                confidence: emotionData.confidence,
                color: emotionData.color
            }
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export const getEntries = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({success: false, message: 'User not found'});
        }

        const entries = await journalModel.find({user_email: user.email});
        res.json({
            success: true,
            entries: entries
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export const getEntryByDate = async(req, res) => {
    const { user_email, date } = req.body;
    if (!user_email || !date) {
        return res.json({success: false, message: "User email and date required"});
    }
    try {
        const entry = await journalModel.find({user_email: user_email, date: date});
        res.json({
            success: true,
            entry: entry
        });
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};