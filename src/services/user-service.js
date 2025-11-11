import useAxios from "@/composables/useAxios";

class UserService {

    constructor() {
        this.collectionName = "users";
    }

    /**
     * Vai pegar os usuários do banco de dados
     * @param {Number} numOfDocs Quantos usuários vão ser pegos de uma vez
     * @param {Number} page Em qua página vai pegar os dados
     * @param {String} classId ObjectId da turma que os usuários participam, null vai pegar todos os usuários sem uma turma
     */
    async get(numOfDocs = 10, page = 1, classId = null) {
        try {
            let url = `${this.collectionName}?numOfDocs=${numOfDocs}&page=${page}&classId=${classId}`;

            // analisa se já ta no cache
            const localData = localStorage.getItem(url);

            if (localData) {
                return { success: true, data: await JSON.parse(localData) };
            }

            const { data } = await useAxios('get', url, true);

            if (data.error) {
                throw new Error(data.message);
            }

            localStorage.setItem(url, JSON.stringify(data));

            return { success: true, data: data };
        } catch (err) {
            return { success: false, error: `UserService: ${err.message}` };
        }
    }

    /**
     * Atualiza objetos da coleção, também pode ser apenas um objeto
     * @param {Object} objs Objeto que contém os dados das atualizações
     */
    async put(objs) {
        try {
            const url = `${this.collectionName}`;

            const { data } = await useAxios('put', url, true, objs);

            if (data.error) {
                throw new Error(data.message);
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: `UserService: ${err.message}` };
        }
    }
}

const userService = new UserService;
export default userService;