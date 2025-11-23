import { PostI } from './post.js';
import { ProfileI } from './profile.js';

export interface UserI {
  id: string;
  name: string;
  balance: number;
  profile?: ProfileI;
  posts: PostI[];
  userSubscribedTo: UserI[];
  subscribedToUser: UserI[];
}
