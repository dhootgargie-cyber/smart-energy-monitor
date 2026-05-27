require('dotenv').config();
const connectDB = require('./db');
const Building = require('./models/Building');
const Room = require('./models/Room');
const EnergyReading = require('./models/EnergyReading');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seed = async () => {
  await connectDB();

  await Building.deleteMany({});
  await Room.deleteMany({});
  await EnergyReading.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  const buildings = await Building.insertMany([
    { name: 'Main Block',  location: 'North Campus', totalFloors: 4 },
    { name: 'Lab Complex', location: 'East Campus',  totalFloors: 3 },
    { name: 'Library',     location: 'Central',      totalFloors: 2 },
  ]);
  console.log('Buildings created:', buildings.map(b => b.name));

  const rooms = await Room.insertMany([
    { name: 'Computer Lab 1',   floor: 1, buildingId: buildings[1]._id, deviceId: 'DEV-001', maxCapacityKW: 10 },
    { name: 'Computer Lab 2',   floor: 1, buildingId: buildings[1]._id, deviceId: 'DEV-002', maxCapacityKW: 10 },
    { name: 'Electronics Lab',  floor: 2, buildingId: buildings[1]._id, deviceId: 'DEV-003', maxCapacityKW: 15 },
    { name: 'Classroom 101',    floor: 1, buildingId: buildings[0]._id, deviceId: 'DEV-004', maxCapacityKW: 5  },
    { name: 'Classroom 102',    floor: 1, buildingId: buildings[0]._id, deviceId: 'DEV-005', maxCapacityKW: 5  },
    { name: 'Staff Room',       floor: 2, buildingId: buildings[0]._id, deviceId: 'DEV-006', maxCapacityKW: 3  },
    { name: 'Reading Hall',     floor: 1, buildingId: buildings[2]._id, deviceId: 'DEV-007', maxCapacityKW: 8  },
    { name: 'Server Room',      floor: 2, buildingId: buildings[0]._id, deviceId: 'DEV-008', maxCapacityKW: 20 },
    { name: 'Seminar Hall',     floor: 3, buildingId: buildings[1]._id, deviceId: 'DEV-009', maxCapacityKW: 12 },
    { name: 'Principal Office', floor: 4, buildingId: buildings[0]._id, deviceId: 'DEV-010', maxCapacityKW: 4  },
  ]);
  console.log('Rooms created:', rooms.map(r => r.name));

  const users = await User.insertMany([
    { name: 'Admin User',  email: 'admin@campus.com',   passwordHash: await bcrypt.hash('admin123', 12),   role: 'admin' },
    { name: 'Tech Staff',  email: 'tech@campus.com',    passwordHash: await bcrypt.hash('tech123', 12),    role: 'technician' },
    { name: 'Student One', email: 'student@campus.com', passwordHash: await bcrypt.hash('student123', 12), role: 'student' },
  ]);
  console.log('Users created:', users.map(u => u.email));

  console.log('\nSeed complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
