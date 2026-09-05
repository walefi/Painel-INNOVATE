import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase'
import { initialSellers, initialTeamGoal, initialSettings } from '../data/initialData'

const SELLERS_COL = 'sellers'
const TEAM_GOAL_DOC = 'teamGoals/main'
const SETTINGS_DOC = 'settings/config'
const SALES_HISTORY_COL = 'salesHistory'

const LS_SELLERS = 'painel_sellers'
const LS_GOAL = 'painel_teamGoal'
const LS_SETTINGS = 'painel_settings'

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded */ }
}

function syncFromFirestore(data, lsKey, setFn) {
  if (data && data.length > 0) {
    setFn(data)
    saveLS(lsKey, data)
    return true
  }
  return false
}

export function useSellers() {
  const [sellers, setSellers] = useState(() => loadLS(LS_SELLERS, []))
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    unsub = onSnapshot(
      collection(db, SELLERS_COL),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        syncFromFirestore(data, LS_SELLERS, setSellers)
        loadingRef.current = false
        setLoading(false)
      },
      (err) => {
        console.error('Firestore sellers error:', err.message)
        const ls = loadLS(LS_SELLERS, [])
        if (ls.length > 0) {
          setSellers(ls)
        } else {
          setSellers(initialSellers.map((s, i) => ({ ...s, id: `local_${i + 1}` })))
        }
        loadingRef.current = false
        setLoading(false)
      }
    )

    // Fallback: se o Firestore nao responder em 5s, usa dados locais/iniciais
    timeout = setTimeout(() => {
      if (loadingRef.current) {
        const ls = loadLS(LS_SELLERS, [])
        setSellers(ls.length > 0 ? ls : initialSellers.map((s, i) => ({ ...s, id: `local_${i + 1}` })))
        loadingRef.current = false
        setLoading(false)
      }
    }, 5000)

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const addSeller = useCallback(async (sellerData) => {
    const { id: _ignore, ...rest } = sellerData
    const docRef = await addDoc(collection(db, SELLERS_COL), {
      ...rest,
      dailySales: 0,
      monthlySales: 0,
      annualSales: 0,
    })
    return docRef.id
  }, [])

  const updateSeller = useCallback(async (sellerId, data) => {
    const { id: _ignore, ...rest } = data
    await setDoc(doc(db, SELLERS_COL, sellerId), rest, { merge: true })
  }, [])

  const deleteSeller = useCallback(async (sellerId) => {
    try {
      await deleteDoc(doc(db, SELLERS_COL, sellerId))
    } catch (err) {
      if (err.code !== 'not-found') throw err
    }
  }, [])

  const bulkUpdateSellers = useCallback(async (updates) => {
    const batch = writeBatch(db)
    updates.forEach(({ id, ...data }) => {
      batch.set(doc(db, SELLERS_COL, id), data, { merge: true })
    })
    await batch.commit()
  }, [])

  const initializeSellers = useCallback(async () => {
    const promises = initialSellers.map((seller) => {
      return setDoc(doc(db, SELLERS_COL, `seller_${seller.id}`), {
        name: seller.name,
        avatarUrl: seller.avatarUrl || '',
        dailyGoal: seller.dailyGoal,
        monthlyGoal: seller.monthlyGoal,
        annualGoal: seller.annualGoal,
        dailySales: 0,
        monthlySales: 0,
        annualSales: 0,
        badges: [],
        manualTags: [],
      })
    })
    await Promise.all(promises)
  }, [])

  const resetAllSales = useCallback(async (period = 'all') => {
    const batch = writeBatch(db)
    const field = period === 'daily' ? 'dailySales' : period === 'monthly' ? 'monthlySales' : period === 'annual' ? 'annualSales' : null
    
    sellers.forEach((seller) => {
      if (field) {
        batch.set(doc(db, SELLERS_COL, seller.id), { [field]: 0 }, { merge: true })
      } else {
        batch.set(doc(db, SELLERS_COL, seller.id), {
          dailySales: 0,
          monthlySales: 0,
          annualSales: 0,
        }, { merge: true })
      }
    })
    
    await batch.commit()
  }, [sellers])

  return { sellers, loading, addSeller, updateSeller, deleteSeller, bulkUpdateSellers, initializeSellers, resetAllSales }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => loadLS(LS_SETTINGS, initialSettings))
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    unsub = onSnapshot(
      doc(db, 'settings', 'config'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSettings(data)
          saveLS(LS_SETTINGS, data)
        }
        loadingRef.current = false
        setLoading(false)
      },
      (err) => {
        console.error('Firestore settings error:', err.message)
        loadingRef.current = false
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }, 5000)

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const updateSettings = useCallback(async (data) => {
    await setDoc(doc(db, 'settings', 'config'), data, { merge: true })
    setSettings(data)
    saveLS(LS_SETTINGS, data)
  }, [])

  return { settings, loading, updateSettings }
}

export function useTeamGoal() {
  const [teamGoal, setTeamGoal] = useState(() => loadLS(LS_GOAL, initialTeamGoal))
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    unsub = onSnapshot(
      doc(db, 'teamGoals', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setTeamGoal(data)
          saveLS(LS_GOAL, data)
        }
        loadingRef.current = false
        setLoading(false)
      },
      (err) => {
        console.error('Firestore teamGoal error:', err.message)
        loadingRef.current = false
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }, 5000)

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const updateTeamGoal = useCallback(async (data) => {
    await setDoc(doc(db, 'teamGoals', 'main'), data, { merge: true })
    setTeamGoal(data)
    saveLS(LS_GOAL, data)
  }, [])

  return { teamGoal, loading, updateTeamGoal }
}

export function useSalesHistory() {
  const [salesHistory, setSalesHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    unsub = onSnapshot(
      collection(db, SALES_HISTORY_COL),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setSalesHistory(data)
        loadingRef.current = false
        setLoading(false)
      },
      (err) => {
        console.error('Firestore salesHistory error:', err.message)
        loadingRef.current = false
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loadingRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }, 5000)

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const addSaleRecord = useCallback(async (saleData) => {
    const docRef = await addDoc(collection(db, SALES_HISTORY_COL), {
      sellerId: saleData.sellerId,
      sellerName: saleData.sellerName,
      value: saleData.value,
      type: saleData.type, // 'add' or 'remove'
      timestamp: new Date().toISOString(),
      period: saleData.period || 'daily',
    })
    return docRef.id
  }, [])

  const getSalesByPeriod = useCallback(async (startDate, endDate, sellerId = null) => {
    let q = query(
      collection(db, SALES_HISTORY_COL),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc')
    )
    
    if (sellerId) {
      q = query(
        collection(db, SALES_HISTORY_COL),
        where('sellerId', '==', sellerId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      )
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  }, [])

  const getDailySalesSummary = useCallback(async (date, sellerId = null) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return getSalesByPeriod(startOfDay.toISOString(), endOfDay.toISOString(), sellerId)
  }, [getSalesByPeriod])

  const getMonthlySalesSummary = useCallback(async (year, month, sellerId = null) => {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)
    
    return getSalesByPeriod(startOfMonth.toISOString(), endOfMonth.toISOString(), sellerId)
  }, [getSalesByPeriod])

  const getAnnualSalesSummary = useCallback(async (year, sellerId = null) => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)
    
    return getSalesByPeriod(startOfYear.toISOString(), endOfYear.toISOString(), sellerId)
  }, [getSalesByPeriod])

  const deleteSaleRecord = useCallback(async (saleId) => {
    try {
      await deleteDoc(doc(db, SALES_HISTORY_COL, saleId))
    } catch (err) {
      if (err.code !== 'not-found') throw err
    }
  }, [])

  const cancelSale = useCallback(async (saleRecord, sellers, updateSeller) => {
    const seller = sellers.find(s => s.id === saleRecord.sellerId)
    if (!seller) throw new Error('Vendedor nao encontrado')

    await updateSeller(seller.id, {
      dailySales: Math.max(0, (seller.dailySales || 0) - saleRecord.value),
      monthlySales: Math.max(0, (seller.monthlySales || 0) - saleRecord.value),
      annualSales: Math.max(0, (seller.annualSales || 0) - saleRecord.value),
    })

    await setDoc(doc(db, SALES_HISTORY_COL, saleRecord.id), {
      ...saleRecord,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    }, { merge: true })

    await addDoc(collection(db, SALES_HISTORY_COL), {
      sellerId: saleRecord.sellerId,
      sellerName: saleRecord.sellerName,
      value: saleRecord.value,
      type: 'cancellation',
      originalSaleId: saleRecord.id,
      originalSaleTimestamp: saleRecord.timestamp,
      timestamp: new Date().toISOString(),
      status: 'active',
    })
  }, [])

  const cancelSalesByPeriod = useCallback(async (sellerId, period, sellers, updateSeller) => {
    const seller = sellers.find(s => s.id === sellerId)
    if (!seller) throw new Error('Vendedor nao encontrado')

    const today = new Date()
    let startDate, endDate

    if (period === 'daily') {
      startDate = new Date(today)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(today)
      endDate.setHours(23, 59, 59, 999)
    } else if (period === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    } else {
      startDate = new Date(today.getFullYear(), 0, 1)
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)
    }

    const salesInPeriod = await getSalesByPeriod(
      startDate.toISOString(),
      endDate.toISOString(),
      sellerId
    )

    const activeSales = salesInPeriod.filter(s => 
      s.type === 'add' && s.status !== 'cancelled'
    )

    const totalToAddBack = activeSales.reduce((sum, s) => sum + (s.value || 0), 0)

    if (totalToAddBack === 0) {
      return { cancelled: 0, total: 0 }
    }

    const field = `${period}Sales`
    await updateSeller(seller.id, {
      [field]: Math.max(0, (seller[field] || 0) - totalToAddBack),
    })

    for (const sale of activeSales) {
      await setDoc(doc(db, SALES_HISTORY_COL, sale.id), {
        ...sale,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      }, { merge: true })
    }

    await addDoc(collection(db, SALES_HISTORY_COL), {
      sellerId: seller.id,
      sellerName: seller.name,
      value: totalToAddBack,
      type: 'bulk_cancellation',
      period: period,
      cancelledCount: activeSales.length,
      timestamp: new Date().toISOString(),
      status: 'active',
    })

    return { cancelled: activeSales.length, total: totalToAddBack }
  }, [getSalesByPeriod])

  return {
    salesHistory,
    loading,
    addSaleRecord,
    getSalesByPeriod,
    getDailySalesSummary,
    getMonthlySalesSummary,
    getAnnualSalesSummary,
    deleteSaleRecord,
    cancelSale,
    cancelSalesByPeriod,
  }
}
