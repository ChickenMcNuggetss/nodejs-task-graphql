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
} from 'graphql';

export function buildSchema(prisma) {
  const User: GraphQLObjectType<string, unknown> = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLInt) },
    }),
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        user: {
          type: User,
          args: {id: {type: GraphQLID}},
          resolve: (_, {id}) => prisma.user.findUnique({ where: { id } })
        },
        users: {
          type: new GraphQLList(User),
          resolve: () => prisma.user.findMany()
        }
      }),
    })
  });
}

// memberTypes {
//     id
//     discount
//     postsLimitPerMonth
// }
// posts {
//     id
//     title
//     content
// }
// users {

// }
// profiles {
//     id
//     isMale
//     yearOfBirth
// }
