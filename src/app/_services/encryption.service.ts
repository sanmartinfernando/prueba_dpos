import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  
  private key: string="encrypt!135790";

  constructor() { }

  public encryptData(data: string,): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  public decrypt(passwordToDecrypt: string) {
    return CryptoJS.AES.decrypt(passwordToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }

  public encode(stringToEncode: string): string {
    return stringToEncode
      .toString()
      .replace(/\//g, 'm5hjSjfgu')
      .replace(/\+/g, 'oVn69Juio0')
      .replace(/=/g, 'l9hvDin2');
  }

  public decode(stringToEncode: string): string {
    return stringToEncode
      .toString()
      .replace(/m5hjSjfgu/g, '/')
      .replace(/oVn69Juio0/g, '+')
      .replace(/l9hvDin2/g, '=');
  }
}
