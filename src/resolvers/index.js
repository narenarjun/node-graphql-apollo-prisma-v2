const { mergeResolvers } = require("@graphql-tools/merge");

import Queryresolver from "./queryresolver";
import Mutation from "./Mutationresolver";
import User from "./user";
import Subscription from "./subscription";

const resolvers = [Queryresolver, Mutation, User, Subscription];

const Resolversmerged = mergeResolvers(resolvers);
// console.log(Resolversmerged);

export default Resolversmerged;
