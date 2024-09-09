async function processArray(arr, numbers) {
  const userCount = arr.reduce((count, obj) => obj.role === "user" ? count + 1 : count, 0);
  if (userCount >= numbers) {
    const systemIndex = arr.findIndex(obj => obj.role === "system");
    if (systemIndex !== -1) {
      return [arr[systemIndex], arr[arr.length - 1]];
    } else {
      return [arr[arr.length - 1]];
    }
  }
  return arr;
}

async function reduceConsecutiveRoles(messages) {
  const result = [];
  let previousItem = null;
  for (const item of messages) {
    if (previousItem && previousItem.role === item.role) {
      result.pop();
    }
    result.push(item);
    previousItem = item;
  }
  return result;
}

module.exports = { processArray, reduceConsecutiveRoles };