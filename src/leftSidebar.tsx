import { Devvit, StateSetter, useState } from "@devvit/public-api";
import { PixelText } from "./font.js";
import { getGuessedLetters } from "./main.js";
import { updateIndex } from "isomorphic-git";
import { totalShields } from "./main.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const LeftSidebar = (props: {
  guessedLetters: string;
  _context: Devvit.Context;
  device: string;
}) => {
  const { guessedLetters, _context, device } = props;

  return (
    <vstack
      width="20%"
      height="100%"
      padding="small"
      backgroundColor="#313d7aa0"
      border="thick"
      borderColor="white"
      alignment="center"
    >
      <vstack
        border="thin"
        borderColor="black"
        width="100%"
        padding="small"
        alignment="center"
      >
        <PixelText size={2}>Guesses</PixelText>
      </vstack>
      <vstack width="100%" padding="small" alignment="center" gap="small">
        {guessedLetters
          .split("")
          .reduce<string[][]>((rows, alphabet, index) => {
            if (index % 3 === 0) rows.push([]);
            rows[rows.length - 1].push(alphabet);
            return rows;
          }, [])
          .map((row: string[], rowIndex: number) => (
            <hstack key={rowIndex.toString()} gap="small">
              {row.map((alphabet: string, index: number) => (
                <zstack
                  key={index.toString()}
                  height="25px"
                  width="25px"
                  backgroundColor={device === "mobile" ? "white" : "black"}
                  alignment="center middle"
                  border="thin"
                  borderColor="white"
                >
                  <PixelText color="white" size={1.5}>
                    {alphabet}
                  </PixelText>
                </zstack>
              ))}
            </hstack>
          ))}
      </vstack>
    </vstack>
  );
};

export default LeftSidebar;
