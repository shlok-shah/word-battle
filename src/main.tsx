// Learn more at developers.reddit.com/docs
import { Devvit, useAsync, useForm, useState } from "@devvit/public-api";
import Title from "./title.js";
import Word from "./word.js";
import Keyboard from "./keyboard.js";
import GameOverTitle from "./gameOver/title.js";
import GameOverMenu from "./gameOver/menu.js";
import LeftSidebar from "./leftSidebar.js";
import RightSidebar from "./rightSidebar.js";
import HintDisplay from "./HintDisplay.js";
import Leaderboard from "./Leaderboard.js";
import Levels from "./levels.js";
import HelpDisplay from "./help.js";
import wordList from "./word_list.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

const getWord = (postId: string | undefined): string => {
  return `get_answer_word:${postId}`;
};

const getGuess = (
  postId: string | undefined,
  userId: string | undefined
): string => {
  return `get_guess:${postId}:${userId}`;
};

export const getGuessedLetters = (
  postId: string | undefined,
  userId: string | undefined
): string => {
  return `get_guessed_letters:${postId}:${userId}`;
};

export const getHint = (postId: string | undefined): string => {
  return `get_hint:${postId}`;
};

export const getHintUsed = (
  postId: string | undefined,
  userId: string | undefined
): string => {
  return `get_hint_used:${postId}:${userId}`;
};

export const totalShields = 5;

const getWordForm = Devvit.createForm(
  {
    fields: [
      {
        type: "string",
        name: "word",
        label: "Type the word to be guessed",
        required: true,
      },
      {
        type: "paragraph",
        name: "hint",
        label: "Hint",
        required: true,
      },
    ],
  },
  async (event, context) => {
    const { reddit, ui, redis } = context;

    ui.showToast(
      "Creating your Word Shield, you'll be redirected to the post soon!"
    );

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "Guess the word before losing all your shields",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    try {
      await redis.set(getWord(post.id), event.values.word.toUpperCase());
      await redis.set(getHint(post.id), event.values.hint);
    } catch (error) {
      console.log(error);
    }
    ui.navigateTo(post);
  }
);

function getRandomWord(data: {
  words: {
    word: string;
    hint: string;
  }[];
}) {
  const randomIndex = Math.floor(Math.random() * data.words.length);
  return data.words[randomIndex];
}

Devvit.addSchedulerJob({
  name: "daily_word_battle",
  onRun: async (_, context) => {
    const { reddit, redis } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "Guess the word before losing all your shields",
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    try {
      const randomEntry = getRandomWord(wordList);
      await redis.set(getWord(post.id), randomEntry.word.toUpperCase());
      await redis.set(getHint(post.id), randomEntry.hint);
    } catch (error) {
      console.log(error);
    }
  },
});

Devvit.addMenuItem({
  label: "Create Post (Every 8 Hours)",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (event, context) => {
    const jobId = await context.scheduler.runJob({
      name: "daily_word_battle",
      cron: "0 */8 * * *",
    });
    await context.redis.set("8_hour_post:jobId", jobId);
  },
});

Devvit.addMenuItem({
  label: "Stop Auto Posts",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_, context) => {
    const jobId = (await context.redis.get("8_hour_post:jobId")) || "0";
    await context.scheduler.cancelJob(jobId);
  },
});

Devvit.addMenuItem({
  label: "Create Word Battle",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    ui.showForm(getWordForm);
  },
});

Devvit.addCustomPostType({
  name: "Experience Post",
  render: (_context) => {
    const { redis } = _context;
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>("play");
    const [word] = useState(async () => {
      const wordData = await redis.get(getWord(_context.postId));
      return wordData || "";
    });

    const [hint] = useState<string>(async () => {
      const hint = await redis.get(getHint(_context.postId));
      return hint || "Failed to load hint";
    });

    const [points] = useState<number>(async () => {
      const userPoints = await _context.redis.zScore(
        "game_leaderboard",
        _context.userId!
      );
      return userPoints ?? 0;
    });

    const [usedHint, setUsedHint] = useState<boolean>(async () => {
      const hintUsed = await redis.get(
        getHintUsed(_context.postId, _context.userId)
      );
      return hintUsed === "true";
    });

    const [guessedLetters, setGuessedLetters] = useState(async () => {
      const guessedLettersData = await redis.get(
        getGuessedLetters(_context.postId, _context.userId)
      );
      return guessedLettersData || "";
    });

    const [shieldsLeft, setShieldsLeft] = useState(() => {
      const wrongGuesses = guessedLetters
        .split("")
        .reduce(
          (shields, letter) => (word.includes(letter) ? shields : shields + 1),
          0
        );
      return Math.max(0, totalShields - wrongGuesses);
    });

    const [device] = useState(async () =>
      _context.dimensions?.width! > 600 ? "laptop" : "mobile"
    );

    const [currentScreen, setCurrentScreen] = useState<string>("play");
    const [display, setDisplay] = useState<string>("none");

    const isGameOver = (
      updatedLetters = guessedLetters,
      updatedShieldsLeft = shieldsLeft
    ): boolean => {
      if (updatedShieldsLeft === 0) {
        setResult("lost");
        setCurrentScreen("gameover");

        const gameOverKey = `game_over:${_context.postId}:${_context.userId}`;
        _context.redis.get(gameOverKey).then((alreadyStored) => {
          if (!alreadyStored) {
            redis.set(gameOverKey, "lost");
            _context.userId &&
              redis.zIncrBy("game_leaderboard", _context.userId, 0);
          }
        });

        return true;
      }

      let flag = true;

      word.split("").forEach((letter) => {
        if (!updatedLetters.includes(letter)) flag = false;
      });

      if (flag) {
        setResult("win");
        setCurrentScreen("gameover");
        const gameOverKey = `game_over:${_context.postId}:${_context.userId}`;
        redis.get(gameOverKey).then((alreadyStored) => {
          if (!alreadyStored) {
            redis.set(gameOverKey, "win");
            _context.userId &&
              redis.zIncrBy("game_leaderboard", _context.userId, 100);
          }
        });
      }
      return flag;
    };

    useState(async () => isGameOver());

    const screens: Record<string, JSX.Element> = {
      play: (
        <hstack
          width="100%"
          height="100%"
          padding={device === "mobile" ? "small" : "medium"}
          gap="small"
          alignment="center"
        >
          {device === "laptop" && (
            <LeftSidebar
              guessedLetters={guessedLetters}
              _context={_context}
              device={device}
            />
          )}
          <vstack
            width={device === "laptop" ? "60%" : "100%"}
            gap="large"
            alignment="center"
          >
            {device === "mobile" && (
              <hstack
                width="100%"
                height="25%"
                padding="small"
                alignment="center"
                gap="small"
              >
                <RightSidebar
                  _context={_context}
                  setDisplay={setDisplay}
                  setCurrentScreen={setCurrentScreen}
                  points={points}
                  device={device}
                />
              </hstack>
            )}
            <hstack width="100%" alignment="top center" gap="small">
              {[...Array(shieldsLeft)].map((_, index) => (
                <image
                  key={index.toString()}
                  url="shield.png"
                  imageWidth="30px"
                  imageHeight="30px"
                  resizeMode="fill"
                />
              ))}
            </hstack>
            <Word
              context={_context}
              guessedLetters={guessedLetters}
              word={word}
            />
            <Keyboard
              guessedLetters={guessedLetters}
              setGuessedLetters={setGuessedLetters}
              setShieldsLeft={setShieldsLeft}
              setCurrentScreen={setCurrentScreen}
              word={word}
              _context={_context}
              isGameOver={isGameOver}
              device={device}
            />
          </vstack>
          {device === "laptop" && (
            <vstack
              width="20%"
              height="100%"
              padding="small"
              alignment="center"
              gap="small"
            >
              <RightSidebar
                _context={_context}
                setDisplay={setDisplay}
                setCurrentScreen={setCurrentScreen}
                points={points}
                device={device}
              />
            </vstack>
          )}
        </hstack>
      ),
      leaderboard: (
        <Leaderboard
          _context={_context}
          setCurrentScreen={setCurrentScreen}
          isGameOver={isGameOver}
          device={device}
        />
      ),
      level: (
        <Levels
          _context={_context}
          setCurrentScreen={setCurrentScreen}
          points={points}
          isGameOver={isGameOver}
          device={device}
        />
      ),
      gameover: (
        <vstack
          height="100%"
          width="100%"
          alignment="center middle"
          gap="medium"
        >
          <GameOverTitle result={result} word={word} />
          <GameOverMenu
            setCurrentScreen={setCurrentScreen}
            context={_context}
            shieldsLeft={shieldsLeft}
            result={result}
            device={device}
          />
        </vstack>
      ),
      default: (
        <vstack height="100%" width="100%" alignment="center middle">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    };

    return (
      <blocks height="regular">
        <vstack height="100%" width="100%" alignment="middle center">
          {loading ? (
            <text size="large">Loading ...</text>
          ) : (
            _context && (
              <zstack height="100%" width="100%" alignment="center middle">
                <image
                  url="arcade.webp"
                  resizeMode="cover"
                  imageWidth={_context.dimensions?.width!}
                  imageHeight={_context.dimensions?.height!}
                />
                {screens[currentScreen] || screens.default}
                {display === "hint" && (
                  <HintDisplay
                    device={device}
                    setDisplay={setDisplay}
                    usedHint={usedHint}
                    hint={hint}
                    setUsedHint={setUsedHint}
                    _context={_context}
                  />
                )}
                {display === "help" && (
                  <HelpDisplay
                    setDisplay={setDisplay}
                    _context={_context}
                    device={device}
                  />
                )}
              </zstack>
            )
          )}
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
