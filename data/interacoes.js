// interacoes.js
import fs from 'fs';
import path from 'path';

const interacoesFilePath = path.join(process.cwd(), 'data', 'interacoes.json');

// Função para carregar interações do arquivo
function carregarInteracoes(interacoesFile) {
    if (fs.existsSync(interacoesFile)) {
        const data = fs.readFileSync(interacoesFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Função para salvar interações no arquivo
function salvarInteracoes(interacoesFile, interacoes) {
    fs.writeFileSync(interacoesFile, JSON.stringify(interacoes, null, 2), 'utf8');
}

// Função para registrar interação
function registrarInteracao(comando, resposta, interacoesFile) {
    let interacoes = carregarInteracoes(interacoesFile);
    const interacaoExistente = interacoes.find(interacao => interacao.input && interacao.input.toLowerCase() === comando.toLowerCase());
    
    if (interacaoExistente) {
        interacaoExistente.output.push(resposta);
    } else {
        interacoes.push({ input: comando, output: [resposta] });
    }

    salvarInteracoes(interacoesFile, interacoes);
}

export { carregarInteracoes, salvarInteracoes, registrarInteracao }; // Certifique-se de exportar a função aqui