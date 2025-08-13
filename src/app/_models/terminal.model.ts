/**
 * Representa un terminal de punto de venta asociado a un comercio.
 * Contiene información como su identificador, estado, aplicación y fechas relevantes.
 */
export class Terminal {

    terminalId: number;
    commerceId: number;
    terminalUid: string;
    terminalNumber: string;
    appId: string;
    application: string;
    typology: string;
    createdAt: string;
    updatedAt: string;
    subscribedAt: string;
    unSubscribedAt: string;
    activated: boolean;
    deactivated: boolean;
}
