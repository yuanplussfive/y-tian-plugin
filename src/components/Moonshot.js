const handleMoonshotCompletions = async (req, res, FreeKimi_1, fetch, crypto) => {
try {
   const { messages } = req.body;
   const responseData = await FreeKimi_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleMoonshotCompletions };