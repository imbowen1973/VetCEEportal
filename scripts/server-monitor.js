const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MAX_RESTARTS = 5;
const RESTART_DELAY = 5000; // 5 seconds
const LOG_FILE = path.join(__dirname, 'server-monitor.log');

// State tracking
let restartCount = 0;
let lastRestartTime = 0;
let serverProcess = null;

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Start the server
function startServer() {
  log('Starting server...');
  
  // Kill any existing Next.js processes
  try {
    const killCommand = spawn('pkill', ['-f', 'next']);
    killCommand.on('close', (code) => {
      log(`Killed existing processes with exit code: ${code}`);
    });
  } catch (error) {
    log(`Error killing existing processes: ${error.message}`);
  }
  
  // Start the Next.js server
  serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'pipe',
    detached: false
  });
  
  // Track process ID
  log(`Server started with PID: ${serverProcess.pid}`);
  
  // Handle stdout
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('error') || output.includes('Error') || output.includes('ERROR')) {
      log(`[ERROR] ${output}`);
    } else if (output.includes('Ready')) {
      log(`[SUCCESS] ${output}`);
    }
  });
  
  // Handle stderr
  serverProcess.stderr.on('data', (data) => {
    log(`[ERROR] ${data.toString().trim()}`);
  });
  
  // Handle server exit
  serverProcess.on('close', (code) => {
    log(`Server process exited with code ${code}`);
    
    // Check if we should restart
    const now = Date.now();
    if (now - lastRestartTime > 60000) { // Reset counter if last restart was more than 1 minute ago
      restartCount = 0;
    }
    
    if (restartCount < MAX_RESTARTS) {
      log(`Restarting server in ${RESTART_DELAY / 1000} seconds... (Attempt ${restartCount + 1}/${MAX_RESTARTS})`);
      setTimeout(startServer, RESTART_DELAY);
      restartCount++;
      lastRestartTime = now;
    } else {
      log(`Maximum restart attempts (${MAX_RESTARTS}) reached. Please check server logs for errors.`);
    }
  });
  
  // Handle monitor process errors
  serverProcess.on('error', (err) => {
    log(`Failed to start server process: ${err.message}`);
  });
}

// Handle monitor process signals
process.on('SIGINT', () => {
  log('Monitor received SIGINT signal');
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Monitor received SIGTERM signal');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Start the monitoring
log('Server monitor started');
startServer();

// Keep the monitor process running
setInterval(() => {
  // Check if server is still running
  if (serverProcess && serverProcess.exitCode !== null) {
    log('Detected server process has exited unexpectedly');
    startServer();
  }
}, 10000);
