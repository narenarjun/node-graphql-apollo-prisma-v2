# node-graphql-apollo-prisma-v2

This is a fictional blog graphql api. This graphql api is implement an **GraphQL server (SDL-first) with Node.js** with the [Prisma Client](https://www.prisma.io/),[Apollo Server](https://www.apollographql.com/docs/apollo-server/) and [graphql-tools](https://www.graphql-tools.com/). For this blog api, postgresql database is used, you can find the migration details in the [`./prisma/migrations`](./prisma/migrations) folder.

To ease development [babeljs](https://babeljs.io/) is used.

This apollo-prisma-graphql app is deployed to heroku.[https://prisma2-test-drive.herokuapp.com/](https://prisma2-test-drive.herokuapp.com/)

### Few gotchas when deploying apollo server to heroku.

When the `NODE_ENV=PRODUCTION`, `introspection` and `playground` are set to `false`
by `apollo-server`. This may cause some issue of not being able to access the graphql playground after deployment.
So , we set them true in the `ApolloServer`

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,

  introspection: true,  // here
  playground: true, //  here

```

As far as Database URL env value, if `heroku postgresql` is used heroku populated the `DATABASE_URL` env value.

Don't forget to set the `JWT_SECRET` env variable value. Without them you can proper jsonwebtokens.

## To check Locally

### 1. Clone & install dependencies

Clone this repository:

```
git clone https://github.com/narenarjun/node-graphql-apollo-prisma-v2.git
```

Install npm dependencies:

```
cd node-graphql-apollo-prisma-v2

yarn install
```

### 2. Setting DB for prisma consumption

Use preferred Database of your choice, for this blog api i have used postgresql. Set the connection uri in the `DATABASE_URL` variable in a `.env` file inside the [`./prisma`](./prisma) folder.

To get set up we use Prisma Migrate. Prisma Migrate is a tool that lets you make changes(schema migrations) to your database e.g. adding columns to existing tables.

Mapping our data model to your database schema is a two-step process which involves running two commands:

```
1>  yarn prisma migrate save --experimental

2>  yarn prisma migrate up --experimental
```

```
 yarn prisma migrate save --experimental
```

saves a new migration to the [`./prisma/migrations`](./prisma/migrations) in the root folder of your project and updates the `_Migration` table in your database. A new migration is saved every time this command is run complete with its own `README.md` file detailing information about the migration.

In order to actually execute the generated migrations, we need to run the second command:

```
yarn prisma migrate up --experimental
```

Now, it's time to generate _`Prisma Client`_

Prisma Client is an auto-generated and type-safe query builder that’s tailored specifically to your data. We can generate our client using either of the following commands:

```
yarn prisma generate
```

now , we are all set to start the server.

### 3. Start the GraphQL server

Launch your GraphQL server with this command:

```
yarn dev
```

Navigate to [http://localhost:4332](http://localhost:4332) in your browser to explore the API of your GraphQL server in a [GraphQL Playground](https://github.com/prisma/graphql-playground).

you can specify your desired port number in a enviromnent file in the `PORT` variable to launch on that port.
