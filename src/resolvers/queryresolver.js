import getUserId from "../utils/getUserId";

const QueryResolvers = {
  Query: {
    greet(parent, args, ctx, info) {
      //   console.log(args.query); //! logging the user input
      if (args.query == null) {
        return "hello world !!";
      } else {
        return `hello ${args.query} !`;
      }
    },

    async users(parent, args, { prisma }) {
      const limit = {};

      if (args.limit) {
        for (const prop in args.limit) {
          limit[prop] = { equals: args.limit[prop], mode: "insensitive" };
        }
      }

      const where = args.filter
        ? {
            name: { contains: args.filter, mode: "insensitive" },
            ...limit,
          }
        : { ...limit };

      const opArgs = {
        where,
        take: args.take,
        ...(args.cursor ? { skip: 1, cursor: { id: args.cursor } } : {}),
        orderBy: args.orderBy,
      };

      const users = await prisma.user.findMany({
        ...opArgs,
        include: {
          posts: true,
          comments: true,
        },
      });

      return users;
    },
    async posts(parent, args, { prisma }) {
      const page = args.page;
      const take = args.take;
      const skip = (page - 1) * take;

      const limit = {};

      if (args.limit) {
        for (const prop in args.limit) {
          limit[prop] = { equals: args.limit[prop], mode: "insensitive" };
        }
      }

      const where = args.filter
        ? {
            published: true,
            OR: [
              { title: { contains: args.filter, mode: "insensitive" } },
              { body: { contains: args.filter, mode: "insensitive" } },
            ],
            ...limit,
          }
        : { published: true, ...limit };

      const opArgs = {
        where,
        skip,
        take,
        orderBy: args.orderBy,
      };

      const posts = await prisma.post.findMany({
        ...opArgs,
        include: {
          author: true,
          comments: true,
        },
      });

      return posts;
    },
    async ownPosts(parent, args, { prisma, request }) {
      const userId = await getUserId(request);
      const page = args.page;
      const take = args.take;
      const skip = (page - 1) * take;

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const limit = {};

      if (args.limit) {
        for (const prop in args.limit) {
          limit[prop] = {
            equals: args.limit[prop],
            ...(typeof args.limit[prop] !== "boolean"
              ? { mode: "insensitive" }
              : {}),
          };
        }
      }

      const where = args.filter
        ? {
            author: {
              id: userId,
            },
            OR: [
              { title: { contains: args.filter, mode: "insensitive" } },
              { body: { contains: args.filter, mode: "insensitive" } },
            ],
            ...limit,
          }
        : {
            author: {
              id: userId,
            },
            ...limit,
          };

      const opArgs = {
        where,
        skip,
        take,
        orderBy: args.orderBy,
      };

      const posts = await prisma.post.findMany({
        ...opArgs,
        include: {
          author: true,
          comments: true,
        },
      });

      return posts;
    },
    async comments(parent, args, { prisma }) {
      const page = args.page;
      const take = args.take;
      const skip = (page - 1) * take;

      const limit = {};

      if (args.limit) {
        for (const prop in args.limit) {
          limit[prop] = { equals: args.limit[prop], mode: "insensitive" };
        }
      }

      const where = args.filter
        ? {
            text: { contains: args.filter, mode: "insensitive" },
            ...limit,
          }
        : { ...limit };

      const opArgs = {
        where,
        skip,
        take,
        orderBy: args.orderBy,
      };

      const comments = await prisma.comment.findMany({
        ...opArgs,
        include: {
          author: true,
          post: true,
        },
      });

      return {
        comments,
      };
    },
    async post(parent, args, { prisma, request }) {
      const userId = await getUserId(request, false);

      const opArgs = {
        where: {
          id: args.id,
          OR: [{ published: true }],
        },
      };

      if (userId) {
        opArgs.where.OR.push({ author: { id: userId } });
      }

      const post = await prisma.post.findFirst({
        ...opArgs,
        include: {
          author: true,
          comments: true,
        },
      });

      if (!post) {
        throw new Error("Unable to fetch post");
      }

      return post;
    },
    async me(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
        include: { posts: true, comments: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
  },
};

export default QueryResolvers;
