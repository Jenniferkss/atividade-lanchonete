import prisma from '../utils/prismaClient.js';

export default class PedidoModel {
    constructor({
        id = null,
        clienteId = null,
        total = 0,
        status = 'ABERTO',
        criadoEm = null,
        itens = [],
    } = {}) {
        this.id = id;
        this.clienteId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
        this.itens = itens;
    }


    static async buscarCliente(clienteId) {
        return prisma.cliente.findUnique({ where: { id: clienteId } });
    }

    static async buscarProduto(produtoId) {
        return prisma.produto.findUnique({ where: { id: produtoId } });
    }

    static async buscarItem(itemId) {
        return prisma.itemPedido.findUnique({ where: { id: itemId } });
    }


    static async criar(clienteId) {
        return prisma.pedido.create({
            data: {
                clienteId,
                status: 'ABERTO',
                total: 0,
            },
            include: { itens: true, cliente: true },
        });
    }

    static async buscarTodos() {
        return prisma.pedido.findMany({
            include: { itens: true, cliente: true },
            orderBy: { criadoEm: 'desc' },
        });
    }

    static async buscarPorId(id) {
        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { itens: true, cliente: true },
        });
        if (!pedido) return null;
        return pedido;
    }

    static async cancelar(id) {
        return prisma.pedido.update({
            where: { id },
            data: { status: 'CANCELADO' },
            include: { itens: true },
        });
    }


    static async adicionarItem({ pedidoId, produtoId, quantidade, precoUnitario }) {
        return prisma.$transaction(async (tx) => {
            const novoItem = await tx.itemPedido.create({
                data: {
                    pedidoId,
                    produtoId,
                    quantidade,
                    precoUnitario,
                },
            });

            const acrescimo = quantidade * Number(precoUnitario);

            await tx.pedido.update({
                where: { id: pedidoId },
                data: {
                    total: { increment: acrescimo },
                },
            });

            return novoItem;
        });
    }

    static async removerItem(pedidoId, itemId) {
        return prisma.$transaction(async (tx) => {
            const item = await tx.itemPedido.findUnique({ where: { id: itemId } });

            if (!item) {
                throw { status: 404, message: 'Item não encontrado.' };
            }

            await tx.itemPedido.delete({ where: { id: itemId } });

            const decrescimo = item.quantidade * Number(item.precoUnitario);

            await tx.pedido.update({
                where: { id: pedidoId },
                data: {
                    total: { decrement: decrescimo },
                },
            });
        });
    }
}
