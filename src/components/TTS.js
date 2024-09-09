const handleTTSCompletions = async (req, res, getAudioFromTPS_1) => {
 try {
   const { message } = req.body;
   const responseData = await getAudioFromTPS_1(message)
    res.send(responseData); 
  } catch (error) {
    res.send('Server error'); 
  }
};

module.exports = { handleTTSCompletions };