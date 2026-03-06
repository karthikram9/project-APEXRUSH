import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'
import {
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, getDocs, deleteDoc
} from 'firebase/firestore'
import { firebaseAuth, firebaseDB } from '../firebase'
import {
    Activity, User,
    Bell, LogOut, Plus, Trash2,
    Heart, ChevronRight
} from 'lucide-react'
import StepTracker from './StepTracker'

const NAV = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'health', label: 'Health Data', icon: Activity },
    { id: 'family', label: 'Family Alerts', icon: Bell },
]

export default function Dashboard({ user }) {
    const navigate = useNavigate()
    const [active, setActive] = useState('profile')
    const [profileData, setProfileData] = useState({ name: '', email: '' })
    const [familyContacts, setFamilyContacts] = useState([])
    const [newContact, setNewContact] = useState({ name: '', email: '' })
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [contactMessage, setContactMessage] = useState('')
    const [settings, setSettings] = useState({
        heartThreshold: 70,
        diabetesThreshold: 70,
        obesityThreshold: 70,
        emailNotifications: true
    })

    useEffect(() => {
        if (!user) return
        setProfileData({
            name: user.displayName || '',
            email: user.email || ''
        })
        loadFamilyContacts()
        loadSettings()
    }, [user])

    const loadFamilyContacts = async () => {
        if (!user?.uid) return
        try {
            const snap = await getDocs(
                collection(firebaseDB, 'users', user.uid, 'familyAlerts')
            )
            const contacts = snap.docs.map(d => ({
                id: d.id,
                ...d.data()
            }))
            setFamilyContacts(contacts)
            console.log('Loaded', contacts.length, 'contacts')
        } catch (e) {
            console.error('Load contacts error:', e)
        }
    }

    const loadSettings = async () => {
        if (!user?.uid) return
        try {
            const snap = await getDoc(
                doc(firebaseDB, 'users', user.uid))
            if (snap.exists()) {
                const data = snap.data()
                if (data.settings) {
                    setSettings(prev => ({
                        ...prev,
                        ...data.settings
                    }))
                }
            }
        } catch (e) {
            console.error('Load settings error:', e)
        }
    }

    const saveProfile = async () => {
        if (!profileData.name.trim()) {
            setMessage('Full name cannot be empty.')
            setTimeout(() => setMessage(''), 3000)
            return
        }
        setSaving(true)
        setMessage('')
        try {
            await setDoc(
                doc(firebaseDB, 'users', user.uid),
                { name: profileData.name.trim() },
                { merge: true }
            )
            await updateProfile(user, {
                displayName: profileData.name.trim()
            })
            setMessage('Profile saved successfully.')
        } catch (e) {
            console.error('Save error:', e)
            setMessage('Failed to save. Try again.')
        }
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    const addContact = async () => {
        if (!newContact.name.trim()) {
            setContactMessage('Please enter a contact name.')
            setTimeout(() => setContactMessage(''), 3000)
            return
        }
        if (!newContact.email.trim() ||
            !newContact.email.includes('@') ||
            !newContact.email.includes('.')) {
            setContactMessage('Please enter a valid email address.')
            setTimeout(() => setContactMessage(''), 3000)
            return
        }
        const duplicate = familyContacts.find(
            c => c.email.toLowerCase() ===
                newContact.email.toLowerCase().trim()
        )
        if (duplicate) {
            setContactMessage('This email is already added.')
            setTimeout(() => setContactMessage(''), 3000)
            return
        }
        if (familyContacts.length >= 5) {
            setContactMessage('Maximum 5 contacts allowed.')
            setTimeout(() => setContactMessage(''), 3000)
            return
        }
        try {
            const contactData = {
                name: newContact.name.trim(),
                email: newContact.email.trim().toLowerCase(),
                addedAt: new Date().toISOString()
            }
            const ref = await addDoc(
                collection(firebaseDB, 'users', user.uid, 'familyAlerts'),
                contactData
            )
            setFamilyContacts(prev => [
                ...prev,
                { id: ref.id, ...contactData }
            ])
            setNewContact({ name: '', email: '' })
            setContactMessage('Contact added successfully.')
            console.log('Contact saved to Firestore:', ref.id)
        } catch (e) {
            console.error('Add contact error:', e)
            setContactMessage('Failed to save contact: ' + e.message)
        }
        setTimeout(() => setContactMessage(''), 3000)
    }

    const removeContact = async (id) => {
        try {
            await deleteDoc(
                doc(firebaseDB, 'users', user.uid, 'familyAlerts', id))
            setFamilyContacts(c => c.filter(x => x.id !== id))
            setMessage('Contact removed.')
        } catch (e) {
            setMessage('Error removing contact.')
        }
        setTimeout(() => setMessage(''), 3000)
    }

    const saveSettings = async () => {
        setSaving(true)
        setMessage('')
        try {
            await setDoc(
                doc(firebaseDB, 'users', user.uid),
                { settings: settings },
                { merge: true }
            )
            setMessage('Settings saved successfully.')
            console.log('Settings saved:', settings)
        } catch (e) {
            console.error('Settings save error:', e)
            setMessage('Error saving settings: ' +
                e.message)
        }
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    const handleSignOut = async () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            await signOut(firebaseAuth)
            navigate('/auth')
        }
    }

    const initials = (profileData.name || user?.email || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">

            {/* SIDEBAR */}
            <aside className="w-64 border-r border-white/[0.08]
        flex flex-col py-6 px-4 fixed h-full z-10">

                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20
            border border-emerald-500/30 flex items-center
            justify-center">
                        <Heart size={14} className="text-emerald-400" />
                    </div>
                    <span className="font-bold text-lg">
                        Vital<span className="text-emerald-400">Scan</span>
                    </span>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {NAV.map(item => (
                        <button key={item.id}
                            onClick={() => setActive(item.id)}
                            className={`flex items-center gap-3 px-3 py-2.5
                rounded-xl text-sm font-medium transition-all
                ${active === item.id
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                            <item.icon size={16} />
                            {item.label}
                            {active === item.id && (
                                <ChevronRight size={14} className="ml-auto" />
                            )}
                        </button>
                    ))}

                    <button
                        onClick={() => navigate('/form')}
                        className="flex items-center gap-3 px-3 py-2.5
              rounded-xl text-sm font-medium text-white/50
              hover:text-white hover:bg-white/5 transition-all mt-2">
                        <Activity size={16} />
                        New Assessment
                    </button>
                </nav>

                <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2.5
            rounded-xl text-sm font-medium text-red-400/70
            hover:text-red-400 hover:bg-red-500/10
            transition-all border border-transparent
            hover:border-red-500/20">
                    <LogOut size={16} />
                    Sign Out
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8 max-w-4xl">

                {/* Toast message */}
                {message && (
                    <div className="mb-6 px-4 py-3 rounded-xl
            bg-emerald-500/10 border border-emerald-500/20
            text-emerald-400 text-sm">
                        {message}
                    </div>
                )}

                {/* PROFILE SECTION */}
                {active === 'profile' && (
                    <div>
                        <h1 className="text-2xl font-bold mb-8">Profile</h1>

                        <div className="bg-white/[0.03] border border-white/[0.08]
              rounded-2xl p-8 mb-6">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-full
                  bg-emerald-500/20 border-2 border-emerald-500/30
                  flex items-center justify-center text-xl font-bold
                  text-emerald-400">
                                    {initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">
                                        {profileData.name || 'No name set'}
                                    </p>
                                    <p className="text-white/50 text-sm">
                                        {profileData.email}
                                    </p>
                                    <p className="text-white/30 text-xs mt-1">
                                        Member since {new Date(
                                            user?.metadata?.creationTime
                                        ).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm text-white/60">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={e => setProfileData(
                                            p => ({ ...p, name: e.target.value }))}
                                        className="px-4 py-3 rounded-xl
                      bg-white/[0.06] border border-white/[0.12]
                      text-white outline-none transition-all
                      focus:border-emerald-500/70
                      focus:ring-2 focus:ring-emerald-500/20"/>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm text-white/60">
                                        Email (cannot change)
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="px-4 py-3 rounded-xl
                      bg-white/[0.03] border border-white/[0.06]
                      text-white/40 outline-none cursor-not-allowed"/>
                                </div>
                                <button
                                    onClick={saveProfile}
                                    disabled={saving}
                                    className="w-full py-3.5 rounded-xl 
                    font-bold text-base text-black 
                    bg-emerald-500 hover:bg-emerald-400
                    disabled:opacity-60 transition-all">
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>

                                {message && (
                                    <p className={`text-sm mt-3 text-center font-medium
                    ${message.includes('success')
                                            ? 'text-emerald-400'
                                            : 'text-red-400'}`}>
                                        {message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* HEALTH DATA SECTION */}
                {active === 'health' && (
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Health Activity
                        </h1>
                        <p className="text-white/50 text-sm mb-6">
                            Every step counts. VitalScan monitors your movement, rewards consistency, and turns daily habits into real health progress.
                        </p>

                        <StepTracker user={user} />

                        <div className="mt-8 bg-emerald-500/5 
                            border border-emerald-500/20 
                            rounded-2xl p-6 text-center">
                            <p className="text-3xl mb-3">🚀</p>
                            <h3 className="font-bold text-lg mb-2">
                                Full Health Assessment
                            </h3>
                            <p className="text-white/50 text-sm mb-5">
                                Get AI-powered risk scores for Heart Disease, Diabetes and Obesity in just 3 minutes.
                            </p>
                            <button
                                onClick={() => navigate('/form')}
                                className="px-8 py-3 rounded-xl 
                                    font-bold text-black bg-emerald-500 
                                    hover:bg-emerald-400 transition-all">
                                Start Full Assessment →
                            </button>
                        </div>
                    </div>
                )}

                {/* FAMILY ALERTS SECTION */}
                {active === 'family' && (
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Family Alerts</h1>
                        <p className="text-white/50 text-sm mb-8">
                            When your risk score exceeds thresholds, these contacts
                            receive automatic email alerts.
                        </p>

                        {/* Add contact form */}
                        <div className="bg-white/[0.03] border border-white/[0.08]
              rounded-2xl p-6 mb-6">
                            <h3 className="font-semibold mb-4">Add Emergency Contact</h3>
                            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="Contact name"
                                    value={newContact.name}
                                    onChange={e => setNewContact(
                                        c => ({ ...c, name: e.target.value }))}
                                    className="flex-1 px-4 py-3 rounded-xl
                    bg-white/[0.06] border border-white/[0.12]
                    text-white placeholder-white/30 outline-none
                    focus:border-emerald-500/70"/>
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={newContact.email}
                                    onChange={e => setNewContact(
                                        c => ({ ...c, email: e.target.value }))}
                                    className="flex-1 px-4 py-3 rounded-xl
                    bg-white/[0.06] border border-white/[0.12]
                    text-white placeholder-white/30 outline-none
                    focus:border-emerald-500/70"/>
                            </div>
                            <button onClick={addContact}
                                className="flex items-center gap-2 px-5 py-2.5
                  rounded-xl bg-emerald-500 hover:bg-emerald-400
                  text-black font-semibold text-sm transition-all">
                                <Plus size={16} />
                                Add Contact
                            </button>
                            {contactMessage && (
                                <p className={`text-sm mt-3 font-medium
                  ${contactMessage.includes('success')
                                        ? 'text-emerald-400'
                                        : 'text-red-400'}`}>
                                    {contactMessage}
                                </p>
                            )}
                        </div>

                        {/* Contacts list */}
                        <div className="flex flex-col gap-3">
                            {familyContacts.length === 0 ? (
                                <div className="bg-white/[0.02] border border-white/[0.06]
                  rounded-2xl p-8 text-center text-white/40 text-sm">
                                    No contacts added yet. Add family members above
                                    to receive health alerts.
                                </div>
                            ) : (
                                familyContacts.map(contact => (
                                    <div key={contact.id}
                                        className="bg-white/[0.03] border border-white/[0.08]
                      rounded-xl px-5 py-4 flex items-center
                      justify-between">
                                        <div>
                                            <p className="font-medium">{contact.name}</p>
                                            <p className="text-white/50 text-sm">
                                                {contact.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeContact(contact.id)}
                                            className="text-red-400/60 hover:text-red-400
                        transition-colors p-2 rounded-lg
                        hover:bg-red-500/10">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}


            </main>
        </div>
    )
}
