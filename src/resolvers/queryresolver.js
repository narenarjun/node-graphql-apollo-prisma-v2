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
  },
};

export default QueryResolvers;
