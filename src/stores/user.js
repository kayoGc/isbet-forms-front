import { defineStore } from "pinia";

const useUserStore = defineStore("user", {
    state: () => {
        return {
            name: "",
            email: "",
            admin: false,
            uid: ""
        }
    },

    getters: {
        // retorna se o usuário está logado
        isLoggedIn: (state) => {
            return state.uid !== "";
        }
    }
})

export default useUserStore