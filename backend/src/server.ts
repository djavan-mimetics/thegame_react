import { buildApp } from './app.js';
import { getConfig } from './config.js';

const app = await buildApp();
const config = getConfig(app);

await app.listen({ port: config.PORT, host: config.HOST });
