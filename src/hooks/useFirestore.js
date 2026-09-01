import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { initialSellers, initialTeamGoal, initialSettings } from '../data/initialData'

const SELLERS_COL = 'sellers'
const TEAM_GOAL_DOC = 'teamGoals/main'
const SETTINGS_DOC = 'settings/config'

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

  useEffect(() => {
    let unsub = null
    let timeout = null

    unsub = onSnapshot(
      collection(db, SELLERS_COL),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        syncFromFirestore(data, LS_SELLERS, setSellers)
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
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loading) {
        const ls = loadLS(LS_SELLERS, [])
        setSellers(ls.length > 0 ? ls : initialSellers.map((s, i) => ({ ...s, id: `local_${i + 1}` })))
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

  return { sellers, loading, addSeller, updateSeller, deleteSeller, bulkUpdateSellers, initializeSellers }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => loadLS(LS_SETTINGS, initialSettings))
  const [loading, setLoading] = useState(true)

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
        setLoading(false)
      },
      (err) => {
        console.error('Firestore settings error:', err.message)
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loading) setLoading(false)
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
        setLoading(false)
      },
      (err) => {
        console.error('Firestore teamGoal error:', err.message)
        setLoading(false)
      }
    )

    timeout = setTimeout(() => {
      if (loading) setLoading(false)
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
