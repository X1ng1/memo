import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/connect.js'
import authRouter from './routes/authRoutes.js'
import journalRouter from './routes/journalRoutes.js'
import userRouter from './routes/userRoutes.js'

// Load environment variables from config.env
dotenv.config({ path: './.env' })

// Verify environment variables are loaded
console.log('Environment variables loaded:');
console.log('- HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const app = express();
const port = process.env.PORT || 5000;
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

app.get('/', (req, res) => res.send("API Working fine"));
app.use('/api/auth', authRouter);
app.use('/api/journal', journalRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));