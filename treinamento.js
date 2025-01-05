//treinamento.js
import fs from 'fs';
import * as tf from '@tensorflow/tfjs';
import stringSimilarity from 'string-similarity'; // Importa a biblioteca para comparação de strings

// Função para carregar dados de treinamento
function carregarDadosTreinamento(interacoesFile) {
    try {
        const interacoes = JSON.parse(fs.readFileSync(interacoesFile, 'utf8'));

        if (!Array.isArray(interacoes)) {
            throw new Error("Os dados de interações não são um array.");
        }

        return interacoes.map(interacao => {
            const texto = interacao.input;

            if (typeof texto !== 'string') {
                throw new Error(`Esperado uma string, mas recebido: ${typeof texto}`);
            }

            // Retorne um objeto com input e output para treinamento
            return {
                input: texto.split(' '), // ou você pode usar textoParaVetor se preferir
                output: interacao.output // Supondo que o output seja um array de respostas
            };
        });
    } catch (error) {
        console.error("Erro ao carregar dados de treinamento:", error);
        return [];
    }
}

// Função de conversão de texto para vetor numérico
function textoParaVetor(texto) {
    const vetor = {};
    texto.split(/\s+/).forEach(palavra => vetor[palavra] = (vetor[palavra] || 0) + 1);
    
    // Transforme o vetor em um array e preencha com 0s para o tamanho fixo
    const tamanhoFixo = 10; // Defina o tamanho fixo desejado
    const resultado = Array(tamanhoFixo).fill(0);

    // Preencher o vetor com valores
    Object.values(vetor).forEach((valor, index) => {
        if (index < tamanhoFixo) {
            resultado[index] = valor;
        }
    });

    return resultado;
}

// Função para treinar a rede neural
async function treinarRede(interacoesFile) {
    const dadosTreinamento = carregarDadosTreinamento(interacoesFile);
    if (dadosTreinamento.length) {
        const xs = tf.tensor2d(dadosTreinamento.map(d => textoParaVetor(d.input.join(' ')))); // Convertendo input para vetor
        const ys = tf.tensor2d(dadosTreinamento.map(d => {
            // Supondo que output seja um array com uma única resposta
            const vetorOutput = textoParaVetor(d.output[0]); // Convertendo output
            return vetorOutput;
        }));

        const modelo = tf.sequential();
        modelo.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [xs.shape[1]] }));
        modelo.add(tf.layers.dense({ units: ys.shape[1], activation: 'softmax' }));

        modelo.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        await modelo.fit(xs, ys, { epochs: 50 });

        // Salvar o modelo após o treinamento
        await modelo.save('file://model');

        console.log("Modelo treinado e salvo!");
    } else {
        console.log("Nenhum dado de treinamento disponível.");
    }
}

export { carregarDadosTreinamento, treinarRede };