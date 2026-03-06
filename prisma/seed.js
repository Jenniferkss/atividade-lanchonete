import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const produtosData = [
    {
        nome: 'X-Burger Artesanal',
        descricao: 'Pão brioche, blend bovino 180g, queijo cheddar e maionese da casa.',
        categoria: 'LANCHE',
        preco: 35.9,
    },
    {
        nome: 'Coca-Cola 350ml',
        descricao: 'Lata trincando de gelada.',
        categoria: 'BEBIDA',
        preco: 7.0,
    },
    {
        nome: 'Petit Gâteau',
        descricao: 'Bolo de chocolate com recheio cremoso, servido com sorvete de baunilha.',
        categoria: 'SOBREMESA',
        preco: 22.5,
    },
    {
        nome: 'Combo Casal',
        descricao: '2 X-Burgers, 1 Porção de Batata G e 2 Refrigerantes lata.',
        categoria: 'COMBO',
        preco: 85.0,
    },
    {
        nome: 'Suco de Laranja Natural',
        descricao: '500ml de suco extraído na hora.',
        categoria: 'BEBIDA',
        preco: 12.0,
    },
];

const clientesData = [
    {
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '11999999999',
        cpf: '12345678901',
        cep: '13270000',
        logradouro: 'Rua das Flores',
        bairro: 'Centro',
        localidade: 'Valinhos',
        uf: 'SP',
        ativo: true,
    },
    {
        nome: 'Maria Souza',
        email: 'maria.souza@email.com',
        telefone: '11888888888',
        cpf: '10987654321',
        ativo: true,
    },
    {
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        telefone: '11777777777',
        cpf: '11122233344',
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        ativo: true,
    },
];

async function main() {
    console.log('🌱 Iniciando seed...');

    console.log('🧹 Limpando dados antigos...');
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.cliente.deleteMany();

    console.log('🍔 Inserindo produtos...');
    const produtosCriados = [];
    for (const produto of produtosData) {
        const prod = await prisma.produto.create({ data: produto });
        produtosCriados.push(prod);
    }

    console.log('👤 Inserindo clientes...');
    const clientesCriados = [];
    for (const cliente of clientesData) {
        const cli = await prisma.cliente.create({ data: cliente });
        clientesCriados.push(cli);
    }

    console.log('🛒 Criando pedidos de exemplo...');

    const lanche = produtosCriados.find((p) => p.nome === 'X-Burger Artesanal');
    const bebida = produtosCriados.find((p) => p.nome === 'Coca-Cola 350ml');

    await prisma.pedido.create({
        data: {
            clienteId: clientesCriados[0].id,
            status: 'ABERTO',
            total: Number(lanche.preco) * 2 + Number(bebida.preco) * 2,
            itens: {
                create: [
                    {
                        produtoId: lanche.id,
                        quantidade: 2,
                        precoUnitario: lanche.preco,
                    },
                    {
                        produtoId: bebida.id,
                        quantidade: 2,
                        precoUnitario: bebida.preco,
                    },
                ],
            },
        },
    });

    console.log('✅ Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
