
var startQuestionIdx;
var endQuestionIdx;
var currentQuestionIdx;
var currentQuestion;
var currentCorrectAnswer;
var questionMap; 


class TestHandler {

    constructor() {
        this.questions = null;
        this.nQuestions = null;
    }

    initialize(questions, firstQuestionNum, lastQuestionNum) {

        this.questions = questions; 
        this.questionMap = new Map(); 
        this.answersMap = new Map();
        
        for (let question of questions) {
            let qid = Number(question["domanda_numero"])
            if (qid < firstQuestionNum) continue;
            if (qid > lastQuestionNum) break;
            this.questionMap.set(qid, question)
            this.answersMap.set(qid, false)
        }

        this.questionMapKeys = [...this.questionMap.keys()]
        this.currentKey = 0;
    }

    getCurrentQuestion() {
        return this.questionMap.get(this.questionMapKeys[this.currentKey])
    }

    nextQuestion() {
        this.currentKey += 1;

        if (this.currentKey >= this.questionMapKeys.length) {
            return false;
        }
        return true;
    }

    registerAnswer(isTrue) {
        this.answersMap.set(this.currentKey, isTrue)
    }

    formatResults() {
        let corrects = 0;
        for (let k of this.answersMap.keys()) {
            corrects += this.answersMap.get(k)
        }
        let perc = Math.round(100 * (corrects / this.questionMapKeys.length))
        return "Hai cumulato il " + String(perc) + "% di risposte corrette!"
    }

}

const testHandler = new TestHandler()


// quick trick to avoid refresh
var form = document.getElementById("indexForm");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

// show the starting menu
const startMenuEl = document.getElementById('startmenu');
const options = {backdrop: 'static', keyboard: false}
const startMenu = new bootstrap.Modal(startMenuEl, options)
startMenu.show()

// declare the results modal
const resultsEl = document.getElementById('results');
const resultsOpts = {backdrop: 'static', keyboard: false}
const resultsModal = new bootstrap.Modal(resultsEl, resultsOpts)


function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

async function fetchQuestions() {
    try {
        const response = await fetch('/add-prefixes-online/med/server/questions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return await response.json();
        
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function runTest() {
    
    const strQuestionEl = document.getElementById('start-question-idx')
    const endQuestionEl = document.getElementById('end-question-idx')
    const firstQuestionIdx    = Number(strQuestionEl.value);
    const lastQuestionIdx     = Number(endQuestionEl.value); 

    const questions = await fetchQuestions()
    testHandler.initialize(questions, firstQuestionIdx, lastQuestionIdx)
    fillQuestionBox(testHandler.getCurrentQuestion())
    startMenu.hide()
}

function fillQuestionBox(question) {
    document.getElementById('question-idx').innerText = "N°" + question["domanda_numero"]
    document.getElementById('question-text').innerText = question["domanda"]
    
    // permute the answer
    var questionOrder = ['a', 'b', 'c', 'd', 'e']
    var questionShuff = questionOrder.slice()
    shuffle(questionShuff)

    // set the current correct answer
    currentCorrectAnswer = questionOrder[ questionShuff.indexOf("a") ]    

    document.getElementById('lab-a').innerText = 'A) ' + question["risposta_" + questionShuff[0]]
    document.getElementById('lab-b').innerText = 'B) ' + question["risposta_" + questionShuff[1]]
    document.getElementById('lab-c').innerText = 'C) ' + question["risposta_" + questionShuff[2]]
    document.getElementById('lab-d').innerText = 'D) ' + question["risposta_" + questionShuff[3]]
    document.getElementById('lab-e').innerText = 'E) ' + question["risposta_" + questionShuff[4]]
}

function submitAnswer() {
    const correctAnswerBtn = document.getElementById('ans-' + currentCorrectAnswer)
    const outcomeAlert = document.getElementById('outcome')

    testHandler.registerAnswer(correctAnswerBtn.checked)

    if (correctAnswerBtn.checked) {
        outcomeAlert.classList.replace("alert-primary", "alert-success")
        outcomeAlert.innerText = "Bravissima! 🙀🙀🙀"        
    }
    else {
        outcomeAlert.classList.replace("alert-primary", "alert-danger")
        outcomeAlert.innerText = "Sometimes I'm alone... 😿😿😿"        
    }
}

function nextQuestion() {
    hasNext = testHandler.nextQuestion()
    
    if (!hasNext) {

        resultsDisplay = document.getElementById("results-display");
        resultsDisplay.innerText = testHandler.formatResults()
        resultsModal.show()
        return;
    }
    
    fillQuestionBox(testHandler.getCurrentQuestion())

    // reset alert
    const outcomeAlert = document.getElementById('outcome');
    outcomeAlert.classList.replace("alert-success", "alert-primary");
    outcomeAlert.classList.replace("alert-danger",   "alert-primary");
    outcomeAlert.innerText = "Leggi bene la domanda."; 

    // reset checkboxes
    document.getElementById('ans-a').checked = false; 
    document.getElementById('ans-b').checked = false; 
    document.getElementById('ans-c').checked = false; 
    document.getElementById('ans-d').checked = false; 
    document.getElementById('ans-e').checked = false; 
}