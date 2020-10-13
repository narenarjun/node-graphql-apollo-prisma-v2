import "@babel/polyfill/noConflict";
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
  // if the NODE_ENV=PRODUCTION, introspection and playground are set to false, this will override them.
  introspection: true,
  playground: true,
  // this healthcheck is very useful in liveness & readiness probes in the k8s or any cloud enviroments.
  onHealthCheck: () => {
    return new Promise((resolve, reject) => {
      // Replace the `true` in this conditional with more specific checks!
      if (true) {
        resolve();
      } else {
        reject();
      }
    });
  },
});

server.listen({ port: Port }).then(({ url }) => {
  console.log(`Server is running at ${url} 🚀🚀🚀 `);
  console.log(
    `Health check is at: ${url}.well-known/apollo/server-health 🏥✅🏥✅`
  );
});

//*  graceful shutdown
const sigs = ["SIGINT", "SIGTERM", "SIGQUIT"];
sigs.forEach((sig) => {
  process.on(sig, () => {
    console.log("SIGTERM signal received: closing HTTP server");
    console.log("Closing http server.");
    // ! shutting down apollo-server.
    server.close(async () => {
      console.log("HTTP server closed");

      // * shutting and closing connection with prisma and database.
      await prisma.$disconnect(() => {
        console.log("prisma database connection closed");
      });
      process.exit(0);
    });
  });
});
