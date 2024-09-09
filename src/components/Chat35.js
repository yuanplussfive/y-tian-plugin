const handleChat35Completions = async (req, res, FreeChat35_1, FreeChat35_2, FreeChat35_3, FreeChat35_4, FreeChat35_5, FreeChat35_6, fetch, crypto) => {
  try {
    const { messages } = req.body;
    let response;
    const functionsToTry = [
      FreeChat35_6,
      FreeChat35_5,
      FreeChat35_2,
      FreeChat35_4,
      FreeChat35_3,
      FreeChat35_1
    ];
    for (let func of functionsToTry) {
      response = await func(messages, fetch, crypto);
      //console.log(response)
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

module.exports = { handleChat35Completions };