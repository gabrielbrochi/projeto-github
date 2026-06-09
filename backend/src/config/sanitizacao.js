const sanitize = require('perfect-express-sanitizer');

// Export the sanitizer middleware configured for the app
module.exports = sanitize.clean({
  xss: true,
  noSql: true,
  sql: true,
  level: 5
});
