const handleDalleCompletions = async (req, res, FreeDalle_1, fetch, crypto) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeDalle_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleDalleCompletions };