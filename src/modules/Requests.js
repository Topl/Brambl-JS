/** A Javascript API wrapper module for the Bifrost Protocol.
 * Currently supports Bifrost v1.3
 * Documentation for Brambl-layer is available at https://Requests.docs.topl.co
 *
 * @author James Aman (j.aman@topl.me)
 * @author Raul Aragonez (r.aragonez@topl.me)
 * @date 2020.10.29
 *
 * Based on the original work of Yamir Tainwala - 2019
 */

"use strict";

const fetch = require("node-fetch");
const utils = require("../utils/address-utils.js");
const Base58 = require("bs58");

/**
 * General builder function for formatting API request
 *
 * @param {object} routeInfo - call specific information
 * @param {string} routeInfo.route - the route where the request will be sent
 * @param {string} routeInfo.method - the json-rpc method that will be triggered on the node
 * @param {string} routeInfo.id - an identifier for tracking requests sent to the node
 * @param {object} params - method specific parameter object
 * @param {object} self - internal reference for accessing constructor data
 * @returns {object} JSON response from the node
 */
async function bramblRequest(routeInfo, params, self) {
  try {
    // const projectId = self.projectId;
    const body = {
      jsonrpc: "2.0",
      id: routeInfo.id || "1",
      method: routeInfo.method,
      params: [
        {...params}
      ]
    };
    const payload = {
      url: self.url,
      method: "POST",
      headers: self.headers,
      body: JSON.stringify(body)
    };
    const response = await (await fetch(self.url, payload)).json();
    if (response.error) {
      throw response;
    } else {
      return response;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * @class Requests
 * @classdesc A class for sending requests to the Brambl layer interface of the given chain provider
 */
class Requests {
  /**
   * @constructor
   * @param {string} [networkPrefix="private"] Network Prefix, defaults to "private"
   * @param {string} [url="http://localhost:9085/YOUR_PROJECT_ID"] Chain provider location, local and private default to http://localhost:9085/
   * @param {string} [apiKey="topl_the_world!"] Access key for authorizing requests to the client API ["x-api-key"], default to "topl_the_world!"
   */
  constructor(networkPrefix, url, apiKey) {
    // set networkPrefix and validate
    this.networkPrefix = networkPrefix || "private";

    if (this.networkPrefix !== "private" && !utils.isValidNetwork(this.networkPrefix)) {
      throw new Error(`Invalid Network Prefix. Must be one of: ${utils.getValidNetworksList()}`);
    }

    // set url if provided or set default
    this.url = url || "http://localhost:9085/";

    // set apiKey or set default
    this.apiKey = apiKey || "topl_the_world!";

    this.headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey
    };
  }

  /**
   * Allows setting a different url than the default from which to create and accept RPC connections
   * @param {string} url url string for instance
   * @returns {void}
   */
  setUrl(url) {
    this.url = url;
  }

  /**
   * Allows setting a different x-api-key than the default
   * @param {string} apiKey api-key for "x-api-key"
   * @returns {void}
   */
  setApiKey(apiKey) {
    this.headers["x-api-key"] = apiKey;
  }

  /* -------------------------------------------------------------------------- */
  /*                             Topl Api Routes                                */
  /* -------------------------------------------------------------------------- */

  /* ---------------------- Create Raw Asset Transfer ------------------------ */
  /**
   * Create a new asset on chain
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.propositionType - Proposition Type -> PublicKeyCurve25519 || TheresholdCurve25519
   * @param {string} params.recipients - 2-dimensional array (array of tuples) -> [["address of recipient", quantity, securityRoot, metadata]]
   * @param {string} params.recipients[i][0]: Required address of recipient
   * @param {string} params.recipients[i][1]: Required number of tokens to send to recipient
   * @param {string} params.recipients[i][2]: Optional security root which is a Base58 encoded 32 byte hash of the data to be stored in the AssetBox.
   * @param {string} params.recipients[i][3]: Optional metadata tag for asset, must be less than 128 Latin-1 characters.
   * @param {string} params.assetCode - Identifier of the asset
   * @param {string} params.sender - Public key of the asset issuer
   * @param {string} params.changeAddress - Public key of the change recipient
   * @param {boolean} params.minting - Minting boolean
   * @param {number} params.fee - Fee to apply to the transaction
   * @param {string} params.consolidationAddress - Address for recipient of unspent Assets
   * @param {string} [params.data] - Data string which can be associated with this transaction (may be empty). Must be strictly less than 128 Latin-1 encoded characters.
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async createRawAssetTransfer(params, id = "1") {
    const validPropositions = ["PublicKeyCurve25519", "ThresholdCurve25519"];

    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.propositionType || !validPropositions.includes(params.propositionType)) {
      throw new Error("A propositionTYpe must be specified: <PublicKeyCurve25519, ThresholdCurve25519>");
    }
    if (!params.sender) {
      throw new Error("An asset sender must be specified");
    }
    if (!params.assetCode) {
      throw new Error("An assetCode must be specified");
    } else if (!utils.isValidAssetCode(params.assetCode)) {
      throw new Error("Invalid asset code");
    }
    if (!params.recipients || params.recipients.length < 1) {
      throw new Error("At least one recipient must be specified");
    }
    if (!params.changeAddress) {
      throw new Error("A changeAddress must be specified");
    }
    if (typeof params.minting !== "boolean") {
      throw new Error("Minting boolean value must be specified");
    }
    if (params.data && !utils.isValidMetadata(params.data)) {
      throw new Error(`Invalid data: ${params.data}`);
    }
    // 0 fee value is accepted
    if (!params.fee && params.fee !== 0) {
      throw new Error("A fee must be specified");
    }
    // fee must be >= 0
    if (params.fee < 0) {
      throw new Error("Invalid fee, a fee must be greater or equal to zero");
    }
    // fee must be a string
    params.fee = params.fee.toString();

    // validate all addresses
    const validationResult = utils.validateAddressesByNetwork(this.networkPrefix, params);
    if (!validationResult.success) {
      throw new Error("Invalid Addresses::" +
        " Network Type: <" + this.networkPrefix + ">" +
        " Invalid Addresses: <" + validationResult.invalidAddresses + ">" +
        " Invalid Checksums: <" + validationResult.invalidChecksums + ">");
    }

    // Include token value holder as tuple format
    for (let i = 0; i < params.recipients.length; i++) {
      // destructuring assingment syntax
      // basic: [address, quantity]
      // advance: [address, quantity, securityRoot, metadata]
      const [address, quantity, securityRoot, metadata] = params.recipients[i];

      // ensure quantitiy is part of the tuple ["address", 10]
      if (!quantity || quantity < 1) {
        throw new Error(`Invalid quantity in Recipient: ${params.recipients[i]}`);
      }

      // required fields
      const tokenValueHolder = {
        "type": "Asset",
        "quantity": quantity.toString(),
        "assetCode": params.assetCode
      };

      // advance option - securityRoot: base58 enconded string [32 bytes]
      if (securityRoot !== undefined) {
        if (Base58.decode(securityRoot).length !== 32) {
          throw new Error(`Invalid securityRoot in Recipient: ${params.recipients[i]}`);
        }
        tokenValueHolder.securityRoot = securityRoot;
      }

      if (metadata !== undefined) {
        // advance option - metadata: up to 128 bytes
        if (!utils.isValidMetadata(metadata)) {
          throw new Error(`Invalid metadata in Recipient: ${metadata}`);
        }
        tokenValueHolder.metadata = metadata;
      }

      params.recipients[i] = [address, tokenValueHolder];
    }

    const method = "topl_rawAssetTransfer";
    return bramblRequest({id, method}, params, this);
  }

  /* ---------------------- Create Raw Poly Trasfer ------------------------ */
  /**
   * Create a raw transaction for transferring polys between addresses
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.propositionType - Proposition Type -> PublicKeyCurve25519 || TheresholdCurve25519
   * @param {string} params.recipients - 2-dimensional array (array of tuples) -> [["publicKey of asset recipient", quantity]]
   * @param {array} params.sender - List of senders addresses
   * @param {string} params.changeAddress - Address of the change recipient
   * @param {number} params.fee - Fee to apply to the transaction
   * @param {string} [params.data] - Data string which can be associated with this transaction (may be empty). This field is restricted to 127 Latin-1 encoded characters
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async createRawPolyTransfer(params, id = "1") {
    const validPropositions = ["PublicKeyCurve25519", "ThresholdCurve25519"];

    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.propositionType || !validPropositions.includes(params.propositionType)) {
      throw new Error("A propositionType must be specified: <PublicKeyCurve25519, ThresholdCurve25519>");
    }
    if (!params.sender) {
      throw new Error("An asset sender must be specified");
    }
    if (!params.recipients || params.recipients.length < 1) {
      throw new Error("At least one recipient must be specified");
    }
    if (!params.changeAddress) {
      throw new Error("A changeAddress must be specified");
    }
    // 0 fee value is accepted
    if (!params.fee && params.fee !== 0) {
      throw new Error("A fee must be specified");
    }
    // fee must be >= 0
    if (params.fee < 0) {
      throw new Error("Invalid fee, a fee must be greater or equal to zero");
    }
    // must be valid data
    if (params.data && !utils.isValidMetadata(params.data)) {
      throw new Error(`Invalid data: ${params.data}`);
    }
    // fee must be a string
    params.fee = params.fee.toString();

    // validate all addresses
    const validationResult = utils.validateAddressesByNetwork(this.networkPrefix, params);
    if (!validationResult.success) {
      throw new Error("Invalid Addresses::" +
        " Network Type: <" + this.networkPrefix + ">" +
        " Invalid Addresses: <" + validationResult.invalidAddresses + ">" +
        " Invalid Checksums: <" + validationResult.invalidChecksums + ">");
    }

    params.recipients.forEach((recipient) => {
      // ensure quantitiy is part of the tuple ["address", 10]
      if (!recipient[1]) {
        throw new Error("Recipient quantity must be specified");
      }
      // quantity must be a string
      recipient[1] = recipient[1].toString();
    });

    const method = "topl_rawPolyTransfer";
    return bramblRequest({id, method}, params, this);
  }

  /* ---------------------- Create Raw Arbit Trasfer ------------------------ */
  /**
   * Create a raw transaction for transferring arbits between addresses
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.propositionType - Proposition Type -> PublicKeyCurve25519 || TheresholdCurve25519
   * @param {string} params.recipients - 2-dimensional array (array of tuples) -> [["publicKey of asset recipient", quantity]]
   * @param {array} params.sender - List of senders addresses
   * @param {string} params.changeAddress - Address of the change recipient
   * @param {string} params.consolidationAddress - Address of the change recipient
   * @param {number} params.fee - Fee to apply to the transaction
   * @param {string} [params.data] - Data string which can be associated with this transaction (may be empty). Must be strictly less than 128 Latin-1 encoded characters.
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async createRawArbitTransfer(params, id = "1") {
    const validPropositions = ["PublicKeyCurve25519", "ThresholdCurve25519"];

    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.propositionType || !validPropositions.includes(params.propositionType)) {
      throw new Error("A propositionType must be specified: <PublicKeyCurve25519, ThresholdCurve25519>");
    }
    if (!params.sender) {
      throw new Error("An asset sender must be specified");
    }
    if (!params.recipients || params.recipients.length < 1) {
      throw new Error("At least one recipient must be specified");
    }
    if (!params.changeAddress) {
      throw new Error("A changeAddress must be specified");
    }
    if (!params.consolidationAddress) {
      throw new Error("A consolidationAddress must be specified");
    }
    // 0 fee value is accepted
    if (!params.fee && params.fee !== 0) {
      throw new Error("A fee must be specified");
    }
    // fee must be >= 0
    if (params.fee < 0) {
      throw new Error("Invalid fee, a fee must be greater or equal to zero");
    }
    // data must be valid
    if (params.data && !utils.isValidMetadata(params.data)) {
      throw new Error(`Invalid data: ${params.data}`);
    }
    // fee must be a string
    params.fee = params.fee.toString();

    // validate all addresses
    const validationResult = utils.validateAddressesByNetwork(this.networkPrefix, params);
    if (!validationResult.success) {
      throw new Error("Invalid Addresses::" +
        " Network Type: <" + this.networkPrefix + ">" +
        " Invalid Addresses: <" + validationResult.invalidAddresses + ">" +
        " Invalid Checksums: <" + validationResult.invalidChecksums + ">");
    }

    params.recipients.forEach((recipient) => {
      // ensure quantitiy is part of the tuple ["address", 10]
      if (!recipient[1]) {
        throw new Error("Recipient quantity must be specified");
      }
      // quantity must be a string
      recipient[1] = recipient[1].toString();
    });

    const method = "topl_rawArbitTransfer";
    return bramblRequest({id, method}, params, this);
  }

  /* --------------------------------- Broadcast Tx --------------------------------------- */
  /**
   * Broadcast a valid signed transaction that will be gossiped about to other nodes
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.tx - a JSON formatted transaction (must include signature(s))
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async broadcastTx(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.tx) {
      throw new Error("A tx object must be specified");
    }
    if (!params.tx.signatures || !Object.keys(params.tx.signatures)[0]) {
      throw new Error("Tx must include signatures");
    }
    // this is not valid since also a signature is being sent, not a full Tx ???
    if (Object.keys(params.tx).length < 10 && params.tx.constructor === Object) {
      throw new Error("Invalid tx object, one or more tx keys not specified");
    }

    const method = "topl_broadcastTx";
    return bramblRequest({id, method}, params, this);
  }

  /* --------------------------------- Lookup Balances By Addresses --------------------------------------- */
  /**
   * Lookup the balances of specified addresses
   * @param {Object} params - body parameters passed to the specified json-rpc method
   * @param {string[]} params.addresses - An array of addresses to query the balance for
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async lookupBalancesByAddresses(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.addresses || !Array.isArray(params.addresses)) {
      throw new Error("A list of addresses must be specified");
    }
    // validate all addresses
    const validationResult = utils.validateAddressesByNetwork(this.networkPrefix, params.addresses);
    if (!validationResult.success) {
      throw new Error("Invalid Addresses::" +
        " Network Type: <" + this.networkPrefix + ">" +
        " Invalid Addresses: <" + validationResult.invalidAddresses + ">" +
        " Invalid Checksums: <" + validationResult.invalidChecksums + ">");
    }
    const method = "topl_balances";
    return bramblRequest({id, method}, params, this);
  }

  /* ----------------------------- Get Mempool ------------------------------------ */
  /**
   * Return the entire mempool of the node
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getMempool(id = "1") {
    const params = {};
    const method = "topl_mempool";
    return bramblRequest({id, method}, params, this);
  }

  /* -------------------------- Get Tx By Id ---------------------------- */
  /**
   * Lookup a transaction from history by the provided id
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.transactionId - Unique identifier of the transaction to retrieve
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getTransactionById(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.transactionId) {
      throw new Error("A transactionId must be specified");
    }
    const method = "topl_transactionById";
    return bramblRequest({id, method}, params, this);
  }

  /* -------------------------- Get Tx From Mempool ---------------------------- */
  /**
   * Lookup a transaction from the mempool by the provided id
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.transactionId - Unique identifier of the transaction to retrieve
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getTransactionFromMempool(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.transactionId) {
      throw new Error("A transactionId must be specified");
    }
    const method = "topl_transactionFromMempool";
    return bramblRequest({id, method}, params, this);
  }

  /* --------------------------------- Get Latest Block --------------------------------------- */
  /**
   * Return the latest block in the chain
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getLatestBlock(id = "1") {
    const params = {};
    const method = "topl_head";
    return bramblRequest({id, method}, params, this);
  }

  /* ----------------------------- Get Block By Id --------------------------------- */
  /**
   * Lookup a block from history by the provided id
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {string} params.blockId - Unique identifier of the block to retrieve
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getBlockById(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.blockId) {
      throw new Error("A blockId must be specified");
    }
    const method = "topl_blockById";
    return bramblRequest({id, method}, params, this);
  }

  /* ----------------------------- Get Block By Height --------------------------------- */
  /**
   * Lookup a block from history by the provided id
   * @param {object} params - body parameters passed to the specified json-rpc method
   * @param {number} params.height - Height as an integer number
   * @param {string} [id="1"] - identifying number for the json-rpc request
   * @returns {object} json-rpc response from the chain
   * @memberof Requests
   */
  async getBlockByHeight(params, id = "1") {
    if (!params) {
      throw new Error("A parameter object must be specified");
    }
    if (!params.height) {
      throw new Error("A height must be specified");
    }
    if (isNaN(params.height) || !Number.isInteger(params.height) || params.height < 1) {
      throw new Error("Height must be an Integer greater than 0");
    }

    const method = "topl_blockByHeight";
    return bramblRequest({id, method}, params, this);
  }
}

/* -------------------------------------------------------------------------- */
module.exports = Requests;
/* -------------------------------------------------------------------------- */
