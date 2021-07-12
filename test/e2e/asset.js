const assert = require("assert");
const Requests = require("../../src/modules/Requests");

describe("Asset", () => {
  before(() => {
    brambljs = new Requests();
  });
  it("should transfer assets", (done) => {
    const paramsTransfer = {
      "issuer": "6sYyiTguyQ455w2dGEaNbrwkAWAEYV1Zk6FtZMknWDKQ",
      "assetCode": "testAssets",
      "recipient": "DXLLQ1cX8MDG3QjCdkH1Q9w3G1UQDU8f2gb4865fNJSh",
      "sender": ["6sYyiTguyQ455w2dGEaNbrwkAWAEYV1Zk6FtZMknWDKQ"],
      "amount": 2,
      "fee": 0
    };

    // mock response data
    const jsonObject = {
      "jsonrpc": "2.0",
      "id": "1",
      "result": {
        "formattedTx": {
          "txType": "AssetTransfer",
          "txHash": "2ChyrPLSdAXof49X2cd75PmT2Jz1xZdphHkf4WLzdfdW",
          "timestamp": 1586470624541,
          "signatures": {},
          "newBoxes": [
            "3gWhYUcC4FngBjJo31wMmytfNvodAQMuUcss5dkwTTpV",
            "k7KY9K9JczYFekMkHkBozs3y1VkasTP4Tgbzg3W49Qb"
          ],
          "data": "",
          "issuer": "6sYyiTguyQ455w2dGEaNbrwkAWAEYV1Zk6FtZMknWDKQ",
          "to": [
            [
              "6sYyiTguyQ455w2dGEaNbrwkAWAEYV1Zk6FtZMknWDKQ",
              "90"
            ],
            [
              "22222222222222222222222222222222222222222222",
              "10"
            ]
          ],
          "assetCode": "test",
          "from": [
            [
              "6sYyiTguyQ455w2dGEaNbrwkAWAEYV1Zk6FtZMknWDKQ",
              "-3898410089397904521"
            ]
          ],
          "boxesToRemove": [
            "HdXwi2FhUFtkRSgogEoazFQkTQ8qhgqTDBVmN8syyNL2"
          ],
          "fee": 0
        },
        "messageToSign": "2BLh7ZpAeCSgv9eiZWrh7ReW3ku2UXRkeYGYECodWja6fbAtYR5S8baZqtyzA4CXx2JgeBcf6zdiNBuHPa882UN7BrGPn9PGzzjr4DzGvrh3Xj8ai1yaYeCMwRzvJ14zfuomW1b6rPLasJEK3hpmbbx345uKHLLXFcmBMjbhhFX7ATkFHjqijGaHi389CeL9A5hWiAo8g4DojwpTum836GrD9z1DzeVmNpUgsZciGR2gxGTBgTBBFrcPQYXs17155QVP9KCqx7SD2EPx54K2vpvhXdQ9u8VuScMcVtKJc3V1usDpWGfRVvzzm2rfnSSQKmMN9hq6bZT6xxYyHtsb4Hu38oBya9cwcpoYdCEWL8YVgvHUpd34XYkhZawpuS2NzwhPYyqPigeGPmYvG2r8Qt883frMwp6hTWys8SvsLeebvQykpbjCyMu"
      }
    };

    brambljs
        .transferAssetsPrototype(paramsTransfer)
        .then((response) => {
          // console.log("Transfer Assets Response: ", response);
          assert.strictEqual(typeof response.result, "object");
          assert.strictEqual(response.result.formattedTx.txHash, "2ChyrPLSdAXof49X2cd75PmT2Jz1xZdphHkf4WLzdfdW");
          done();
        })
        .catch((error) => {
          console.log("Transfer Assets ERROR: ", error);
          done(new Error("Transfer Assets Failed"));
        });
  });
});
