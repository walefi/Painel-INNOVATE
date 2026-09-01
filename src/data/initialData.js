/**
 * Dados iniciais para o sistema de metas
 * Contém vendedores de exemplo e metas padrão
 */

export const initialSellers = [
  {
    id: 1,
    name: 'Nelson Júnior',
    avatar: '👨‍💼',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 2,
    name: 'Victoria Benevenuto',
    avatar: '👩‍💼',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 3,
    name: 'Alessandro',
    avatar: '👨‍💻',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 4,
    name: 'Yves da Cunha',
    avatar: '🧑‍💼',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 5,
    name: 'Thuane Manzzalli',
    avatar: '👩‍🔬',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 6,
    name: 'Lorrany Santa Clara',
    avatar: '👩‍🎨',
    dailyGoal: 50000,
    monthlyGoal: 1000000,
    annualGoal: 12000000,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
  },
  {
    id: 7,
    name: 'Representantes',
    avatar: '👥',
    dailyGoal: 0,
    monthlyGoal: 0,
    annualGoal: 0,
    dailySales: 0,
    monthlySales: 0,
    annualSales: 0,
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

// Períodos disponíveis
export const periods = [
  { id: 'daily', label: 'Diário', shortLabel: 'Dia' },
  { id: 'monthly', label: 'Mensal', shortLabel: 'Mês' },
  { id: 'annual', label: 'Anual', shortLabel: 'Ano' },
]