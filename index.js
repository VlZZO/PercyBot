//index.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { carregarDadosTreinamento, treinarRede } from './treinamento.js';
import { processarMensagem } from './processamento.js';

// Configurações iniciais de arquivos e diretórios
const interacoesFile = path.join(process.cwd(), 'data', 'interacoes.json');

let client; // Variável global para o cliente

// Inicialização do cliente
client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true
    }
});

// Evento para QR code
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true }); // Gera o QR code no terminal
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('Bot Percy está pronto!');
});

// Evento para processar mensagens recebidas
client.on('message', async (msg) => {
    await processarMensagem(msg, interacoesFile, client); // Passando interacoesFile
});

// Inicializa o cliente
client.initialize();
