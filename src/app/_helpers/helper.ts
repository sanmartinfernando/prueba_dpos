import * as moment from "moment";

export default class Helper {

    /**
     * Check the Http response. If not a status that need further logic (Ok / 409)
     * logs the response and Throws an error.
     * Actualmente solo funciona para los fetch.
     * @param response 
     * @returns Response or Error
     */
    static handleErrors(response) {
        console.log('handleErrors');
        console.log(response);
        console.log(response.status);
        if (!(response.status == 200 || response.status == 409)) {
            console.log('!(response.status==200 || response.status==409)');
            console.log(response);
            throw Error(response.statusText);
        }
        console.log('handleErrors');
        return response;
    }

    static getDate(date: string): { dateFormatted: string, timeFormatted: string } {
        const dateToday = moment(Date.now()).format("yyyy-MM-DD");
        let dateFormatted = moment(date).format("yyyy-MM-DD");
        let timeFormatted = moment(date).format("HH:mm");
        if (dateFormatted == dateToday) {
            dateFormatted = "Hoy"
        }
        return { dateFormatted, timeFormatted };
    }

    static toQueryString(obj: any) {
        let queryStringParams = [];
        for (let prop in obj){
            if (obj.hasOwnProperty(prop) && obj[prop] != undefined && obj[prop] != null) {
                queryStringParams.push(encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]));
            }
        }
        return queryStringParams.join("&");
    }
}
