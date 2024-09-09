const handleSDCompletions = async (req, res, FreeStableDiffusion_1, fetch, crypto) => {
  try {
   const { messages } = req.body;
   const responseData = await FreeStableDiffusion_1(messages, fetch, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleSDCompletions };