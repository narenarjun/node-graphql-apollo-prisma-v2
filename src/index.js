import { ApolloServer, PubSub } from "apollo-server";
import { PrismaClient } from "@prisma/client";

import schemawithtypedefresolver from "./schema";

const Port = process.env.PORT || 4332;

const prisma = new PrismaClient();

const pubsub = new PubSub();

const server = new ApolloServer({
  schema: schemawithtypedefresolver,
  context: ({ req, connection }) => {
    const request = { req, connection };
    return {
      prisma,
      request,
      pubsub,
    };
  },
});

server.listen({ port: Port }).then(({ url }) => {
  console.log(`Server is running at ${url} 🚀🚀🚀 `);
});
