import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { earthquakeId } = req.query;

    if (!earthquakeId || typeof earthquakeId !== 'string') {
      return res.status(400).json({ error: 'Geçersiz deprem ID' });
    }

    const client = await clientPromise;
    const db = client.db('earthquakes');
    const comments = db.collection('comments');

    // Yorumları getir
    if (req.method === 'GET') {
      try {
        const commentsList = await comments
          .find({ earthquakeId })
          .sort({ createdAt: -1 })
          .toArray();

        return res.json(commentsList);
      } catch (error) {
        console.error('Yorumları getirme hatası:', error);
        return res.status(500).json({ 
          error: 'Yorumlar yüklenirken bir hata oluştu',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Yeni yorum ekle
    if (req.method === 'POST') {
      if (!session?.user) {
        return res.status(401).json({ 
          error: 'Yorum yapmak için giriş yapmalısınız.',
          isAuthError: true 
        });
      }

      try {
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
          return res.status(400).json({ error: 'Geçersiz yorum içeriği' });
        }

        const newComment = {
          earthquakeId,
          userId: session.user.id,
          userName: session.user.name,
          userImage: session.user.image,
          content: content.trim(),
          createdAt: new Date(),
        };

        const result = await comments.insertOne(newComment);
        const insertedComment = await comments.findOne({ _id: result.insertedId });
        
        return res.status(201).json(insertedComment);
      } catch (error) {
        console.error('Yorum ekleme hatası:', error);
        return res.status(500).json({ 
          error: 'Yorum eklenirken bir hata oluştu',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API genel hatası:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 