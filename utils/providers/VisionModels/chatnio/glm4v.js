import { Chatnio } from '../../ChatModels/chatnio/chatnio.js';

export const Chatnio_glm4v = async (messages, fileUrl) => {
    const result = await Chatnio(messages, 'glm-4v-flash', fileUrl);
    return result;
}