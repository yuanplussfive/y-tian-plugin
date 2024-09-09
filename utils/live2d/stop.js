const { execSync } = require('child_process');

const stopCommand = process.platform === 'win32' ? 'taskkill /F /IM node.exe' : 'pkill node';

try {
  execSync(stopCommand);
  console.log('Node.js processes successfully stopped.');
} catch (error) {
  console.error('Failed to stop Node.js processes:', error);
}