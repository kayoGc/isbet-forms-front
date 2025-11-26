import axios from "axios"
import useUserStore from "@/stores/user";
import authService from "@/services/auth-service";

const backUrl = import.meta.env.VITE_BACK_ORIGIN;

// vai fazer chamadas http para o site
const useAxios = async (method, url, auth = false, data = null) => {
    try {
        console.log("== DEBUG REQUEST ==");

        console.log("method", method);
        console.log("url", `${backUrl}/${url}`);
        console.log("auth", auth);

        let config = {
            method: method,
            url: `${backUrl}/${url}`,
            data: data,
        }

        console.log(config);
        
        // Analisa se precisa de autenticação
        if (auth) {
            // // analisa se usuário está logado
            // if (!user.isLoggedIn) {
            //     throw new Error("Usuário não está logado");
            // }
            
            console.log("pegando token...");

            const token = await authService.getToken();

            console.log("token pego com sucesso");

            config.headers = {
                "Authorization": `Bearer ${token}`
            }
        }

        const response = await axios(config);

        console.log("== DEBUG RESPONSE ==");
        console.log("status", response.status);

        if (typeof response.data === 'string') {
            response.data = {};
        }

        // sinaliza que não houve erro
        response.data['error'] = false;
        // bota o codigo status na resposta
        response.data['statusCode'] = response.status;
        
        return response;
    } catch (err) {
        console.log("Sucesso:", false);

        // se é um erro do axios
        if (axios.isAxiosError(err)) {
            console.log("Erro aconteceu no axios");

            return { data: { error: true, message: err.response.data.message } }
        }

        console.log("Erro aconteceu fora do axios");
        console.error(err);
        return { data: { error: true, message: `Erro no codigo: ${err.message}`}}
    }
}

export default useAxios;