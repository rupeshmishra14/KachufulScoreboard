import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, UserPlus, UserMinus, Trash2, Moon, Sun, Crown, Frown, Shuffle } from 'lucide-react';

const Button = ({ children, onClick, className, variant = 'primary', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-colors duration-200 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    success: "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300",
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const KachufulScoreboard = () => {
  const [players, setPlayers] = useState([]);
  const [round, setRound] = useState(1);
  const [set, setSet] = useState(1);
  const [cardCount, setCardCount] = useState(8);
  const [trumpSuit, setTrumpSuit] = useState('♠');
  const [gameActive, setGameActive] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isScoreCalculated, setIsScoreCalculated] = useState(false);
  const [previousScores, setPreviousScores] = useState([]);

  const trumpColors = {
    '♠': 'text-gray-800 dark:text-gray-200',
    '♥': 'text-red-600 dark:text-red-400',
    '♦': 'text-red-600 dark:text-red-400',
    '♣': 'text-gray-800 dark:text-gray-200'
  };

  useEffect(() => {
    const savedState = localStorage.getItem('kachufulState');
    if (savedState) {
      const { players, round, trumpSuit, gameActive, gameHistory, pastGames, isDarkMode } = JSON.parse(savedState);
      setPlayers(players);
      setRound(round);
      setTrumpSuit(trumpSuit);
      setGameActive(gameActive);
      setGameHistory(gameHistory || []);
      setPastGames(pastGames || []);
      setIsDarkMode(isDarkMode || false);
    } else {
      startNewGame();
    }
    
    // Apply dark mode on initial load
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  useEffect(() => {
    if (gameActive) {
      localStorage.setItem('kachufulState', JSON.stringify({ players, round, trumpSuit, gameActive, gameHistory, pastGames, isDarkMode }));
    }
  }, [players, round, trumpSuit, gameActive, gameHistory, pastGames, isDarkMode]);

  const startNewGame = () => {
    setPlayers([
      { name: 'Rupesh', score: 0, bid: 0, tricks: 0 },
      { name: 'Saurav', score: 0, bid: 0, tricks: 0 },
      { name: 'Nirav', score: 0, bid: 0, tricks: 0 },
      { name: 'Sandeep', score: 0, bid: 0, tricks: 0 },
      { name: 'Sudarshan', score: 0, bid: 0, tricks: 0 },
    ]);
    setRound(1);
    setSet(1);
    setCardCount(8);
    setTrumpSuit('♠');
    setGameActive(true);
    setGameEnded(false);
    setWinner(null);
    setGameHistory([]);
    localStorage.removeItem('kachufulState');
  };

  const updatePlayer = (index, field, value) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      return newPlayers;
    });
    if (isScoreCalculated) {
      // If scores were already calculated, we need to recalculate
      recalculateScores();
    } else {
      setIsScoreCalculated(false);
    }
  };

  const calculatePlayerScore = (player, previousScore) => {
    return player.bid === player.tricks ? previousScore + 10 + player.bid : previousScore;
  };

  const calculateScore = () => {
    setPreviousScores(players.map(player => player.score));
    const updatedPlayers = players.map(player => ({
      ...player,
      score: calculatePlayerScore(player, player.score)
    }));
    setPlayers(updatedPlayers);
    setIsScoreCalculated(true);
  };

  const recalculateScores = () => {
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      score: calculatePlayerScore(player, previousScores[index])
    }));
    setPlayers(updatedPlayers);
    setIsScoreCalculated(true);
  };

  const rotatePlayers = () => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const firstPlayer = newPlayers.shift();
      newPlayers.push(firstPlayer);
      return newPlayers;
    });
  };

  const nextRound = () => {
    setGameHistory(prev => [...prev, { round, set, cardCount, players, trumpSuit }]);
    
    if (round % 8 === 0) {
      // End of a set
      setSet(prevSet => prevSet + 1);
      setRound(1);
      setCardCount(8);
    } else {
      setRound(prevRound => prevRound + 1);
      setCardCount(prevCount => prevCount - 1);
    }
    
    const suits = ['♠', '♥', '♦', '♣'];
    setTrumpSuit(suits[round % 4]);
    
    // Reset bid and tricks, then rotate players
    const resetPlayers = players.map(player => ({ ...player, bid: 0, tricks: 0 }));
    setPlayers(resetPlayers);
    rotatePlayers();
    setIsScoreCalculated(false);
  };

  const addPlayer = () => {
    if (players.length < 7) {
      setPlayers(prevPlayers => [...prevPlayers, { name: `Player ${prevPlayers.length + 1}`, score: 0, bid: 0, tricks: 0 }]);
    } else {
      alert("Maximum number of players (7) reached!");
    }
  };

  const removePlayer = (index) => {
    if (players.length > 2) {
      setPlayers(prevPlayers => prevPlayers.filter((_, i) => i !== index));
    } else {
      alert("Minimum of 2 players required!");
    }
  };

  const deletePastGame = (gameId) => {
    if (window.confirm("Are you sure you want to delete this past game?")) {
      setPastGames(prevGames => prevGames.filter(game => game.id !== gameId));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const getLeadingScore = useCallback(() => {
    return players.length > 0 ? Math.max(...players.map(player => player.score)) : 0;
  }, [players]);

  const getLosingScore = useCallback(() => {
    return players.length > 0 ? Math.min(...players.map(player => player.score)) : 0;
  }, [players]);

  const updatePlayerName = (index, newName, historyIndex = -1) => {
    if (historyIndex === -1) {
      // Update current players
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[index] = { ...newPlayers[index], name: newName };
        return newPlayers;
      });
    } else {
      // Update game history
      setGameHistory(prevHistory => {
        const newHistory = [...prevHistory];
        newHistory[historyIndex].players[index].name = newName;
        return newHistory;
      });
    }
  };

  const updatePastGamePlayerName = (gameIndex, playerIndex, newName) => {
    setPastGames(prevGames => {
      const newGames = [...prevGames];
      newGames[gameIndex].players[playerIndex].name = newName;
      newGames[gameIndex].rounds.forEach(round => {
        round.players[playerIndex].name = newName;
      });
      return newGames;
    });
  };

  const renderPlayerName = (player, index, isLeading, isLosing, isEditable, updateNameFunction) => (
    <div className="flex items-center">
      {isEditable ? (
        <input
          value={player.name}
          onChange={(e) => updateNameFunction(index, e.target.value)}
          className="font-semibold mr-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
        />
      ) : (
        <span className="font-semibold mr-2">{player.name}</span>
      )}
      {round > 1 && isLeading && <Crown className="h-5 w-5 text-yellow-500 animate-bounce" />}
      {round > 1 && isLosing && <Frown className="h-5 w-5 text-red-500 animate-pulse" />}
      {index === 0 && <span className="ml-2 text-xs font-semibold text-purple-600 dark:text-purple-400">(First Bid)</span>}
      {index === players.length - 1 && <span className="ml-2 text-xs font-semibold text-orange-600 dark:text-orange-400">(Dealer)</span>}
    </div>
  );

  const endGame = () => {
    if (window.confirm("Are you sure you want to end the game?")) {
      const finalScores = players.map(player => ({
        ...player,
        score: calculatePlayerScore(player, player.score)
      }));
      const maxScore = Math.max(...finalScores.map(player => player.score));
      const winners = finalScores.filter(player => player.score === maxScore);
      
      setPlayers(finalScores);
      setWinner(winners);
      setGameEnded(true);
      
      const finalGameState = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        players: finalScores,
        rounds: [...gameHistory, { round, set, cardCount, players: finalScores, trumpSuit }]
      };
      setPastGames(prev => [...prev, finalGameState]);
      
      localStorage.removeItem('kachufulState');
    }
  };

  const getCardSuit = (index) => {
    const suits = ['♠', '♥', '♦', '♣'];
    return suits[index % suits.length];
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return <span className="text-2xl mr-2" role="img" aria-label="Gold Medal">🥇</span>;
      case 2: return <span className="text-2xl mr-2" role="img" aria-label="Silver Medal">🥈</span>;
      case 3: return <span className="text-2xl mr-2" role="img" aria-label="Bronze Medal">🥉</span>;
      default: return null;
    }
  };

  if (!gameActive && !gameEnded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Button onClick={startNewGame} variant="primary" className="text-xl py-4 px-8">
          Start New Game
        </Button>
      </div>
    );
  }

  if (gameEnded) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    let currentRank = 1;
    let prevScore = null;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 dark:from-purple-900 dark:to-blue-900 text-white p-4">
        <h1 className="text-6xl font-bold mb-8 text-center text-yellow-300 animate-bounce">
          Game Over!
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 max-w-3xl w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-rainbow animate-rainbow"></div>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Final Scores
          </h2>
          <ul className="space-y-4">
            {sortedPlayers.map((player, index) => {
              if (player.score !== prevScore) {
                currentRank = index + 1;
              }
              prevScore = player.score;

              return (
                <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    {getMedalIcon(currentRank)}
                    {currentRank > 3 && (
                      <div className="h-8 w-8 flex items-center justify-center mr-2 text-2xl">
                        {getCardSuit(index)}
                      </div>
                    )}
                    <span className="text-xl font-semibold text-gray-800 dark:text-white">{player.name}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{player.score}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Button onClick={startNewGame} variant="primary" className="text-xl py-4 px-8 bg-green-500 hover:bg-green-600 transition-colors duration-300 transform hover:scale-105">
          Start New Game
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-4 max-w-4xl mx-auto min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <h1 className="text-4xl font-bold mb-6 text-center">Kachuful Scoreboard</h1>
      <div className={`rounded-lg shadow-md p-6 mb-6 bg-white dark:bg-gray-800`}>
        {/* Player order information - Moved up */}
        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-800 dark:text-blue-200">
          <p className="text-center font-semibold">
            <span className="mr-2">🎭</span>
            {players[0]?.name} starts bidding
            <span className="mx-2">•</span>
            <Shuffle className="inline-block h-5 w-5 mr-1" />
            {players[players.length - 1]?.name} shuffles & deals
          </p>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Set: <span className="text-blue-600 dark:text-blue-400">{set}</span></div>
            <div className="text-lg font-semibold">Round: <span className="text-blue-600 dark:text-blue-400">{round}/8</span></div>
            <div className="text-lg font-semibold">Cards: <span className="text-blue-600 dark:text-blue-400">{cardCount}</span></div>
            <div className="text-lg font-semibold">Trump: <span className={`text-2xl ${trumpColors[trumpSuit]}`}>{trumpSuit}</span></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isScoreCalculated ? (
              <Button onClick={nextRound} variant="primary">Next Round</Button>
            ) : (
              <Button onClick={calculateScore} variant="success">Calculate Score</Button>
            )}
            {round <= 2 && (
              <Button onClick={addPlayer} variant="secondary">
                <UserPlus className="mr-2 h-4 w-4" /> Add Player
              </Button>
            )}
            <Button onClick={endGame} variant="danger">
              End Game
            </Button>
            <Button onClick={toggleDarkMode} variant="secondary">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Table view for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Player</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Score</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Bid</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Tricks</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const isLeading = player.score === getLeadingScore() && round > 1;
                const isLosing = player.score === getLosingScore() && round > 1;
                return (
                  <tr key={index} className={`border-b border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isLeading ? 'bg-green-100 dark:bg-green-900' : 
                    isLosing ? 'bg-red-100 dark:bg-red-900' : ''
                  }`}>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      {renderPlayerName(
                        player, 
                        index, 
                        isLeading, 
                        isLosing, 
                        round <= 2, 
                        updatePlayerName
                      )}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold text-lg">
                      {player.score}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Button onClick={() => updatePlayer(index, 'bid', Math.max(0, player.bid - 1))} variant="secondary">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-8 text-center">{player.bid}</span>
                        <Button onClick={() => updatePlayer(index, 'bid', player.bid + 1)} variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Button onClick={() => updatePlayer(index, 'tricks', Math.max(0, player.tricks - 1))} variant="secondary">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-8 text-center">{player.tricks}</span>
                        <Button onClick={() => updatePlayer(index, 'tricks', player.tricks + 1)} variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">
                      <Button onClick={() => removePlayer(index)} variant="danger">
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card view for mobile screens */}
        <div className="md:hidden space-y-4">
          {players.map((player, index) => {
            const isLeading = player.score === getLeadingScore() && round > 1;
            const isLosing = player.score === getLosingScore() && round > 1;
            return (
              <div key={index} className={`p-4 rounded-lg shadow ${
                isLeading ? 'bg-green-100 dark:bg-green-900' : 
                isLosing ? 'bg-red-100 dark:bg-red-900' : 
                'bg-gray-50 dark:bg-gray-700'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  {renderPlayerName(
                    player, 
                    index, 
                    isLeading, 
                    isLosing, 
                    round <= 2, 
                    updatePlayerName
                  )}
                  <Button onClick={() => removePlayer(index)} variant="danger" className="ml-2">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-bold ${
                    isLeading ? 'text-green-600 dark:text-green-400' : 
                    isLosing ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    Score: {player.score}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Bid:</span>
                    <Button onClick={() => updatePlayer(index, 'bid', Math.max(0, player.bid - 1))} variant="secondary">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">{player.bid}</span>
                    <Button onClick={() => updatePlayer(index, 'bid', player.bid + 1)} variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <span className="font-semibold mr-2">Tricks:</span>
                  <Button onClick={() => updatePlayer(index, 'tricks', Math.max(0, player.tricks - 1))} variant="secondary">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{player.tricks}</span>
                  <Button onClick={() => updatePlayer(index, 'tricks', player.tricks + 1)} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 ${activeTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} rounded-l-lg`}
          >
            Current Game
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 ${activeTab === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} rounded-r-lg`}
          >
            Past Games
          </button>
        </div>
        
        {activeTab === 'current' ? (
          <div>
            <h2 className="text-xl font-bold mb-2">Current Game History</h2>
            {gameHistory.length === 0 ? (
              <p>No rounds played yet in the current game.</p>
            ) : (
              <div className="space-y-4">
                {gameHistory.map((history, historyIndex) => (
                  <div key={historyIndex} className="border border-gray-300 dark:border-gray-600 p-2 rounded">
                    <h3 className="font-bold">Set {history.set}, Round {history.round}</h3>
                    <p>Cards: {history.cardCount}, Trump: <span className={trumpColors[history.trumpSuit]}>{history.trumpSuit}</span></p>
                    <ul>
                      {history.players.map((player, playerIndex) => {
                        const isLeading = player.score === Math.max(...history.players.map(p => p.score));
                        const isLosing = player.score === Math.min(...history.players.map(p => p.score));
                        return (
                          <li key={playerIndex} className={`${
                            isLeading ? 'text-green-600 dark:text-green-400' : 
                            isLosing ? 'text-red-600 dark:text-red-400' : ''
                          }`}>
                            {renderPlayerName(player, playerIndex, isLeading, isLosing, false, () => {})}
                            Score: {player.score}, Bid: {player.bid}, Tricks: {player.tricks}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-2">Past Games</h2>
            {pastGames.length === 0 ? (
              <p>No past games available.</p>
            ) : (
              <div className="space-y-4">
                {pastGames.map((game, gameIndex) => (
                  <div key={game.id} className="border border-gray-300 dark:border-gray-600 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Game {gameIndex + 1} - {game.date}</h3>
                      <Button onClick={() => deletePastGame(game.id)} variant="danger">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p>Final Scores:</p>
                    <ul>
                      {game.players.map((player, playerIndex) => {
                        const isLeading = player.score === Math.max(...game.players.map(p => p.score));
                        const isLosing = player.score === Math.min(...game.players.map(p => p.score));
                        return (
                          <li key={playerIndex} className={`${
                            isLeading ? 'text-green-600 dark:text-green-400' : 
                            isLosing ? 'text-red-600 dark:text-red-400' : ''
                          }`}>
                            {renderPlayerName(player, playerIndex, isLeading, isLosing, false, () => {})}
                            {player.score}
                          </li>
                        );
                      })}
                    </ul>
                    <details>
                      <summary className="cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View Game Details</summary>
                      <div className="mt-2">
                        {game.rounds.map((round, roundIndex) => (
                          <div key={roundIndex} className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                            <h4 className="font-semibold">Set {round.set}, Round {round.round}</h4>
                            <p>Cards: {round.cardCount}, Trump: <span className={trumpColors[round.trumpSuit]}>{round.trumpSuit}</span></p>
                            <ul>
                              {round.players.map((player, playerIndex) => {
                                const isLeading = player.score === Math.max(...round.players.map(p => p.score));
                                const isLosing = player.score === Math.min(...round.players.map(p => p.score));
                                return (
                                  <li key={playerIndex} className={`${
                                    isLeading ? 'text-green-600 dark:text-green-400' : 
                                    isLosing ? 'text-red-600 dark:text-red-400' : ''
                                  }`}>
                                    {renderPlayerName(player, playerIndex, isLeading, isLosing, false, () => {})}
                                    Score: {player.score}, Bid: {player.bid}, Tricks: {player.tricks}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KachufulScoreboard;