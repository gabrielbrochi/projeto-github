require('dotenv').config();
const { createClient } = require('redis');

const cliente = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

cliente.on('error', (err) => console.error('Erro Redis:', err));

cliente.connect().catch(console.error);

module.exports = cliente;
