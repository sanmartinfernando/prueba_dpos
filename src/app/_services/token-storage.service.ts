import { Injectable } from '@angular/core';
import { StringConstants } from '../_rest/string-constants';

/**
 * @class TokenStorageService
 * @description
 * Servicio encargado de la gestión de tokens de autenticación.
 * Proporciona métodos para almacenar, recuperar y eliminar tokens 
 * en `localStorage`, así como un token en memoria para PortalUsers.
 * Tokens manejados:
 * - `TOKEN_KEY`: Token principal del usuario.
 * - `TOKEN_KEY2`: Token secundario (ej. autorización de cliente).
 * - `portalUsersToken`: Token de PortalUsers (en memoria).
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  
  private portalUsersToken: string;

  /**
   * Obtiene el token principal del usuario desde `localStorage`.
   * 
   * @returns Token principal o cadena vacía si no existe
   */
  getToken(): string {
    return window.localStorage.getItem(StringConstants.TOKEN_KEY) ?? '';
  }

  /**
   * Obtiene el token secundario (`token2`) desde `localStorage`.
   * 
   * @returns Token secundario o cadena vacía si no existe
   */
  getToken2(): string {
    return window.localStorage.getItem(StringConstants.TOKEN_KEY2) ?? '';
  }

  /**
   * Obtiene el token secundario (`token2`) desde `localStorage`.
   * 
   * @returns Token secundario o cadena vacía si no existe
   */
  getPortalUsersToken(): string {
    return this.portalUsersToken;
  }

  /**
   * Establece el token de PortalUsers en memoria.
   * 
   * @param token Token de PortalUsers
   */
  setPortalUsersToken(token: string): void {
    this.portalUsersToken = token;
  }

  /**
   * Guarda el token principal en `localStorage`.
   * 
   * @param token Token principal
   */
  saveToken(token: string): void {
    window.localStorage.setItem(StringConstants.TOKEN_KEY, token);
  }

  /**
   * Elimina el token principal de `localStorage`.
   */
  clearToken(): void {
    window.localStorage.removeItem(StringConstants.TOKEN_KEY);
  }
}
