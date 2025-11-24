# Stock Portfolio Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `stock-portfolio`

3. **Get Gemini API Key**
   - Go to https://ai.google.dev/
   - Sign up and get your free API key

4. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your MongoDB URI
   - Add your Gemini API key

5. **Run the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will run on `http://localhost:3000`

## API Endpoints

### POST /api/generate-portfolio
Generate portfolio recommendations
```json
{
  "riskTolerance": "moderate",
  "investmentAmount": 10000,
  "sectors": ["Technology", "Healthcare"],
  "timeHorizon": "5-10 years",
  "userId": "user123"
}
```

### GET /api/portfolio-history/:userId
Get user's portfolio history

### GET /api/portfolio/:id
Get specific portfolio by ID

## Notes
- Make sure MongoDB is running before starting the server
- The free Gemini API has rate limits
- Update the frontend API URL to point to this backend
