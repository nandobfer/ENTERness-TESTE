<img src="https://enterness.easychannel.online/assets/images/logo.png" alt="ENTERness Logo" width="200"/>

# 🚀 ENTERness Developer Challenge

Olá Desenvolvedor! 👋  
Bem-vindo ao **Desafio ENTERness**! Este desafio foi criado para avaliar suas habilidades em desenvolvimento FullStack utilizando **Node.js**, **React**, e **TypeScript**. Estamos ansiosos para ver como você aborda o problema e organiza o seu código.

---

## 🏆 Objetivo

Demonstrar proficiência em desenvolvimento **FullStack** com foco em **TypeScript**, evidenciando suas habilidades no **backend** e **frontend**. Embora o aplicativo seja simples, buscamos observar o máximo de boas práticas que você consegue implementar, como:
- DRY (Don’t Repeat Yourself).
- Programação funcional.
- Composição de componentes.

---

## 💻 Projeto

Desenvolva um **chat em tempo real** simples, usando **TypeScript** e **React**.

### ✨ Funcionalidades

1. O usuário deve poder abrir várias abas do navegador.  
2. Cada aba deve solicitar o **nome do usuário** antes de entrar no chat.  
3. Uma vez dentro do chat, o usuário poderá **conversar com outros usuários** em diferentes abas do navegador.  

---

## 📋 Requisitos

### Requisitos Funcionais

- Desenvolver um aplicativo web utilizando **React** e **TypeScript**.
- O backend deve permitir comunicação em **tempo real**.
- O estado do chat pode ser armazenado **em memória**.

### Requisitos Não Funcionais (Obrigatórios)

- Utilizar **TypeScript** no desenvolvimento.
- Utilizar a biblioteca **React** para construir a interface do usuário.
- O backend pode usar qualquer biblioteca ou framework de rotas, desde que seja **real-time**.

### Requisitos Não Funcionais (Opcionais)

- O uso de um banco de dados é **opcional**, mas caso utilizado, o **MySQL** é preferencial.
- O uso de **Docker** é opcional, mas recomendado caso um banco de dados seja usado.
- O uso de **Typeorm** é opcional.

---

## 🌟 Bônus (Opcional)

Demonstre ainda mais domínio com estas melhorias:

- Criar um **layout bonito e intuitivo** (UI/UX).  
- Gerar um **build do projeto** (`npm run build`).  
- Estruturar o projeto de forma clara e escalável.  
- Adicionar **documentação de código** para demonstrar preocupação com qualidade.  
- Implementar **salas de chat**.  
- Adicionar funcionalidades como **emojis** ou outras facilidades comuns de um chat.  

---

## 📅 Prazo

- Você terá até **2 dias** a partir do recebimento deste documento para concluir o projeto.  
- Caso não consiga finalizar dentro do prazo, envie o que foi feito. Valorizaremos sua abordagem e qualidade do código.

---

## 📧 Dúvidas?

Se tiver dúvidas sobre o desafio, envie um e-mail para **jean@enterness.com**. Estamos disponíveis para ajudar e responderemos suas perguntas o mais rápido possível.

---
## ⚙️ Configuração do Projeto

Siga os passos abaixo para configurar o ambiente e executar o projeto:

1. **Clone o Repositório**  
   Clone o projeto para o seu ambiente local:  
   ```bash
        git clone <link-Repositório>
        cd desafio-enterness
    ```
2. **Suba o Banco de Dados com Docker Compose**  
    Este projeto já inclui uma configuração de Docker Compose para MariaDB.
    Para iniciar o banco de dados, execute:  
   ```bash
        docker-compose up --build
    ```

3. **Conexão com o Banco de Dados**  
    O projeto já contém um arquivo de conexão pré-configurado para utilizar o banco de dados MariaDB.
    Certifique-se de que o serviço do banco está rodando antes de iniciar o backend.
    ```bash
        mysql://user:user_password@localhost:3306/mydatabase
    ```
4. **Agora construa o backend e frontend**  
    
    
## 📝 Observações

- Os **bônus** não são obrigatórios, mas ajudam a demonstrar um pouco mais do seu domínio na linguagem.  
- Agradecemos o tempo dedicado para realizar o desafio! Todos os testes serão avaliados com um **feedback construtivo**.

Boa sorte! 🚀
