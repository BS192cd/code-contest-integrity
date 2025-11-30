const axios = require('axios');

class AIPlagiarismService {
  constructor() {
    this.apiKey = process.env.AI_PLAGIARISM_API_KEY;
    this.apiUrl = process.env.AI_PLAGIARISM_API_URL;
  }

  async analyzeCode(code) {
    if (!this.apiKey || !this.apiUrl) {
      // Return a mock response if the API is not configured
      return { isAI: Math.random() > 0.8, confidence: Math.random() };
    }

    try {
      const response = await axios.post(this.apiUrl, 
        { code },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );
      return response.data;
    } catch (error) {
      console.error('AI plagiarism analysis error:', error);
      throw new Error('AI plagiarism analysis failed');
    }
  }
}

module.exports = new AIPlagiarismService();
