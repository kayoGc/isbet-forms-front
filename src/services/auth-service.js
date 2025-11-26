/**
 * o firebase é utilizado como serviço de autenticação da aplicação
 */
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import configFirebase from "@/config/firebase";
import useAxios from "@/composables/useAxios";

// inicializa o firebase primeiro
configFirebase();

class AuthService {
    auth = getAuth();

    /**
     * Vai registrar um novo usuário. Aqui vamos fazer uma chamada para o backend,
     * lá vai ser criado o usuário no firebase e em seguida no banco de dados.
     * @param {String} email email do usuário
     * @param {String} password senha do usuário
     * @param {String} name nome do usuário
     * @returns 
     */
    async register(email, password, name) {
        try {
            // verifica dados
            if (!email) {
                throw new Error("Email é obrigatório");
            }
            if (!password) {
                throw new Error("Senha é obrigatório");
            }
            if (!name) {
                throw new Error("Nome é obrigatório");
            }

            // faz requisição
            const { data } = await useAxios("post", "auth/register", false, {
                name: name,
                password: password,
                email: email
            });

            if (data.error) {
                throw new Error(data.message);
            }

            return { success: true };
        } catch (err) {

            return { success: false, error: err };
        }
    }   
    
    // vai logar um usuário com email e senha
    async login(email, password) {
        try {
            const response = await signInWithEmailAndPassword(this.auth, email, password);
            
            // devolve os dados do usuário
            const user = {
                uid: response.user.uid,
                name: response.user.displayName,
                email: response.user.email,
                admin: false
            }
            
            return { success: true, user: user };
        } catch (err) {
            return { success: false, error: err.code };
        }
    }
    
    // vai sair da conta do usuário
    async signOut() {
        try {
            await signOut(this.auth);
            
            // saiu sem problemas
            return { success: true };
        } catch (err) {
            // deu erro ao sair
            return { success: false, error: err.message };
        }
    }
    
    // vai pegar o token JWT que usamos em requisiões
    async getToken() {
        try {
            // pega o usuário atual
            const user = this.auth.currentUser;
            
            if (!user) {
                throw new Error("Usuário não está logado");
            }
            
            const idToken = await user.getIdToken();

            return idToken;
        } catch (err) {
            console.error(`Erro ao pegar token do usuário: ${err.message}`);
        }
    }

    // retorna dados do usuário se já estiver logado, null se não estiver
    // usado especialmente na tela de login
    getUserInfo() {
        return new Promise((resolve) => {
            // espera o estado auth mudar, após inicialização ele ainda pode estar nulo mesmo com usuário logado
            const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                // para de receber atualizações
                unsubscribe();
    
                if (user) {
                    resolve({
                        uid: user.uid,
                        name: user.displayName,
                        email: user.email,
                        admin: false,
                    });
                    return;
                }
    
                resolve(null);
            });
        });
    }


}

const authService = new AuthService();
export default authService;