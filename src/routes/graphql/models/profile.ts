import { MemberTypeId } from "../../member-types/schemas.js";

export interface ProfileI {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  memberTypeId: MemberTypeId;
  userId: string;
}