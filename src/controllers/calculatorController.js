const { GoogleGenerativeAI } = require('@google/generative-ai');
const calculatorUtils = require('../utils/calculatorUtils');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Calculate water footprint based on user inputs
 */
exports.calculateWaterFootprint = async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate input data
    if (!userData) {
      return res.status(400).json({ error: 'No user data provided' });
    }
    
    // Calculate water usage using utility functions
    const waterUsage = calculatorUtils.calculateTotalWaterUsage(userData);
    
    // Return the calculated water usage
    return res.status(200).json({ 
      success: true, 
      data: waterUsage
    });
    
  } catch (error) {
    console.error('Error calculating water footprint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate water footprint' 
    });
  }
};

/**
 * Get AI-generated advice based on water usage data
 */
exports.getAdvice = async (req, res) => {
  try {
    const { waterUsage, userData } = req.body;
    
    // Validate input data
    if (!waterUsage || !userData) {
      return res.status(400).json({ error: 'Incomplete data provided' });
    }

    // Create a prompt for Gemini - streamlined for more concise responses
    const prompt = `
      Provide SHORT and CONCISE water saving advice based on the following user data. 
      Keep your total response under 250 words.
      
      User's daily water usage: ${waterUsage.total} liters (${waterUsage.comparisonToAverage}% of average consumption)
      Highest usage category: ${waterUsage.highestCategory}
      
      User's key habits:
      - Diet: ${userData.diet || 'not specified'}
      - Shower: ${userData.shower || 'unknown'} minutes
      - Toilet flushes: ${userData.toiletFlushes || 'unknown'} times daily
      - Laundry: ${userData.laundry || 'unknown'} loads weekly
      ${userData.garden ? `- Garden watering: ${userData.garden} times weekly` : ''}
      
      Please provide:
      1. THREE specific actionable tips targeting their highest usage category
      2. Potential water savings in liters if these tips are followed
      3. ONE quick, interesting water-saving fact
      
      Format the advice in clear, numbered bullet points. Be direct and specific.
    `;

    // Generate content with Gemini - updated to use generative-ai v1 API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      advice: text
    });
    
  } catch (error) {
    console.error('Error getting AI advice:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate advice' 
    });
  }
}; 