import { Terminal } from "./terminal.model";


export class Commerce {
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
    resellerName: number;
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
