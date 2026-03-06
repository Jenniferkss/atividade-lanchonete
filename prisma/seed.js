import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const produtos = [
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
const itens_pedido = [
    {
        pedido_id: 1,
        produto_id: 1, // X-Burger Artesanal
        quantidade: 2,
        preco_unitario: 35.9,
    },
    {
        pedido_id: 1,
        produto_id: 2, // Coca-Cola
        quantidade: 2,
        preco_unitario: 7.0,
    },
    {
        pedido_id: 2,
        produto_id: 4, // Combo Casal
        quantidade: 1,
        preco_unitario: 85.0,
    },
    {
        pedido_id: 2,
        produto_id: 5, // Suco de Laranja
        quantidade: 1,
        preco_unitario: 12.0,
    },
    {
        pedido_id: 3,
        produto_id: 1, // X-Burger
        quantidade: 1,
        preco_unitario: 35.9,
    },
    {
        pedido_id: 3,
        produto_id: 3, // Petit Gâteau
        quantidade: 1,
        preco_unitario: 22.5,
    },
    {
        pedido_id: 3,
        produto_id: 2, // Coca-Cola
        quantidade: 1,
        preco_unitario: 7.0,
    },
];
async function main() {
    console.log('🌱 Iniciando seed...');

    // Opcional: Limpar a tabela antes de inserir para evitar duplicatas em testes
    // console.log('🧹 Limpando dados antigos...');
    // await prisma.produto.deleteMany();

    console.log('📦 Inserindo produtos...');

    for (const produto of produtos) {
        await prisma.produto.create({
            data: produto,
        });
    }

    console.log('✅ Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end(); // Fecha a conexão do pool do pg
    });
