import prisma from '../utils/prismaClient.js';

export default class itemModel {
    constructor({ id = null, pedidoId = null, preco = null, produtoId = null, quantidade = null } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.preco = preco;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
    }

    async criar() {
        return prisma.item.create({
            data: {
                pedidoId: this.pedidoId,
                preco: this.preco,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
            },
        });
    }

    async atualizar() {
        return prisma.item.update({
            where: { id: this.id },
            data: { pedidoId: this.pedidoId, preco: this.preco, produtoId: this.produtoId, quantidade: this.quantidade },
        });
    }

    async deletar() {
        return prisma.item.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.status !== undefined) where.status = filtros.status === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.item.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.item.findUnique({ where: { id } });
        if (!data) return null;
        return new itemModel(data);
    }
}
