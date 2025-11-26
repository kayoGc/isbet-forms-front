import { RequestHandler } from "./request-service";

class ExamService extends RequestHandler {

    constructor() {
        super('exams');
    }

    async getById(id) {
        try {
            const { success, status, data, error } = await this.getObjById(id);

            if (!success) {
                throw new Error(`ActiveService -> get(): ${error}`);
            }

            return { success: true, status: status, data: data };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    
    async get(params = []) {
        try {
            let paramsObj = {};

            for (const param of params) {
                paramsObj[param.key] = param.value;
            }

            const { success, status, data, error } = await this.getObj(paramsObj);

            if (!success) {
                throw new Error(`ActiveService -> get(): ${error}`);
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
            console.log("Liberando prova...");

            const { success, status, error } = await this.postObj(data);

            if (!success) {
                throw new Error(error);
            }

            console.log("SUCESSO -> prova liberada com sucesso!");
            console.log(`status code: ${status}`);

            return { success };
        } catch (err) {
            return { success: false, error: `ActiveService: ${err.message}` };
        }
    }
}

const examService = new ExamService();
export default examService;