import { createContext, useState } from 'react';

export const GithubContext = createContext();

export const GithubProvider = ({ children }) => {
    const [perfil, setPerfil] = useState(null);
    const [repositorios, setRepositorios] = useState([]);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    return (
        <GithubContext.Provider
            value={{
                perfil, setPerfil,
                repositorios, setRepositorios,
                erro, setErro,
                carregando, setCarregando
            }}
        >
            {children}
        </GithubContext.Provider>
    );
};