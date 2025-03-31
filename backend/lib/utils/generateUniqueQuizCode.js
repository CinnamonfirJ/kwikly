import Quiz from "../../models/quiz.model.js";

// Function to generate a random unique quiz code
export const generateUniqueQuizCode = async () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code;
  let exists = true;

  while (exists) {
    // Generate 5 characters (letters or numbers) before the hyphen
    const firstPart = Array.from(
      { length: 5 },
      () =>
        Math.random() > 0.5
          ? letters[Math.floor(Math.random() * letters.length)] // Random letter
          : numbers[Math.floor(Math.random() * numbers.length)] // Random number
    ).join("");

    // Generate 5 digits after the hyphen
    const secondPart = Array.from(
      { length: 5 },
      () => numbers[Math.floor(Math.random() * numbers.length)]
    ).join("");

    // Combine both parts with a hyphen
    code = `${firstPart}-${secondPart}`;

    // Check if the generated code already exists in the database
    const existingQuiz = await Quiz.findOne({ code });
    exists = existingQuiz !== null;
  }

  return code;
};
