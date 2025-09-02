import { defineStore } from "pinia";

const useUserStore = defineStore("user", {
    state: () => {
        return {
            _id: "",
            name: "",
            email: "",
            admin: false
        }
    }
})

export default useUserStore