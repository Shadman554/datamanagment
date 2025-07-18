// Simple script to clear rate limiting by restarting the server
// The rate limiting is stored in memory, so restarting clears it

import { exec } from 'child_process';

console.log('Clearing rate limits by restarting server...');

// Kill any existing server processes on port 5000
exec('netstat -ano | findstr :5000', (error, stdout) => {
  if (stdout) {
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        const pid = match[1];
        exec(`taskkill /F /PID ${pid}`, (err) => {
          if (!err) {
            console.log(`Killed process ${pid}`);
          }
        });
      }
    });
  }
  
  // Wait a moment then restart
  setTimeout(() => {
    console.log('Rate limits cleared! You can now try logging in again.');
    console.log('Restart the server with: npm start');
  }, 2000);
});
