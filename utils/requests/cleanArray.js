export const cleanArray = async (array) => {
    let indexesToRemove = [];
    for(let i = 0; i < array.length; i++) {
        if(Array.isArray(array[i].content)) {
            indexesToRemove.push(i);
            let j = i + 1;
            while(j < array.length && array[j].role === 'assistant') {
                indexesToRemove.push(j);
                j++;
            }
        }
    }
    for(let i = indexesToRemove.length - 1; i >= 0; i--) {
        array.splice(indexesToRemove[i], 1);
    }
    return array;
}