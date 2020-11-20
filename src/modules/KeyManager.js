/**
 * Create, import, and export Topl Bifrost keys.
 * Also allows for signing of transactions
 * @author James Aman (j.aman@topl.me)
 *
 * Based on the keythereum library from Jack Peterson
 * https://github.com/Ethereumjs/keythereum
 */

"use strict";

// Dependencies
const fs = require("fs");
const path = require("path");
const blake = require("blake2");
const crypto = require("crypto");
const Base58 = require("base-58");
const keccakHash = require("keccak");
const curve25519 = require("curve25519-js");

// Default options for key generation as of 2020.01.25
const defaultOptions = {
  // Symmetric cipher for private key encryption
  // --- anything from crypto.getCiphers() is eligible
  cipher: "aes-256-ctr",

  // Initialization vector size in bytes
  ivBytes: 16,

  // Private key size in bytes
  keyBytes: 32,

  // Key derivation function parameters
  scrypt: {
    dkLen: 32,
    n: Math.pow(2, 18), // cost (as given in bifrost)
    r: 8, // blocksize
    p: 1 // parallelization
  }
};

/* ------------------------------ Generic key methods  ------------------------------ */

/**
 * Function for checking the type input as a callback
 * @param {object} f obj f to verify if type is function
 * @returns {boolean} returns true if obj provided is a function
 */
function isFunction(f) {
  return typeof f === "function";
}

/**
 * Convert a string to a Buffer.  If encoding is not specified, hex-encoding
 * will be used if the input is valid hex.  If the input is valid base64 but
 * not valid hex, base64 will be used.  Otherwise, utf8 will be used.
 * @param {string} str String to be converted.
 * @param {string=} enc Encoding of the input string (optional).
 * @returns {Buffer} Buffer (bytearray) containing the input data.
 */
function str2buf(str, enc) {
  if (!str || str.constructor !== String) return str;
  return enc ? Buffer.from(str, enc) : Buffer.from(Base58.decode(str));
}

/**
 * Check if the selected cipher is available.
 * @param {string} cipher Encryption algorithm.
 * @returns {boolean} If available true, otherwise false.
 */
function isCipherAvailable(cipher) {
  return crypto.getCiphers().some(function(name) {
    return name === cipher;
  });
}

/**
 * Symmetric private key encryption using secret (derived) key.
 * @param {Buffer|string} plaintext Data to be encrypted.
 * @param {Buffer|string} key Secret key.
 * @param {Buffer|string} iv Initialization vector.
 * @param {string=} algo Encryption algorithm (default: constants.cipher).
 * @returns {Buffer} Encrypted data.
 */
function encrypt(plaintext, key, iv, algo) {
  if (!isCipherAvailable(algo)) throw new Error(algo + " is not available");
  const cipher = crypto.createCipheriv(algo, str2buf(key), str2buf(iv));
  const ciphertext = cipher.update(str2buf(plaintext));
  return Buffer.concat([ciphertext, cipher.final()]);
}

/**
 * Symmetric private key decryption using secret (derived) key.
 * @param {Buffer|string} ciphertext Data to be decrypted.
 * @param {Buffer|string} key Secret key.
 * @param {Buffer|string} iv Initialization vector.
 * @param {string=} algo Encryption algorithm (default: constants.cipher).
 * @returns {Buffer} Decrypted data.
 */
function decrypt(ciphertext, key, iv, algo) {
  if (!isCipherAvailable(algo)) throw new Error(algo + " is not available");
  const decipher = crypto.createDecipheriv(algo, str2buf(key), str2buf(iv));
  const plaintext = decipher.update(str2buf(ciphertext));
  return Buffer.concat([plaintext, decipher.final()]);
}

/**
 * Calculate message authentication code from secret (derived) key and
 * encrypted text.  The MAC is the keccak-256 hash of the byte array
 * formed by concatenating the second 16 bytes of the derived key with
 * the ciphertext key's contents.
 * @param {Buffer|string} derivedKey Secret key derived from password.
 * @param {Buffer|string} ciphertext Text encrypted with secret key.
 * @returns {string} Base58-encoded MAC.
 */
function getMAC(derivedKey, ciphertext) {
  const keccak256 = (msg) => keccakHash("keccak256").update(msg).digest();
  if (derivedKey !== undefined && derivedKey !== null && ciphertext !== undefined && ciphertext !== null) {
    return keccak256(Buffer.concat([
      str2buf(derivedKey).slice(16, 32),
      str2buf(ciphertext)
    ]));
  }
}

/**
 * Generate random numbers for private key, initialization vector,
 * and salt (for key derivation).
 * @param {Object} params Encryption options.
 * @param {string} params.keyBytes Private key size in bytes.
 * @param {string} params.ivBytes Initialization vector size in bytes.
 * @param {function=} cb Callback function (optional).
 * @returns {Object} Keys, IV and salt.
 */
function create(params, cb) {
  const keyBytes = params.keyBytes;
  const ivBytes = params.ivBytes;

  /**
   * Create hash using Blake2b
   * @param {Object} Buffer buffer to process
   * @returns {Object} has created by blake2b
   */
  function bifrostBlake2b(Buffer) {
    return blake.createHash("blake2b", {digestLength: 32}).update(Buffer).digest();
  }

  /**
   * Generate curve25519 Key
   * @param {Object} randomBytes random bytes
   * @returns {Object} curve25519 Key as obj
   */
  function curve25519KeyGen(randomBytes) {
    const {public: pk, private: sk} = curve25519.generateKeyPair(bifrostBlake2b(randomBytes));
    return {
      publicKey: Buffer.from(pk),
      privateKey: Buffer.from(sk),
      iv: bifrostBlake2b(crypto.randomBytes(keyBytes + ivBytes + keyBytes)).slice(0, ivBytes),
      salt: bifrostBlake2b(crypto.randomBytes(keyBytes + ivBytes))
    };
  }

  // synchronous key generation if callback not provided
  if (!isFunction(cb)) {
    return curve25519KeyGen(crypto.randomBytes(keyBytes + ivBytes + keyBytes));
  }

  // asynchronous key generation
  crypto.randomBytes(keyBytes + ivBytes + keyBytes, function(randomBytes) {
    cb(curve25519KeyGen(randomBytes));
  });
}

/**
 * Derive secret key from password with key derivation function.
 * @param {String|Buffer} password User-supplied password.
 * @param {String|Buffer} salt Randomly generated salt.
 * @param {Object} [kdfParams] key-derivation parameters
 * @param {function} [cb] Callback function (optional).
 * @returns {Buffer} Secret key derived from password.
 */
function deriveKey(password, salt, kdfParams, cb) {
  if (typeof password === "undefined" || password === null || !salt) {
    throw new Error("Must provide password and salt to derive a key");
  }

  // convert strings to Buffers
  password = str2buf(password, "utf8");
  salt = str2buf(salt);

  // get scrypt parameters
  const dkLen = kdfParams.dkLen;
  const N = kdfParams.n;
  const r = kdfParams.r;
  const p = kdfParams.p;
  const maxmem = 2 * 128 * N * r;

  // use scrypt as key derivation function
  if (!isFunction(cb)) {
    return crypto.scryptSync(password, salt, dkLen, {N, r, p, maxmem});
  }

  // asynchronous key generation
  cb(crypto.scryptSync(password, salt, dkLen, {N, r, p, maxmem}));
}

/**
 * Assemble key data object in secret-storage format.
 * @param {Buffer} derivedKey Password-derived secret key.
 * @param {Object} keyObject Object containing the raw public / private keypair
 * @param {Buffer} salt Randomly generated salt.
 * @param {Buffer} iv Initialization vector.
 * @param {Buffer} algo encryption algorithm to be used
 * @returns {Object} key data object in secret-storage format
 */
function marshal(derivedKey, keyObject, salt, iv, algo) {
  // encrypt using last 16 bytes of derived key (this matches Bifrost)
  const ciphertext = encrypt(keyObject.privateKey, derivedKey, iv, algo);

  const keyStorage = {
    publicKeyId: Base58.encode(keyObject.publicKey),
    crypto: {
      cipher: algo,
      cipherText: Base58.encode(ciphertext),
      cipherParams: {iv: Base58.encode(iv)},
      mac: Base58.encode(getMAC(derivedKey, ciphertext))
    }
  };

  keyStorage.crypto.kdf = "scrypt";
  keyStorage.crypto.kdfSalt = Base58.encode(salt);

  return keyStorage;
}

/**
 * Export private key to keystore secret-storage format.
 * @param {string|Buffer} password User-supplied password.
 * @param {Object} keyObject Object containing the raw public / private keypair
 * @param {Buffer} options encryption algorithm to be used
 * @param {function=} cb Callback function (optional).
 * @returns {Object} keyStorage for use with exportToFile
 */
function dump(password, keyObject, options, cb) {
  const kdfParams = options.kdfParams || options.scrypt;
  const iv = str2buf(keyObject.iv);
  const salt = str2buf(keyObject.salt);
  const privateKey = str2buf(keyObject.privateKey);
  const publicKey = str2buf(keyObject.publicKey);

  // synchronous if no callback provided
  if (!isFunction(cb)) {
    return marshal(deriveKey(password, salt, kdfParams), {privateKey, publicKey}, salt, iv, options.cipher);
  }

  // asynchronous if callback provided
  deriveKey(password, salt, function(derivedKey) {
    cb(marshal(derivedKey, privateKey, salt, iv, options.cipher));
  });
}

/**
 * Recover plaintext private key from secret-storage key object.
 * @param {string|Buffer} password User-supplied password.
 * @param {Object} keyStorage Keystore object.
 * @param {Object} [kdfParams] key-derivation parameters
 * @param {function=} cb Callback function (optional).
 * @returns {Buffer} Plaintext private key.
 */
function recover(password, keyStorage, kdfParams, cb) {
  /**
   * Verify that message authentication codes match, then decrypt
   * @param {Buffer} derivedKey Password-derived secret key.
   * @param {Buffer} iv Initialization vector.
   * @param {Object} ciphertext cipher text
   * @param {Object} mac keccak-256 hash of the byte array
   * @param {Buffer} algo encryption algorithm to be used
   * @returns {object} returns result of fn decrypt
   */
  function verifyAndDecrypt(derivedKey, iv, ciphertext, mac, algo) {
    if (!getMAC(derivedKey, ciphertext).equals(mac)) {
      throw new Error("message authentication code mismatch");
    }
    return decrypt(ciphertext, derivedKey, iv, algo);
  }

  const iv = str2buf(keyStorage.crypto.cipherParams.iv);
  const salt = str2buf(keyStorage.crypto.kdfSalt);
  const ciphertext = str2buf(keyStorage.crypto.cipherText);
  const mac = str2buf(keyStorage.crypto.mac);
  const algo = keyStorage.crypto.cipher;

  // derive secret key from password
  if (!isFunction(cb)) {
    return verifyAndDecrypt(deriveKey(password, salt, kdfParams), iv, ciphertext, mac, algo);
  }

  deriveKey(password, salt, kdfParams, (derivedKey) => {
    cb(verifyAndDecrypt(derivedKey, iv, ciphertext, mac, algo));
  });
}

/**
 * Generate filename for a keystore file.
 * @param {String} publicKey Topl address.
 * @returns {string} Keystore filename.
 */
function generateKeystoreFilename(publicKey) {
  if (typeof publicKey !== "string") throw new Error("PublicKey must be given as a string for the filename");
  const filename = new Date().toISOString() + "-" + publicKey + ".json";

  return filename.split(":").join("-");
}

/* -------------------------------------------------------------------------- */
/*                           Key Manager Class                                */
/* -------------------------------------------------------------------------- */
/**
 * @class
 * @classdesc Create a new instance of the Key management interface.
 */
class KeyManager {
    // Private variables
    #sk;
    #isLocked;
    #password;
    #keyStorage;
    /* ------------------------------ Instance constructor ------------------------------ */
    /**
     * @constructor
     * @param {object} params constructor object for key manager
     * @param {string} params.password password for encrypting (decrypting) the keyfile
     * @param {string} [params.path] path to import keyfile
     * @param {object} [params.constants] default encryption options for storing keyfiles
     */
    constructor(params) {
      // enforce that a password must be provided
      if (params.constructor !== String && !params.password) throw new Error("A password must be provided at initialization");

      // Initialize a key manager object with a key storage object
      const initKeyStorage = (keyStorage, password) => {
        this.pk = keyStorage.publicKeyId;
        this.#isLocked = false;
        this.#password = password;
        this.#keyStorage = keyStorage;

        if (this.pk) this.#sk = recover(password, keyStorage, this.constants.scrypt);
      };

      const generateKey = (password) => {
        // this will create a new curve25519 key pair and dump to an encrypted format
        initKeyStorage(dump(password, create(this.constants), this.constants), password);
      };

      // Imports key data object from keystore JSON file.
      const importFromFile = (filepath, password) => {
        const keyStorage = JSON.parse(fs.readFileSync(filepath));
        // todo - check that the imported object conforms to our definition of a keyfile
        initKeyStorage(keyStorage, password);
      };

      // initialize vatiables
      this.constants = params.constants || defaultOptions;
      initKeyStorage({publicKeyId: "", crypto: {}}, "");

      // load in keyfile if a path was given, or default to generating a new key
      if (params.keyPath) {
        try {
          importFromFile(params.keyPath, params.password);
        } catch (err) {
          throw new Error("Error importing keyfile - " + err);
        }
      } else {
        // Will check if only a string was given and assume it is the password
        if (params.constructor === String) generateKey(params);
        else generateKey(params.password);
      }
    }

    /* ------------------------------ Static methods ------------------------------------ */
    /**
     * Check whether a private key was used to generate the signature for a message.
     * This method is static so that it may be used without generating a keyfile
     * @param {Buffer|string} publicKey A public key (if string, must be base-58 encoded)
     * @param {string} message Message to sign (utf-8 encoded)
     * @param {Buffer|string} signature Signature to verify (if string, must be base-58 encoded)
     * @param {function=} cb Callback function (optional).
     * @returns {function} returns function Verify or includes fuinction verify if callback provided
     * @memberof KeyManager
     */
    static verify(publicKey, message, signature, cb) {
      const pk = str2buf(publicKey);
      const msg = str2buf(message, "utf8");
      const sig = str2buf(signature);

      // synchronous key generation if callback not provided
      if (!isFunction(cb)) {
        return curve25519.verify(pk, msg, sig);
      }

      // asynchronous
      cb(curve25519.verify(pk, msg, sug));
    };

    /* ------------------------------ Public methods -------------------------------- */
    /**
     * Getter function to retrieve key storage in the Bifrost compatible format
     * @memberof KeyManager
     * @returns {any} #keyStorage
     */
    getKeyStorage() {
      if (this.#isLocked) throw new Error("Key manager is currently locked. Please unlock and try again.");
      if (!this.pk) throw new Error("A key must be initialized before using this key manager");
      return this.#keyStorage;
    }

    /**
     * Set the key manager to locked so that the private key may not be decrypted
     * @memberof KeyManager
     * @returns {void}
     */
    lockKey() {
      this.#isLocked = true;
    }

    /**
     * Unlock the key manager to be used in transactions
     * @param {string} password encryption password for accessing the keystorage object
     * @memberof KeyManager
     * @returns {void}
     */
    unlockKey(password) {
      if (!this.#isLocked) throw new Error("The key is already unlocked");
      if (password !== this.#password) throw new Error("Invalid password");
      this.#isLocked = false;
    }

    /**
     * Generate the signature of a message using the provided private key
     * @param {string} message Message to sign (utf-8 encoded)
     * @memberof KeyManager
     * @returns {Buffer} signature
     */
    sign(message) {
      if (this.#isLocked) throw new Error("The key is currently locked. Please unlock and try again.");
      // curve25519sign using this.#sk as private key and provided message
      return curve25519.sign(str2buf(this.#sk), str2buf(message, "utf8"), crypto.randomBytes(64));
    }

    /**
     * Export formatted JSON to keystore file.
     * @param {string=} _keyPath Path to keystore folder (default: "keystore").
     * @returns {string} JSON filename
     * @memberof KeyManager
     */
    exportToFile(_keyPath) {
      const keyPath = _keyPath || "keyfiles";

      const outfile = generateKeystoreFilename(this.pk);
      const json = JSON.stringify(this.getKeyStorage());
      const outpath = path.join(keyPath, outfile);

      fs.writeFileSync(outpath, json);
      return outpath;
    }
};

/* -------------------------------------------------------------------------- */

module.exports = KeyManager;

/* -------------------------------------------------------------------------- */
