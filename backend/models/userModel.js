import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    emotionColor: {type: String, default: "#ffffffff"},
    emotionCount: {
        type: [{
            year: {type: Number, required: true},
            month: {type: Number, required: true}, // 1-12
            emotions: {
                type: Map,
                of: Number,
                default: {}
            }
        }],
        default: []
    }
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;