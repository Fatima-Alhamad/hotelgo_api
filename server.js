process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! shuting down...');
  console.log(err);
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
async function connection() {
  try {
    const connect = await mongoose.connect(process.env.LOCAL_DATABASE);
    console.log('the Db connected successfully');
  } catch (error) {
    console.log(error.message);
  }
}
connection();
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`the server is listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection! the app Shutdown...');
  ServiceWorkerRegistration.close(() => {
    process.exit(1);
  });
});
