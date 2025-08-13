import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Servicio para encriptar, desencriptar y codificar/decodificar cadenas de texto
 * utilizando AES y transformaciones personalizadas.
 */
@Injectable({ providedIn: 'root' })
export class EncryptionService {

  private readonly key = 'encrypt!135790';

  /**
   * Encripta una cadena de texto utilizando AES.
   * @param data Cadena a encriptar.
   * @returns Cadena encriptada en formato base64.
   */
  public encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  /**
   * Desencripta una cadena previamente encriptada con AES.
   * @param passwordToDecrypt Cadena encriptada a desencriptar.
   * @returns Cadena original en texto plano.
   */
  public decrypt(passwordToDecrypt: string): string {
    return CryptoJS.AES.decrypt(passwordToDecrypt, this.key).toString(CryptoJS.enc.Utf8);
  }

  /**
   * Codifica una cadena reemplazando caracteres especiales por secuencias personalizadas.
   * @param stringToEncode Cadena a codificar.
   * @returns Cadena codificada.
   */
  public encode(stringToEncode: string): string {
    return stringToEncode
      .toString()
      .replace(/\//g, 'm5hjSjfgu')
      .replace(/\+/g, 'oVn69Juio0')
      .replace(/=/g, 'l9hvDin2');
  }

  /**
   * Decodifica una cadena previamente codificada con el método encode().
   * @param stringToEncode Cadena codificada a decodificar.
   * @returns Cadena original.
   */
  public decode(stringToEncode: string): string {
    return stringToEncode
      .toString()
      .replace(/m5hjSjfgu/g, '/')
      .replace(/oVn69Juio0/g, '+')
      .replace(/l9hvDin2/g, '=');
  }
}
