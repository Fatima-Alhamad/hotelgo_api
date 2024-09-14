const faker = require('faker');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const User = require('../models/userSchema');

async function connection() {
  try {
    const connect = await mongoose.connect(`mongodb://localhost:27017/hotelgo`);
    console.log('the Db connected successfully');
  } catch (error) {
    console.log(error.message);
  }
}


const generateRandomUsers = async () => {
  const users = [];

  for (let i = 0; i < 20; i++) {
    users.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      phoneNumber: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
    });
  }
  return users;
};

const importData = async () => {
  try {
    await connection();
    const users = await generateRandomUsers();
    await User.create(users);
    console.log('users imported successfully');
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};

const deleteUsers = async () => {
  try {
    await connection();
    await User.deleteMany({});
    console.log('users deleted successfully !');
    process.exit();
  } catch (err) {
    console.log(err.message);
  }
};
if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteUsers();
}
