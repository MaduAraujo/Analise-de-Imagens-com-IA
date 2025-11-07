<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Análise de Imagens com IA

Esta é uma aplicação interativa que demonstra o poder da Inteligência Artificial na análise de imagens. O projeto permite que os usuários façam o upload de uma imagem, e a IA
identificará e listará os objetos presentes na imagem. Além da identificação, o usuário pode selecionar um objeto específico da lista para visualizá-lo isoladamente, entendendo 
na prática o conceito de **segmentação**.

## Demonstração

https://github.com/user-attachments/assets/ae31e6cb-908f-486c-ae49-302fc99b2be3

## Funcionalidades Principais

  * **Upload de Imagem:** Interface simples para o usuário enviar uma imagem (PNG, JPG, etc.).
  * **Identificação de Objetos:** Utiliza um modelo de IA multimodal para analisar a imagem e retornar uma lista de todos os objetos detectados.
  * **Segmentação de Objetos:** Permite ao usuário clicar em um objeto identificado para gerar e exibir uma máscara de segmentação, isolando visualmente o objeto do restante da imagem.

## Tecnologias Utilizadas

  * **Google AI Studio**
  * **Gemini API**
  * **Node.js**
  * **TypeScript**
  * **HTML5**
  * **Vite**

## Instalação e Execução Local

### Pré-requisitos

  * **Node.js**
  * **Git**
  * **Chave de API do Gemini**

### Passos

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/MaduAraujo/Analise-de-Imagens-com-IA.git
    cd Analise-de-Imagens-com-IA
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure sua Chave de API:**
    Crie um arquivo chamado `.env.local` na raiz do projeto e adicione sua chave de API do Gemini:

    ```
    GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```

4.  **Execute a aplicação:**

    ```bash
    npm run dev
    ```

Após executar o comando, o servidor de desenvolvimento será iniciado. Abra o navegador e acesse `http://localhost:3000` (ou o endereço indicado no terminal) para ver a aplicação em funcionamento.
