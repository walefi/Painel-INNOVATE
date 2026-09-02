/**
 * Dados iniciais para o sistema de metas
 * Contém vendedores de exemplo e metas padrão
 */

export const initialSellers = [
  {
    id: 1,
    name: 'Nelson Júnior',
    avatar: '👨‍💼',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 2,
    name: 'Victoria Benevenuto',
    avatar: '👩‍💼',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 3,
    name: 'Alessandro',
    avatar: '👨‍💻',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 4,
    name: 'Yves da Cunha',
    avatar: '🧑‍💼',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 5,
    name: 'Thuane Manzzalli',
    avatar: '👩‍🔬',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 6,
    name: 'Lorrany Santa Clara',
    avatar: '👩‍🎨',
    avatarUrl: '',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
  {
    id: 7,
    name: 'Representantes',
    avatar: '👥',
    avatarUrl: '',
    dailyGoal: 0,
    monthlyGoal: 0,
    annualGoal: 0,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
    badges: [],
    manualTags: [],
  },
]

// Meta da equipe (total)
export const initialTeamGoal = {
  daily: 300000,
  monthly: 6000000,
  annual: 72000000,
}

export const initialSettings = {
  monthlyResetDay: 1,
  lastResetDate: null,
  showPrize: false,
}

// Frases motivacionais para o rodapé
export const motivationalPhrases = [
  "🚀 Acredite no seu potencial e vá além!",
  "💪 Cada venda é um passo rumo ao sucesso!",
  "🏆 Metas são sonhos com prazo de validade!",
  "⭐ Excelência não é acaso, é atitude!",
  "🎯 Foco, determinação e resultado!",
  "🔥 A energia da equipe faz a diferença!",
  "📈 Crescimento começa com cada ação!",
  "✨ Seu melhor sempre pode melhorar!",
  "🌟 Trabalho em equipe conquista o impossível!",
  "💡 Inovação é a chave do futuro!",
]

// Badges disponíveis para atribuição manual
export const availableBadges = [
  { id: 'maior-venda-dia', label: 'Maior Venda do Dia 💸', color: 'text-[#E8A33D]' },
  { id: 'estrela-semanal', label: 'Estrela da Semana ⭐', color: 'text-purple-400' },
  { id: 'speed-demon', label: 'Speed Demon ⚡', color: 'text-[#2DD4BF]' },
  { id: 'top-performer', label: 'Top Performer 🎯', color: 'text-green-400' },
]

// Períodos disponíveis
export const periods = [
  { id: 'daily', label: 'Diário', shortLabel: 'Dia' },
  { id: 'monthly', label: 'Mensal', shortLabel: 'Mês' },
  { id: 'annual', label: 'Anual', shortLabel: 'Ano' },
]