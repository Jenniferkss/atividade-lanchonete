import ProdutoModel from '../models/ProdutoModel.js';

const CATEGORIAS_VALIDAS = ['LANCHE', 'BEBIDA', 'SOBREMESA', 'COMBO'];

export const criar = async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, disponivel } = req.body;

        if (!nome || nome.trim().length < 3) {
            return res
                .status(400)
                .json({ erro: "O campo 'nome' é obrigatório (mínimo 3 caracteres)." });
        }

        if (descricao && descricao.length > 255) {
            return res.status(400).json({ erro: 'A descrição deve ter no máximo 255 caracteres.' });
        }

        if (preco === undefined || preco === null) {
            return res.status(400).json({ erro: "O campo 'preco' é obrigatório." });
        }

        if (Number(preco) <= 0) {
            return res.status(400).json({ erro: 'O preço deve ser maior que 0.' });
        }

        const precoStr = String(preco);
        if (precoStr.includes('.') && precoStr.split('.')[1].length > 2) {
            return res.status(400).json({ erro: 'O preço deve ter no máximo 2 casas decimais.' });
        }

        if (!categoria) {
            return res.status(400).json({ erro: "O campo 'categoria' é obrigatório." });
        }

        if (!CATEGORIAS_VALIDAS.includes(categoria.toUpperCase())) {
            return res
                .status(400)
                .json({ erro: `Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(', ')}` });
        }

        const produto = new ProdutoModel({
            nome: nome.trim(),
            descricao: descricao || null,
            categoria: categoria.toUpperCase(),
            preco: parseFloat(preco),
            disponivel: disponivel !== undefined ? disponivel : true,
        });

        const data = await produto.criar();
        res.status(201).json({ mensagem: 'Produto criado com sucesso!', data });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ erro: 'Erro interno ao salvar o produto.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const produtos = await ProdutoModel.buscarTodos(req.query);

        if (!produtos || produtos.length === 0) {
            return res.status(200).json({ mensagem: 'Nenhum produto encontrado.' });
        }

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ erro: 'Erro ao buscar produtos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        res.json({ data: produto });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ erro: 'Erro ao buscar produto.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        if (req.body.nome !== undefined) {
            if (req.body.nome.trim().length < 3) {
                return res
                    .status(400)
                    .json({ erro: "O campo 'nome' é obrigatório (mínimo 3 caracteres)." });
            }
            produto.nome = req.body.nome.trim();
        }

        if (req.body.descricao !== undefined) {
            if (req.body.descricao && req.body.descricao.length > 255) {
                return res
                    .status(400)
                    .json({ erro: 'A descrição deve ter no máximo 255 caracteres.' });
            }
            produto.descricao = req.body.descricao;
        }

        if (req.body.categoria !== undefined) {
            const categoriaUpper = req.body.categoria.toUpperCase();
            if (!CATEGORIAS_VALIDAS.includes(categoriaUpper)) {
                return res
                    .status(400)
                    .json({ erro: `Categoria inválida. Use: ${CATEGORIAS_VALIDAS.join(', ')}` });
            }
            produto.categoria = categoriaUpper;
        }

        if (req.body.preco !== undefined) {
            if (Number(req.body.preco) <= 0) {
                return res.status(400).json({ erro: 'O preço deve ser maior que 0.' });
            }
            const precoStr = String(req.body.preco);
            if (precoStr.includes('.') && precoStr.split('.')[1].length > 2) {
                return res
                    .status(400)
                    .json({ erro: 'O preço deve ter no máximo 2 casas decimais.' });
            }
            produto.preco = parseFloat(req.body.preco);
        }

        if (req.body.disponivel !== undefined) {
            produto.disponivel = req.body.disponivel;
        }

        const data = await produto.atualizar();

        res.json({ mensagem: `O produto "${data.nome}" foi atualizado com sucesso!`, data });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ erro: 'Erro ao atualizar produto.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const produto = await ProdutoModel.buscarPorId(parseInt(id));

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        await produto.deletar();

        res.json({
            mensagem: `O produto "${produto.nome}" foi deletado com sucesso!`,
            deletado: produto,
        });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ erro: error.message });
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ erro: 'Erro ao deletar produto.' });
    }
};
