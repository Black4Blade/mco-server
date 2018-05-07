class RC4 {
  constructor (key) {
    const keyBytes = Buffer.from (key, 'utf8');
    this.keyBytes = keyBytes;
    const keyLength = keyBytes.length;
    this.keyLen = keyLength;
    this.mState = Array (256);
    this.mX = 0;
    this.mY = 0;

    for (let counter = 0; counter < 256; counter++) {
      this.mState[counter] = counter;
    }

    let index1 = 0;
    let j = 0;

    for (let counter = 0; counter < 256; counter++) {
      j = (j + this.mState[counter] + keyBytes[index1++]) % 256;
      this.swapByte (counter, j);
      if (index1 >= keyLength) {
        index1 = 0;
      }
    }
  }

  getKey () {
    return this.keyBytes;
  }

  getKeyLen () {
    return this.keyLen;
  }

  getSBox () {
    return this.mState;
  }

  processString (inString) {
    const inBytes = Buffer.from (inString);
    let idx1 = 0;
    let idx2 = 0;
    let strLength = inBytes.length;
    const output = Buffer.alloc (strLength);
    const s = this.mState;
    let x = this.mX;
    let y = this.mY;

    while (strLength--) {
      // tslint:disable-next-line:no-bitwise
      x = (x + 1) & 0xff;
      const a = s[x];
      // tslint:disable-next-line:no-bitwise
      y = (y + a) & 0xff;
      const b = s[y];
      s[x] = b;
      s[y] = a;

      // tslint:disable-next-line:no-bitwise
      output[idx1++] = inBytes[idx2++] ^ s[(a + b) & 0xff];
    }

    this.mX = x;
    this.mY = y;
    return output;
  }
  swapByte (b1, b2) {
    const t1 = this.mState[b1];
    this.mState[b1] = this.mState[b2];
    this.mState[b2] = t1;
  }
}

module.exports = {RC4};