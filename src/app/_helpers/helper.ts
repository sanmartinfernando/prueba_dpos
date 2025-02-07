import * as moment from "moment";

export default class Helper {

    static handleErrors(response) {
        if (!(response.status == 200 || response.status == 409)) {
            throw Error(response.statusText);
        }
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
