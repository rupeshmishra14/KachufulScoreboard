import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, UserPlus, UserMinus, Trash2, Moon, Sun, Crown, Frown } from 'lucide-react';

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
  const [trumpSuit, setTrumpSuit] = useState('♠');
  const [gameActive, setGameActive] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    if (gameActive) {
      const finalGameState = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        players: players.map(({ name, score }) => ({ name, score })),
        rounds: [...gameHistory, { round, players, trumpSuit }]
      };
      setPastGames(prev => [...prev, finalGameState]);
    }
    
    setPlayers([
      { name: 'Player 1', score: 0, bid: 0, tricks: 0 },
      { name: 'Player 2', score: 0, bid: 0, tricks: 0 },
      { name: 'Player 3', score: 0, bid: 0, tricks: 0 },
    ]);
    setRound(1);
    setTrumpSuit('♠');
    setGameActive(true);
    setGameHistory([]);
    localStorage.removeItem('kachufulState');
  };

  const updatePlayer = (index, field, value) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      return newPlayers;
    });
  };

  const calculateAllScores = () => {
    return players.map(player => ({
      ...player,
      score: player.bid === player.tricks ? player.score + 10 + player.bid : player.score
    }));
  };

  const nextRound = () => {
    const updatedPlayers = calculateAllScores();
    setPlayers(updatedPlayers);
    setGameHistory(prev => [...prev, { round, players: updatedPlayers, trumpSuit }]);
    setRound(prevRound => prevRound + 1);
    const suits = ['♠', '♥', '♦', '♣'];
    setTrumpSuit(suits[round % 4]);
    setPlayers(updatedPlayers.map(player => ({ ...player, bid: 0, tricks: 0 })));
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
    return Math.max(...players.map(player => player.score));
  }, [players]);

  const getLosingScore = useCallback(() => {
    return Math.min(...players.map(player => player.score));
  }, [players]);

  const renderPlayerName = (player, index, isLeading, isLosing) => (
    <div className="flex items-center">
      <input
        value={player.name}
        onChange={(e) => updatePlayer(index, 'name', e.target.value)}
        className="font-semibold mr-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
      />
      {round > 1 && (
        <>
          {isLeading && (
            <Crown className="h-5 w-5 text-yellow-500 animate-bounce" />
          )}
          {isLosing && (
            <Frown className="h-5 w-5 text-red-500 animate-pulse" />
          )}
        </>
      )}
    </div>
  );

  if (!gameActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Button onClick={startNewGame} variant="primary" className="text-xl py-4 px-8">
          Start New Game
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-4 max-w-4xl mx-auto min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <h1 className="text-4xl font-bold mb-6 text-center">Kachuful Scoreboard</h1>
      <div className={`rounded-lg shadow-md p-6 mb-6 bg-white dark:bg-gray-800`}>
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Round: <span className="text-blue-600 dark:text-blue-400">{round}</span></div>
            <div className="text-lg font-semibold">Trump: <span className={`text-2xl ${trumpColors[trumpSuit]}`}>{trumpSuit}</span></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={nextRound} variant="primary">Next Round</Button>
            <Button onClick={addPlayer} variant="secondary">
              <UserPlus className="mr-2 h-4 w-4" /> Add Player
            </Button>
            <Button onClick={startNewGame} variant="success">
              New Game
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
                      {renderPlayerName(player, index, isLeading, isLosing)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold text-lg">{player.score}</td>
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
                  {renderPlayerName(player, index, isLeading, isLosing)}
                  <Button onClick={() => removePlayer(index)} variant="danger" className="ml-2">
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Score: {player.score}</span>
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
                {gameHistory.map((history, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 p-2 rounded">
                    <h3 className="font-bold">Round {history.round}</h3>
                    <p>Trump: <span className={trumpColors[history.trumpSuit]}>{history.trumpSuit}</span></p>
                    <ul>
                      {history.players.map((player, playerIndex) => {
                        const isLeading = player.score === Math.max(...history.players.map(p => p.score)) && history.round > 1;
                        const isLosing = player.score === Math.min(...history.players.map(p => p.score)) && history.round > 1;
                        return (
                          <li key={playerIndex} className={`${
                            isLeading ? 'text-green-600 dark:text-green-400' : 
                            isLosing ? 'text-red-600 dark:text-red-400' : ''
                          }`}>
                            {renderPlayerName(player, playerIndex, isLeading, isLosing)}
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
                {pastGames.map((game, index) => (
                  <div key={game.id} className="border border-gray-300 dark:border-gray-600 p-2 rounded">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Game {index + 1} - {game.date}</h3>
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
                            {renderPlayerName(player, playerIndex, isLeading, isLosing)} {player.score}
                          </li>
                        );
                      })}
                    </ul>
                    <details>
                      <summary className="cursor-pointer text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">View Game Details</summary>
                      <div className="mt-2">
                        {game.rounds.map((round, roundIndex) => (
                          <div key={roundIndex} className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                            <h4 className="font-semibold">Round {round.round}</h4>
                            <p>Trump: <span className={trumpColors[round.trumpSuit]}>{round.trumpSuit}</span></p>
                            <ul>
                              {round.players.map((player, playerIndex) => {
                                const isLeading = player.score === Math.max(...round.players.map(p => p.score));
                                const isLosing = player.score === Math.min(...round.players.map(p => p.score));
                                return (
                                  <li key={playerIndex} className={`${
                                    isLeading ? 'text-green-600 dark:text-green-400' : 
                                    isLosing ? 'text-red-600 dark:text-red-400' : ''
                                  }`}>
                                    {renderPlayerName(player, playerIndex, isLeading, isLosing)}
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