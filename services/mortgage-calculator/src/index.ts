import express from 'express';
import cors from 'cors';
import { calculateMortgage, MortgageParams } from './lib/calculator';

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.post('/calculate', (req, res) => {
  try {
    const params: MortgageParams = req.body;
    const result = calculateMortgage(params);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid calculation request' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Mortgage calculator service listening at http://localhost:${port}`);
});
