import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if(!user) {
            return res.json({success: false, message: 'User not found'});
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                emotionColor: user.emotionColor
            }
        });
    } catch(error) {
        res.json({success: false, message: error.message});
    }
};

export const updateColor = async (req, res) => {
    const {email, userColor, addColor} = req.body;
    if (!email || !userColor || !addColor) {
        return res.json({success: false, message: 'Missing details.'});
    }
    try {
        const newColor = averageColor(userColor, addColor);
        const updatedUser = await userModel.findOneAndUpdate({email: email}, { $set: {emotionColor: newColor}});
        if (!updatedUser) {
            return res.json({success: false, message: 'Failed to update user emotion'});
        }
        return res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
};

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
        r: parseInt(clean.substring(0,2), 16),
        g: parseInt(clean.substring(2,4), 16),
        b: parseInt(clean.substring(4,6), 16)
    };
};

function rgbToHex({r,g,b}) {
    const toHex = (v) => v.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

function averageColor(hex1, hex2) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);

    return rgbToHex({
        r: Math.round((c1.r + c2.r) / 2),
        g: Math.round((c1.g + c2.g) / 2),
        b: Math.round((c1.b + c2.b) / 2),
    });
};