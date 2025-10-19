import useAxios from "@/composables/useAxios";

class UserService {

    /**
     * Vai pegar os usuários do banco de dados
     * @param {Number} numOfDocs Quantos usuários vão ser pegos de uma vez
     * @param {Number} page Em qua página vai pegar os dados
     * @param {String} classId ObjectId da turma que os usuários participam, null vai pegar todos os usuários sem uma turma
     */
    async get(numOfDocs = 10, page = 1, classId = null) {
        try {
            const url = `users?numOfDocs=${numOfDocs}&page=${page}&classId=${classId}`;

            const { data } = await useAxios('get', url, true);

            if (data.error) {
                throw new Error(data.message);
            }

            return { success: true, data: data};
        } catch (err) {
            return { success: false, error: `UserService: ${err.message}`};
        }
    }
}

const userService = new UserService;
export default userService;