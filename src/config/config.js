const packageJson = require('../../package.json');
const bot = require('./bot');
const paths = require('./paths');
const pairing = require('./pairing');
const connection = require('./connection');
const puppeteer = require('./puppeteer');
const features = require('./features');
const antiFlood = require('./antiFlood');
const antiLink = require('./antiLink');
const links = require('./links');
const groupRules = require('./rules');
const messageStyle = require('./messageStyle');

module.exports = {
  ...bot,
  version: packageJson.version,
  authStrategy: 'local',
  paths,
  pairing,
  connection,
  puppeteer,
  features,
  antiFlood,
  antiLink,
  groupRules,
  messageStyle,
  blacklist: links,
};
