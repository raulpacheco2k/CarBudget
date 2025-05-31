# CarBudget

CarBudget é uma aplicação web projetada para auxiliar no planejamento financeiro da compra de um veículo. Ele oferece ferramentas para simular custos, analisar despesas e organizar o orçamento de forma eficaz.

![](/docs/images/preview.png)

# ✨ Funcionalidades Principais

*   **Simulação de Orçamento:** Calcule os custos totais envolvidos na compra e manutenção de um carro.
*   **Suporte a Múltiplos Idiomas:** Acessível para usuários de diferentes regiões.
*   **Armazenamento Local:** Salve suas simulações e dados diretamente no navegador.

# 📂 Estrutura do Projeto

O projeto segue uma estrutura modular para facilitar a organização e o desenvolvimento:
```
┌── app/                # Páginas da aplicação (rotas) e layouts 
├── components/         # Componentes React reutilizáveis 
│ ├── ui/               # Componentes de UI (shadcn/ui) 
│ └── ...               # Outros componentes específicos da aplicação 
├── lib/                # Funções utilitárias, configurações, internacionalização (i18n) 
├── hooks/              # Hooks React customizados 
├── public/             # Arquivos estáticos (imagens, fontes, etc.) 
├── styles/             # Arquivos de estilo globais 
├── .gitignore          # Arquivos e pastas ignorados pelo Git 
├── Dockerfile          # Configuração para containerização com Docker 
├── components.json     # Configuração para shadcn/ui 
├── next.config.mjs     # Configuração do Next.js 
├── package.json        # Metadados do projeto e dependências 
├── pnpm-lock.yaml      # Lockfile do PNPM 
├── postcss.config.mjs  # Configuração do PostCSS 
├── tailwind.config.ts  # Configuração do Tailwind CSS 
└── tsconfig.json       # Configuração do TypeScript
``` 

# 🚀 Começando

Siga os passos abaixo para configurar e executar o projeto localmente.

## Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão recomendada pela `package.json` ou mais recente)
*   [PNPM](https://pnpm.io/installation)

## Instalação

1.  **Clone o repositório:**
```bash
git clone https://github.com/raulpacheco2k/CarBudget.git
cd CarBudget
```

2.  **Instale as dependências:**
```bash
pnpm install
```

3. Executando Localmente
```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

# 🐳 Docker
O projeto inclui um `Dockerfile` para facilitar a criação de containers Docker.
1. **Construa a imagem Docker:**
``` bash
docker build -t carbudget .
```
1. **Execute o container:**
``` bash
docker run -p 3000:3000 carbudget
```
A aplicação estará acessível em `http://localhost:3000`.

# 🤝 Contribuindo
Contribuições são sempre bem-vindas! Se você tem sugestões para melhorar o projeto, sinta-se à vontade para:
1. Fazer um Fork do projeto
2. Criar uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commitar suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Fazer um Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

Criado com ❤️ para ajudar no seu planejamento financeiro!
