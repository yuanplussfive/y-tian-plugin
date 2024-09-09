const handleSearchCompletions = async (req, res, FreeSearch_1, fetch, crypto) => {
 try {
   const { messages } = req.body;
   const responseData = await FreeSearch_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleSearchCompletions };