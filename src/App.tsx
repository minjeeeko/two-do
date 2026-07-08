import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { BottomNav } from './components/BottomNav'
import { OnboardingFlow } from './pages/onboarding/OnboardingFlow'
import { Home } from './pages/Home'
import { Missions } from './pages/Missions'
import { MissionForm } from './pages/MissionForm'
import { MissionDetail } from './pages/MissionDetail'
import { Garden } from './pages/Garden'
import { Mailbox } from './pages/Mailbox'
import { Me } from './pages/Me'
import { PrivacySettings } from './pages/PrivacySettings'
import { NotificationSettings } from './pages/NotificationSettings'
import { CoupleManage } from './pages/CoupleManage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { RewardsPage } from './pages/RewardsPage'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallPrompt } from './components/InstallPrompt'

const NO_NAV_PREFIXES = ['/missions/new', '/me/']

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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/missions/new" element={<MissionForm />} />
          <Route path="/missions/:id" element={<MissionDetail />} />
          <Route path="/missions/:id/edit" element={<MissionForm />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/mailbox" element={<Mailbox />} />
          <Route path="/me" element={<Me />} />
          <Route path="/me/privacy" element={<PrivacySettings />} />
          <Route path="/me/notifications" element={<NotificationSettings />} />
          <Route path="/me/couple" element={<CoupleManage />} />
          <Route path="/me/policy" element={<PrivacyPolicy />} />
          <Route path="/me/rewards" element={<RewardsPage />} />
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
