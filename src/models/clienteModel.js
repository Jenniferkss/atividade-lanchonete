// ✅ USE ISSO:
import prisma from '../utils/prismaClient.js'; 
import axios from 'axios';

export default class ClienteModel {
  // Chamada externa ao ViaCEP
  static async buscarEnderecoPorCep(cep) {
    const cleanCep = String(cep).replace(/\D/g, '');
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (res.data.erro) return { error: `CEP ${cleanCep} não encontrado.` };
      return res.data;
    } catch (e) {
      throw new Error("Serviço ViaCEP indisponível no momento.");
    }
  }

  static async criar(dados) {
    return await prisma.cliente.create({ data: dados });
  }

  static async atualizar(id, dados) {
    return await prisma.cliente.update({
      where: { id: Number(id) },
      data: dados
    });
  }

  static async listar(filtros) {
    const { nome, cpf, ativo } = filtros;
    return await prisma.cliente.findMany({
      where: {
        nome: nome ? { contains: nome, mode: 'insensitive' } : undefined,
        cpf: cpf || undefined,
        ativo: ativo !== undefined ? ativo === 'true' : undefined
      },
      orderBy: { nome: 'asc' }
    });
  }

  static async buscarPorId(id) {
    return await prisma.cliente.findUnique({ where: { id: Number(id) } });
  }

  static async deletar(id) {
    // REGRA: Não deleta se houver pedido ABERTO
    const pedidosAbertos = await prisma.pedido.count({
      where: { clienteId: Number(id), status: 'ABERTO' }
    });

    if (pedidosAbertos > 0) {
      throw new Error("Não pode deletar cliente com pedido em status ABERTO");
    }

    return await prisma.cliente.delete({ where: { id: Number(id) } });
  }
}