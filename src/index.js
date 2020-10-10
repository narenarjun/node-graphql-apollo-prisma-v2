import { ApolloServer, gql } from "apollo-server";

import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { addResolversToSchema } from "@graphql-tools/schema";

import { join } from "path";

const Port = process.env.PORT || 4332;

// const typeDefs = gql`
//   type Query {
//     greet(query: String): String!
//   }
// `;

const weirdname = loadSchemaSync(join(__dirname, "schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    greet(parent, args, ctx, info) {
      //   console.log(args.query); //! logging the user input
      if (args.query == null) {
        return "hello world !!";
      } else {
        return `hello ${args.query} !`;
      }
    },
  },
};

const schemawithresolver = addResolversToSchema({
  schema: weirdname,
  //   schema,
  resolvers,
});

// console.log(`is this logged ? ${typedefwithresolver}`);

const server = new ApolloServer({
  schema: schemawithresolver,
  //   resolvers,
});

server.listen({ port: Port }).then(({ url }) => {
  console.log(`Server is running at ${url} 🚀🚀🚀 `);
});
