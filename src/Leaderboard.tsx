import { Devvit, useAsync, useState, StateSetter } from "@devvit/public-api";
import { PixelText } from "./font.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const Leaderboard = (props: {
  _context: Devvit.Context;
  setCurrentScreen: StateSetter<string>;
  device: string;
  isGameOver: (updatedLetters?: string, updatedShieldsLeft?: number) => boolean;
}) => {
  const { _context, setCurrentScreen, isGameOver, device } = props;
  const redis = _context.redis;
  const reddit = _context.reddit;

  const { data, loading, error } = useAsync<
    { rank: number; member: string; score: number }[]
  >(async () => {
    console.log("Fetching leaderboard data...");
    const total_points = await redis.zRange("game_leaderboard", 0, 5, {
      reverse: true,
      by: "rank",
    });
    const ranked_points = total_points.map((user, index) => {
      return { rank: index + 1, member: user.member, score: user.score };
    });
    const user_rank =
      (await redis.zRank("game_leaderboard", _context.userId!)) || 0;
    const user_score =
      (await redis.zScore("game_leaderboard", _context.userId!)) || 0;
    const user_member = {
      rank: user_rank + 1,
      member: _context.userId!,
      score: user_score,
    };
    if (!ranked_points.some((user) => user.member === user_member.member)) {
      ranked_points.push(user_member);
    }

    const formattedPoints = await Promise.all(
      ranked_points.map(async (user) => {
        const username = await reddit.getUserById(user.member);
        return {
          member: username ? username.username : "User",
          score: user.score,
          rank: user.rank,
        };
      })
    );

    console.log(formattedPoints);
    return formattedPoints;
  });

  return (
    <vstack height="100%" width="100%" alignment="center middle">
      <hstack
        width="100%"
        height="20%"
        padding="medium"
        alignment="center middle"
      >
        <PixelText color="white" size={3}>
          Leaderboard
        </PixelText>
      </hstack>

      <hstack height="60%" width="100%" padding="small">
        <vstack width="100%" alignment="center">
          {!loading &&
            data &&
            data.map((player, index) => (
              <hstack
                key={index.toString()}
                width="90%"
                padding="small"
                border="thin"
              >
                <vstack width="70%" alignment="start">
                  <PixelText>{player.rank + "." + player.member}</PixelText>
                </vstack>
                <vstack width="30%" alignment="end">
                  <PixelText>{player.score.toString() + "pts"}</PixelText>
                </vstack>
              </hstack>
            ))}
          {loading && <PixelText>Loading</PixelText>}
        </vstack>
      </hstack>
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

export default Leaderboard;
