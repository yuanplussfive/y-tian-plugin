import { NoobxL } from './noobxl.js';

export async function huggingfaceClient(prompt) {
  try {
    const result = await NoobxL([{ role: "user", content: prompt }]);
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}
