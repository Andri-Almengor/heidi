import { env } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Heidi Quiz Backend escuchando en el puerto ${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} recibido. Cerrando servidor...`);
  server.close((error) => {
    if (error) {
      console.error('Error al cerrar el servidor:', error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
