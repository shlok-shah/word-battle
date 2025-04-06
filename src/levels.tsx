import { Devvit, useAsync, useState, StateSetter } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const levelText: Record<string, string[]> = {
  "1": ["5 Shields", "1x score multiplier"],
  "2": ["5 Shields", "1.25x score multiplier"],
  "3": ["5 Shields", "1.5x score multiplier"],
  "4": ["6 Shields", "1.75x score multiplier"],
  "5": ["6 Shields", "2x score multiplier"],
};

const Levels = (props: {
  _context: Devvit.Context;
  setCurrentScreen: StateSetter<string>;
  points: number;
  isGameOver: (updatedLetters?: string, updatedShieldsLeft?: number) => boolean;
  device: string;
}) => {
  const { _context, setCurrentScreen, points, isGameOver, device } = props;

  const [level, setLevel] = useState<number>(
    Math.min(Math.floor(points / 1000) + 1, 5)
  );

  return (
    <vstack height="100%" width="100%" alignment="center middle">
      <hstack
        width="100%"
        height="20%"
        padding="medium"
        alignment="center middle"
      >
        <PixelText color="white" size={3}>
          Levels
        </PixelText>
      </hstack>
      <vstack height="60%" width="100%" padding="small" alignment="center">
        <vstack backgroundColor="#FFD5C6" width="50%" height="8px">
          <hstack width="100%" height="100%">
            {Array.from({ length: 10 }).map((_, index) => (
              <vstack
                key={index.toString()}
                backgroundColor={
                  points > level * 1000 ||
                  (level == Math.floor(points / 1000) + 1 &&
                    index < (points % 1000) / 100)
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
        <vstack width="100%" alignment="center" padding="medium" gap="small">
          <PixelText color="white" size={2.5}>
            {"Level: " + level}
          </PixelText>
          <PixelText color="#65a657" size={1.5}>
            {"Your score - " + points + " xp"}
          </PixelText>
        </vstack>
        <vstack gap="medium">
          {levelText[level.toString()].map((line, _index) => (
            <vstack>
              <PixelText color="white">{"- " + line}</PixelText>
            </vstack>
          ))}
        </vstack>
        <hstack width="100%">
          <hstack width="50%" alignment="start">
            <zstack
              onPress={() => setLevel((level) => Math.max(level - 1, 1))}
              backgroundColor={device === "mobile" ? "white" : "black"}
              padding="medium"
              border="thick"
              borderColor="white"
              alignment="center middle"
            >
              <icon name="left" size={"medium"}></icon>
            </zstack>
          </hstack>
          <hstack width="50%" alignment="end">
            <zstack
              onPress={() => setLevel((level) => Math.min(level + 1, 5))}
              backgroundColor={device === "mobile" ? "white" : "black"}
              padding="medium"
              border="thick"
              borderColor="white"
              alignment="center middle"
            >
              <icon name="right" size={"medium"}></icon>
            </zstack>
          </hstack>
        </hstack>
      </vstack>
      <zstack
        onPress={() => {
          if (!isGameOver()) setCurrentScreen("play");
          return;
        }}
        backgroundColor={device === "mobile" ? "white" : "black"}
        padding="medium"
        border="thick"
        borderColor="white"
        alignment="center middle"
      >
        <PixelText color="white">Back</PixelText>
      </zstack>
    </vstack>
  );
};

export default Levels;
