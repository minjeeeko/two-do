import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { BottomNav } from './components/BottomNav'
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow'
import { Home } from './pages/Home'
import { Chores } from './pages/Chores'
import { Mailbox } from './pages/Mailbox'
import { Me } from './pages/Me'
import { ProfileEdit } from './pages/ProfileEdit'
import { Report } from './pages/Report'
import { CoupleManage } from './pages/CoupleManage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallPrompt } from './components/InstallPrompt'

const NO_NAV_PREFIXES = ['/me/']

function Shell() {
  const location = useLocation()
  const onboarded = useAppStore((s) => s.onboarded)
  const coupleStatus = useAppStore((s) => s.couple?.status)
  const hideNav = NO_NAV_PREFIXES.some((p) => location.pathname.startsWith(p))

  if (!onboarded) return <OnboardingFlow />

  if (coupleStatus === 'disconnected') {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <CoupleManage />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <OfflineBanner />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/mailbox" element={<Mailbox />} />
          <Route path="/me" element={<Me />} />
          <Route path="/me/profile" element={<ProfileEdit />} />
          <Route path="/me/report" element={<Report />} />
          <Route path="/me/couple" element={<CoupleManage />} />
          <Route path="/me/policy" element={<PrivacyPolicy />} />
          <Route path="/onboarding" element={<OnboardingReplay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
      <InstallPrompt />
    </div>
  )
}

function OnboardingReplay() {
  const resetToOnboarding = useAppStore((s) => s.resetToOnboarding)
  useEffect(() => {
    resetToOnboarding()
  }, [resetToOnboarding])
  return null
}

function App() {
  const hydrated = useAppStore((s) => s.hydrated)

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-paper">
        <span className="font-display text-3xl text-brand">DOMO</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="mx-auto w-full max-w-md flex flex-col flex-1 min-h-0 bg-paper">
        <Shell />
      </div>
    </BrowserRouter>
  )
}

export default App
