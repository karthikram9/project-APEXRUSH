import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { firebaseDB } from '../firebase'

export const LEAGUES = [
    { name: 'Couch Potato', icon: '🛋️', minSteps: 0, color: '#6b7280', target: 2000, desc: 'Just getting started' },
    { name: 'Casual Walker', icon: '🚶', minSteps: 2000, color: '#10b981', target: 5000, desc: 'Building the habit' },
    { name: 'Active Mover', icon: '🏃', minSteps: 5000, color: '#3b82f6', target: 8000, desc: 'On the right track' },
    { name: 'Fitness Chaser', icon: '⚡', minSteps: 8000, color: '#8b5cf6', target: 10000, desc: 'Almost elite level' },
    { name: 'Step Master', icon: '🏆', minSteps: 10000, color: '#f59e0b', target: 15000, desc: 'WHO recommended goal' },
    { name: 'Ultra Walker', icon: '👑', minSteps: 15000, color: '#ef4444', target: 20000, desc: 'Elite health champion' },
]

export const STEP_REWARDS = [
    { steps: 1000, coins: 5, label: '1K Steps milestone' },
    { steps: 5000, coins: 15, label: '5K Steps milestone' },
    { steps: 8000, coins: 20, label: '8K Steps milestone' },
    { steps: 10000, coins: 50, label: '10K Steps — WHO Goal!' },
    { steps: 15000, coins: 75, label: '15K Steps — Ultra!' },
    { steps: 20000, coins: 100, label: '20K Steps — Legend!' },
]

export default function useStepTracker(user, award) {
    const [steps, setSteps] = useState(0)
    const [todaySteps, setTodaySteps] = useState(0)
    const [weeklySteps, setWeeklySteps] = useState([])
    const [totalSteps, setTotalSteps] = useState(0)
    const [isTracking, setIsTracking] = useState(false)
    const [permission, setPermission] = useState('unknown')
    const [loading, setLoading] = useState(true)
    const [reachedMilestones, setReachedMilestones] = useState([])

    const stepRef = useRef(0)
    const lastAccel = useRef({ x: 0, y: 0, z: 0 })
    const stepThreshold = 1.2
    const stepCooldown = useRef(false)

    const currentLeague = LEAGUES.reduce((acc, l) => todaySteps >= l.minSteps ? l : acc, LEAGUES[0])

    const nextLeague = LEAGUES.find(l => l.minSteps > todaySteps) || LEAGUES[LEAGUES.length - 1]

    const progressToNextLeague = nextLeague.minSteps > todaySteps
        ? ((todaySteps - currentLeague.minSteps) / (nextLeague.minSteps - currentLeague.minSteps)) * 100
        : 100

    useEffect(() => {
        if (user) loadStepData()
    }, [user])

    const loadStepData = async () => {
        setLoading(true)
        try {
            const snap = await getDoc(doc(firebaseDB, 'users', user.uid))
            if (snap.exists()) {
                const d = snap.data()
                const today = new Date().toDateString()
                const savedDate = d.stepDate
                const saved = savedDate === today ? (d.todaySteps || 0) : 0
                setTodaySteps(saved)
                stepRef.current = saved
                setTotalSteps(d.totalSteps || 0)
                setWeeklySteps(d.weeklySteps || Array(7).fill(0))
                setReachedMilestones(d.reachedMilestones || [])
            }
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const saveStepData = async (newToday, newTotal, weekly, milestones) => {
        if (!user) return
        try {
            await setDoc(doc(firebaseDB, 'users', user.uid), {
                todaySteps: newToday,
                totalSteps: newTotal,
                weeklySteps: weekly,
                stepDate: new Date().toDateString(),
                reachedMilestones: milestones,
                displayName: user.displayName,
                email: user.email
            }, { merge: true })
        } catch (e) {
            console.error(e)
        }
    }

    const startTracking = async () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const perm = await DeviceMotionEvent.requestPermission()
                if (perm !== 'granted') {
                    setPermission('denied')
                    return
                }
                setPermission('granted')
            } catch (e) {
                setPermission('denied')
                return
            }
        } else {
            setPermission('granted')
        }

        setIsTracking(true)
        window.addEventListener('devicemotion', handleMotion)
    }

    const stopTracking = () => {
        setIsTracking(false)
        window.removeEventListener('devicemotion', handleMotion)
    }

    const handleMotion = (event) => {
        const acc = event.accelerationIncludingGravity
        if (!acc) return

        const { x, y, z } = acc
        const prev = lastAccel.current

        const delta = Math.abs(
            Math.sqrt(x * x + y * y + z * z) -
            Math.sqrt(prev.x * prev.x + prev.y * prev.y + prev.z * prev.z))

        lastAccel.current = { x, y, z }

        if (delta > stepThreshold && !stepCooldown.current) {
            stepCooldown.current = true
            setTimeout(() => {
                stepCooldown.current = false
            }, 300)

            stepRef.current += 1
            const newToday = stepRef.current
            setTodaySteps(newToday)

            checkMilestones(newToday)

            if (newToday % 50 === 0) {
                const newTotal = (totalSteps || 0) + 50
                setTotalSteps(newTotal)
                const today = new Date().getDay()
                const weekly = [...weeklySteps]
                weekly[today] = newToday
                saveStepData(newToday, newTotal, weekly, reachedMilestones)
            }
        }
    }

    const checkMilestones = (currentSteps) => {
        STEP_REWARDS.forEach(milestone => {
            if (currentSteps >= milestone.steps && !reachedMilestones.includes(milestone.steps)) {
                const newMilestones = [...reachedMilestones, milestone.steps]
                setReachedMilestones(newMilestones)
                if (award) {
                    award('COMPLETE_FORM')
                }
            }
        })
    }



    useEffect(() => {
        return () => {
            window.removeEventListener('devicemotion', handleMotion)
        }
    }, [])

    return {
        todaySteps, totalSteps, weeklySteps, isTracking,
        permission, loading, currentLeague, nextLeague,
        progressToNextLeague, reachedMilestones,
        startTracking, stopTracking, LEAGUES, STEP_REWARDS
    }
}
