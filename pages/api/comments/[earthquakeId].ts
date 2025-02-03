import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Comment {
  _id: ObjectId;
  earthquakeId: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  createdAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { earthquakeId } = req.query;

  if (!earthquakeId || typeof earthquakeId !== 'string') {
    return res.status(400).json({ error: 'Geçersiz deprem ID' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('comments');

    // GET isteği - Yorumları getir
    if (req.method === 'GET') {
      try {
        const comments = await collection
          .find({ earthquakeId })
          .sort({ createdAt: -1 })
          .toArray();

        return res.status(200).json(comments);
      } catch (error) {
        console.error('Yorumlar yüklenirken hata:', error);
        return res.status(500).json({ 
          error: 'Yorumlar yüklenirken bir hata oluştu',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }

    // POST isteği - Yeni yorum ekle
    if (req.method === 'POST') {
      if (!session?.user) {
        return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
      }

      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Geçersiz yorum içeriği' });
      }

      try {
        const comment: Omit<Comment, '_id'> = {
          earthquakeId,
          userId: session.user.id!,
          userName: session.user.name!,
          userImage: session.user.image!,
          content: content.trim(),
          createdAt: new Date(),
        };

        const result = await collection.insertOne(comment);

        return res.status(201).json({
          ...comment,
          _id: result.insertedId,
        });
      } catch (error) {
        console.error('Yorum eklenirken hata:', error);
        return res.status(500).json({ 
          error: 'Yorum eklenirken bir hata oluştu',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    }

    // Desteklenmeyen HTTP metodu
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
} 