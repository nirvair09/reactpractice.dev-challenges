// src/MemoryGame.jsx
import React, { useState, useEffect } from "react";
import { shuffle } from "lodash";
import MemoryCard from "./MemoryCard";

function MemoryGame({ images }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);

  // initialize + shuffle cards
  useEffect(() => {
    const doubled = images.flatMap((img, idx) => [
      { id: idx * 2, image: img, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, image: img, isFlipped: false, isMatched: false },
    ]);
    setCards(shuffle(doubled));
  }, [images]);

  const handleCardClick = (id) => {
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    const newFlipped = [...flippedCards, id];

    setCards(newCards);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find((c) => c.id === firstId);
      const secondCard = newCards.find((c) => c.id === secondId);

      if (firstCard.image === secondCard.image) {
        // match found
        setCards((prev) =>
          prev.map((c) =>
            c.image === firstCard.image ? { ...c, isMatched: true } : c
          )
        );
        setFlippedCards([]);
      } else {
        // not a match → flip back after 1s
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="grid">
      {cards.map((card) => (
        <MemoryCard
          key={card.id}
          image={card.image}
          isFlipped={card.isFlipped}
          isMatched={card.isMatched}
          onClick={() => handleCardClick(card.id)}
        />
      ))}
    </div>
  );
}

export default MemoryGame;
