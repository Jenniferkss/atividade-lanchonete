import ClienteModel from '../models/clienteModel.js';
import { getClimaByCidade } from '../utils/weatherService.js';

// Exportando funções individuais para facilitar a importação nas rotas
export const criarCliente = async (req, res) => {
  try {
    const { nome, cpf, cep } = req.body;

    if (!nome || nome.length < 3) throw new Error("O campo 'nome' é obrigatório (mín 3 caracteres).");
    
    const cleanCpf = String(cpf || '').replace(/\D/g, '');
    if (cleanCpf.length !== 11) throw new Error("CPF deve conter 11 dígitos.");

    let endereco = {};
    if (cep) {
      const cleanCep = String(cep).replace(/\D/g, '');
      const viacep = await ClienteModel.buscarEnderecoPorCep(cleanCep);
      if (viacep.error) return res.status(400).json({ erro: viacep.error });
      endereco = { logradouro: viacep.logradouro, bairro: viacep.bairro, localidade: viacep.localidade, uf: viacep.uf };
    }

    const cliente = await ClienteModel.criar({ ...req.body, ...endereco, cpf: cleanCpf });
    res.status(201).json(cliente);
  } catch (error) {
    const msg = error.message.includes('unique constraint') ? "CPF ou Email já cadastrado." : error.message;
    res.status(400).json({ erro: msg });
  }
};

export const listarClientes = async (req, res) => {
  try {
    const clientes = await ClienteModel.listar(req.query);
    res.json(clientes.length ? clientes : { mensagem: "Nenhum cliente encontrado." });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

export const buscarPorId = async (req, res) => {
  try {
    const cliente = await ClienteModel.buscarPorId(req.params.id);
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado." });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ erro: "ID inválido." });
  }
};

export const atualizarCliente = async (req, res) => {
  try {
    const cliente = await ClienteModel.atualizar(req.params.id, req.body);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

export const deletarCliente = async (req, res) => {
  try {
    await ClienteModel.deletar(req.params.id);
    res.json({ mensagem: "Cliente removido com sucesso." });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

export const getClimaCliente = async (req, res) => {
  try {
    const cliente = await ClienteModel.buscarPorId(req.params.id);
    if (!cliente || !cliente.localidade) return res.json({ clima: null });
    const clima = await getClimaByCidade(cliente.localidade);
    res.json({ clima });
  } catch (error) {
    res.json({ clima: null });
  }
};