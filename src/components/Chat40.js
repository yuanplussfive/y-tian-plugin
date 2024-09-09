const handleChat40Completions = async (req, res, FreeChat40_1, FreeChat40_2, FreeChat40_3,    FreeChat40_4, FreeChat40_5, fetch, crypto) => {
  try {
    const { messages } = req.body;
    let response;
    const functionsToTry = [
      FreeChat40_5,
      FreeChat40_4,
      FreeChat40_3,
      FreeChat40_2,
      FreeChat40_1
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

module.exports = { handleChat40Completions };