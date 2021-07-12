/** Unit testing for blocks type funtionality:
 * - Lookup Block by Id
 * - Lookup Block by Height
 * - Get the latest block in the chain
 *
 * @author Raul Aragonez (r.aragonez@topl.me)
 * @date 2020.12.8
 *
 * This test suite uses Mocha(https://mochajs.org/), Chai(https://www.chaijs.com/)
 * and Sinon(https://sinonjs.org/).
 */

const Requests = require("../../../src/modules/Requests");
const assert = require("assert");
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const nodeFetch = require("node-fetch");

/* -------------------------------------------------------------------------- */
/*                         Blocks type unit tests                             */
/* -------------------------------------------------------------------------- */
describe("Blocks", () => {
  const localTestObj = {"status": "200", "json": () => {
    return {"test": "dummy data"};
  }};

  /**
     * Every test will have a localTestObj returned
     * as a succesfull call. This ensures the call
     * doesn't leave our local environment and prevents
     * tests from hanging until a timeout is reached.
     */
  function enforceLocalTesting() {
    return sinon.stub(nodeFetch, "Promise").returns(Promise.resolve(localTestObj));
  }

  // run this before all tests
  before(() => {
    requests = new Requests();
  });

  // run this before every test
  beforeEach(() => {
    // avoid server side calls and return dummy data
    enforceLocalTesting();
  });

  // run this after every test
  afterEach(() => {
    sinon.restore();
  });

  /* ---------------------------- lookup block by id -------------------------------- */
  describe("lookup block by id", () => {
    beforeEach(() => {
      parameters = {
        "blockId": "2BTSL7ubSmADr6n5K7qNRodygTVmruHMy8MhtKuaC6G2H"
      };
    });

    it("should lookup block by id", async () => {
      // query params using params under beforeEach()
      // mock response data
      const jsonObject = {
        "jsonrpc": "2.0",
        "id": "1",
        "result": {
          "header": {
            "txRoot": "3HwNJirUFu7cEqF4DgBZJDv27QgKMctior8cWjCqV9j7",
            "difficulty": 67338152852815544,
            "timestamp": 1614870913077,
            "bloomFilter": "111112aqEiuVS2efQXoVV33coDbqihkMzNt6CsCazeCAzTQ2j1YAds6tebhCDqBaDBs3Lo28WB",
            "height": 295,
            "signature": "6EAPy7vV3JVhpZ3ARSQLfPtFuY8qhd15KrPKoijyoRLzDnPi7C4FF2HTwDk5F7bPVz9qbenSSBdeRj1pr6W8vu1a",
            "generatorBox": {
              "nonce": "6192622283292330446",
              "id": "5Wq9cayFkbA2WzMVugWtm4kpLoYn5QTMkvpyNh9jCDBY",
              "evidence": "PGdnCwZkNwzL9JgMMThi1Qv3mc5SHCG9Zu4k7qb5TdvT",
              "type": "ArbitBox",
              "value": {
                "type": "Simple",
                "quantity": "1000000"
              }
            },
            "version": 0,
            "id": "2BTSL7ubSmADr6n5K7qNRodygTVmruHMy8MhtKuaC6G2H",
            "publicKey": "bDpCdRHS5YzVndGmSrmXgjR4Q31AQqM9VkVAjBz9nzRE",
            "parentId": "ziho65Xc5GqHqhgeBEFiS6redsZfcgGdXcAFWbUNxzdV"
          },
          "body": {
            "id": "2BTSL7ubSmADr6n5K7qNRodygTVmruHMy8MhtKuaC6G2H",
            "parentId": "ziho65Xc5GqHqhgeBEFiS6redsZfcgGdXcAFWbUNxzdV",
            "txs": [
              {
                "txType": "ArbitTransfer",
                "timestamp": 1614870913077,
                "signatures": {
                  "bDpCdRHS5YzVndGmSrmXgjR4Q31AQqM9VkVAjBz9nzRE": "7iGAPS2bthwXLnMsbsDDuNAkKxaygbcSPv2bfGg5pgwUCXXQtA7CgYYg2CTqchmRRvHtixrVy5QiMEhcgyYdQcLM"
                },
                "newBoxes": [],
                "data": "ziho65Xc5GqHqhgeBEFiS6redsZfcgGdXcAFWbUNxzdV_",
                "to": [
                  [
                    "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                    {
                      "type": "Simple",
                      "quantity": "0"
                    }
                  ]
                ],
                "propositionType": "PublicKeyCurve25519",
                "from": [],
                "minting": true,
                "txId": "bwwYcvfconQVaqdJsGPmX2nH9Qg3DEVSqzaQFH267xbu",
                "boxesToRemove": [],
                "fee": "0"
              },
              {
                "txType": "PolyTransfer",
                "timestamp": 1614870913077,
                "signatures": {
                  "bDpCdRHS5YzVndGmSrmXgjR4Q31AQqM9VkVAjBz9nzRE": "6yXjsELAC5FHnHJw6zgCtf81XJ7AZgKjAwFtBBCQ7aDHAD8LcfdXuJEYBeMtGGcD5jitjkyqnuB9CcudMTjeRbG3"
                },
                "newBoxes": [],
                "data": "ziho65Xc5GqHqhgeBEFiS6redsZfcgGdXcAFWbUNxzdV_",
                "to": [
                  [
                    "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                    {
                      "type": "Simple",
                      "quantity": "0"
                    }
                  ]
                ],
                "propositionType": "PublicKeyCurve25519",
                "from": [],
                "minting": true,
                "txId": "bvEJk2bQG9QmnEXGErjJdJgkJ1GvfeKzMzXAP7bivUXB",
                "boxesToRemove": [],
                "fee": "0"
              }
            ],
            "version": 0
          },
          "blockSize": 655
        }
      };

      // creates the response obj
      const responseObject = {"status": "200", "json": () => {
        return jsonObject;
      }};

      // stub the promise response
      sinon.restore(); // restore sinon to resolve promise with new obj
      sinon.stub(nodeFetch, "Promise").returns(Promise.resolve(responseObject));

      // make the call trying to test for
      const response = await requests.getBlockById(parameters);

      // do validation here
      assert.strictEqual(response.result.header.id, "2BTSL7ubSmADr6n5K7qNRodygTVmruHMy8MhtKuaC6G2H");
      assert.strictEqual(response.result.body.version, 0);
      assert.strictEqual(response.result.blockSize, 655);
    });
    it("should fail if no parameters present", function(done) {
      // make call without parameters
      requests
          .getBlockById()
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: A parameter object must be specified");
            done();
          });
    });
    it("should fail if no blockId provided", (done) => {
      // set "recipient" as empty string to validate
      parameters.blockId = "";

      requests
          .getBlockById(parameters)
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: A blockId must be specified");
            done();
          });
    });
  });

  /* ---------------------------- lookup block by height -------------------------------- */
  describe("lookup block by height", () => {
    beforeEach(() => {
      parameters = {
        "height": 10
      };
    });

    it("should lookup block by height", async () => {
      // query params using params under beforeEach()
      // mock response data
      const jsonObject = {
        "jsonrpc": "2.0",
        "id": "1",
        "result": {
          "header": {
            "txRoot": "DX1Fsb1MdMvMcG3AcvJ4w5gxsKXrPjGv5qrmTvXR2WWt",
            "difficulty": 1051840731240324224,
            "timestamp": 1614870125215,
            "bloomFilter": "111112aqEiuVS2efQXoVV33coDbqihkMzNt6CsCazeCAzTQ2j1YAds6tebhCDqBaDBs3Lo28WB",
            "height": 10,
            "signature": "ABphU6uQZvan2GGBagmwsLeaTHFKDY26v1oER9dFhHoo4TuroFrmbVgqYE9bxepUZvnWTLajRNEGUMus2H4Xihtn",
            "generatorBox": {
              "nonce": "-2738345987285926199",
              "id": "EkQrVxwgAmHJrzgY5kJyAvqH36DjkBFa4cPGGE31tY6y",
              "evidence": "YbEfzvNJ9YeaejXvhV1G4TdBrdYg1mBgzZNAwQ5TYssm",
              "type": "ArbitBox",
              "value": {
                "type": "Simple",
                "quantity": "1000000"
              }
            },
            "version": 0,
            "id": "28kpaSA3AYrbnGDYTmK3J9V93FrmiWvfke7rP2UiZe5HL",
            "publicKey": "aansHqDUHRhD7kztDfQXXZkcGLL4KD8VcEDzQB9fjBPM",
            "parentId": "y2Xktmv6erDjjyykchKbffFBJ78yfMBTZfL5QHNPeD2k"
          },
          "body": {
            "id": "28kpaSA3AYrbnGDYTmK3J9V93FrmiWvfke7rP2UiZe5HL",
            "parentId": "y2Xktmv6erDjjyykchKbffFBJ78yfMBTZfL5QHNPeD2k",
            "txs": [
              {
                "txType": "ArbitTransfer",
                "timestamp": 1614870125215,
                "signatures": {
                  "aansHqDUHRhD7kztDfQXXZkcGLL4KD8VcEDzQB9fjBPM": "985C2DU1CCyP1V4rsNakn1XEQTwjwVsFfc1aTgKysvkNn1rAPwgkRC7Y6MKA4qdYpiXBbVH3RGgziEPP7nJxN6D6"
                },
                "newBoxes": [],
                "data": "y2Xktmv6erDjjyykchKbffFBJ78yfMBTZfL5QHNPeD2k_",
                "to": [
                  [
                    "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                    {
                      "type": "Simple",
                      "quantity": "0"
                    }
                  ]
                ],
                "propositionType": "PublicKeyCurve25519",
                "from": [],
                "minting": true,
                "txId": "fNGtFy3AvyFNm4jhiKkvfB6x9agYpEdt6X2zVcMDLKJn",
                "boxesToRemove": [],
                "fee": "0"
              },
              {
                "txType": "PolyTransfer",
                "timestamp": 1614870125215,
                "signatures": {
                  "aansHqDUHRhD7kztDfQXXZkcGLL4KD8VcEDzQB9fjBPM": "7fPCwtJYYAv2RcUUoRafB4hn3SmC5Jiy5EB9thukjvtcnQRc6uUPqu5VnUo7EH65EZ3MxtDyTBDEmM2cdXJGvCmn"
                },
                "newBoxes": [],
                "data": "y2Xktmv6erDjjyykchKbffFBJ78yfMBTZfL5QHNPeD2k_",
                "to": [
                  [
                    "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                    {
                      "type": "Simple",
                      "quantity": "0"
                    }
                  ]
                ],
                "propositionType": "PublicKeyCurve25519",
                "from": [],
                "minting": true,
                "txId": "n5RUHRn8wjWL6UagecnUpNjvvzBRMU9Z4CLEhREhowoV",
                "boxesToRemove": [],
                "fee": "0"
              }
            ],
            "version": 0
          },
          "blockSize": 654
        }
      };

      // creates the response obj
      const responseObject = {"status": "200", "json": () => {
        return jsonObject;
      }};

      // stub the promise response
      sinon.restore(); // restore sinon to resolve promise with new obj
      sinon.stub(nodeFetch, "Promise").returns(Promise.resolve(responseObject));

      // make the call trying to test for
      const response = await requests.getBlockByHeight(parameters);

      // do validation here
      assert.strictEqual(response.result.header.id, "28kpaSA3AYrbnGDYTmK3J9V93FrmiWvfke7rP2UiZe5HL");
      assert.strictEqual(response.result.body.version, 0);
      assert.strictEqual(response.result.blockSize, 654);
    });
    it("should fail if no parameters present", function(done) {
      // make call without parameters
      requests
          .getBlockByHeight()
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: A parameter object must be specified");
            done();
          });
    });
    it("should fail if no height provided", (done) => {
      parameters.height = "";

      requests
          .getBlockByHeight(parameters)
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: A height must be specified");
            done();
          });
    });
    it("should fail if height < 1", (done) => {
      parameters.height = -1;

      requests
          .getBlockByHeight(parameters)
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: Height must be an Integer greater than 0");
            done();
          });
    });
    it("should fail if height is not an Integer", (done) => {
      parameters.height = "notaninteger";

      requests
          .getBlockByHeight(parameters)
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: Height must be an Integer greater than 0");
            done();
          });
    });
    it("should fail if height is a double", (done) => {
      parameters.height = 3.14;

      requests
          .getBlockByHeight(parameters)
          .then((response) => {
            done(new Error("should not succeded"));
          })
          .catch((error) => {
            expect(String(error)).to.equal("Error: Height must be an Integer greater than 0");
            done();
          });
    });
  });

  /* -------------------- Get the latest block in the chain --------------------------- */
  describe("get the latest block in the chain", () => {
    it("should return latest block in chain", async () => {
      // mock response data
      const jsonObject = {
        "jsonrpc": "2.0",
        "id": "1",
        "result": {
          "height": "403",
          "score": 5527765018,
          "bestBlockId": "xeSu62ZNd4psnYvxj1M9QzrHTnxHZLsotqBNvjem3aGC",
          "bestBlock": {
            "header": {
              "txRoot": "Hnr45z9TFKjS3YbKdUrTxszLeD9cErMPLQGz9kfpgDeb",
              "difficulty": 123164816978748752,
              "timestamp": 1614871235474,
              "bloomFilter": "111112aqEiuVS2efQXoVV33coDbqihkMzNt6CsCazeCAzTQ2j1YAds6tebhCDqBaDBs3Lo28WB",
              "height": 403,
              "signature": "92QJGw9ayXo1HeBZ5ngHERb1L4QCge8JSoGrbVTfoMYgE8HzG1k1RHEsRF6k2MzsAkyYSzUxRi4egBCuyftq7A5C",
              "generatorBox": {
                "nonce": "632651921866009156",
                "id": "HAkHigK5gLyf7h6sXrr6TXeN2e2kGuWn5eLe53muGBrD",
                "evidence": "MCeJ37GRGfqgzLwjn2G9yk5aN9ch91nVGgAmzWrvMMAq",
                "type": "ArbitBox",
                "value": {
                  "type": "Simple",
                  "quantity": "1000000"
                }
              },
              "version": 0,
              "id": "xeSu62ZNd4psnYvxj1M9QzrHTnxHZLsotqBNvjem3aGC",
              "publicKey": "XYD8eeqVNVbxW7KgPj9vWMzEph76vg7xNCRYQFWfneGd",
              "parentId": "xZvaaLKrFzznZ2t9ieMSihfgmstjB6xYM5EgZpgRnUnx"
            },
            "body": {
              "id": "xeSu62ZNd4psnYvxj1M9QzrHTnxHZLsotqBNvjem3aGC",
              "parentId": "xZvaaLKrFzznZ2t9ieMSihfgmstjB6xYM5EgZpgRnUnx",
              "txs": [
                {
                  "txType": "ArbitTransfer",
                  "timestamp": 1614871235474,
                  "signatures": {
                    "XYD8eeqVNVbxW7KgPj9vWMzEph76vg7xNCRYQFWfneGd": "9ZTNcebwgkxUn1sAipYcKFmTxAuTPAZngWdSkNZEoRc4mZCtpEBCU7bZMRZBjtjTQRC98hWxFCJ3wsEWxM4JqQL7"
                  },
                  "newBoxes": [],
                  "data": "xZvaaLKrFzznZ2t9ieMSihfgmstjB6xYM5EgZpgRnUnx_",
                  "to": [
                    [
                      "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                      {
                        "type": "Simple",
                        "quantity": "0"
                      }
                    ]
                  ],
                  "propositionType": "PublicKeyCurve25519",
                  "from": [],
                  "minting": true,
                  "txId": "t6dpKT3o2jPQLgb2e2snEw4rGNqCdJiZ5KE1L57d5juE",
                  "boxesToRemove": [],
                  "fee": "0"
                },
                {
                  "txType": "PolyTransfer",
                  "timestamp": 1614871235474,
                  "signatures": {
                    "XYD8eeqVNVbxW7KgPj9vWMzEph76vg7xNCRYQFWfneGd": "AGKWbeTpS7JRT3jkfBJxaBUjvkfBQRRqntJGHh7gUPFBD1TJDyHkxkYkpUqTUNfkJncMFvNfhVybLoRiAEqqdWTv"
                  },
                  "newBoxes": [],
                  "data": "xZvaaLKrFzznZ2t9ieMSihfgmstjB6xYM5EgZpgRnUnx_",
                  "to": [
                    [
                      "AU9dn9YhqL1YWxfemMfS97zjVXR6G9QX74XRq1jVLtP3snQtuuVk",
                      {
                        "type": "Simple",
                        "quantity": "0"
                      }
                    ]
                  ],
                  "propositionType": "PublicKeyCurve25519",
                  "from": [],
                  "minting": true,
                  "txId": "frYhd49QqGAkWrVywsyWTyb37eAa8wq798gw4Ad7BGXe",
                  "boxesToRemove": [],
                  "fee": "0"
                }
              ],
              "version": 0
            },
            "blockSize": 655
          }
        }
      };

      // creates the response obj
      const responseObject = {"status": "200", "json": () => {
        return jsonObject;
      }};

      // stub the promise response
      sinon.restore(); // restore sinon to resolve promise with new obj
      sinon.stub(nodeFetch, "Promise").returns(Promise.resolve(responseObject));

      // make the call trying to test for
      const response = await requests.getLatestBlock(parameters);

      // do validation here
      assert.strictEqual(typeof response.result, "object");
      assert.strictEqual(typeof response.result.bestBlock, "object");
      assert.strictEqual(response.result.bestBlockId, "xeSu62ZNd4psnYvxj1M9QzrHTnxHZLsotqBNvjem3aGC");
    });
  });
});
