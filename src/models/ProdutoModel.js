import prisma from '../utils/prismaClient.js';

export default class ProdutoModel {
    constructor({
        id = null,
        nome = null,
        descricao = null,
        categoria = null,
        preco = null,
        disponivel = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.disponivel = disponivel;
    }

    validarPreco() {
        if (this.preco === null || this.preco === undefined || Number(this.preco) <= 0) {
            throw { status: 400, message: 'O preço deve ser maior que 0.' };
        }
    }

    static async verificarVinculoPedidoAberto(produtoId) {
        if (!prisma.pedido) return;

        const pedidoComProduto = await prisma.pedido.findFirst({
            where: {
                status: 'ABERTO',
                itens: {
                    some: { produtoId },
                },
            },
        });

        if (pedidoComProduto) {
            throw {
                status: 409,
                message: 'Não é possível deletar um produto vinculado a um pedido ABERTO.',
            };
        }
    }

    async criar() {
        this.validarPreco();

        return prisma.produto.create({
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });
    }

    async atualizar() {
        this.validarPreco();

        return prisma.produto.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                descricao: this.descricao,
                categoria: this.categoria,
                preco: this.preco,
                disponivel: this.disponivel,
            },
        });
    }

    async deletar() {
        await ProdutoModel.verificarVinculoPedidoAberto(this.id);

        return prisma.produto.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) {
            where.nome = { contains: filtros.nome, mode: 'insensitive' };
        }

        if (filtros.categoria) {
            where.categoria = filtros.categoria.toUpperCase();
        }

        if (filtros.disponivel !== undefined) {
            where.disponivel = filtros.disponivel === 'true';
        }

        if (filtros.precoMin || filtros.precoMax) {
            where.preco = {};
            if (filtros.precoMin) where.preco.gte = parseFloat(filtros.precoMin);
            if (filtros.precoMax) where.preco.lte = parseFloat(filtros.precoMax);
        }

        return prisma.produto.findMany({ where, orderBy: { nome: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.produto.findUnique({ where: { id } });
        if (!data) return null;
        return new ProdutoModel(data);
    }
}
