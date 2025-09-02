import axios from "axios"

const backUrl = "http://localhost:3000";

// vai fazer chamadas http para o site
const useAxios = async (method, url, data = null) => {
    try {
        const response = await axios({
            method: method,
            url: `${backUrl}/${url}`,
            data: data,
            credentials: 'include'
        });

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