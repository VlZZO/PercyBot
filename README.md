Percy Bot é um chatbot desenvolvido para o WhatsApp Web, projetado para responder a mensagens privadas ou ser mencionado em grupos. Ele possui a capacidade de expandir seu banco de dados e registrar interações, além de realizar cálculos matemáticos. Caso não encontre uma resposta no seu banco de dados, Percy pode consultar a API Gemini para fornecer uma solução.

## Funcionalidades:

- Respostas em Mensagens Privadas e Grupos: Percy pode interagir tanto em chats individuais quanto em grupos, respondendo quando mencionado.
- Expansão de Banco de Dados: O bot é capaz de aprender e expandir seu banco de dados com base nas interações.
- Cálculos Matemáticos: Percy pode executar cálculos simples e avançados diretamente nas conversas.
- Integração com a API Gemini: Quando uma resposta não é encontrada no banco de dados, Percy recorre automaticamente à API Gemini para fornecer informações precisas.

## Configuração:

- Execução: Percy é executado via linha de comando (cmd). Para iniciar, basta rodar o arquivo index.js e escanear o QR code que aparecerá no console.
- Chave API Gemini: Para utilizar a funcionalidade de consulta à API Gemini, é necessário obter uma chave API. Insira essa chave no arquivo gemini.js, localizado na pasta data, para que o bot consiga recorrer à API quando necessário.
