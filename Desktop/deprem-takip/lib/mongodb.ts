import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const uri = process.env.MONGODB_URI;

// Connection options
const options: MongoClientOptions = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  writeConcern: {
    w: 'majority'
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Development'da global değişkeni kullan
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log('MongoDB bağlantısı başarılı (Development)');
        return client;
      })
      .catch(err => {
        console.error('MongoDB bağlantı hatası (Development):', err);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Production'da yeni client oluştur
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('MongoDB bağlantısı başarılı (Production)');
      return client;
    })
    .catch(err => {
      console.error('MongoDB bağlantı hatası (Production):', err);
      throw err;
    });
}

// Test connection
clientPromise
  .then(async (client) => {
    try {
      await client.db('admin').command({ ping: 1 });
      console.log('MongoDB bağlantısı test edildi ve başarılı');
    } catch (error) {
      console.error('MongoDB bağlantı testi başarısız:', error);
      throw error;
    }
  })
  .catch(console.error);

export default clientPromise; 