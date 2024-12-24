import { cleanArray } from '../../../requests/cleanArray.js';
import fetch from 'node-fetch';

export const airforce = async (messages, model) => {
    messages = await cleanArray(messages);
    const api_url = "https://api.airforce/chat/completions";
    const headers = {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br", 
      "Accept-Language": "en-US,en;q=0.9",
      Authorization: "Bearer missing api key",
      Origin: "https://llmplayground.net",
      Referer: "https://llmplayground.net/",
      "Content-Type": "application/json"
    };
    const MESSAGE_MAX_CHARS = 990;
    const formatMessages = (messages) => {
      let formatted = [];
      for (let msg of messages) {
        let content = msg.content;
        while (content.length > 0) {
          const chunk = content.substring(0, MESSAGE_MAX_CHARS);
          content = content.substring(MESSAGE_MAX_CHARS);
          formatted.push({ role: msg.role, content: chunk });
          if (content.length) {
            formatted.push({ 
              role: msg.role === "user" ? "assistant" : "user", 
              content: "[system: continuing message]" 
            });
          }
        }
      }
      return formatted;
    };
  
    try {
      const payload = {
        messages: formatMessages(messages),
        model: model || "gpt-4o",
        max_tokens: 100000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      };
  
      const response = await fetch(api_url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });
  
      const result = await response.json();
      const output = result.choices[0].message.content
      const checkRateLimitAndAd = (inputString) => {
        if (inputString.includes("discord") && inputString.includes("limit")) {
          return null;
        } else {
          return inputString;
        }
      };
      return checkRateLimitAndAd(output);
    } catch (error) {
      return null;
    }
  }