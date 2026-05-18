export const qk = {
  me:               ['me'],
  subscription:     ['me', 'subscription'],
  nrgBoosters:      ['nrg-boosters'],
  myAchievements:   ['me', 'achievements'],
  achievements:     ['achievements'],

  battles:          ['battles'],
  battle:           (id) => ['battle', String(id)],
  battlePackChallenges: (packId, opponentId) =>
    ['battle-pack-challenges', String(packId), String(opponentId)],

  friends:          ['friends'],
  friendRequests:   ['friend-requests'],

  games:            ['games'],
  game:             (id) => ['game', String(id)],
  guesses:          (gameId) => ['guesses', String(gameId)],

  packs:            ['challenge-packs'],
  pack:             (id) => ['challenge-pack', String(id)],
  packChallenges:   (id) => ['challenge-pack', String(id), 'challenges'],
  daily:            ['daily'],

  myCustomChallenges: ['me', 'custom-challenges'],
  customChallenge:    (id) => ['custom-challenge', String(id)],
}
