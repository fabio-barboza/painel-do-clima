require('dotenv').config();
const { getEnv } = require('./config/env');
const createApp = require('./app');

const { port } = getEnv();
const app = createApp();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
});
