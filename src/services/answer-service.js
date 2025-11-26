import { RequestHandler } from "./request-service";

class AnswersService extends RequestHandler {

    constructor() {
        super('answers');
    }

    
    async get(params = []) {
        try {
            let paramsObj = {};

            for (const param of params) {
                paramsObj[param.key] = param.value;
            }

            const { success, status, data, error } = await this.getObj(paramsObj);

            if (!success) {
                throw new Error(`AnswersService -> get(): ${error}`);
            }

            return { success: true, status: status, data: data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    
    /**
     * Vai mandar dados para o banco de dados
     * @param {Object} data dados que serão mandados para o banco
     */
    async post(data) {
        try {
            console.log("Mandando resposta...");

            const { success, status, error } = await this.postObj(data);

            if (!success) {
                throw new Error(error);
            }

            console.log(":) -> resposta mandada com sucesso!");
            console.log(`status code: ${status}`);

            return { success };
        } catch (err) {
            return { success: false, error: `AnswersService: ${err.message}` };
        }
    }
}

const answersService = new AnswersService();
export default answersService;