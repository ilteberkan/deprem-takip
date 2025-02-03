import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Veritabanı bağlantısını test et
    await db.command({ ping: 1 });

    return res.status(200).json({
      status: 'success',
      message: 'MongoDB bağlantısı başarılı',
      database: db.databaseName
    });

  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    return res.status(500).json({
      status: 'error',
      error: 'MongoDB bağlantı hatası',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 