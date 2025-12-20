import journalModel from "../models/journalModel.js";
import userModel from "../models/userModel.js";
import { classifyEmotion } from "../services/emotionService.js";

export const createEntry = async(req, res) => {
    const {title, date, user_email, content} = req.body;
    if (!title || !date || !user_email || !content) {
        return res.json({success: false, message: 'Missing details'});
    }
    try {
        // Normalize the date to start of day to ensure consistent comparison
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        // Check if an entry already exists for this user and date
        const existingEntry = await journalModel.findOne({
            user_email: user_email,
            date: dateObj
        });

        const emotionData = await classifyEmotion(content);
        const finalEmotionColor = emotionData.color;

        if (existingEntry) {
            return res.json({success: false, message: 'Journal entry already exists for this date.'});
        } else {
            const entry = new journalModel({
                title, 
                date: dateObj, 
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
        }
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
    try {
        const userId = req.userId; // From userAuth middleware
        const { date } = req.query;
        
        if (!date) {
            return res.json({success: false, message: "Date required"});
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({success: false, message: 'User not found'});
        }

        // Parse date string as YYYY-MM-DD and create UTC dates to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        console.log('Looking for entry between:', startOfDay, 'and', endOfDay);
        console.log('User email:', user.email);

        const entry = await journalModel.findOne({
            user_email: user.email,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        
        console.log('Found entry:', entry ? 'YES' : 'NO');
        if (entry) {
            console.log('Entry date in DB:', entry.date);
        }
        
        res.json({
            success: true,
            entry: entry
        });
    } catch (error) {
        console.error('getEntryByDate error:', error);
        res.json({success: false, message: error.message});
    }
};

export const updateStickers = async(req, res) => {
    try {
        const userId = req.userId;
        const { date, stickers } = req.body;
        
        if (!date) {
            return res.json({success: false, message: "Date required"});
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({success: false, message: 'User not found'});
        }

        // Parse date and find entry
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        const entry = await journalModel.findOneAndUpdate(
            {
                user_email: user.email,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            },
            { stickers: stickers || [] },
            { new: true }
        );
        
        if (!entry) {
            return res.json({success: false, message: 'Entry not found'});
        }
        
        res.json({success: true, entry});
    } catch (error) {
        console.error('updateStickers error:', error);
        res.json({success: false, message: error.message});
    }
};