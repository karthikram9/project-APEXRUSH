import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { firebaseDB } from '../firebase'
import useStepTracker, { LEAGUES, STEP_REWARDS } from '../hooks/useStepTracker'
import { Activity } from 'lucide-react'

// Dummy fallback for GameContext as it might not be implemented yet.
const useGame = () => ({ award: (action) => console.log('Award earned:', action) })

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StepTracker({ user }) {
    const { award } = useGame()
    const {
        todaySteps, totalSteps, weeklySteps, isTracking,
        permission, loading, currentLeague, nextLeague,
        progressToNextLeague, reachedMilestones,
        startTracking, stopTracking
    } = useStepTracker(user, award)


    const [leaderboard, setLeaderboard] = useState([])
    const [activeTab, setActiveTab] = useState('today')

    useEffect(() => {
        loadLeaderboard()
    }, [])

    const loadLeaderboard = async () => {
        try {
            const q = query(collection(firebaseDB, 'users'), orderBy('todaySteps', 'desc'), limit(10))
            const snap = await getDocs(q)
            setLeaderboard(snap.docs.map((d, i) => ({
                rank: i + 1,
                name: d.data().displayName || d.data().email?.split('@')[0] || 'Anonymous',
                steps: d.data().todaySteps || 0,
                league: LEAGUES.reduce((acc, l) => (d.data().todaySteps || 0) >= l.minSteps ? l : acc, LEAGUES[0])
            })))
        } catch (e) {
            console.error(e)
        }
    }

    const healthScore = Math.min(Math.round((todaySteps / 10000) * 100), 100)
    const caloriesBurned = Math.round(todaySteps * 0.04)
    const kmWalked = (todaySteps * 0.000762).toFixed(1)
    const minutesActive = Math.round(todaySteps / 100)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-emerald-400 animate-pulse">Loading step data...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Tab bar */}
            <div className="flex bg-white/[0.05] rounded-xl p-1 gap-1">
                {['today', 'leagues', 'leaderboard', 'history'].map(tab => (
                    <button key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-white/50 hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* TODAY TAB */}
            {activeTab === 'today' && (
                <div className="space-y-5">

                    {/* Main step circle */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center">
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke={currentLeague.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.min(todaySteps / 10000, 1))}`} className="transition-all duration-700" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white">{todaySteps.toLocaleString()}</span>
                                <span className="text-white/50 text-sm mt-1">steps today</span>
                                <span className="text-xs mt-1" style={{ color: currentLeague.color }}>{currentLeague.icon} {currentLeague.name}</span>
                            </div>
                        </div>

                        {/* Goal progress */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-white/50">Daily Goal</span>
                                <span className="font-bold" style={{ color: currentLeague.color }}>{todaySteps} / 10,000</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((todaySteps / 10000) * 100, 100)}%`, backgroundColor: currentLeague.color }} />
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-3 mb-6">
                            {[
                                { label: 'Calories', value: caloriesBurned, unit: 'kcal', icon: '🔥' },
                                { label: 'Distance', value: kmWalked, unit: 'km', icon: '📍' },
                                { label: 'Active', value: minutesActive, unit: 'min', icon: '⏱️' },
                                { label: 'Score', value: healthScore, unit: '%', icon: '💯' },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
                                    <p className="text-lg mb-1">{stat.icon}</p>
                                    <p className="font-bold text-sm">{stat.value}<span className="text-white/40 text-xs">{stat.unit}</span></p>
                                    <p className="text-white/40 text-xs">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Tracking button */}
                        {permission === 'denied' ? (
                            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                                Motion sensor access denied. Use manual entry below.
                            </div>
                        ) : (
                            <button
                                onClick={isTracking ? stopTracking : startTracking}
                                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 mb-3 ${isTracking ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>
                                {isTracking ? '⏹ Stop Tracking' : '▶ Start Step Tracking'}
                            </button>
                        )}

                        {isTracking && (
                            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm animate-pulse mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                Tracking active — walk with your phone
                            </div>
                        )}


                    </div>

                    {/* Weekly chart */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                        <h3 className="font-semibold mb-5">This Week</h3>
                        <div className="flex items-end justify-between gap-2 h-24">
                            {DAYS.map((day, i) => {
                                const s = weeklySteps[i] || 0
                                const h = s > 0 ? Math.max((s / 10000) * 100, 8) : 4
                                const isToday = i === new Date().getDay()
                                return (
                                    <div key={day} className="flex flex-col items-center gap-1 flex-1">
                                        <div className="w-full rounded-t-lg transition-all duration-700" style={{ height: `${h}%`, backgroundColor: isToday ? currentLeague.color : 'rgba(255,255,255,0.1)' }} />
                                        <span className={`text-xs ${isToday ? 'text-white font-bold' : 'text-white/40'}`}>{day}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                        <h3 className="font-semibold mb-4">Daily Milestones</h3>
                        <div className="flex flex-col gap-3">
                            {STEP_REWARDS.map(m => {
                                const reached = todaySteps >= m.steps
                                return (
                                    <div key={m.steps} className={`flex items-center justify-between p-3 rounded-xl transition-all ${reached ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5 opacity-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{reached ? '✅' : '🔒'}</span>
                                            <div>
                                                <p className="text-sm font-medium">{m.steps.toLocaleString()} steps</p>
                                                <p className="text-white/40 text-xs">{m.label}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${reached ? 'text-yellow-400' : 'text-white/30'}`}>+{m.coins} 🪙</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* LEAGUES TAB */}
            {activeTab === 'leagues' && (
                <div className="space-y-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center mb-2">
                        <p className="text-5xl mb-3">{currentLeague.icon}</p>
                        <h2 className="text-2xl font-bold">{currentLeague.name}</h2>
                        <p className="text-white/50 text-sm mt-1">{currentLeague.desc}</p>
                        <p className="text-white/40 text-xs mt-3">
                            {todaySteps.toLocaleString()} / {nextLeague.minSteps.toLocaleString()} steps to {nextLeague.name}
                        </p>
                        <div className="h-2 bg-white/10 rounded-full mt-3">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressToNextLeague}%`, backgroundColor: currentLeague.color }} />
                        </div>
                    </div>

                    {LEAGUES.map((league, i) => {
                        const unlocked = todaySteps >= league.minSteps
                        const isCurrent = league.name === currentLeague.name
                        return (
                            <div key={league.name} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${isCurrent ? 'border-2 bg-white/[0.05]' : unlocked ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.04] opacity-50'}`} style={isCurrent ? { borderColor: league.color } : {}}>
                                <span className="text-4xl">{league.icon}</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold">{league.name}</p>
                                        {isCurrent && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ backgroundColor: league.color }}>CURRENT</span>
                                        )}
                                    </div>
                                    <p className="text-white/50 text-sm">{league.desc}</p>
                                    <p className="text-white/30 text-xs mt-1">{league.minSteps.toLocaleString()} steps required</p>
                                </div>
                                {unlocked ? <span className="text-emerald-400 font-bold text-lg">✅</span> : <span className="text-white/20 text-lg">🔒</span>}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
                <div className="space-y-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">Today's Top Walkers</h3>
                            <button onClick={loadLeaderboard} className="text-emerald-400 text-sm hover:text-emerald-300">Refresh</button>
                        </div>

                        {leaderboard.length === 0 ? (
                            <p className="text-white/40 text-sm text-center py-4">No data yet. Be the first!</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {leaderboard.map((entry, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${entry.name === (user?.displayName || user?.email?.split('@')[0]) ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/60'}`}>
                                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : entry.rank}
                                        </div>
                                        <span className="text-xl">{entry.league.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">
                                                {entry.name}
                                                {entry.name === (user?.displayName || user?.email?.split('@')[0]) && <span className="text-emerald-400 text-xs ml-2">(You)</span>}
                                            </p>
                                            <p className="text-white/40 text-xs">{entry.league.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm" style={{ color: entry.league.color }}>{entry.steps.toLocaleString()}</p>
                                            <p className="text-white/40 text-xs">steps</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    <h3 className="font-semibold mb-5">Weekly Summary</h3>
                    <div className="flex flex-col gap-3">
                        {DAYS.map((day, i) => {
                            const s = weeklySteps[i] || 0
                            const league = LEAGUES.reduce((acc, l) => s >= l.minSteps ? l : acc, LEAGUES[0])
                            const isToday = i === new Date().getDay()
                            return (
                                <div key={day} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                                    <span className="text-2xl">{league.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">
                                            {day} {isToday && <span className="text-emerald-400 text-xs ml-2">Today</span>}
                                        </p>
                                        <div className="h-1.5 bg-white/10 rounded-full mt-1.5">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((s / 10000) * 100, 100)}%`, backgroundColor: league.color }} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm" style={{ color: league.color }}>{s.toLocaleString()}</p>
                                        <p className="text-white/40 text-xs">steps</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/[0.08]">
                        <div className="flex justify-between">
                            <div className="text-center">
                                <p className="text-2xl font-black text-emerald-400">{weeklySteps.reduce((a, b) => a + b, 0).toLocaleString()}</p>
                                <p className="text-white/50 text-xs">Total This Week</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-blue-400">{Math.round(weeklySteps.reduce((a, b) => a + b, 0) / 7).toLocaleString()}</p>
                                <p className="text-white/50 text-xs">Daily Average</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-yellow-400">{totalSteps.toLocaleString()}</p>
                                <p className="text-white/50 text-xs">All Time Total</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
