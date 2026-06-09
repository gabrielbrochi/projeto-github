const sanitize = require('perfect-express-sanitizer');

module.exports = sanitize.clean({
  xss: true,
  noSql: true,
  sql: true,
  level: 5
});
