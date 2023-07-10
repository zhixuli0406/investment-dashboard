import express from 'express';
import { historicalDB } from './mongoDB.js'

const router = express.Router();

router.get('/historical/candles', async (req, res) => {
    let col = historicalDB.collection(`${req.query.symbol}`)
    const data = await col.find().sort({ 'date': 1 }).toArray();
    return res.json(data);
})

export default router;