import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";

import schemawithtypedefresolver from "./schema";

const Port = process.env.PORT || 4332;

const prisma = new PrismaClient();

const server = new ApolloServer({
  schema: schemawithtypedefresolver,
  context(request) {
    return {
      prisma,
      request,
    };
  },
});

server.listen({ port: Port }).then(({ url }) => {
  console.log(`Server is running at ${url} 🚀🚀🚀 `);
});
