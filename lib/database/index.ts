import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  console.log('Attempting to connect to database...');

  // Check if a connection is already established
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    throw new Error('MONGODB_URI is missing');
  }

  // If no existing connection promise exists, create a new connection promise
  if (!cached.promise) {
    console.log('Creating new database connection promise');
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: 'evently',
      bufferCommands: false,
    }).then(mongoose => {
      console.log('Database connection successful');
      return mongoose;
    }).catch(error => {
      console.error('Database connection failed:', error);
      throw error; // Rethrow to ensure it's handled by callers
    });
  } else {
    console.log('Waiting on existing database connection promise');
  }

  // Await the existing or new promise and cache the connection
  try {
    cached.conn = await cached.promise;
    console.log('Database connection established and cached');
  } catch (error) {
    console.error('Failed to establish database connection:', error);
    cached.promise = null; // Reset promise to allow retries
    throw error;
  }

  return cached.conn;
}



// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;

// let cached = (global as any).mongoose || { conn: null, promise: null };

// export const connectToDatabase = async () => {
//   if (cached.conn) return cached.conn;

//   if(!MONGODB_URI) throw new Error('MONGODB_URI is missing');

//   cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
//     dbName: 'evently',
//     bufferCommands: false,
//   })

//   cached.conn = await cached.promise;

//   return cached.conn;
// }