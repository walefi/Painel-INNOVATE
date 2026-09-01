import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { initialSellers, initialTeamGoal, initialSettings } from '../data/initialData'

const SELLERS_COL = 'sellers'
const SETTINGS_DOC = 'settings/config'
const TEAM_GOAL_DOC = 'teamGoals/main'

// Check if Firestore connection is working
let firestoreAvailable = null

async function checkFirestore() {
  if (firestoreAvailable !== null) return firestoreAvailable
  try {
    const { enableNetwork } = await import('firebase/firestore')
    await enableNetwork(db)
    firestoreAvailable = true
  } catch (e) {
    console.warn('Firestore indisponivel, usando dados locais:', e.message)
    firestoreAvailable = false
  }
  return firestoreAvailable
}

export function useSellers() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsub = null
    let timeout = null

    const startListener = async () => {
      try {
        unsub = onSnapshot(
          collection(db, SELLERS_COL),
          (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            if (data.length > 0) {
              setSellers(data)
            } else {
              // Collection empty — use initial data as display defaults
              setSellers(initialSellers.map((s, i) => ({ ...s, id: String(i + 1) })))
            }
            setLoading(false)
            setError(null)
          },
          (err) => {
            console.error('Firestore sellers error:', err.message)
            setError(err.message)
            // Fallback to local data
            setSellers(initialSellers.map((s, i) => ({ ...s, id: String(i + 1) })))
            setLoading(false)
          }
        )
      } catch (err) {
        console.error('Failed to start sellers listener:', err)
        setSellers(initialSellers.map((s, i) => ({ ...s, id: String(i + 1) })))
        setLoading(false)
      }
    }

    // Safety timeout: if loading takes too long, use local data
    timeout = setTimeout(() => {
      if (loading) {
        console.warn('Firestore timeout — usando dados locais')
        setSellers(initialSellers.map((s, i) => ({ ...s, id: String(i + 1) })))
        setLoading(false)
      }
    }, 5000)

    startListener()

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const addSeller = useCallback(async (sellerData) => {
    const { id: _ignore, ...rest } = sellerData
    try {
      await addDoc(collection(db, SELLERS_COL), {
        ...rest,
        dailySales: 0,
        monthlySales: 0,
        annualSales: 0,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Erro ao adicionar vendedor:', err)
      alert('Erro ao salvar no Firestore. Verifique as regras de seguranca.')
      throw err
    }
  }, [])

  const updateSeller = useCallback(async (sellerId, data) => {
    const { id: _ignore, ...rest } = data
    try {
      await setDoc(doc(db, SELLERS_COL, sellerId), rest, { merge: true })
    } catch (err) {
      console.error('Erro ao atualizar vendedor:', err)
      alert('Erro ao salvar no Firestore. Verifique as regras de seguranca.')
      throw err
    }
  }, [])

  const deleteSeller = useCallback(async (sellerId) => {
    try {
      await deleteDoc(doc(db, SELLERS_COL, sellerId))
    } catch (err) {
      console.error('Erro ao deletar vendedor:', err)
      // Ignore "not found" errors
      if (err.code !== 'not-found') {
        alert('Erro ao deletar no Firestore.')
        throw err
      }
    }
  }, [])

  const bulkUpdateSellers = useCallback(async (updates) => {
    try {
      const batch = writeBatch(db)
      updates.forEach(({ id, ...data }) => {
        const ref = doc(db, SELLERS_COL, id)
        batch.set(ref, data, { merge: true })
      })
      await batch.commit()
    } catch (err) {
      console.error('Erro ao atualizar em lote:', err)
      alert('Erro ao salvar no Firestore.')
      throw err
    }
  }, [])

  const initializeSellers = useCallback(async () => {
    try {
      const batch = writeBatch(db)
      initialSellers.forEach((seller) => {
        const ref = doc(collection(db, SELLERS_COL))
        batch.set(ref, {
          ...seller,
          createdAt: serverTimestamp(),
        })
      })
      await batch.commit()
    } catch (err) {
      console.error('Erro ao inicializar dados:', err)
      alert('Erro ao criar dados no Firestore. Verifique as regras de seguranca.')
      throw err
    }
  }, [])

  return { sellers, loading, error, addSeller, updateSeller, deleteSeller, bulkUpdateSellers, initializeSellers }
}

export function useSettings() {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    const startListener = async () => {
      try {
        unsub = onSnapshot(
          doc(db, 'settings', 'config'),
          (snapshot) => {
            if (snapshot.exists()) {
              setSettings(snapshot.data())
            }
            setLoading(false)
          },
          (err) => {
            console.error('Firestore settings error:', err.message)
            setLoading(false)
          }
        )
      } catch (err) {
        setLoading(false)
      }
    }

    timeout = setTimeout(() => {
      if (loading) setLoading(false)
    }, 5000)

    startListener()

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const updateSettings = useCallback(async (data) => {
    try {
      await setDoc(doc(db, 'settings', 'config'), data, { merge: true })
    } catch (err) {
      console.error('Erro ao atualizar settings:', err)
      alert('Erro ao salvar no Firestore.')
      throw err
    }
  }, [])

  return { settings, loading, updateSettings }
}

export function useTeamGoal() {
  const [teamGoal, setTeamGoal] = useState(initialTeamGoal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = null
    let timeout = null

    const startListener = async () => {
      try {
        unsub = onSnapshot(
          doc(db, 'teamGoals', 'main'),
          (snapshot) => {
            if (snapshot.exists()) {
              setTeamGoal(snapshot.data())
            }
            setLoading(false)
          },
          (err) => {
            console.error('Firestore teamGoal error:', err.message)
            setLoading(false)
          }
        )
      } catch (err) {
        setLoading(false)
      }
    }

    timeout = setTimeout(() => {
      if (loading) setLoading(false)
    }, 5000)

    startListener()

    return () => {
      if (unsub) unsub()
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const updateTeamGoal = useCallback(async (data) => {
    try {
      await setDoc(doc(db, 'teamGoals', 'main'), data, { merge: true })
    } catch (err) {
      console.error('Erro ao atualizar teamGoal:', err)
      alert('Erro ao salvar no Firestore.')
      throw err
    }
  }, [])

  return { teamGoal, loading, updateTeamGoal }
}
