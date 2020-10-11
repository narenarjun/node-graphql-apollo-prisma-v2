import bcrypt from "bcryptjs";
import getUserId from "../utils/getUserId";
import generateToken from "../utils/generateToken";
import hashPassword from "../utils/hashpassword";

const MutationResolvers = {
  Mutation: {
    async createUser(parent, args, { prisma }, info) {
      // console.log(`User mutation INPUT- ${args.data.name}`);
      const password = await hashPassword(args.data.password);

      const user = await prisma.user.create({
        data: { ...args.data, password },
      });
      return {
        user,
        token: generateToken(user.id),
      };
    },
    async loginUser(parent, args, { prisma }, info) {
      const user = await prisma.user.findOne({
        where: {
          email: args.data.email,
        },
      });

      // console.log(`user value : ${JSON.stringify(user)}`);

      if (!user) {
        throw new Error("Unable to login");
      }

      const isMatch = await bcrypt.compare(args.data.password, user.password);

      if (!isMatch) {
        throw new Error("Unable to login");
      }

      return {
        user: user,
        token: generateToken(user.id),
      };
    },

    async deleteUser(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return prisma.user.delete({
        where: { id: userId },
        include: { posts: true, comments: true },
      });
    },
    async updateUser(parent, args, { prisma, request }) {
      const userId = await getUserId(request);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (typeof args.data.password === "string") {
        args.data.password = await hashPassword(args.data.password);
      }

      return prisma.user.update({
        where: { id: userId },
        data: args.data,
        include: { posts: true, comments: true },
      });
    },
    async createPost(parent, args, { prisma, pubsub, request }) {
      // console.log(`the value of request: ${req.headers.authorization}`);
      const userId = await getUserId(request);
      // console.log(`the value of userId: ${userId}`);

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const post = await prisma.post.create({
        data: {
          ...(args.data.published ? { published: args.data.published } : {}),
          title: args.data.title,
          body: args.data.body,
          author: { connect: { id: userId } },
        },
        include: { author: true, comments: true },
      });

      if (post.published) {
        pubsub.publish("post", { post: { mutation: "CREATED", data: post } });
      }

      pubsub.publish(`post ${userId}`, {
        ownPost: { mutation: "CREATED", data: post },
      });

      return post;
    },
    async deletePost(parent, args, { prisma, pubsub, request }) {
      const userId = await getUserId(request);
      let post;

      post = await prisma.post.findFirst({
        where: {
          id: args.id,
          author: {
            id: userId,
          },
        },
      });

      if (!post) {
        throw new Error("Unable to delete Post");
      }

      post = await prisma.post.delete({
        where: { id: args.id },
        include: { author: true, comments: true },
      });

      if (post.published) {
        pubsub.publish("post", { post: { mutation: "DELETED", data: post } });
      }

      pubsub.publish(`post ${userId}`, {
        ownPost: { mutation: "DELETED", data: post },
      });

      return post;
    },
    async updatePost(parent, args, { prisma, pubsub, request }) {
      const userId = await getUserId(request);
      let post;

      post = await prisma.post.findFirst({
        where: {
          id: args.id,
          author: {
            id: userId,
          },
        },
      });

      if (!post) {
        throw new Error("Unable to update Post");
      }

      if (post.published && !args.data.published) {
        await prisma.comment.deleteMany({
          where: { post: { id: args.id } },
        });
      }

      post = await prisma.post.update({
        where: { id: args.id },
        data: args.data,
        include: { author: true, comments: true },
      });

      if (post.published) {
        pubsub.publish("post", { post: { mutation: "UPDATED", data: post } });
      }

      pubsub.publish(`post ${userId}`, {
        ownPost: { mutation: "UPDATED", data: post },
      });

      return post;
    },
    async createComment(parent, args, { prisma, pubsub, request }) {
      const userId = await getUserId(request);
      const postId = args.data.post;

      const user = await prisma.user.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          published: true,
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const comment = await prisma.comment.create({
        data: {
          text: args.data.text,
          post: { connect: { id: postId } },
          author: { connect: { id: userId } },
        },
        include: { author: true, post: true },
      });

      pubsub.publish(`comment ${postId}`, {
        comment: {
          mutation: "CREATED",
          data: comment,
        },
      });

      return comment;
    },
    async deleteComment(parent, args, { prisma, pubsub, request }) {
      const userId = await getUserId(request);
      let comment;

      comment = await prisma.comment.findFirst({
        where: {
          id: args.id,
          OR: [
            { author: { id: userId } },
            { post: { author: { id: userId } } },
          ],
        },
      });

      if (!comment) {
        throw new Error("Unable to delete comment");
      }

      comment = await prisma.comment.delete({
        where: { id: args.id },
        include: { author: true, post: true },
      });

      pubsub.publish(`comment ${comment.post.id}`, {
        comment: {
          mutation: "DELETED",
          data: comment,
        },
      });

      return comment;
    },
    async updateComment(parent, args, { prisma, pubsub, request }) {
      const userId = await getUserId(request);
      let comment;

      comment = await prisma.comment.findFirst({
        where: {
          id: args.id,
          author: {
            id: userId,
          },
        },
      });

      if (!comment) {
        throw new Error("Unable to update comment");
      }

      comment = await prisma.comment.update({
        where: { id: args.id },
        data: args.data,
        include: { author: true, post: true },
      });

      pubsub.publish(`comment ${comment.post.id}`, {
        comment: {
          mutation: "UPDATED",
          data: comment,
        },
      });

      return comment;
    },
  },
};

export default MutationResolvers;
