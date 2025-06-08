const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MAX_RESTARTS = 5;
const RESTART_DELAY = 3000; // 3 seconds
const LOG_FILE = path.join(__dirname, '../server-monitor.log');

// State tracking
let restartCount = 0;
let lastRestartTime = 0;
let serverProcess = null;

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
  
  // Wait a moment to ensure processes are killed
  setTimeout(() => {
    // Start the Next.js server
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000' },
      stdio: 'pipe'
    });
    
    log(`Server started with PID: ${serverProcess.pid}`);
    
    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output.includes('Ready') || output.includes('started')) {
        log('Server is ready and running');
      }
      // Log important messages
      if (output.includes('error') || output.includes('Error') || 
          output.includes('warn') || output.includes('Warning')) {
        log(`Server output: ${output}`);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      log(`Server error: ${data.toString().trim()}`);
    });
    
    // Handle server exit
    serverProcess.on('close', (code) => {
      log(`Server process exited with code ${code}`);
      handleServerExit(code);
    });
    
    serverProcess.on('error', (error) => {
      log(`Failed to start server: ${error.message}`);
      handleServerExit(1);
    });
  }, 1000);
}

// Handle server exit and restart if needed
function handleServerExit(code) {
  // Don't restart if exit was clean (code 0)
  if (code === 0) {
    log('Server exited cleanly, not restarting');
    return;
  }
  
  const now = Date.now();
  const timeSinceLastRestart = now - lastRestartTime;
  
  // Reset restart count if it's been more than 60 seconds since last restart
  if (timeSinceLastRestart > 60000) {
    restartCount = 0;
  }
  
  // Check if we've hit the maximum number of restarts
  if (restartCount >= MAX_RESTARTS) {
    log(`Maximum restart attempts (${MAX_RESTARTS}) reached. Giving up.`);
    return;
  }
  
  // Increment restart count and update last restart time
  restartCount++;
  lastRestartTime = now;
  
  log(`Restarting server (attempt ${restartCount}/${MAX_RESTARTS}) in ${RESTART_DELAY/1000} seconds...`);
  
  // Restart the server after a delay
  setTimeout(startServer, RESTART_DELAY);
}

// Handle process signals
process.on('SIGINT', () => {
  log('Received SIGINT signal, shutting down...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal, shutting down...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

// Start the server initially
log('Server monitor starting...');
startServer();
