import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { EnergyProvider } from './context/EnergyContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import Nav from './components/Nav'
import StatusBar from './components/StatusBar'
import ChallengesPage from './features/challenges/pages/ChallengesPage'
import GamePage from './features/games/pages/GamePage'
import BattlesPage from './features/battles/pages/BattlesPage'
import BattlePage from './features/battles/pages/BattlePage'
import AccountLayout from './features/account/pages/AccountLayout'
import ProfilePage from './features/account/pages/ProfilePage'
import SettingsPage from './features/account/pages/SettingsPage'
import PackChallengesPage from './features/packs/pages/PackChallengesPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'

const AUTH_ROUTES = ['/login', '/register']

function Layout() {
  const { pathname } = useLocation()
  const isAuth = AUTH_ROUTES.includes(pathname)

  return (
    <>
      {!isAuth && <Nav />}
      {!isAuth && <StatusBar />}
      <main className={isAuth ? 'main-content main-content--full' : 'main-content'}>
        <Routes>
          <Route index element={<Navigate to="/challenges" replace />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/:challengeId/games/:gameId" element={<GamePage />} />
          <Route path="/games/:gameId" element={<GamePage />} />
          <Route path="/battles" element={<BattlesPage />} />
          <Route path="/challenges/:challengeId/battle/:battleId" element={<BattlePage />} />
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/packs/:packId/challenges" element={<PackChallengesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <SubscriptionProvider>
            <EnergyProvider>
              <Layout />
            </EnergyProvider>
          </SubscriptionProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
