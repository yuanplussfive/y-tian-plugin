import { Chatnio } from '../../ChatModels/chatnio/chatnio.js';

export const Chatnio_glm4v = async (messages, fileUrl) => {
    const result = await Chatnio('glm-4v-flash', messages, fileUrl);
    return result;
}