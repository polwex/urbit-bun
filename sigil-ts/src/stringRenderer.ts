// @ts-ignore
import { stringify } from "svgson";
import type { Ast } from "./types";

const stringRenderer = (ast: Ast) => {
  if (ast.attributes.style !== undefined) delete ast.attributes.style;
  return stringify(ast as any);
};

export default stringRenderer;
