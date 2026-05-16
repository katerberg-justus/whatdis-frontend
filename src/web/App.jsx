import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { EnergyProvider } from './context/EnergyContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { NotificationProvider } from './context/NotificationContext'
import { BattlesProvider } from './context/BattlesContext'
import { FriendsProvider } from './context/FriendsContext'
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
import PickBattlePackPage from './features/battles/pages/PickBattlePackPage'
import PickBattleChallengePage from './features/battles/pages/PickBattleChallengePage'
import CollectiblesLayout from './features/collectibles/pages/CollectiblesLayout'
import StickersPage from './features/collectibles/pages/StickersPage'
import AchievementsPage from './features/collectibles/pages/AchievementsPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import HowToPlayDemoPage from './features/howtoplay/HowToPlayDemoPage'
import { TourProvider } from './components/Tour'

const AUTH_ROUTES = ['/login', '/register']

function Layout() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const mustLogin = !user && localStorage.getItem('logged_out') === '1'

  if (mustLogin && pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

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
          <Route path="/battles/new/:friendshipId" element={<PickBattlePackPage />} />
          <Route path="/battles/new/:friendshipId/packs/:packId" element={<PickBattleChallengePage />} />
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
          <Route path="/how-to-play/demo" element={<HowToPlayDemoPage />} />
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
                <NotificationProvider>
                  <BattlesProvider>
                    <FriendsProvider>
                      <TourProvider>
                        <Layout />
                      </TourProvider>
                    </FriendsProvider>
                  </BattlesProvider>
                </NotificationProvider>
              </EnergyProvider>
            </SubscriptionProvider>
          </CurrencyProvider>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
