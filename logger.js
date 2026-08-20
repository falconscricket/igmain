/**
 * logger.js
 * ---------------------------------------------------------------
 * Minimal, dependency-free logger that prefixes every line with a
 * timestamp and a level tag. Keeping this dependency-free avoids
 * pulling in a heavy logging library for what is a small bot.
 * ---------------------------------------------------------------
 */

function timestamp() {
  return new Date().toISOString();
}

function format(level, message) {
  return `[${timestamp()}] [${level}] ${message}`;
}

export const logger = {
  info(message) {
    console.log(format('INFO', message));
  },

  warn(message) {
    console.warn(format('WARN', message));
  },

  error(message, err) {
    if (err instanceof Error) {
      console.error(format('ERROR', `${message} -> ${err.message}`));
      if (err.stack) {
        console.error(err.stack);
      }
    } else if (err !== undefined) {
      console.error(format('ERROR', `${message} -> ${JSON.stringify(err)}`));
    } else {
      console.error(format('ERROR', message));
    }
  },

  success(message) {
    console.log(format('SUCCESS', message));
  },

  debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(format('DEBUG', message));
    }
  },
};

export default logger;
