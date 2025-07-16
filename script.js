
// Game data and state
const WORDLE_WORDS = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY',
    'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD', 'AWARE',
    'BADLY', 'BAKER', 'BALLS', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLIND',
    'BLOCK', 'BLOOD', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRASS', 'BRAVE',
    'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BURNT',
    'BUYER', 'CABLE', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART',
    'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM',
    'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST'
];

const SCRAMBLE_WORDS = ['JAVASCRIPT', 'COMPUTER', 'PROGRAMMING', 'WEBSITE', 'CHALLENGE', 'PUZZLE', 'WORDLE', 'LETTERS', 'KEYBOARD', 'MYSTERY'];

const ANAGRAM_SETS = [
    'REACT', 'TRACE', 'CATER', 'POWER', 'TOWER', 'WROTE', 'LOWER', 'BOWEL', 'BELOW', 'ELBOW'
];

let currentGame = 'wordle';
let wordleState = {
    targetWord: '',
    currentRow: 0,
    currentCol: 0,
    gameOver: false,
    guesses: []
};

let scrambleState = {
    targetWord: '',
    scrambledWord: ''
};

let chainState = {
    words: [],
    lastWord: ''
};

let anagramState = {
    letters: '',
    foundWords: [],
    possibleWords: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGameSwitching();
    initializeWordle();
    initializeWordScramble();
    initializeWordChain();
    initializeAnagram();
});

// Game switching functionality
function initializeGameSwitching() {
    const gameCards = document.querySelectorAll('.game-card');
    const gameContainers = document.querySelectorAll('.game-container');

    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.getAttribute('data-game');
            
            // Update active states
            gameCards.forEach(c => c.classList.remove('active'));
            gameContainers.forEach(c => c.classList.remove('active'));
            
            card.classList.add('active');
            document.getElementById(`${gameName}-game`).classList.add('active');
            
            currentGame = gameName;
        });
    });
}

// WORDLE GAME
function initializeWordle() {
    createWordleBoard();
    createKeyboard();
    newWordleGame();
    
    document.getElementById('new-wordle-game').addEventListener('click', newWordleGame);
    document.addEventListener('keydown', handleWordleKeypress);
}

function createWordleBoard() {
    const board = document.getElementById('wordle-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        row.id = `row-${i}`;
        
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.id = `cell-${i}-${j}`;
            row.appendChild(cell);
        }
        
        board.appendChild(row);
    }
}

function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ZXCVBNM'
    ];
    
    keyboard.innerHTML = '';
    
    rows.forEach((row, rowIndex) => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        if (rowIndex === 2) {
            const enterKey = document.createElement('button');
            enterKey.textContent = 'ENTER';
            enterKey.className = 'key wide';
            enterKey.addEventListener('click', () => handleWordleKeypress({key: 'Enter'}));
            keyboardRow.appendChild(enterKey);
        }
        
        [...row].forEach(letter => {
            const key = document.createElement('button');
            key.textContent = letter;
            key.className = 'key';
            key.id = `key-${letter}`;
            key.addEventListener('click', () => handleWordleKeypress({key: letter}));
            keyboardRow.appendChild(key);
        });
        
        if (rowIndex === 2) {
            const backspaceKey = document.createElement('button');
            backspaceKey.textContent = '⌫';
            backspaceKey.className = 'key wide';
            backspaceKey.addEventListener('click', () => handleWordleKeypress({key: 'Backspace'}));
            keyboardRow.appendChild(backspaceKey);
        }
        
        keyboard.appendChild(keyboardRow);
    });
}

function newWordleGame() {
    wordleState = {
        targetWord: WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)],
        currentRow: 0,
        currentCol: 0,
        gameOver: false,
        guesses: []
    };
    
    // Clear board
    document.querySelectorAll('.wordle-cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'wordle-cell';
    });
    
    // Reset keyboard
    document.querySelectorAll('.key').forEach(key => {
        key.className = key.className.includes('wide') ? 'key wide' : 'key';
    });
    
    document.getElementById('wordle-message').textContent = '';
}

function handleWordleKeypress(e) {
    if (currentGame !== 'wordle' || wordleState.gameOver) return;
    
    const key = e.key.toUpperCase();
    
    if (key === 'ENTER') {
        if (wordleState.currentCol === 5) {
            submitWordleGuess();
        }
    } else if (key === 'BACKSPACE') {
        if (wordleState.currentCol > 0) {
            wordleState.currentCol--;
            const cell = document.getElementById(`cell-${wordleState.currentRow}-${wordleState.currentCol}`);
            cell.textContent = '';
        }
    } else if (/^[A-Z]$/.test(key) && wordleState.currentCol < 5) {
        const cell = document.getElementById(`cell-${wordleState.currentRow}-${wordleState.currentCol}`);
        cell.textContent = key;
        wordleState.currentCol++;
    }
}

function submitWordleGuess() {
    const guess = [];
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${wordleState.currentRow}-${i}`);
        guess.push(cell.textContent);
    }
    
    const guessWord = guess.join('');
    wordleState.guesses.push(guessWord);
    
    // Check guess
    const result = checkWordleGuess(guessWord, wordleState.targetWord);
    
    // Update board
    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${wordleState.currentRow}-${i}`);
        cell.classList.add(result[i]);
    }
    
    // Update keyboard
    for (let i = 0; i < 5; i++) {
        const key = document.getElementById(`key-${guess[i]}`);
        if (key) {
            if (result[i] === 'correct') {
                key.classList.add('correct');
            } else if (result[i] === 'present' && !key.classList.contains('correct')) {
                key.classList.add('present');
            } else if (result[i] === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.classList.add('absent');
            }
        }
    }
    
    if (guessWord === wordleState.targetWord) {
        document.getElementById('wordle-message').innerHTML = `<span class="success">Congratulations! You found the word!</span>`;
        wordleState.gameOver = true;
    } else if (wordleState.currentRow === 5) {
        document.getElementById('wordle-message').innerHTML = `<span class="error">Game over! The word was: ${wordleState.targetWord}</span>`;
        wordleState.gameOver = true;
    } else {
        wordleState.currentRow++;
        wordleState.currentCol = 0;
    }
}

function checkWordleGuess(guess, target) {
    const result = new Array(5).fill('absent');
    const targetArray = [...target];
    const guessArray = [...guess];
    
    // Check for correct positions
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === targetArray[i]) {
            result[i] = 'correct';
            targetArray[i] = null;
            guessArray[i] = null;
        }
    }
    
    // Check for present letters
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] && targetArray.includes(guessArray[i])) {
            result[i] = 'present';
            targetArray[targetArray.indexOf(guessArray[i])] = null;
        }
    }
    
    return result;
}

// WORD SCRAMBLE GAME
function initializeWordScramble() {
    newScrambleGame();
    
    document.getElementById('new-scramble-game').addEventListener('click', newScrambleGame);
    document.getElementById('check-scramble').addEventListener('click', checkScrambleAnswer);
    document.getElementById('scramble-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkScrambleAnswer();
    });
}

function newScrambleGame() {
    const word = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    scrambleState.targetWord = word;
    scrambleState.scrambledWord = scrambleWord(word);
    
    document.getElementById('scrambled-word').textContent = scrambleState.scrambledWord;
    document.getElementById('scramble-input').value = '';
    document.getElementById('scramble-message').textContent = '';
}

function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

function checkScrambleAnswer() {
    const answer = document.getElementById('scramble-input').value.toUpperCase();
    const messageEl = document.getElementById('scramble-message');
    
    if (answer === scrambleState.targetWord) {
        messageEl.innerHTML = `<span class="success">Correct! Well done!</span>`;
        setTimeout(newScrambleGame, 2000);
    } else {
        messageEl.innerHTML = `<span class="error">Not quite right. Try again!</span>`;
    }
}

// WORD CHAIN GAME
function initializeWordChain() {
    newChainGame();
    
    document.getElementById('new-chain-game').addEventListener('click', newChainGame);
    document.getElementById('add-chain-word').addEventListener('click', addChainWord);
    document.getElementById('chain-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addChainWord();
    });
}

function newChainGame() {
    const startWords = ['CAT', 'DOG', 'SUN', 'MOON', 'FIRE', 'WATER', 'BOOK', 'TREE'];
    const startWord = startWords[Math.floor(Math.random() * startWords.length)];
    
    chainState.words = [startWord];
    chainState.lastWord = startWord;
    
    updateChainDisplay();
    document.getElementById('chain-input').value = '';
    document.getElementById('chain-message').innerHTML = `<span class="info">Start with "${startWord}". Next word must start with "${startWord.slice(-1)}"</span>`;
}

function addChainWord() {
    const input = document.getElementById('chain-input').value.toUpperCase().trim();
    const messageEl = document.getElementById('chain-message');
    
    if (!input) {
        messageEl.innerHTML = `<span class="error">Please enter a word!</span>`;
        return;
    }
    
    if (input.length < 3) {
        messageEl.innerHTML = `<span class="error">Word must be at least 3 letters long!</span>`;
        return;
    }
    
    if (chainState.words.includes(input)) {
        messageEl.innerHTML = `<span class="error">Word already used in this chain!</span>`;
        return;
    }
    
    const lastLetter = chainState.lastWord.slice(-1);
    const firstLetter = input[0];
    
    if (firstLetter !== lastLetter) {
        messageEl.innerHTML = `<span class="error">Word must start with "${lastLetter}"!</span>`;
        return;
    }
    
    chainState.words.push(input);
    chainState.lastWord = input;
    
    updateChainDisplay();
    document.getElementById('chain-input').value = '';
    messageEl.innerHTML = `<span class="success">Good! Next word must start with "${input.slice(-1)}"</span>`;
}

function updateChainDisplay() {
    const container = document.getElementById('chain-words');
    container.innerHTML = '';
    
    chainState.words.forEach(word => {
        const wordEl = document.createElement('div');
        wordEl.className = 'chain-word';
        wordEl.textContent = word;
        container.appendChild(wordEl);
    });
}

// ANAGRAM GAME
function initializeAnagram() {
    newAnagramGame();
    
    document.getElementById('new-anagram-game').addEventListener('click', newAnagramGame);
    document.getElementById('check-anagram').addEventListener('click', checkAnagramWord);
    document.getElementById('anagram-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnagramWord();
    });
}

function newAnagramGame() {
    const letters = ANAGRAM_SETS[Math.floor(Math.random() * ANAGRAM_SETS.length)];
    anagramState.letters = letters;
    anagramState.foundWords = [];
    anagramState.possibleWords = generateAnagramWords(letters);
    
    document.getElementById('anagram-letters').textContent = letters.split('').join(' ');
    document.getElementById('anagram-input').value = '';
    document.getElementById('words-list').innerHTML = '';
    document.getElementById('anagram-message').innerHTML = `<span class="info">Find words using these letters! (${anagramState.possibleWords.length} possible)</span>`;
}

function generateAnagramWords(letters) {
    // Simple word list for demonstration
    const possibleWords = ['REACT', 'TRACE', 'CRATE', 'CARE', 'RACE', 'ACE', 'ARC', 'CAR', 'CAT', 'RAT', 'TAR', 'ART', 'EAR', 'ERA', 'ARE', 'TEA', 'EAT', 'ATE'];
    return possibleWords.filter(word => canFormWord(word, letters));
}

function canFormWord(word, availableLetters) {
    const letterCount = {};
    for (let letter of availableLetters) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    for (let letter of word) {
        if (!letterCount[letter] || letterCount[letter] === 0) {
            return false;
        }
        letterCount[letter]--;
    }
    
    return true;
}

function checkAnagramWord() {
    const input = document.getElementById('anagram-input').value.toUpperCase().trim();
    const messageEl = document.getElementById('anagram-message');
    
    if (!input) {
        messageEl.innerHTML = `<span class="error">Please enter a word!</span>`;
        return;
    }
    
    if (anagramState.foundWords.includes(input)) {
        messageEl.innerHTML = `<span class="error">You already found this word!</span>`;
        return;
    }
    
    if (!canFormWord(input, anagramState.letters)) {
        messageEl.innerHTML = `<span class="error">Can't form this word with available letters!</span>`;
        return;
    }
    
    if (anagramState.possibleWords.includes(input)) {
        anagramState.foundWords.push(input);
        addFoundWord(input);
        document.getElementById('anagram-input').value = '';
        
        const remaining = anagramState.possibleWords.length - anagramState.foundWords.length;
        messageEl.innerHTML = `<span class="success">Great! ${remaining} words remaining.</span>`;
        
        if (anagramState.foundWords.length === anagramState.possibleWords.length) {
            messageEl.innerHTML = `<span class="success">Amazing! You found all words!</span>`;
        }
    } else {
        messageEl.innerHTML = `<span class="error">Not a valid word for this puzzle!</span>`;
    }
}

function addFoundWord(word) {
    const wordsList = document.getElementById('words-list');
    const wordEl = document.createElement('div');
    wordEl.className = 'found-word';
    wordEl.textContent = word;
    wordsList.appendChild(wordEl);
}
