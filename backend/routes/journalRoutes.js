import express from 'express';
import { createEntry, getEntries, getEntryByDate, updateStickers } from '../controllers/journalController.js';
import userAuth from '../middleware/userAuth.js';

const journalRouter = express.Router();

journalRouter.post('/create-entry', createEntry);
journalRouter.get('/get-entries', userAuth, getEntries);
journalRouter.get('/get-entry-date', userAuth, getEntryByDate);
journalRouter.post('/update-stickers', userAuth, updateStickers);

export default journalRouter;