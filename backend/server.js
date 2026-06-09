// Ponto de entrada do servidor
const app = require('./src/app');

const porta = process.env.PORT || 3001;

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
