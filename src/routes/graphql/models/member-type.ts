import { ProfileI } from "./profile.js";

export interface MemberTypeI {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
  profiles: ProfileI[];
}