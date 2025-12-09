// utils/safeRequire.js
function safeRequire(path) {
  try {
    return require(path);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn(`[${new Date().toISOString()}] ⚠️ Optional module not found: ${path}`);
      return null;
    }
    throw err; // real errors (syntax, etc.) should still bubble up
  }
}

module.exports = safeRequire;