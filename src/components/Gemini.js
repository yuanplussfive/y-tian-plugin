const handleGeminiCompletions = async (req, res, FreeGemini_1, FreeGemini_2, FreeGemini_3, fetch, crypto) => {
  try {
    const { messages } = req.body;
    let response;
    const functionsToTry = [
      FreeGemini_2, 
      FreeGemini_1, 
      FreeGemini_3
    ];
    for (let func of functionsToTry) {
      response = await func(messages, fetch, crypto);
      if (response) break;
    }
    if (!response) {
      res.status(500).json({ error: "No valid response obtained from any services." });
      return;
    }
    res.send(response);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'Server error' }); 
  }
};

module.exports = { handleGeminiCompletions };