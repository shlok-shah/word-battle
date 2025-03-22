// Learn more at developers.reddit.com/docs
import { Devvit, useForm, useState } from "@devvit/public-api";
import Title from "./title.js";
import Word from "./word.js";
import Keyboard from "./keyboard.js";
import GameOverTitle from "./gameOver/title.js";
import GameOverMenu from "./gameOver/menu.js";

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
    } catch (error) {
      console.log(error);
    }
    ui.navigateTo(post);
  }
);

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: "Create Word Shield",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { ui } = context;
    ui.showForm(getWordForm);
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: "Experience Post",
  render: (_context) => {
    const { redis } = _context;
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<string>("play");
    const [word] = useState(async () => {
      const wordData = await redis.get(getWord(_context.postId));
      return wordData || "";
    });
    const [guessedLetters, setGuessedLetters] = useState(async () => {
      const guessedLettersData = await redis.get(
        getGuessedLetters(_context.postId, _context.userId)
      );
      if (!guessedLettersData) {
        await redis.set(
          getGuessedLetters(_context.postId, _context.userId),
          ""
        );
      }
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
    const [currentScreen, setCurrentScreen] = useState<string>("play");

    const isGameOver = (
      updatedLetters = guessedLetters,
      updatedShieldsLeft = shieldsLeft
    ): boolean => {
      if (updatedShieldsLeft === 0) {
        setResult("lost");
        setCurrentScreen("gameover");
        return true;
      }
      let flag = true;
      word.split("").forEach((letter) => {
        if (!updatedLetters.includes(letter)) flag = false;
      });
      if (flag) {
        setResult("win");
      }
      if (flag) setCurrentScreen("gameover");
      return flag;
    };

    isGameOver();
    setLoading(false);

    const screens: Record<string, JSX.Element> = {
      play: (
        <vstack
          height="100%"
          width="100%"
          gap="large"
          alignment="center middle"
        >
          <Title shieldsLeft={shieldsLeft} guessedLetters={guessedLetters} />
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
          />
        </vstack>
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
          />
        </vstack>
      ),
      default: (
        <vstack height="100%" width="100%" alignment="center middle">
          <text size="large">Screen Not Found</text>
          <button onPress={() => setCurrentScreen("home")}>Go to Home</button>
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
              <zstack height="100%" width="100%">
                <image
                  url="background.jpg"
                  resizeMode="cover"
                  imageWidth={_context.dimensions?.width!}
                  imageHeight={_context.dimensions?.height!}
                />
                {screens[currentScreen] || screens.default}
              </zstack>
            )
          )}
        </vstack>
      </blocks>
    );
  },
});

export default Devvit;
