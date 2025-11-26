import useAxios from "@/composables/useAxios";
import { RequestHandler } from "./request-service";

class ClassService extends RequestHandler {

    constructor() {
        super('classes');
        this.collectionName = 'classes';
    }

    /**
     * Vai pegar os usuários do banco de dados, também controla o cache dos dados
     * @param {Number} numOfDocs Quantos usuários vão ser pegos de uma vez, 0 é sem limite
     * @param {Number} page Em qua página vai pegar os dados
     * @param {String} name nome que as turmas retornadas tem que ter
     */
    async get(numOfDocs = 10, page = 1, name = null) {
        try {
            let url = `${this.collectionName}?numOfDocs=${numOfDocs}&page=${page}`;

            if (name) {
                url += `&name=${name}`;
            }

            // analisa se já ta no cache
            const localData = localStorage.getItem(url);
            
            if (localData) {
                return { success: true, data: await JSON.parse(localData) };
            }

            const { data } = await useAxios('get', url, true);

            if (data.error) {
                throw new Error(data.message);
            }

            // coloca no cache
            localStorage.setItem(url, JSON.stringify(data));

            return { success: true, data: data };
        } catch (err) {
            return { success: false, error: `UserService: ${err.message}`};
        }
    }

    /**
     * Vai mandar dados para o banco de dados
     * @param {Object} data dados que serão mandados para o banco
     */
    async post(data) {
        try {
            console.log("Enviando nova turma...");

            const { success, status, error } = await this.postObj(data);

            if (!success) {
                throw new Error(error);
            }

            console.log("SUCESSO -> Turma enviado com sucesso!");
            console.log(`status code: ${status}`);

            return { success };
        } catch (err) {
            return { success: false, error: `ClassService: ${err.message}` };
        }
    }
}

const classService = new ClassService;
export default classService;