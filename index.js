const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js');
const config = require('./config');

// Native HTTP server for Mozzex Capital Official Website & Render 24/7 Hosting (Initialized FIRST)
const http = require('http');
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  if (req.url === '/healthz' || req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      service: 'Mozzex Capital Official Platform',
      status: 'ONLINE',
      uptime: Math.floor(process.uptime()),
      guilds: client.guilds ? client.guilds.cache.size : 0
    }));
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';

  let filePath = path.join(__dirname, 'public', safePath);
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (e) {}

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const fallbackPath = path.join(__dirname, 'public', 'index.html');
        fs.readFile(fallbackPath, (fallbackErr, fallbackContent) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(fallbackContent);
        });
      } else {
        res.writeHead(500);
        return res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`🌐 [Mozzex Capital Web] Website & Health-check listening on port ${port}`);
});

if (!config.token) {
  console.warn('[Warning] DISCORD_TOKEN is missing in .env! Running web server in standalone mode.');
} else {
  // Login to Discord Bot
  client.login(config.token).catch(err => {
    console.error('[Login Failed]', err);
  });
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

// Load Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[Command Loaded] /${command.data.name}`);
    } else {
      console.warn(`[Warning] Command at ${filePath} is missing "data" or "execute".`);
    }
  }
}

// Load Events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[Event Loaded] ${event.name}`);
  }
}

// Error Handling
process.on('unhandledRejection', error => {
  console.error('[Unhandled Rejection]', error);
});

process.on('uncaughtException', error => {
  console.error('[Uncaught Exception]', error);
});


