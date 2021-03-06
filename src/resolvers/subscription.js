import getUserId from "../utils/getUserId";

const Subscription = {
  Subscription: {
    post: {
      subscribe(parent, args, { pubsub }) {
        return pubsub.asyncIterator("post");
      },
    },
    comment: {
      async subscribe(parent, { postId }, { prisma, pubsub }) {
        const post = await prisma.post.findOne({
          where: {
            id: postId,
          },
        });

        if (!post) {
          throw new Error("Post not found");
        }

        return pubsub.asyncIterator(`comment ${postId}`);
      },
    },
    ownPost: {
      async subscribe(parent, args, { prisma, pubsub, request }) {
        const userId = await getUserId(request);

        const user = await prisma.user.findOne({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        return pubsub.asyncIterator(`post ${userId}`);
      },
    },
  },
};

export { Subscription as default };
