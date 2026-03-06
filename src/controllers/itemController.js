import itemModel from '../models/itemModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const quantidade = parseInt(req.body.quantidade);
        if (isNaN(quantidade) || quantidade <= 0) {
            return res.status(400).json({ error: 'Quantidade deve ser um número maior que 0.' });
        }
    } catch (error) {
        console.error('Erro ao validar quantidade:', error);
        return res.status(400).json({ error: 'Quantidade inválida. Certifique-se de enviar um número válido.' });
    }
    res.status(201).json({ message: 'produto criado com sucesso!', data });
};


    const precoUnitario = parseFloat(req.body.preco);
    if (isNaN(precoUnitario) || precoUnitario < 0) {
        return res.status(400).json({ error: 'O item deve conter preço.' });
    }


export const buscarTodos = async (req, res) => {
    try {
        const registros = await itemModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum produto encontrado.' });
        }

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {item
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const item = await itemModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({ error: 'produto não encontrado.' });
        }

        res.json({ data: item });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const item = await itemModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({ error: 'produto não encontrado para atualizar.' });
        }

        if (req.body.nome !== undefined) item.nome = req.body.nome;
        if (req.body.estatus !== undefined) item.estatus = req.body.estatus;
        if (req.body.preco !== undefined) item.preco = parseFloat(req.body.preco);

        const data = await item.atualizar();

        res.json({ message: `O produto "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const item = await itemModel.buscarPorId(parseInt(id));

        if (!item) {
            return res.status(404).json({ error: 'produto não encontrado para deletar.' });
        }

        await item.deletar();

        res.json({ message: `O produto "${item.nome}" foi deletado com sucesso!`, deletado: item });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar produto.' });
    }
};
