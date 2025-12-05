import type { UrbitWallet } from "urbit-key-generation";
import { get } from "lodash";
import templates from "./templates.json";
import { draw } from "./draw";
import { loadSigil } from "./load";
import { dataURItoBlob, sequence } from "./utils";

export const SIGIL_LOADING_SIZE = 16;
export const CANVAS_SIZE = { x: 612, y: 792 };
// TODO
const version = "6.6.6";
interface ExtendedWallet extends UrbitWallet {
  meta: UrbitWallet["meta"] & {
    sigilDark: HTMLImageElement;
    sigilLight: HTMLImageElement;
    azimuth: { url: string };
    renderer: { version: string; name: string };
    generator: { version: string };
    dateCreated: string;
  };
}
interface Pair {
  wallet: ExtendedWallet;
  templates: (typeof templates)["frames"];
}
export const extendWallet = async (
  owallet: UrbitWallet,
): Promise<ExtendedWallet> => {
  // load sigil
  const wallet: any = { ...owallet };
  const patp = wallet.meta.patp;
  const sigilDark = await loadSigil(SIGIL_LOADING_SIZE, patp, [
    "black",
    "white",
  ]);
  wallet.meta.sigilDark = sigilDark;

  const sigilLight = await loadSigil(SIGIL_LOADING_SIZE, patp, [
    "white",
    "black",
  ]);
  wallet.meta.sigilLight = sigilLight;

  // add the ship's azimuth url
  wallet.meta.azimuth = {
    url: `bridge.urbit.org`,
  };

  // get the renderer lib name and version number
  wallet.meta.renderer = {
    version: `v${version}`,
    name: name,
  };

  // prepend a 'v' on urbit-key-generator's version number
  wallet.meta.generator = {
    version: `v${wallet.meta.generator.version}`,
  };

  // Add the date created with formatting
  const date = new Date();
  wallet.meta.dateCreated = `${date.getUTCDate()}/${
    date.getUTCMonth() + 1
  }/${date.getUTCFullYear().toString().slice(-2)}`;

  // used to generate data for documentation and tests
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(JSON.stringify(Object.keys(flat(wallet)), null, ' '))
  // }

  return wallet as ExtendedWallet;
};

// TODO type return
export const generatePng = (
  canvas: HTMLCanvasElement,
  pair: Pair,
  debug: boolean,
  output: "png" | "uri",
) => {
  const imageFrames = pair.templates.map((page) => {
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    page.classOf =
      page.classOf.charAt(0).toUpperCase() + page.classOf.substring(1);
    // console.log(page.classOf)
    page.elements.forEach((elem) => {
      try {
        const taip = elem.draw as keyof typeof draw;
        draw[taip](ctx, elem as any);
      } catch (e) {
        console.error(e);
        console.error("wallet", pair.wallet);
        console.error("page", page);
        console.error("elem", elem);
        ///@ts-ignore
        console.error("draw[elem.draw]", draw[elem.draw]);
      }
    });

    // draw layout grid if debug mode is on
    if (debug === true) {
      const cols = [96, 186, 206, 296, 316, 406, 426, 516];

      const cardEdges = [80, 532];

      const bl4 = 4;
      const bl8 = 8;
      const bl16 = 16;

      sequence(Math.floor(CANVAS_SIZE.y / bl8)).forEach((y) => {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, y * bl8);
        ctx.lineTo(CANVAS_SIZE.x, y * bl8);
        ctx.stroke();
      });

      sequence(Math.floor(CANVAS_SIZE.y / 16)).forEach((y) => {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, y * bl16);
        ctx.lineTo(CANVAS_SIZE.x, y * bl16);
        ctx.stroke();
      });

      // draw the layout columns
      cols.forEach((x) => {
        // ctx.strokeWidth = 1;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE.y);
        ctx.stroke();
      });

      // Draw the edges of the card-shaped outline
      cardEdges.forEach((x) => {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 0, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE.y);
        ctx.stroke();
      });
    }

    const imgURI = canvas.toDataURL("image/png");
    const pageName = givenName(page);

    if (output === "png") {
      return {
        ...page,
        givenName: pageName,
        image: dataURItoBlob(imgURI),
      };
    }

    if (output === "uri") {
      return {
        ...page,
        givenName: pageName,
        image: imgURI,
      };
    }
  });

  return {
    ...pair,
    frames: imageFrames,
  };
};

const givenName = (page: (typeof templates)["frames"][0]) => {
  const { usage } = page;
  if (usage === "ticket") return "Master Ticket";
  if (usage === "shard1") return "Master Ticket Shard 1";
  if (usage === "shard2") return "Master Ticket Shard 2";
  if (usage === "shard3") return "Master Ticket Shard 3";
  if (usage === "management") return "Management Proxy";
  if (usage === "voting") return "Voting Proxy";
  if (usage === "spawn") return "Spawn Proxy";
  if (usage === "transfer") return "Transfer Proxy";
};

export const merge = (pair: Pair) => {
  const { templates, wallet } = pair;

  const docket = templates.filter((template) => {
    return template.classOf === "all" || template.classOf === wallet.meta.tier;
  });

  const filledTemplates = docket.map((template) => {
    const filledElems = template.elements.map((elem) => {
      if (elem.path === null) return elem;
      if (elem.data !== null) return elem;

      // get data from wallet when given a path
      if (elem.path !== null) {
        var data = get(wallet, elem.path);

        // capitalize planet/galaxy/star class tier
        if (elem.path === "meta.tier") {
          data = data.charAt(0).toUpperCase() + data.substring(1);
        }

        return {
          ...elem,
          data: data,
        };
      }
    });
    return {
      ...template,
      elements: filledElems,
    };
  });
  return {
    templates: filledTemplates,
    wallet: wallet,
  };
};
