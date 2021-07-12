/**
 * @fileOverview Utility encryption related functions for KeyManager module.
 *
 * @author Raul Aragonez (r.aragonez@topl.me)
 *
 * @exports utils isValidNetwork, getUrlByNetwork, getHexByNetwork, getDecimalByNetwork, getValidNetworksList, validateAddressesByNetwork, generatePubKeyHashAddress
 */

"use strict";

// Dependencies
const Base58 = require("bs58");
const blake = require("blake2");

const validNetworks = ["local", "private", "toplnet", "valhalla", "hel"];

// TODO: Feature - support custom define network
// TODO: everything in UTILS should be part of BramblJS
const networksDefaults = {
  "local": {
    hex: "0x30",
    decimal: 48
  },
  "private": {
    hex: "0x40",
    decimal: 64
  },
  "toplnet": {
    hex: "0x01",
    decimal: 1
  },
  "valhalla": {
    hex: "0x10",
    decimal: 16
  },
  "hel": {
    hex: "0x20",
    decimal: 32
  }
};

/**
 * Check if addresses are valid by verifying:
 * 1. verify the address is not null
 * 2. verify the base58 is 38 bytes long
 * 3. verify that it matches the network
 * 4. verify that hash matches the last 4 bytes
 * @param {String} networkPrefix prefix of network to validate against
 * @param {Array} addresses list of addresses to run validation against
 * @returns {object} result obj returned as json
 */
function validateAddressesByNetwork(networkPrefix, addresses) {
  // response upon the completion of validation
  const result = {
    success: false,
    errorMsg: "",
    networkPrefix: networkPrefix,
    addresses: [],
    invalidAddresses: [],
    invalidChecksums: []
  };

  // check if network is valid
  if (!isValidNetwork(networkPrefix)) {
    result.errorMsg = "Invalid network provided";
    return result;
  }

  if (!addresses) {
    result.errorMsg = "No addresses provided";
    return result;
  }

  // get decimal of the network prefix
  const networkDecimal = getDecimalByNetwork(networkPrefix);

  // addresses can be passed as an array or extracted from a json obj
  result.addresses = addresses.constructor === Array ? addresses : extractAddressesFromObj(addresses);

  // check if addresses were obtained
  if (!result.addresses || result.addresses.length < 1) {
    result.errorMsg = "No addresses found";
    return result;
  }

  // run validation on addresses, if address is not valid then add it to invalidAddresses array
  result.addresses.forEach((address) => {
    const decodedAddress = Base58.decode(address);

    // validation: base58 38 byte obj that matches networkPrefix decimal
    if (decodedAddress.length !== 38 || decodedAddress[0] !== networkDecimal) {
      result.invalidAddresses.push(address);
    } else {
      // address has correct length and matches the network, now validate the checksum
      const checksumBuffer = Buffer.from(decodedAddress.slice(34));

      // encrypt message (bytes 1-34)
      const msgBuffer = Buffer.from(decodedAddress.slice(0, 34));
      const hashChecksumBuffer = blake.createHash("blake2b", {digestLength: 32}).update(msgBuffer).end().read().slice(0, 4);

      // verify checksum bytes match
      if (!checksumBuffer.equals(hashChecksumBuffer)) {
        result.invalidChecksums.push(address);
      }
    }
  });

  // check if any invalid addresses were found
  if (result.invalidAddresses.length > 0) {
    result.errorMsg = "Invalid addresses for network: " + networkPrefix;
  } else if (result.invalidChecksums.length > 0) {
    result.errorMsg = "Addresses with invalid checksums found.";
  } else {
    result.success = true;
  }

  return result;
}

/**
 * Generate Hash Address using the Public Key and Network Prefix
 * @param {Buffer} publicKey base58 buffer of public key
 * @param {String} networkPrefix prefix of network where address will be used
 * @returns {object} result obj returned as json
 */
function generatePubKeyHashAddress(publicKey, networkPrefix) {
  const result = {
    success: false,
    errorMsg: "",
    networkPrefix: networkPrefix,
    address: ""
  };

  // validate Network Prefix
  if (!isValidNetwork(networkPrefix)) {
    result.errorMsg = "Invalid network provided";
    return result;
  }

  // validate public key
  if (publicKey.length !== 32) {
    result.errorMsg = "Invalid publicKey length";
    return result;
  }

  // include evidence with network prefix and multisig
  const networkHex = getHexByNetwork(networkPrefix);
  const netSigBytes = new Uint8Array([networkHex, "0x01"]); // network decimal + multisig
  const evidence = blake.createHash("blake2b", {digestLength: 32}).update(publicKey).digest(); // hash it

  const concatEvidence = Buffer.concat([netSigBytes, evidence], 34); // insert the publicKey

  // get the hash of these 2, add first 4 bytes to the end.
  const hashChecksumBuffer = blake.createHash("blake2b", {digestLength: 32}).update(concatEvidence).end().read().slice(0, 4);
  const address = Buffer.concat([concatEvidence, hashChecksumBuffer], 38);

  result.address = Base58.encode(address);
  result.success = true;
  return result;
}

/**
 * Parse obj to retrieve addresses from the following keys:
 * ["recipients", "sender", "changeAddress", "consolidationAdddress", "addresses"]
 *
 * @param {object} obj json obj to retrieve addresses from
 * @returns {Array} list of addresses found in object
 */
function extractAddressesFromObj(obj) {
  // only push unique items in array, so that validation is faster
  let addresses = [];
  if (obj.constructor === String) {
    return [obj];
  }

  const addKeys = ["recipients", "sender", "changeAddress", "consolidationAdddress", "addresses"];

  addKeys.forEach((addKey) => {
    if (obj[addKey] && obj[addKey].length > 0) {
      if (addKey === "recipients") {
        obj[addKey].forEach((recipient) => {
          // retrieve address from tuple
          addresses = addresses.concat(recipient[0]);
        });
      } else {
        addresses = addresses.concat(obj[addKey]);
      }
    }
  });

  return addresses;
}

/**
 *
 * @param {string} networkPrefix prefix of network where address will be used
 * @param {string} address address to be used to create asset code
 * @param {string} shortName name of assets, up to 8 bytes long latin-1 enconding
 * @returns {string} return asset code
 */
function createAssetCode(networkPrefix, address, shortName) {
  if (!isValidNetwork(networkPrefix)) {
    throw new Error("Invalid network provided");
  }

  const validationResult = validateAddressesByNetwork(networkPrefix, address);
  if (!validationResult.success) {
    throw new Error("Invalid Addresses::" +
      " Network Type: <" + this.networkPrefix + ">" +
      " Invalid Addresses: <" + validationResult.invalidAddresses + ">" +
      " Invalid Checksums: <" + validationResult.invalidChecksums + ">");
  }

  const decodedAddress = Base58.decode(address);
  const slicedAddress = Buffer.from(decodedAddress.slice(0, 34));

  // validate shortName
  if (!shortName || shortName.length > 8) {
    throw new Error("shortname must be defined with length up to 8 bytes in latin-1 encoding");
  }

  // ensure shortName is latin1
  const latin1ShortName = Buffer.from(shortName, "latin1");
  if (latin1ShortName.toString() !== shortName) {
    throw new Error("shortname must be latin-1 encoding, other languages are currenlty not supported");
  }

  // concat 01 [version] + 34 bytes [address] + ^8bytes [asset name]
  const version = new Uint8Array(["0x01"]);
  const concatValues = Buffer.concat([version, slicedAddress, latin1ShortName], 43); // add trailing zeros, shortname must be 8 bytes long
  const encodedAssetCode = Base58.encode(concatValues);

  return encodedAssetCode;
}

/**
 *
 * @param {string} assetCode string in latin1 encoding
 * @returns {boolean} true if valid
 */
function isValidAssetCode(assetCode) {
  // concat 01 [version] + 34 bytes [address] + ^8bytes [asset name]
  const decodedAssetCode = Base58.decode(assetCode);
  if (decodedAssetCode.length !== 43 || decodedAssetCode[0] !== 1) {
    return false;
  }
  return true;
}

/**
 *
 * @param {string} metadata string in latin1 encoding
 * @returns {boolean} true if valid
 */
function isValidMetadata(metadata) {
  // ensure data is latin1
  if (!metadata) {
    return false;
  }

  const latin1Buffer = Buffer.from(metadata, "latin1");
  if (latin1Buffer.toString() !== metadata || latin1Buffer.length > 127) {
    return false;
  }
  return true;
}

/**
 * @param {String} networkPrefix prefix of network to validate against
 * @returns {boolean} true if network is valid and is included in the valid networks obj
 */
function isValidNetwork(networkPrefix) {
  return networkPrefix && validNetworks.includes(networkPrefix);
}

/**
 * @param {String} networkPrefix prefix of network to validate against
 * @returns {hex} hexadecimal value of network
 */
function getHexByNetwork(networkPrefix) {
  return networksDefaults[networkPrefix].hex;
}

/**
 * @param {String} networkPrefix prefix of network to validate against
 * @returns {String} hexadecimal value of network
 */
function getDecimalByNetwork(networkPrefix) {
  return networksDefaults[networkPrefix].decimal;
}

/**
 * @param {String} networkPrefix prefix of network to validate against
 * @returns {object} json obj of valid networks
 */
function getValidNetworksList() {
  return validNetworks;
}
/**
 *
 * @param {string} address valid address to retrieve network prefix from
 * @returns {object} obj with {success: <boolean>, networkPrefix: "<prefix if found>", error: "<message>"}
 */
function getAddressNetwork(address) {
  const decodedAddress = Base58.decode(address);
  const result = {
    success: false,
    networkPrefix: "",
    error: ""
  };

  if (decodedAddress.length > 0) {
    validNetworks.forEach((prefix) => {
      if (networksDefaults[prefix].decimal === decodedAddress[0]) {
        result.networkPrefix = prefix;
      }
    });
    if (!isValidNetwork(result.networkPrefix)) {
      result.success = false;
      result.error = "invalid network prefix found";
    } else {
      result.success = true;
    }
  }
  return result;
}

module.exports = {
  isValidNetwork,
  getHexByNetwork,
  getDecimalByNetwork,
  getValidNetworksList,
  validateAddressesByNetwork,
  generatePubKeyHashAddress,
  createAssetCode,
  isValidAssetCode,
  isValidMetadata,
  getAddressNetwork,
  extractAddressesFromObj
};
