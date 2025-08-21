/**
 * @class User
 * @description
 * Representa un usuario del sistema con sus credenciales y datos personales.
 */
export class User {
  
  public id: number;
  public idToken: string
  public email: string;
  public user: string;
  public first_name: string;
  public last_name: string;
  public admin: boolean;
  public pwd: string;
}