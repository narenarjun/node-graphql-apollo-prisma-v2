import { addResolversToSchema } from "@graphql-tools/schema";
import typedefmade from "./typedefs/typedef";
import mergedResolvers from "./resolvers";

const schemawithtypedefresolver = addResolversToSchema({
  schema: typedefmade,
  resolvers: mergedResolvers,
});

export default schemawithtypedefresolver;
