import express from 'express';
import { createEntry, getEntries } from '../controllers/journalController.js';
import userAuth from '../middleware/userAuth.js';

const journalRouter = express.Router();

journalRouter.post('/create-entry', createEntry);
journalRouter.get('/get-entries', userAuth, getEntries);

export default journalRouter;