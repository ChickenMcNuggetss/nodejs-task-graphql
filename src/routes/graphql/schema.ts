import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLFloat,
} from 'graphql';
import { ProfileI } from './models/profile.js';
import { UserI } from './models/user.js';
import { UUIDType } from './types/uuid.js';

const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (parent: UserI, _, context) => {
        return await context.prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async (parent: UserI, _, context) => {
        return await context.prisma.post.findMany({ where: { authorId: parent.id } });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(User),
      resolve: async (parent: UserI, _, context) => {
        const res = await context.prisma.subscribersOnAuthors
          .findMany({
            where: { subscriberId: parent.id },
            include: { author: true },
          })
          .then((rows) => rows.map((r) => r.author));
        return res;
      },
    },

    subscribedToUser: {
      type: new GraphQLList(User),
      resolve: async (parent: UserI, _, context) => {
        return await context.prisma.subscribersOnAuthors
          .findMany({
            where: { authorId: parent.id },
            include: { subscriber: true },
          })
          .then((rows) => rows.map((r) => r.subscriber));
      },
    },
  }),
});

const Post = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const memberTypeIdEnumType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BUSINESS: {value: 'BUSINESS'},
    BASIC: {value: 'BASIC'},
  },
});

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(memberTypeIdEnumType) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (parent: ProfileI, _, context) => {
        return await context.prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
      },
    },
  }),
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: {
      type: User,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context) => {
        return await context.prisma.user.findUnique({ where: { id } });
      },
    },
    users: {
      type: new GraphQLList(User),
      resolve: async (_, b, context) => await context.prisma.user.findMany(),
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(memberTypeIdEnumType) } },
      resolve: async (_, { id }: { id: 'BUSINESS' | 'BASIC' }, context) => {
        const res = await context.prisma.memberType.findUnique({ where: { id } });
        console.log(res, 'rofile parent');
        return res;
      },
    },
    memberTypes: {
      type: new GraphQLList(new GraphQLNonNull(MemberType)),
      resolve: async (_, b, context) => await context.prisma.memberType.findMany(),
    },
    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context) =>
        await context.prisma.post.findUnique({ where: { id } }),
    },
    posts: {
      type: new GraphQLList(Post),
      resolve: async (_, b, context) => await context.prisma.post.findMany(),
    },
    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, { id }: { id: string }, context) =>
        await context.prisma.profile.findUnique({ where: { id } }),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_, b, context) => await context.prisma.profile.findMany(),
    },
  }),
});

export const schema = new GraphQLSchema({
  query: Query,
});
