// processamento.js
import fs from 'fs';
import stringSimilarity from 'string-similarity';
import { franc } from 'franc';
import { gerarTextoGemini } from './data/gemini.js';
import { carregarPrefixos } from './data/prefixos.js';
import { verificarRespostaComGemini } from './data/verificarResposta.js';
import { carregarInteracoes, salvarInteracoes } from './data/interacoes.js';

const memoriaTemporaria = {};
const respostasEnviadas = new Set();
let interacoes = carregarInteracoes('./data/interacoes.json');
let pontosPercy = 0;

async function enviarMensagem(client, userId, mensagem, msg) {
    try {
        const options = {};

        // Verificação para mensagens em grupo
        if (msg.isGroupMsg) {
            const quotedMessageId = msg.id._serialized;
            console.log(`quotedMessageId a ser usado: ${quotedMessageId}`);
            options.quotedMessageId = quotedMessageId;
        }

        await client.sendMessage(userId, mensagem, options);
        console.log(`Mensagem enviada para ${userId}: ${mensagem}`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem para ${userId}:`, error);
    }
}

async function processarMensagem(msg, interacoesFile, client) {
    const userId = msg.from;
    const isPrivateChat = userId.endsWith('@c.us');
    const lowerCaseBody = msg.body.toLowerCase();

    const prefixes = carregarPrefixos();
    const startsWithPrefix = prefixes.some(prefix => lowerCaseBody.startsWith(prefix.toLowerCase()));

    if (!isPrivateChat && !startsWithPrefix) {
        console.log('Mensagem ignorada, pois não foi mencionada corretamente.');
        return { resposta: '', registro: false };
    }

    const comandoSemPrefixo = startsWithPrefix ? 
        msg.body.replace(new RegExp(`^(${prefixes.join('|')})\\s*`, 'i'), '').trim() : 
        msg.body.trim();

    let respostaFinal = '';
    let origemResposta = '';

    const respostaBanco = buscarRespostaSimilar(comandoSemPrefixo);
    if (respostaBanco) {
        const respostas = respostaBanco.output.map(resposta => resposta.replace(/\*/g, ''));
        if (respostas && respostas.length > 0) {
            respostaFinal = respostas[Math.floor(Math.random() * respostas.length)];
            origemResposta = 'Banco de Dados';
            pontosPercy += 1;
        }
    }

    if (!respostaFinal) {
        // Detecta o idioma da pergunta do usuário
        const idiomaPergunta = franc(comandoSemPrefixo);
        
        if (idiomaPergunta !== 'por' || lowerCaseBody.includes('speak in english')) {
            const respostaGemini = await verificarRespostaComGemini(comandoSemPrefixo);
            registrarInteracao(comandoSemPrefixo, respostaGemini, interacoesFile);
            respostaFinal = respostaGemini;
            origemResposta = 'Gemini API';
            pontosPercy += 1;
        } else {
            const respostaGemini = await verificarRespostaComGemini(comandoSemPrefixo);
            const idiomaResposta = franc(respostaGemini.slice(0, 50));
            
            if (idiomaResposta !== 'por') {
                console.warn("Resposta gerada em outro idioma, ignorando.");
                respostaFinal = 'Desculpe, não consegui entender sua mensagem.';
                origemResposta = 'Nenhuma';
                pontosPercy -= 1;
            } else {
                registrarInteracao(comandoSemPrefixo, respostaGemini, interacoesFile);
                respostaFinal = respostaGemini;
                origemResposta = 'Gemini API';
                pontosPercy += 1;
            }
        }
    }

    await enviarMensagem(client, userId, respostaFinal.replace(/\*/g, ''), msg); // Remover '*' antes de enviar
    return { resposta: respostaFinal, registro: true };
}

function buscarRespostaSimilar(pergunta) {
    console.log('Pergunta recebida:', pergunta);
    console.log('Interações disponíveis:', interacoes);

    const similaridades = interacoes.map(interacao => {
        if (interacao.input) {
            const similaridade = stringSimilarity.compareTwoStrings(pergunta.toLowerCase(), interacao.input.toLowerCase());
            return {
                interacao: interacao,
                similaridade: similaridade
            };
        } else {
            return null;
        }
    }).filter(sim => sim !== null && sim.similaridade >= 0.75); // Ajuste na similaridade mínima

    if (similaridades.length === 0) {
        return null;
    }

    const interacaoMaisSimilar = similaridades.reduce((prev, current) => {
        return (prev.similaridade > current.similaridade) ? prev : current;
    });

    return interacaoMaisSimilar.interacao;
}

function registrarInteracao(comando, resposta, interacoesFile) {
    let interacoes = carregarInteracoes(interacoesFile);
    const interacaoExistente = interacoes.find(interacao => interacao.input && interacao.input.toLowerCase() === comando.toLowerCase());

    if (interacaoExistente) {
        if (!interacaoExistente.output.includes(resposta)) {
            interacaoExistente.output.push(resposta);
        }
    } else {
        interacoes.push({ input: comando, output: [resposta] });
    }

    salvarInteracoes(interacoesFile, interacoes);
}

export { processarMensagem };
