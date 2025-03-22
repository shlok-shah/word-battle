import { Devvit } from "@devvit/public-api";
import { PixelText } from "../font.js";

Devvit.configure({
  redditAPI: true,
});

const GameOverTitle = (props: { result: string; word: string }) => {
  const { result, word } = props;
  return (
    <vstack gap="medium" alignment="center">
      <PixelText size={result === "win" ? 6 : 4}>
        {result === "win" ? "You Won!" : "Better Luck Next Time!"}
      </PixelText>
      <PixelText size={3}>{"The word was " + word}</PixelText>
    </vstack>
  );
};

export default GameOverTitle;
