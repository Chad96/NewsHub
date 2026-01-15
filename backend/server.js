import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend running ✅' });
});

// News endpoint
app.get('/api/news', async (req, res) => {
  try {
    const {
      category = 'technology',
      country = 'us',
      pageSize = 20
    } = req.query;

    const url = `${NEWS_API_BASE_URL}/top-headlines?` +
      `category=${category}&country=${country}` +
      `&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
