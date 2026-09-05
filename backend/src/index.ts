import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const port = Number(process.env.PORT || 5000);
createApp().listen(port, () => console.log(`Server running on ${port}`));
