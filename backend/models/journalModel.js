import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    user_email: {type: String, required: true},
    emotionColor: {type: String, default: "#FFFF"},
    content: {type: String, required: true}
});

const journalModel = mongoose.models.journal || mongoose.model('journal', journalSchema);

export default journalModel;