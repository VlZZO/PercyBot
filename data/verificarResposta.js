//verificarResposta.js
import { gerarTextoGemini } from './gemini.js';
import { registrarInteracao } from './interacoes.js'; // Importando corretamente
import { obterRespostaDoGemini } from './gemini.js';
import fs from 'fs'; // Importando o módulo fs

// Carrega interações do arquivo JSON
let interacoes;
try {
    interacoes = JSON.parse(fs.readFileSync('./data/interacoes.json', 'utf-8'));
    if (!Array.isArray(interacoes)) {
        throw new Error('O conteúdo de interacoes.json não é um array.');
    }
} catch (error) {
    console.error('Erro ao carregar interações:', error.message);
    interacoes = []; // Define como um array vazio em caso de erro
}

// Verifica a validade da resposta gerada pelo Gemini
const verificarRespostaComGemini = async (comando) => {
    const prompt = `Olá, eu sou Percy! Estou utilizando a API Gemini para responder perguntas que ainda não estão em minha database. Recebi a seguinte pergunta: "${comando}". Por favor, me forneça uma resposta em português para essa questão e seja objetivo. Seja direto e dispense apresentações; você deve responder como se fosse eu: Percy.`;

    const respostaGemini = await obterRespostaDoGemini(prompt);
    const respostaNormalizada = respostaGemini.replace(/\*/g, '').trim(); // Remover '*' e trim

    // Log para verificar a resposta gerada
    console.log(`Prompt enviado ao Gemini: "${prompt}"`);
    console.log(`Resposta do Gemini: "${respostaGemini}"`);

    return respostaNormalizada;
};

// Adiciona a lógica para verificar se a mensagem contém palavras-chave
const verificarMensagem = async (mensagem, interacoesFile) => {
    const palavrasChave = ['gere', 'faça', 'realize', 'me conte', 'fale sobre', 'crie', 'calculo', 'matematico'];

    // Verifica se a mensagem contém alguma palavra-chave
    const contemPalavraChave = palavrasChave.some(palavra => mensagem.toLowerCase().includes(palavra));

    // Verifica se a mensagem se refere a cálculos matemáticos e força a chamada ao Gemini
    const contemCalculo = mensagem.toLowerCase().includes('calculo matematico');

    if (contemCalculo || contemPalavraChave) {
        // Se contiver, chama a função para gerar resposta com o Gemini
        return await verificarRespostaComGemini(mensagem, interacoesFile);
    } else {
        // Lógica para resposta normal (do banco de dados)
        return gerarRespostaNormal(mensagem);
    }
};

const gerarRespostaNormal = (mensagem) => {
    // Busca a resposta na lista de interações
    const respostaEncontrada = interacoes.find(interacao => interacao.pergunta.toLowerCase() === mensagem.toLowerCase());
    
    return respostaEncontrada ? respostaEncontrada.output[Math.floor(Math.random() * respostaEncontrada.output.length)] : 'Desculpe, não tenho uma resposta para isso.'; // Retorna resposta aleatória
};

export { verificarRespostaComGemini, verificarMensagem };
