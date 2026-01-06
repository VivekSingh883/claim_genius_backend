import fs from 'fs';
import path from 'path';

// path logs file is created
const logDir = path.join(process.cwd(), 'logs'); //cwd(): current working directory

// Create log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Helper to get timestamp
const getTimeStamp = () => {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }); // e.g., 15/10/2025, 22:16:57
};

// Define color codes for console
const colors = {
  reset: '\x1b[0m', //ANSI excape codes for coloring text in terminal
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  fg: {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
  },
};

// Function to write log to file
const writeToFile = (filename: string, message: string) => {
  const filePath = path.join(logDir, filename);
  fs.appendFileSync(filePath, message + '\n');
};

// Core logger object
const logger = {
  info: (message: string) => {
    //message: log text
    const log = `[${getTimeStamp()}] INFO: ${message}`;
    console.log(colors.fg.green + log + colors.reset);
    writeToFile('info.log', log);
  },

  warn: (message: string) => {
    const log = `[${getTimeStamp()}] WARN: ${message}`;
    console.log(colors.fg.yellow + log + colors.reset);
    writeToFile('warn.log', log);
  },

  error: (message: string) => {
    const log = `[${getTimeStamp()}] ERROR: ${message}`;
    console.log(colors.fg.red + log + colors.reset);
    writeToFile('error.log', log);
  },

  debug: (message: string) => {
    const log = `[${getTimeStamp()}] DEBUG: ${message}`;
    console.log(colors.fg.cyan + log + colors.reset);
    writeToFile('debug.log', log);
  },
};

export default logger;
