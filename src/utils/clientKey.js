import 'dotenv/config';

const autenticar = (req, res, next) => {
    const chave = req.headers['X-API-Key'];

    if (!chave || chave !== process.env.Lanchonete_Key) {
        return res.status(401).json({ error: 'Acesso não autorizado. X-API-Key inválida.' });
    }

    next();
}

export default autenticar;
