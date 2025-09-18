// server/index.js (snippet)
import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
// ... other imports and setup

const app = express();

// ... middleware (cors, express.json, etc.)

app.use('/api/orders', orderRoutes); // Mount order routes

// ... error handling middleware, app.listen, etc.
