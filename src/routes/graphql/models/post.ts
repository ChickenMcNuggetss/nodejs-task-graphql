import { UserI } from './user.js';

export interface PostI {
  id: string;
  title: string;
  content: string;
  author: UserI;
  authorId: string;
}
