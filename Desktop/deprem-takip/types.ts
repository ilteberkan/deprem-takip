export interface Earthquake {
  id: string;
  location: string;
  date: string;
  magnitude: number;
  coordinates: [number, number];
  depth: number;
}

export interface Comment {
  id: string;
  earthquakeId: string;
  userId: string;
  userName: string;
  userImage: string;
  content: string;
  createdAt: Date;
} 