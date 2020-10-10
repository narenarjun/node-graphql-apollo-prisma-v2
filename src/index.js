import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type Query {
    greet(query: String): String!
  }
`;

const resolvers = {
  Query: {
    greet(parent, args, ctx, info) {
      //   console.log(args.query); //! logging the user input
      if (args.query !== null) {
        return `hello ${args.query} !`;
      } else {
        return "hello world!";
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4221 }).then(({ url }) => {
  console.log(`Server is running at ${url} 🚀🚀🚀 `);
});
