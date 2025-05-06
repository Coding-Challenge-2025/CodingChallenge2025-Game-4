import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './routes/api.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.json());

// routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'VoxelCode server is running',
     }); 
})

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: true,
        message: 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    })
})

app.listen(PORT, () => {
    console.log(`VoxelCode server is running on port ${PORT}`);
});
