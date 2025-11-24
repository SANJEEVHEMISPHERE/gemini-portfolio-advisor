const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: String,
  preferences: {
    riskTolerance: String,
    investmentAmount: Number,
    sectors: [String],
    timeHorizon: String,
  },
  recommendations: [{
    symbol: String,
    name: String,
    allocation: Number,
    rationale: String,
    expectedReturn: String,
    risk: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate Portfolio Recommendations
app.post('/api/generate-portfolio', async (req, res) => {
  try {
    const { riskTolerance, investmentAmount, sectors, timeHorizon } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As a financial advisor, create a stock portfolio recommendation with the following parameters:
- Risk Tolerance: ${riskTolerance}
- Investment Amount: $${investmentAmount}
- Preferred Sectors: ${sectors.join(', ')}
- Time Horizon: ${timeHorizon}

Provide 5-7 specific stock recommendations with:
1. Stock symbol and company name
2. Allocation percentage (must total 100%)
3. Clear rationale for each pick
4. Expected return range
5. Risk level

Format as JSON array with objects containing: symbol, name, allocation, rationale, expectedReturn, risk`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    let recommendations;
    
    if (jsonMatch) {
      recommendations = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback parsing if JSON not found
      recommendations = parseTextResponse(text);
    }

    // Save to database
    const portfolio = new Portfolio({
      userId: req.body.userId || 'anonymous',
      preferences: { riskTolerance, investmentAmount, sectors, timeHorizon },
      recommendations,
    });

    await portfolio.save();

    res.json({
      success: true,
      portfolio: {
        id: portfolio._id,
        recommendations,
        preferences: portfolio.preferences,
      },
    });
  } catch (error) {
    console.error('Error generating portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate portfolio recommendations',
      details: error.message,
    });
  }
});

// Get Portfolio History
app.get('/api/portfolio-history/:userId', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      portfolios,
    });
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio history',
    });
  }
});

// Get Single Portfolio
app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
      });
    }

    res.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio',
    });
  }
});

// Helper function to parse text response
function parseTextResponse(text) {
  const stocks = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  // Simple parsing logic - adjust based on actual Gemini output format
  let currentStock = {};
  
  lines.forEach(line => {
    if (line.includes('Symbol:') || line.includes('Ticker:')) {
      if (currentStock.symbol) stocks.push(currentStock);
      currentStock = {
        symbol: line.split(':')[1]?.trim() || '',
        name: '',
        allocation: 0,
        rationale: '',
        expectedReturn: '',
        risk: '',
      };
    } else if (line.includes('Name:') || line.includes('Company:')) {
      currentStock.name = line.split(':')[1]?.trim() || '';
    } else if (line.includes('Allocation:')) {
      const allocMatch = line.match(/(\d+)%/);
      currentStock.allocation = allocMatch ? parseInt(allocMatch[1]) : 0;
    } else if (line.includes('Rationale:') || line.includes('Reason:')) {
      currentStock.rationale = line.split(':')[1]?.trim() || '';
    } else if (line.includes('Expected Return:') || line.includes('Return:')) {
      currentStock.expectedReturn = line.split(':')[1]?.trim() || '';
    } else if (line.includes('Risk:')) {
      currentStock.risk = line.split(':')[1]?.trim() || '';
    }
  });
  
  if (currentStock.symbol) stocks.push(currentStock);
  
  return stocks.length > 0 ? stocks : getDefaultPortfolio();
}

// Fallback portfolio
function getDefaultPortfolio() {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      allocation: 25,
      rationale: 'Strong brand, consistent revenue growth, leading in technology innovation',
      expectedReturn: '8-12% annually',
      risk: 'Medium',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      allocation: 20,
      rationale: 'Diversified revenue streams, cloud computing leader, strong fundamentals',
      expectedReturn: '10-15% annually',
      risk: 'Medium',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      allocation: 20,
      rationale: 'Dominant search engine, advertising revenue, AI investments',
      expectedReturn: '9-13% annually',
      risk: 'Medium',
    },
    {
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      allocation: 20,
      rationale: 'Broad market exposure, low fees, diversification across sectors',
      expectedReturn: '7-10% annually',
      risk: 'Low-Medium',
    },
    {
      symbol: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      allocation: 15,
      rationale: 'Fixed income stability, portfolio balance, capital preservation',
      expectedReturn: '3-5% annually',
      risk: 'Low',
    },
  ];
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
