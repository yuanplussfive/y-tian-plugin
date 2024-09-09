const handleGLM4VCompletions = async (req, res, chatglm4v, fetch, crypto) => {
  try {
   const { messages, imgUrl } = req.body;
   const last = messages.pop()
   const responseData = await chatglm4v(last.content, imgUrl, crypto)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleGLM4VCompletions };