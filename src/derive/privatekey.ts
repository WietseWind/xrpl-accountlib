"use strict";

import Account from "../schema/Account";

const privatekey = (hex: string): Account => {
  // Account{} will recover required data
  return new Account({
    keypair: { privateKey: hex }
  });
};

export default privatekey;
