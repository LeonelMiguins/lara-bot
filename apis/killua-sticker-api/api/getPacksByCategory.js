const { defaultApi } = require("./defaultApi");

module.exports = (...args) => defaultApi.getPacksByCategory(...args);
