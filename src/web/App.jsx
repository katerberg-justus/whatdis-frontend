import { BrowserRouter, Routes, Route } from 'react-router'
import Nav from './components/Nav'
import ChallengesPage from './features/challenges/pages/ChallengesPage'
import GamePage from './features/games/pages/GamePage'
import BattlesPage from './features/battles/pages/BattlesPage'
import BattlePage from './features/battles/pages/BattlePage'
import AccountPage from './features/account/pages/AccountPage'
import PackChallengesPage from './features/packs/pages/PackChallengesPage'

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main className="main-content">
      <Routes>
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/challenges/:challengeId/games/:gameId" element={<GamePage />} />
        <Route path="/battles" element={<BattlesPage />} />
        <Route path="/challenges/:challengeId/battle/:battleId" element={<BattlePage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/packs/:packId/challenges" element={<PackChallengesPage />} />
      </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
