import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    
    // Test database connection
    await client.db('admin').command({ ping: 1 });
    
    // Get database stats
    const db = client.db('earthquakes');
    const stats = await db.stats();
    
    // Get collections
    const collections = await db.listCollections().toArray();
    
    return res.status(200).json({
      status: 'success',
      message: 'MongoDB bağlantısı başarılı',
      dbStats: stats,
      collections: collections.map(col => col.name),
      uri: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Gizli bilgileri maskele
    });
  } catch (error: any) {
    console.error('MongoDB durum kontrolü hatası:', error);
    return res.status(500).json({
      status: 'error',
      message: 'MongoDB bağlantı hatası',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 