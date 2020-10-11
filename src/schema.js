import { addResolversToSchema } from "@graphql-tools/schema";
import typedefmade from "./typedefs/typedef";
import QueryResolvers from './resolvers/queryresolver'

const schemawithtypedefresolver = addResolversToSchema({
  schema: typedefmade,
  resolvers: QueryResolvers
});

export default schemawithtypedefresolver;
