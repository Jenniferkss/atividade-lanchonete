import ClienteModel from '../models/clienteModel.js';
import { getClimaByCidade } from '../utils/weatherService.js';

// Funções auxiliares de validação
function validarNome(nome) {
    if (!nome || nome.trim().length < 3) {
        throw { status: 400, message: "O campo 'nome' é obrigatório." };
    }
    if (nome.trim().length > 100) {
        throw { status: 400, message: "O campo 'nome' deve ter no máximo 100 caracteres." };
    }
}

function validarCpf(cpf) {
    const cleanCpf = String(cpf).replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
        throw { status: 400, message: 'CPF deve conter exatamente 11 dígitos numéricos.' };
    }
    return cleanCpf;
}

function validarTelefone(telefone) {
    const cleanTel = String(telefone).replace(/\D/g, '');
    if (cleanTel.length !== 10 && cleanTel.length !== 11) {
        throw { status: 400, message: 'Telefone deve conter 10 ou 11 dígitos numéricos.' };
    }
    return cleanTel;
}

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw { status: 400, message: 'Email informado é inválido.' };
    }
}

function validarCep(cep) {
    const cleanCep = String(cep).replace(/\D/g, '');
    if (cleanCep.length !== 9) {
        throw { status: 400, message: 'CEP deve conter exatamente 9 dígitos numéricos.' };
    }
    return cleanCep;
}

function tratarErroUnicidade(error) {
    if (error.message && error.message.includes('unique constraint')) {
        if (error.message.includes('cpf')) {
            return 'CPF já cadastrado no sistema.';
        }
        if (error.message.includes('email')) {
            return 'Email já cadastrado no sistema.';
        }
        return 'CPF ou Email já cadastrado no sistema.';
    }
    if (error.code === 'P2002') {
        const campo = error.meta?.target;
        if (campo && campo.includes('cpf')) return 'CPF já cadastrado no sistema.';
        if (campo && campo.includes('email')) return 'Email já cadastrado no sistema.';
        return 'CPF ou Email já cadastrado no sistema.';
    }
    return null;
}

export const criarCliente = async (req, res) => {
    try {
        const { nome, cpf, telefone, email, cep } = req.body;

        validarNome(nome);

        let dadosCliente = { ...req.body };

        if (cpf !== undefined && cpf !== null) {
            dadosCliente.cpf = validarCpf(cpf);
        }

        if (telefone !== undefined && telefone !== null) {
            dadosCliente.telefone = validarTelefone(telefone);
        }

        if (email !== undefined && email !== null) {
            validarEmail(email);
        }

        if (cep !== undefined && cep !== null) {
            const cleanCep = validarCep(cep);
            const viacep = await ClienteModel.buscarEnderecoPorCep(cleanCep);
            if (viacep.error) return res.status(400).json({ erro: viacep.error });
            dadosCliente.cep = cleanCep;
            dadosCliente.logradouro = viacep.logradouro;
            dadosCliente.bairro = viacep.bairro;
            dadosCliente.localidade = viacep.localidade;
            dadosCliente.uf = viacep.uf;
        }

        const cliente = await ClienteModel.criar(dadosCliente);
        res.status(201).json(cliente);
    } catch (error) {
        const erroUnico = tratarErroUnicidade(error);
        if (erroUnico) return res.status(400).json({ erro: erroUnico });
        const status = error.status || 400;
        res.status(status).json({ erro: error.message || 'Erro ao criar cliente.' });
    }
};

export const listarClientes = async (req, res) => {
    try {
        const clientes = await ClienteModel.listar(req.query);
        res.json(clientes.length ? clientes : { mensagem: 'Nenhum cliente encontrado.' });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }
        const cliente = await ClienteModel.buscarPorId(parseInt(id));
        if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const atualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const clienteExistente = await ClienteModel.buscarPorId(parseInt(id));
        if (!clienteExistente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        const { nome, cpf, telefone, email, cep } = req.body;
        let dadosAtualizados = { ...req.body };

        if (nome !== undefined) {
            validarNome(nome);
        }

        if (cpf !== undefined && cpf !== null) {
            dadosAtualizados.cpf = validarCpf(cpf);
        }

        if (telefone !== undefined && telefone !== null) {
            dadosAtualizados.telefone = validarTelefone(telefone);
        }

        if (email !== undefined && email !== null) {
            validarEmail(email);
        }

        if (cep !== undefined && cep !== null) {
            const cleanCep = validarCep(cep);
            const viacep = await ClienteModel.buscarEnderecoPorCep(cleanCep);
            if (viacep.error) return res.status(400).json({ erro: viacep.error });
            dadosAtualizados.cep = cleanCep;
            dadosAtualizados.logradouro = viacep.logradouro;
            dadosAtualizados.bairro = viacep.bairro;
            dadosAtualizados.localidade = viacep.localidade;
            dadosAtualizados.uf = viacep.uf;
        }

        const cliente = await ClienteModel.atualizar(parseInt(id), dadosAtualizados);
        res.json(cliente);
    } catch (error) {
        const erroUnico = tratarErroUnicidade(error);
        if (erroUnico) return res.status(400).json({ erro: erroUnico });
        const status = error.status || 400;
        res.status(status).json({ erro: error.message || 'Erro ao atualizar cliente.' });
    }
};

export const deletarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const clienteExistente = await ClienteModel.buscarPorId(parseInt(id));
        if (!clienteExistente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        await ClienteModel.deletar(parseInt(id));
        res.json({ mensagem: 'Cliente removido com sucesso.' });
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};

export const getClimaCliente = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ erro: 'ID inválido. Informe um número válido.' });
        }

        const cliente = await ClienteModel.buscarPorId(parseInt(id));
        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        if (!cliente.cep || !cliente.localidade) {
            return res.json({ clima: null });
        }

        const clima = await getClimaByCidade(cliente.localidade);
        res.json({ clima });
    } catch (error) {
        res.json({ clima: null });
    }
};
