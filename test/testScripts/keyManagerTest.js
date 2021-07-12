const KeyMan = require("../../src/modules/KeyManager");

gjal = new KeyMan("password");

h = gjal.getKeyStorage();
console.log(h);

sig = gjal.sign("this is a msg", Buffer.from);
console.log(sig);

ver = KeyMan.verify(gjal.pk, "this is a msg", sig);
console.log(ver);
console.log(gjal.pk);

gjal.exportToFile("keystore/");

/* ----------------------------------------------------------- */
gjak = new KeyMan("genesis_test_password");

try {
  gjak.sign("this should break");
} catch (err) {
  console.log(err);
}

let outKey = "";
try {
  outKey = gjak.exportToFile("keystore/");
  console.log(outKey);
} catch (err) {
  console.log(err);
}

/* ----------------------------------------------------------- */
try {
  gjam = new KeyMan({
    password: "genesis_test_password",
    keyPath: outKey
  });
  console.log(gjam.getKeyStorage());
} catch (err) {
  console.log(err);
}
