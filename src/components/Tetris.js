import React, { useState } from 'react';
import { StyledTetrisWrapper, StyledTetris } from './styles/StyledTetris';
import { createStage, checkCollision } from '../gameHelpers';
import ReactTouchEvents from "react-touch-events";

import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

//document.body.style.overflow = "hidden"

const Tetris = () => {
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(
    rowsCleared
  );

  console.log('re-render');

  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver) {
      // Activate the interval again when user releases down arrow.
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1));
      }
    }
  };

  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setScore(0);
    setLevel(0);
    setRows(0);
    setGameOver(false);
    //document.getElementById("test").focus();
  };

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game over!
      if (player.pos.y < 1) {
        console.log('GAME OVER!!!');
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const dropPlayer = () => {
    // We don't need to run the interval when we use the arrow down to
    // move the tetromino downwards. So deactivate it for now.
    setDropTime(null);
    drop();
  };

  // This one starts the game
  // Custom hook by Dan Abramov
  useInterval(() => {
    drop();
  }, dropTime);

  const move = ({ keyCode }) => {
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        playerRotate(stage, 1);
        console.log('focused: ', document.activeElement);
      }
    }
  };

  const handleTap = () => {
    startGame();
  }

  const handleSwipe = (direction) => {

    switch (direction) {
      case "top":
        playerRotate(stage, 1);
        break;
      case "bottom":
        dropPlayer();
        break;
      case "left":
        movePlayer(-1);
        break;
      case "right":
        movePlayer(1);
        break;
    }
  }

  return (
    <ReactTouchEvents
      onTap={handleTap}
      onSwipe={handleSwipe}
    >
      <div>
        <StyledTetrisWrapper
          id="test"
          role="button"
          tabIndex="0"
          onKeyDown={e => move(e)}
          onKeyUp={keyUp}
        >
          <StyledTetris>
            <Stage stage={stage} />
          </StyledTetris>
        </StyledTetrisWrapper>
        <center>
          <StartButton callback={startGame} />
        </center>
        <center>
          <div>
            {gameOver ? (
              <Display gameOver={gameOver} text="Game Over" />
            ) : (
                <div className="ui-bar">
                  <Display text={`Score: ${score}`} />
                  <Display text={`rows: ${rows}`} />
                  <Display text={`Level: ${level}`} />
                </div>
              )}
          </div>
        </center>
      </div>
    </ReactTouchEvents>
  );
};

export default Tetris;
