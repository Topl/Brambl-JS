const blake = require("blake2");
const crypto = require("crypto");
const Base58 = require("bs58");
const keccakHash = require("keccak");
const curve25519 = require("curve25519-js");

const Brambl = require("../../../src/Brambl");

const Requests = require("../../../src/modules/Requests");
const requests = new Requests("private");

const KeyManager = require("../../../src/modules/KeyManager");
// const keyManager = new KeyManager("private");


/* ---------------------- Create Raw Asset Trasfer ------------------------ */
// my local bifrost is set to Private Network:
// AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE
// this is a local network address:
// 86tS2ExvjGEpS3Ntq5vZgHirUMuee7pJELGD8GmBoUyjXpAaAXTz
const rawAssetParams1 = {
  "propositionType": "PublicKeyCurve25519",
  "recipients": [
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 4, "5Jrbs2qVvXEtLpshpR7dLsSPmsgJLYU5nUiQftyoZYL3", "as"],
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 3, "5Jrbs2qVvXEtLpshpR7dLsSPmsgJLYU5nUiQftyoZYL3"],
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 2]
  ],
  "assetCode": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "sender": ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE"],
  "changeAddress": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "minting": true,
  "fee": 1
};
/**
 * for
  securityRoot : base58 enconded string  [32 bytes]   hash output of blake2b
  metadata : 128 byte string UTF8

  make asset and tag asset
  metadata is an davanced feature
 */

// requests.createRawAssetTransfer(rawAssetParams)
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));


/* ---------------------- Create Raw Poly Trasfer ------------------------ */
const rawPolyParams = {
  "propositionType": "PublicKeyCurve25519",
  "recipients": [
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 4],
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 3]
  ],
  "sender": ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE"],
  "changeAddress": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "fee": 1
};

// requests.createRawPolyTransfer(rawPolyParams)
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));

/* ---------------------- Create Raw Arbit Trasfer ------------------------ */
const rawArbitParams = {
  "propositionType": "PublicKeyCurve25519",
  "recipients": [["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 10]],
  "sender": ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLos"],
  "changeAddress": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "consolidationAddress": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "fee": 1,
  "data": ""
};

// requests.createRawArbitTransfer(rawArbitParams)
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));


/* ---------------------- Get Latest Block ------------------------ */
// requests.getLatestBlock()
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));

/* ---------------------- Lookup Balances By Key ------------------------ */
// requests.lookupBalancesByAddresses({addresses:["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE"]})
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));

/* ---------------------- Get Mem Pool ------------------------ */
// requests.getMempool()
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));


/* ---------------------- Create Asset + Sign and Broadcast Tx ------------------------ */
// const keyManager = BramblJS.KeyManager();
// const keyMan = new KeyManager({networkPrefix:"private", password:"topl_the_world!"});

// [keyManager.pk, 4, "5Jrbs2qVvXEtLpshpR7dLsSPmsgJLYU5nUiQftyoZYL3","as"],
// [keyManager.pk, 3, "5Jrbs2qVvXEtLpshpR7dLsSPmsgJLYU5nUiQftyoZYL3"],


// Sign a prototype transaction and broadcast to a chain provider
// const brambl = new Brambl({networkPrefix:"private", password:"topl_the_world!"});
// const signAndBroadcastPromise = (tx) => brambl.signAndBroadcast(tx);

const rawAssetParams = {
  "propositionType": "PublicKeyCurve25519",
  "recipients": [
    ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", 2]
  ],
  "assetCode": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE",
  "sender": ["AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE"],
  "changeAddress": "AUAftQsaga8DjVfVvq7DK14fm5HvGEDdVLZwexZZvoP7oWkWCLoE", // brambl.keyManager.pk
  "minting": true,
  "fee": 1
};

// requests.createRawAssetTransfer(rawAssetParams)
//   .then((res) => signAndBroadcastPromise(res.result))
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));

/* ---------------------- Export Key to File ------------------------ */
// brambl.keyManager.exportToFile();


/* ---------------------- Get Block by Id ------------------------ */
// brambl.requests.getBlockById({blockId: "wL12me5cR4imXjssQsB47sKfaAgciYvYrHZCF6JN8v1o"})
//   .then((res) => console.log(res))
//   .catch((e) => console.error(e));

/* ---------------------- Get Block by Height ------------------------ */
// brambl.requests.getBlockByHeight({"height": 3})
// .then((res) => console.log(res))
// .catch((e) => console.error(e));


/* ---------------------- Import Keyfile from BramblSc ------------------------ */
const brsc = ".keyfiles/brambl-sc-key1.json";
const brbi = ".keyfiles/brambl-bifrost-key1.json";
const brjs = ".keyfiles/2021-02-08T22-40-21.175Z-618wxiUxPqjmU9Qn7YwJao8etb6Cz9XSTkvPCjiXNMME.json";

// let keyManTest = new KeyManager({
//   'keyPath': brsc,
//   'password': "tmp",
//   'networkPrefix': "local"
// });

// let keyManTest = new KeyManager({
//   'keyPath': brbi,
//   'password': "tmp",
//   'networkPrefix': "private"
// });

const keyManTest = new KeyManager({
  "keyPath": brjs,
  "password": "tmp",
  "networkPrefix": "private"
});

// address: AUAVaH15Rw5Yo4QyBdGwdAe4f7Nk3Sm1uoeygwJsyBViLnJeud4E
// 4001 939904d534717c69cfa4e80916fc32d22376c83a1403abdbdd93c976ed612587 85bd6aff
// this.#pk  618wxiUxPqjmU9Qn7YwJao8etb6Cz9XSTkvPCjiXNMME
// this.#pk hash <Buffer 93 99 04 d5 34 71 7c 69 cf a4 e8 09 16 fc 32 d2 23 76 c8 3a 14 03 ab db dd 93 c9 76 ed 61 25 87>
const pk = Base58.decode(keyManTest.pk);
console.log("this.#pk hash", blake.createHash("blake2b", {digestLength: 32}).update(pk).digest());

// keyManTest.exportToFile();
