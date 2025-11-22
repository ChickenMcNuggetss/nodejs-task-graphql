import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLBoolean,
} from 'graphql';
import { MemberTypeId } from '../member-types/schemas.js';
import { ProfileI } from './models/profile.js';
import { UserI } from './models/user.js';

export function buildSchema(
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
) {
  const User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLInt) },
      profile: {
        type: Profile,
        resolve: (parent: UserI) => {
          return prisma.profile.findUnique({
            where: { userId: parent.id},
          });
        },
      },
    }),
  });

  const Post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLString) },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    }),
  });

  const memberTypeValues = Object.fromEntries(Object.entries(MemberTypeId).map(([key, val]) => [key, {value: val}]));
  const memberTypeIdEnumType = new GraphQLEnumType({name: 'MemberTypeId', values: memberTypeValues})

  const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: { type:  new GraphQLNonNull(memberTypeIdEnumType)},
      discount: { type: new GraphQLNonNull(GraphQLInt) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

  const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLString) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLString) },
      memberType: {
        type: MemberType,
        resolve: (parent: ProfileI) => {
          return prisma.memberType.findUnique({where: {
            id: parent.memberTypeId
          }})
        }
      }
    }),
  });

  const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      user: {
        type: User,
        args: { id: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: (_, { id }: { id: string }) => prisma.user.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLList(User),
        resolve: () => prisma.user.findMany(),
      },
      memberType: {
        type: MemberType,
        args: { id: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: (_, { id }: { id: string }) =>
          prisma.memberType.findUnique({ where: { id } }),
      },
      memberTypes: {
        type: new GraphQLList(MemberType),
        resolve: () => prisma.memberType.findMany(),
      },
      post: {
        type: Post,
        args: { id: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: (_, { id }: { id: string }) => prisma.post.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLList(Post),
        resolve: () => prisma.post.findMany(),
      },
      profile: {
        type: Profile,
        args: { id: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: (_, { id }: { id: string }) =>
          prisma.profile.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLList(Profile),
        resolve: () => prisma.profile.findMany(),
      },
    }),
  });

  return new GraphQLSchema({
    query: Query,
  });
}
