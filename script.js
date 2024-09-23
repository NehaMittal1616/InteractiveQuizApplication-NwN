const apiUrl = "https://opentdb.com/api.php?amount=50&type=multiple";  // Fetch 50 questions to select random 5
let currentQuestion = 0;
let score = 0;
let totalQuestions = 5;
let questions = [];
let selectedAnswer = null;
let timer;
let timeLeft = 15;
let attempts = [];

// Start Quiz Button Handler
document.getElementById("startBtn").addEventListener("click", () => {
    const userName = document.getElementById("user-name").value.trim();

    if (!userName) {
        alert("Please enter your name to start the quiz!");
        return;
    }

    // Store the user's name and display it
    document.getElementById("username-display").innerText = userName;

    // Hide the name section and show the quiz section
    document.getElementById("name-section").classList.add("hide");
    document.getElementById("quiz-section").classList.remove("hide");

    // Fetch and start the quiz
    getQuestions();
});

// Fetch questions from the API and randomly select 5 questions
async function getQuestions() {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const allQuestions = data.results;

    // Randomly select 5 unique questions from the fetched questions
    questions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    displayQuestion();
}

// Display the current question and options
function displayQuestion() {
    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const progressEl = document.getElementById("current");

    if (currentQuestion >= totalQuestions) {
        showResult();
        return;
    }

    // Update question
    questionEl.innerText = decodeHTML(questions[currentQuestion].question);

    // Update options
    const correctAnswer = decodeHTML(questions[currentQuestion].correct_answer);
    const incorrectAnswers = questions[currentQuestion].incorrect_answers.map(a => decodeHTML(a));
    const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    answersEl.innerHTML = "";
    allAnswers.forEach(answer => {
        const li = document.createElement("li");
        li.innerText = answer;
        li.addEventListener("click", () => selectAnswer(li, correctAnswer));
        answersEl.appendChild(li);
    });

    // Update progress
    progressEl.innerText = currentQuestion + 1;

    // Reset "Next" button state and timer
    document.getElementById("nextBtn").disabled = true;
    resetTimer();
    startTimer();

    // Update progress bar
    updateProgressBar();
}

// Handle answer selection
function selectAnswer(selectedOption, correctAnswer) {
    const answersEl = document.getElementById("answers");
    const options = answersEl.querySelectorAll("li");

    // Prevent selecting multiple answers
    if (selectedAnswer) return;

    // Mark the selected answer
    selectedAnswer = selectedOption;

    // Add feedback (correct/incorrect) styling
    if (selectedOption.innerText === correctAnswer) {
        selectedOption.classList.add("correct");
        score++;  // Increment score for correct answer
    } else {
        selectedOption.classList.add("incorrect");
        // Highlight correct answer for feedback
        options.forEach(option => {
            if (option.innerText === correctAnswer) {
                option.classList.add("correct");
            }
        });
    }

    // Disable further selections and stop timer
    clearInterval(timer);

    // Enable the "Next" button
    document.getElementById("nextBtn").disabled = false;
}

// Timer function
function startTimer() {
    timeLeft = 15;
    document.getElementById("time").innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time").innerText = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timer);
            showCorrectAnswer();
            document.getElementById("nextBtn").disabled = false; // Enable "Next" button when time runs out
        }
    }, 1000);
}

// Reset timer
function resetTimer() {
    clearInterval(timer);
    document.getElementById("time").innerText = 15;
}

// Show the correct answer when time runs out
function showCorrectAnswer() {
    const answersEl = document.getElementById("answers");
    const correctAnswer = decodeHTML(questions[currentQuestion].correct_answer);
    const options = answersEl.querySelectorAll("li");

    options.forEach(option => {
        if (option.innerText === correctAnswer) {
            option.classList.add("correct");
        } else {
            option.classList.add("incorrect");
        }
    });
}

// Update the progress bar based on the current question number
function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    const percentage = ((currentQuestion + 1) / totalQuestions) * 100;
    progressBar.style.width = `${percentage}%`;
}

// Move to the next question
document.getElementById("nextBtn").addEventListener("click", () => {
    currentQuestion++;
    selectedAnswer = null; // Reset selected answer
    displayQuestion();
});

// Show the result screen
function showResult() {
    document.getElementById("quiz-section").classList.add("hide");
    document.getElementById("result-section").classList.remove("hide");

    const scorePercent = (score / totalQuestions) * 100;
    document.getElementById("score").innerText = scorePercent;

    // Save the current attempt and display previous attempts
    const userName = document.getElementById("username-display").innerText;
    attempts.push({ name: userName, score: scorePercent });
    displayPreviousAttempts();
}

// Display previous attempts
function displayPreviousAttempts() {
    const attemptsList = document.getElementById("attempts-list");
    attemptsList.innerHTML = "";
    attempts.forEach((attempt, index) => {
        const li = document.createElement("li");
        li.innerText = `${index + 1}. ${attempt.name}: ${attempt.score}%`;
        attemptsList.appendChild(li);
    });
}

// Restart the quiz
document.getElementById("restartBtn").addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;

    // Hide result section and show quiz section
    document.getElementById("result-section").classList.add("hide");
    document.getElementById("quiz-section").classList.remove("hide");

    getQuestions();  // Fetch new set of random questions
});

// Helper function to decode HTML entities (for special characters)
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
