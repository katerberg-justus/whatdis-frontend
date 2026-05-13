import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { EnergyProvider } from './context/EnergyContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import Nav from './components/Nav'
import StatusBar from './components/StatusBar'
import ChallengesPage from './features/challenges/pages/ChallengesPage'
import GamePage from './features/games/pages/GamePage'
import BattlesLayout from './features/battles/pages/BattlesLayout'
import BattlesPage from './features/battles/pages/BattlesPage'
import FriendsPage from './features/battles/pages/FriendsPage'
import BattlesHistoryPage from './features/battles/pages/BattlesHistoryPage'
import BattlePage from './features/battles/pages/BattlePage'
import FriendPage from './features/battles/pages/FriendPage'
import AccountLayout from './features/account/pages/AccountLayout'
import ProfilePage from './features/account/pages/ProfilePage'
import SettingsPage from './features/account/pages/SettingsPage'
import SubscriptionPage from './features/account/pages/SubscriptionPage'
import PackChallengesPage from './features/packs/pages/PackChallengesPage'
import CollectiblesLayout from './features/collectibles/pages/CollectiblesLayout'
import StickersPage from './features/collectibles/pages/StickersPage'
import AchievementsPage from './features/collectibles/pages/AchievementsPage'
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
          <Route path="/battles" element={<BattlesLayout />}>
            <Route index element={<BattlesPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="history" element={<BattlesHistoryPage />} />
          </Route>
          <Route path="/battles/:battleId" element={<BattlePage />} />
          <Route path="/friends/:friendshipId" element={<FriendPage />} />
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>
          <Route path="/packs/:packId/challenges" element={<PackChallengesPage />} />
          <Route path="/collectibles" element={<CollectiblesLayout />}>
            <Route index element={<StickersPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
          </Route>
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
          <CurrencyProvider>
            <SubscriptionProvider>
              <EnergyProvider>
                <Layout />
              </EnergyProvider>
            </SubscriptionProvider>
          </CurrencyProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
