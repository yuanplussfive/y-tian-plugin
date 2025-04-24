import { liblib } from './liblib.js';

export async function liblibClient(prompt) {
  try {
    const result = await liblib([{ role: "user", content: prompt }]);
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}