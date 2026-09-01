# Painel de Metas - Innovate Brazil

Sistema de gestão de metas para equipe comercial com visual futurista estilo LED/cibernético.

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Clock.jsx       # Relógio em tempo real
│   ├── MotivationalFooter.jsx  # Rodapé com frases motivacionais
│   ├── ProgressBar.jsx # Barra de progresso
│   ├── Ranking.jsx     # Ranking dos vendedores
│   └── SellerCard.jsx  # Card do vendedor
├── data/
│   └── initialData.js  # Dados iniciais e constantes
├── hooks/
│   └── useLocalStorage.js  # Hook para persistência
├── pages/
│   ├── AdminPanel.jsx  # Painel do Gerente
│   └── DashboardTV.jsx # Painel de TV
├── App.jsx            # Configuração de rotas
├── index.css          # Estilos globais e Tailwind
└── main.jsx           # Ponto de entrada
```

## Imagens de Fundo

Adicione as seguintes imagens na pasta `public/assets/`:

1. `background-1.jpg` - Imagem de fundo principal (estilo cibernético/tecnologia)
2. `background-2.jpg` - Imagem de fundo alternativa

**Dica**: Use imagens com tema de tecnologia, painéis de LED, circuitos ou futurismo para combinar com o estilo visual.

## Scripts Disponíveis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build
npm run preview
```

## Rotas

- `/tv` - Painel de TV (visualização pública)
- `/admin` - Painel do Gerente (gestão de metas)
- `/` - Redireciona automaticamente para `/tv`

## Funcionalidades

### Painel de TV (/tv)
- Visualização de metas diárias, mensais e anuais
- Ranking motivacional da equipe
- Indicadores visuais com ícones animados
- Relógio em tempo real
- Rodapé rotativo com frases motivacionais

### Painel do Gerente (/admin)
- Cadastro, edição e remoção de vendedores
- Configuração de metas individuais e da equipe
- Atualização de valores de vendas
- Persistência automática no localStorage

## Personalização

### Cores
As cores podem ser customizadas no arquivo `src/index.css`:
- `--color-cyber-dark`: Cor de fundo principal
- `--color-cyber-cyan`: Cor de destaque (LED)
- `--color-cyber-gold`: Cor de destaque (metas)

### Fontes
- **Space Grotesk**: Para números e títulos
- **Inter**: Para textos gerais