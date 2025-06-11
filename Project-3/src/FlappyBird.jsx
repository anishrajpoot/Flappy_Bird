import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const FlappyBird = () => {
  const birdRef = useRef(null);
  const pipeContainerRef = useRef(null);

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const birdYRef = useRef(350);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef([]);
  const lastPipeXRef = useRef(1000);

  const gameLoopRef = useRef(null);
  const pipeIntervalRef = useRef(null);

  const gravity = 0.68;
  const pipeSpeed = 8;
  const gap = 200;

  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    const handleKeyDown = () => {
      if (!isGameOver) {
        birdVelocityRef.current = -11;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const createPipe = () => {
      const pipeHeight = Math.floor(Math.random() * 200) + 100;
      const pipeBottomHeight = 700 - pipeHeight - gap;

      const pipeTop = document.createElement('div');
      const pipeBottom = document.createElement('div');

      pipeTop.className = 'pipe pipe-top';
      pipeTop.style.height = `${pipeHeight}px`;
      pipeTop.style.left = `${lastPipeXRef.current + 300}px`;

      pipeBottom.className = 'pipe pipe-bottom';
      pipeBottom.style.height = `${pipeBottomHeight}px`;
      pipeBottom.style.left = `${lastPipeXRef.current + 300}px`;

      pipeContainerRef.current.appendChild(pipeTop);
      pipeContainerRef.current.appendChild(pipeBottom);

      pipesRef.current.push({
        top: pipeTop,
        bottom: pipeBottom,
        x: lastPipeXRef.current + 300,
        passed: false,
      });

      lastPipeXRef.current += 300;
    };

    const gameLoop = () => {
      if (isGameOver || !isGameStarted) return;

      birdVelocityRef.current += gravity;
      birdYRef.current += birdVelocityRef.current;

      pipesRef.current.forEach((pipe) => {
        pipe.x -= pipeSpeed;
        pipe.top.style.left = `${pipe.x}px`;
        pipe.bottom.style.left = `${pipe.x}px`;

        if (pipe.x < -80) {
          pipesRef.current.shift();
          pipe.top.remove();
          pipe.bottom.remove();
        }

        if (pipe.x < 150 && !pipe.passed) {
          setScore((prev) => prev + 1);
          pipe.passed = true;
        }

        if (checkCollision(pipe)) {
          endGame();
        }
      });

      if (birdRef.current) {
        birdRef.current.style.top = `${birdYRef.current}px`;
        birdRef.current.style.bottom = `${birdYRef.current}px`;
      }

      if (birdYRef.current > 650 || birdYRef.current < 0) {
        endGame();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const checkCollision = (pipe) => {
      const birdRect = birdRef.current.getBoundingClientRect();
      const pipeTopRect = pipe.top.getBoundingClientRect();
      const pipeBottomRect = pipe.bottom.getBoundingClientRect();

      return (
        birdRect.right > pipeTopRect.left &&
        birdRect.left < pipeTopRect.right &&
        (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)
      );
    };

    createPipe();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    pipeIntervalRef.current = setInterval(createPipe, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(gameLoopRef.current);
      clearInterval(pipeIntervalRef.current);
    };
  }, [isGameStarted, isGameOver]);

  const startGame = () => {
    cancelAnimationFrame(gameLoopRef.current);
    clearInterval(pipeIntervalRef.current);

    setIsGameOver(false);
    setIsGameStarted(false);
    setScore(0);
    setCountdown(3);
    birdYRef.current = 350;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    lastPipeXRef.current = 1000;
    if (pipeContainerRef.current) pipeContainerRef.current.innerHTML = '';

    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setIsGameStarted(true);
      }
    }, 1000);
  };

  const endGame = () => {
    setIsGameOver(true);
  };

  return (
    <div id="game-container">
      {!isGameStarted && countdown > 0 && countdown < 3 && (
        <div className="overlay">
          <h1>{countdown}</h1>
        </div>
      )}

      {!isGameStarted && countdown === 3 && (
        <div className="overlay">
          <h1>Flappy Bird</h1>
          <button className="btn" onClick={startGame}>Start Game</button>
        </div>
      )}

      {isGameOver && (
        <div className="overlay">
          <h2>Game Over!</h2>
          <p>Your Score: {score}</p>
          <button className="btn" onClick={startGame}>Restart</button>
        </div>
      )}

      <div id="bird" ref={birdRef}>
        <img src="/bird.png" width="100px" height="80px" alt="Bird" />
      </div>
      <div id="pipe-container" ref={pipeContainerRef}></div>
      <div id="score">score: {score}</div>
    </div>
  );
};

export default FlappyBird;
