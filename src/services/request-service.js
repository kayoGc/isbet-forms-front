import axios from "axios";
import authService from "./auth-service";

export class RequestHandler {

    /**
     * @param {String} colName nome da coleção que vai ser manipulada
     */
    constructor(colName) {
        this.url = `${import.meta.env.VITE_BACK_ORIGIN}/${colName}`;
    }

    async getObjById(id) {
        try { 
            // coloca os parâmetros na url
            let customUrl = this.url + '/' + id;

            let axiosConfig = {
                method: 'GET',
                url: customUrl,
                headers: {
                    "Authorization": `Bearer ${await authService.getToken()}`
                }
            };

            const response = await axios(axiosConfig);

            let result = response.data.result;
            
            if (Array.isArray(result) && result.length > 0) {
                result = result[0];
            }
            
            
            return { success: true, status: response.status, data: result };
        } catch (err) {
            return { success: false, error: `RequestHandler -> ${err}` };
        }
    }

    async getObj(params = {}) {
        try { 
            // coloca os parâmetros na url
            let andFlag = false;
            let customUrl = this.url + '?';

            for (const [key, value] of Object.entries(params)) {
                
                if (andFlag) {
                    customUrl += `&${key}=${value}`;
                    continue;
                }

                customUrl += `${key}=${value}`;
                andFlag = true;
            }

            let axiosConfig = {
                method: 'GET',
                url: customUrl,
                headers: {
                    "Authorization": `Bearer ${await authService.getToken()}`
                }
            };

            const response = await axios(axiosConfig);
            
            return { success: true, status: response.status, data: response.data.result };
        } catch (err) {
            return { success: false, error: `RequestHandler -> ${err}` };
        }
    }

    async postObj(data) {
        try {  
            let axiosConfig = {
                method: 'POST',
                url: this.url,
                data: data,
                headers: {
                    "Authorization": `Bearer ${await authService.getToken()}`
                }
            };

            const response = await axios(axiosConfig);

            return { success: true, status: response.status};
        } catch (err) {
            return { success: false, error: `RequestHandler -> ${err}` };
        }
    }

}