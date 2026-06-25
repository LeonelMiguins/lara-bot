const path = require('path');
const { loadCommands } = require('../src/core/commandLoader');

const commands = loadCommands(path.join(__dirname, '..', 'src', 'commands'));
const uniqueCommandNames = [...new Set([...commands.values()].map((command) => command.name))];

console.log(`Comandos carregados: ${uniqueCommandNames.length}`);
for (const commandName of uniqueCommandNames) {
  console.log(`- ${commandName}`);
}
