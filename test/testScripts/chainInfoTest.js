require("dotenv").config();
const brambl = require("../../index");

brambl.Requests("https://valhalla.torus.topl.co/", process.env.VALHALLA_KEY)
    .getLatestBlock()
    .then((x) => {
      const timestamp = new Date(x.result.bestBlock.header.timestamp);
      const timeDiff = Date.now() - timestamp;
      const blockHeight = x.result.height;
      console.log("Block #" + blockHeight + " forged at " + timestamp + ".\nThe latest block was created approx. " + Math.floor(timeDiff/1000) + " seconds ago.");
    })
    .catch((e) => console.error(e));
