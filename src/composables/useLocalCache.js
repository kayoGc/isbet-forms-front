/**
 * Composable para cache local usando localStorage com TTL opcional
 * @param {string} prefix prefix das chaves no localStorage
 */
const useLocalCache = (prefix = 'app:') => {
    
    const keyOf = (k) => {
        return `${prefix}${k}`;
    }

    /**
     * vai colocar um valor no localStorage com uma chave e TTL opcional
     * @param {String} key Chave que ficara no localStorage
     * @param {*} value Valor que será colocado no localstorage
     * @param {number} ttlMs tempo de vida dos dados no localStorage, em milisegundos
     */
    const set = (key, value, ttlMs = 0) => {
        const record = {
            value,
            expires: ttlMs > 0 ? Date.now() + ttlMs : null
        };
        localStorage.setItem(keyOf(key), JSON.stringify(record));
    }

    /**
     * Vai pegar um valor no localStorage pela chave, retorna null se não existir
     * @param {String} key Chave do valor a ser pego
     */
    const get = (key) => {
        const raw = localStorage.getItem(keyOf(key));
        if (!raw) return null;

        try {
            const rec = JSON.parse(raw);
            if (rec.expires && Date.now() > rec.expires) {
                localStorage.removeItem(keyOf(key));
                return null;
            }
            return rec.value;
        } catch (e) {
            localStorage.removeItem(keyOf(key));
            return null;
        }
    }

    const wrap = async (key, ttlMs, loader) => {
        const cached = get(key);

        if (cached !== null) return cached;

        const value = await loader();
        try { set(key, value, ttlMs); } catch (e) { /* ignore storage errors */ }
        return value;
    }

    /**
     * Remove um item do localStorage pela chave    
     * @param {String} key chave do valor a ser removido
     */
    const remove = (key) => {
        localStorage.removeItem(keyOf(key));
    }

    /**
     * Remove todos os itens do localStorage que começam com o prefixo definido
     */
    function clearPrefix() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith(prefix)) localStorage.removeItem(k);
        }
    }

    return { set, get, wrap, remove, clearPrefix };
}

export default useLocalCache