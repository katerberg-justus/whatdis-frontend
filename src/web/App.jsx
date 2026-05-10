import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import ChallengesPage from './features/challenges/pages/ChallengesPage'
import GamePage from './features/games/pages/GamePage'
import BattlesPage from './features/battles/pages/BattlesPage'
import BattlePage from './features/battles/pages/BattlePage'
import AccountPage from './features/account/pages/AccountPage'
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
      <main className={isAuth ? 'main-content main-content--full' : 'main-content'}>
        <Routes>
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/:challengeId/games/:gameId" element={<GamePage />} />
          <Route path="/battles" element={<BattlesPage />} />
          <Route path="/challenges/:challengeId/battle/:battleId" element={<BattlePage />} />
          <Route path="/account" element={<AccountPage />} />
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
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
