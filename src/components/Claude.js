const handleClaudeCompletions = async (req, res, FreeClaude_1, fetch, crypto) => {
  try {
        const { messages } = req.body;
        const response = await FreeClaude_1(messages, fetch, crypto)
        if (response) {
            res.send(response);
        } else {
            res.status(500).json({ error: "No valid response obtained from any services." });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Server error' }); 
    }
};

module.exports = { handleClaudeCompletions };