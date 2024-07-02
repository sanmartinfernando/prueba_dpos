export class Page {
    id: string;
    text: string;
    code: string;
    icon: string;
    //constructor();
    constructor(id?:string,text?:string,code?:string,icon?:string) {
        this.id = id || '';
        this.text = text || '';
        this.code = code || '';
        this.icon = icon || '';
    }
  }