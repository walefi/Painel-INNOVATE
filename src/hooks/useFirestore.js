import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { initialSellers, initialTeamGoal, initialSettings } from '../data/initialData'

const SELLERS_COL = 'sellers'
const SETTINGS_DOC = 'settings/config'

export function useSellers() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, SELLERS_COL), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setSellers(data)
      setLoading(false)
    }, (error) => {
      console.error('Erro ao escutar sellers:', error)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const addSeller = useCallback(async (sellerData) => {
    const { id: _ignore, ...rest } = sellerData
    await addDoc(collection(db, SELLERS_COL), {
      ...rest,
      dailySales: 0,
      monthlySales: 0,
      annualSales: 0,
      createdAt: serverTimestamp(),
    })
  }, [])

  const updateSeller = useCallback(async (sellerId, data) => {
    const { id: _ignore, ...rest } = data
    await updateDoc(doc(db, SELLERS_COL, sellerId), rest)
  }, [])

  const deleteSeller = useCallback(async (sellerId) => {
    await deleteDoc(doc(db, SELLERS_COL, sellerId))
  }, [])

  const bulkUpdateSellers = useCallback(async (updates) => {
    const batch = writeBatch(db)
    updates.forEach(({ id, ...data }) => {
      const ref = doc(db, SELLERS_COL, id)
      batch.update(ref, data)
    })
    await batch.commit()
  }, [])

  const initializeSellers = useCallback(async () => {
    const batch = writeBatch(db)
    initialSellers.forEach((seller) => {
      const ref = doc(collection(db, SELLERS_COL))
      batch.set(ref, {
        ...seller,
        createdAt: serverTimestamp(),
      })
    })
    await batch.commit()
  }, [])

  return { sellers, loading, addSeller, updateSeller, deleteSeller, bulkUpdateSellers, initializeSellers }
}

export function useSettings() {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, ...SETTINGS_DOC.split('/')), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data())
      }
      setLoading(false)
    }, (error) => {
      console.error('Erro ao escutar settings:', error)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const updateSettings = useCallback(async (data) => {
    await setDoc(doc(db, ...SETTINGS_DOC.split('/')), data, { merge: true })
  }, [])

  return { settings, loading, updateSettings }
}

export function useTeamGoal() {
  const [teamGoal, setTeamGoal] = useState(initialTeamGoal)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'teamGoals', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setTeamGoal(snapshot.data())
      }
      setLoading(false)
    }, (error) => {
      console.error('Erro ao escutar teamGoal:', error)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const updateTeamGoal = useCallback(async (data) => {
    await setDoc(doc(db, 'teamGoals', 'main'), data, { merge: true })
  }, [])

  return { teamGoal, loading, updateTeamGoal }
}
