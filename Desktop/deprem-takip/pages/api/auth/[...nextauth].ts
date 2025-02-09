import NextAuth, { NextAuthOptions, Session, User, JWT } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from '../../../lib/mongodb';

// TypeScript için session ve user tiplerini genişletiyoruz
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Burada id özelliğini ekliyoruz
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface JWT {
    id?: string; // Token'a id özelliğini ekliyoruz
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string; // Burada token.id'yi kullanıyoruz
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Kullanıcı bilgilerini token'a ekleyin
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 