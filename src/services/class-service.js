import useAxios from "@/composables/useAxios";

class ClassService {

    constructor() {
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
}

const classService = new ClassService;
export default classService;