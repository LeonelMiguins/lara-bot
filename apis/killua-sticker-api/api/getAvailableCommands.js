const { defaultApi } = require("./defaultApi");

module.exports = (...args) => defaultApi.getAvailableCommands(...args);
