import reactRenderer from "./reactRenderer";
import sigil from "./sigil";

function Sigil({
  patp,
  size,
  colors,
}: {
  patp: string;
  size: number;
  colors: [string, string];
}) {
  return sigil({ patp, renderer: reactRenderer, size, colors });
}

export default Sigil;
