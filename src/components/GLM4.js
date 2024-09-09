const handleGLM4Completions = async (req, res, chatglm4, fetch, crypto) => {
  try {
    const { messages } = req.body;
    const responseData = await chatglm4(messages, fetch, crypto);
    res.send(responseData);
  } catch (error) {
    res.send('Server error');
  }
};

module.exports = { handleGLM4Completions };