import { Terminal } from "./terminal.model";

/**
 * @class Commerce
 * @description
 * Representa un comercio con su identificador, datos de contacto,
 * información fiscal y terminal asociado.
 */
export class Commerce {

    public static readonly RESELLER_DID: string = 'DID';
    public static readonly RESELLER_ABANCA: string = 'Abanca';
    public static readonly RESELLER_BBVA: string = 'BBVA';
    public static readonly RESELLER_IBERCAJA: string = 'Ibercaja';
    public static readonly RESELLER_COMERCIA: string = 'Comercia';
    public static readonly RESELLER_GETNET: string = 'Getnet';
    public static readonly RESELLER_CAJAMAR: string = 'Cajamar';
    public static readonly RESELLER_CAJARURAL: string = 'Cajarural';
    public static readonly RESELLER_KUTXABANK: string = 'Kutxabank';
    public static readonly RESELLER_LABORALKUTXA: string = 'Laboralkutxa';
    public static readonly RESELLER_OPENPAY: string = 'Openpay';
    public static readonly RESELLER_SABADELL: string = 'Sabadell';

    commerceId: number;
    commerceNumber: string;
    name: string;
    lastName: string;
    tradeName: string;
    nif: string;
    address: string;
    postalCode: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    resellerId: number;
    resellerName: string;
    typology: string;
    createdAt: string;
    updatedAt: string;
    subscribedAt: string;
    unSubscribedAt: string;
    terminals_Total: string;
    terminals_Active: string;
    terminals: Terminal[];
    activated: boolean;
    deactivated: boolean;
}
