/**
 * SelfSubmit API entrypoint.
 * Loads environment, initialises Firebase Admin once, then starts Express.
 */
require('dotenv').config();

const { initFirebase } = require('./src/config/firebase');
const app = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

initFirebase();

app.listen(PORT, () => {
  console.log(`SelfSubmit API listening on port ${PORT}`);
});
