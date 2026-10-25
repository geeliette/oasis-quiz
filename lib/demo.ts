import { newId } from "./id";
import type { Category, Game, Team } from "./types";

export const DEMO_GAME_ID = "demo";

function clue(value: number, question: string, answer: string) {
  return {
    id: newId(),
    value,
    question,
    answer,
    revealed: false,
    answered: false,
  };
}

function category(name: string, clues: ReturnType<typeof clue>[]): Category {
  return { id: newId(), name, clues };
}

export function buildDemoGame(): Game {
  const now = Date.now();

  const categories: Category[] = [
    category("Animal Kingdom", [
      clue(100, "This tall African animal has a very long neck.", "What is a giraffe?"),
      clue(200, "This black-and-white bear loves eating bamboo.", "What is a panda?"),
      clue(300, "Known as the 'king of the jungle,' famous for its big mane.", "What is a lion?"),
      clue(400, "This ocean giant is the largest animal on Earth.", "What is a blue whale?"),
      clue(500, "This flightless bird is the fastest animal on two legs.", "What is an ostrich?"),
    ]),
    category("Colors & Shapes", [
      clue(100, "Mixing blue and yellow makes this color.", "What is green?"),
      clue(200, "A shape with three sides.", "What is a triangle?"),
      clue(300, "The color of the sun and bananas.", "What is yellow?"),
      clue(400, "A shape with four equal sides and four right angles.", "What is a square?"),
      clue(500, "Mixing red and white makes this color.", "What is pink?"),
    ]),
    category("Outer Space", [
      clue(100, "The star at the center of our solar system.", "What is the Sun?"),
      clue(200, "The planet we call home.", "What is Earth?"),
      clue(300, "This red planet is named after the Roman god of war.", "What is Mars?"),
      clue(400, "Earth's only natural satellite.", "What is the Moon?"),
      clue(500, "The largest planet in our solar system.", "What is Jupiter?"),
    ]),
    category("Cartoon Fun", [
      clue(100, "Disney's most famous mouse.", "Who is Mickey Mouse?"),
      clue(200, "This yellow sponge lives in a pineapple under the sea.", "Who is SpongeBob SquarePants?"),
      clue(300, "This blue hedgehog is known for running super fast.", "Who is Sonic?"),
      clue(400, "This clownfish went on a big adventure to find his son.", "Who is Marlin?"),
      clue(500, "This green ogre lives happily in a swamp.", "Who is Shrek?"),
    ]),
    category("Math Magic", [
      clue(100, "5 + 5 equals this number.", "What is 10?"),
      clue(200, "This shape has zero corners and is perfectly round.", "What is a circle?"),
      clue(300, "10 x 10 equals this number.", "What is 100?"),
      clue(400, "Half of 50.", "What is 25?"),
      clue(500, "The next number: 2, 4, 6, 8, __.", "What is 10?"),
    ]),
  ];

  const teams: Team[] = [
    { id: newId(), name: "Team Sunshine", color: "#FFC53D", score: 0 },
    { id: newId(), name: "Team Ocean", color: "#4DA8FF", score: 0 },
    { id: newId(), name: "Team Forest", color: "#3DD9A5", score: 0 },
  ];

  return {
    id: DEMO_GAME_ID,
    title: "Oasis Quiz Demo Night",
    categories,
    teams,
    createdAt: now,
    updatedAt: now,
  };
}
