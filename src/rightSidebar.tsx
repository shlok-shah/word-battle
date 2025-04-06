import { Devvit, StateSetter, useState } from "@devvit/public-api";
import { PixelText } from "./font.js";
import { getGuessedLetters } from "./main.js";
import { updateIndex } from "isomorphic-git";
import { totalShields } from "./main.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const RightSidebar = (props: {
  _context: Devvit.Context;
  setDisplay: StateSetter<string>;
  setCurrentScreen: StateSetter<string>;
  device: string;
  points: number;
}) => {
  const { _context, setDisplay, setCurrentScreen, points, device } = props;

  const level = Math.min(Math.floor(points / 1000) + 1, 5);

  return (
    <>
      <vstack
        gap="small"
        width={device === "mobile" ? "20%" : "100%"}
        alignment="end"
      >
        <vstack backgroundColor="#FFD5C6" width="100%" height="8px">
          <hstack width="100%" height="100%">
            {Array.from({ length: 10 }).map((_, index) => (
              <vstack
                key={index.toString()}
                backgroundColor={
                  points > 5000 || index < (points % 1000) / 100
                    ? "#D93A00"
                    : "#FFD5C6"
                }
                width="10%"
                height="100%"
                gap="small"
                border="thin"
                borderColor="black"
              />
            ))}
          </hstack>
        </vstack>
        <PixelText size={1.5} color="white">
          {"Level " + level.toString()}
        </PixelText>
      </vstack>

      <vstack
        border="thin"
        borderColor="#FFD700"
        width={device === "mobile" ? "20%" : "100%"}
        padding="small"
        alignment="center"
        backgroundColor="#2c2953"
        onPress={() => setDisplay("hint")}
      >
        <PixelText size={2} color="#ba8494">
          Hint
        </PixelText>
      </vstack>
      <vstack
        border="thin"
        borderColor="white"
        width={device === "mobile" ? "20%" : "100%"}
        padding="small"
        alignment="center"
        backgroundColor="#2c2953"
        onPress={() => setCurrentScreen("leaderboard")}
      >
        <PixelText size={2} color="#ba8494">
          Ranks
        </PixelText>
      </vstack>
      <vstack
        border="thin"
        borderColor="white"
        width={device === "mobile" ? "20%" : "100%"}
        padding="small"
        alignment="center"
        backgroundColor="#2c2953"
        onPress={() => setDisplay("help")}
      >
        <PixelText size={2} color="#ba8494">
          Help
        </PixelText>
      </vstack>
      <vstack
        border="thin"
        borderColor="white"
        width={device === "mobile" ? "20%" : "100%"}
        padding="small"
        alignment="center"
        backgroundColor="#2c2953"
        onPress={() => setCurrentScreen("level")}
      >
        <PixelText size={2} color="#ba8494">
          Levels
        </PixelText>
      </vstack>
    </>
  );
};

export default RightSidebar;
