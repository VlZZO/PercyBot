import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = "xxxxxxx"; // Defina sua chave aqui 
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

// Função para gerar texto
async function gerarTextoGemini(userMessage) {
    const data = { contents: [{ parts: [{ text: userMessage }] }] };

    try {
        const response = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
        const respostaGerada = response.data.candidates[0].content.parts[0].text;
        
        // Log para verificar a resposta gerada
        console.log(`Resposta gerada pelo Gemini: ${respostaGerada}`);
        
        return respostaGerada;
    } catch (error) {
        console.error('Erro ao chamar a API do Gemini:', error);
        return 'Desculpe, ocorreu um erro ao processar sua solicitação.';
    }
}

// Se você quiser que 'obterRespostaDoGemini' seja um alias para 'gerarTextoGemini'
const obterRespostaDoGemini = gerarTextoGemini;

// Exportando as funções com a sintaxe ES6
export { gerarTextoGemini, obterRespostaDoGemini };
