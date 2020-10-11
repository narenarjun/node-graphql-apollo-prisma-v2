import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";

import { join } from "path";

const typedefmade = loadSchemaSync(join(__dirname, "schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

export default typedefmade;
