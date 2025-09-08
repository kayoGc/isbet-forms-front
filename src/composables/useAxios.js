import axios from "axios"

const backUrl = import.meta.env.VITE_BACK_ORIGIN;

// vai fazer chamadas http para o site
const useAxios = async (method, url, auth = false, data = null) => {
    try {
        let config = {
            method: method,
            url: `${backUrl}/${url}`,
            data: data,
        }
        
        // só bota headers necessários em autenticação apenas quando necessário
        if (auth) {
            config.credentials = "include";
            config.withCredentials = true;    
        }

        const response = await axios(config);

        // sinaliza que não houve erro
        response.data.error = false;
        // bota o codigo status na resposta
        response.data.statusCode = response.status;
        
        return response;
    } catch (err) {
        return { data: { error: true, message: `${err.status} - ${err.response.data.message}` } };
    }
}

export default useAxios;