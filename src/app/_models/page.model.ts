/**
 * Representa una página con un identificador, texto, código e icono.
 */
export class Page {

    id: string;
    text: string;
    code: string;
    icon: string;

    /**
     * Crea una nueva instancia de Page.
     * @param id Identificador de la página.
     * @param text Texto descriptivo de la página.
     * @param code Código asociado a la página.
     * @param icon Icono representativo de la página.
     */
    constructor(id?: string, text?: string, code?: string, icon?: string) {
        this.id = id || '';
        this.text = text || '';
        this.code = code || '';
        this.icon = icon || '';
    }
}
