import { Button, Frog, TextInput, parseEther } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/vercel";
import { abi } from "../abi.ts";
import { BigNumber, ethers } from "ethers";
import axios from "axios";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

app.frame("/", (c) => {
  return c.res({
    action: "/created",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Create Lattery Game!
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter eth amount..." />,
      <Button.Transaction target="/create">Create</Button.Transaction>,
    ],
  });
});

app.frame("/created", async (c) => {
  const url = "https://eth-sepolia.public.blastapi.io	";
  const contract = new ethers.Contract(
    "0x99d3224457679cb10996dd21120d9fc16e0697eb",
    abi,
    new ethers.providers.JsonRpcProvider(url)
  );
  const gameId = await contract.gameId();
  const gameUrl = c.url.replace("/create", `/game/${gameId.toNumber()}`);

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 60,
          }}
        >
          {gameUrl.slice(0, -1)}
        </div>
      </div>
    ),
  });
});

app.transaction("/create", async (c) => {
  const { inputText = "" } = c;

  await axios.post("https://testnetapi.lum0x.com/frame/validation", {
    farcasterFid: c.frameData?.fid,
    frameUrl: c.frameData?.url,
  });

  return c.contract({
    abi,
    chainId: "eip155:11155111",
    functionName: "create",
    args: [5n], // default numPlayers
    to: "0x99d3224457679cb10996dd21120d9fc16e0697eb",
    value: parseEther(inputText),
  });
});

app.frame("/joined", async (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            fontSize: 50,
            whiteSpace: "pre-wrap",
          }}
        >
          {`You joined game!`}
        </div>
      </div>
    ),
  });
});

app.transaction("/join/:id", (c) => {
  const { id } = c.req.param();

  return c.contract({
    abi,
    chainId: "eip155:11155111",
    functionName: "join",
    args: [BigInt(id)],
    to: "0x99d3224457679cb10996dd21120d9fc16e0697eb",
  });
});

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
