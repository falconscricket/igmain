const colors = { info: '\x1b[36m', success: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
const ts = () => new Date().toISOString();
export const logger = {
  info:    (m) => console.log(`${colors.info}[${ts()}] [INFO] ${m}${colors.reset}`),
  success: (m) => console.log(`${colors.success}[${ts()}] [SUCCESS] ${m}${colors.reset}`),
  warn:    (m) => console.warn(`${colors.warn}[${ts()}] [WARN] ${m}${colors.reset}`),
  error:   (m, e) => console.error(`${colors.error}[${ts()}] [ERROR] ${m}${e ? ' -> ' + e.message : ''}${colors.reset}`),
  debug:   (m) => console.log(`[${ts()}] [DEBUG] ${m}`),
};
