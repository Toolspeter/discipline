let filteredQuestions = [];
let userAnswers = [];
let showingAnswer = [];


function init() {
    
    userAnswers = new Array(question.length).fill(null);
    showingAnswer = new Array(question.length).fill(false);
    
    
    applyFilters();
    updateStats();
}


function renderAllQuestions() {
    const container = document.getElementById('questionContainer');
    const noQuestions = document.getElementById('noQuestions');
    
    if (filteredQuestions.length === 0) {
        container.innerHTML = '';
        noQuestions.style.display = 'block';
        return;
    }
    
    noQuestions.style.display = 'none';
    
    let html = '';
    filteredQuestions.forEach((q, index) => {
        const originalIndex = question.indexOf(q);
        html += createQuestionCard(q, index, originalIndex);
    });
    
    container.innerHTML = html;
}


function createQuestionCard(q, displayIndex, originalIndex) {
    const answered = userAnswers[originalIndex] !== null;
    const isCorrect = userAnswers[originalIndex] === q.answer;
    const showing = showingAnswer[originalIndex];
    
    
    let statusHTML = '';
    if (answered && showing) {
        statusHTML = `
            <div class="question-status">
                <span class="status-badge ${isCorrect ? 'correct' : 'wrong'}">
                    ${isCorrect ? '✓ 答對' : '✗ 答錯'}
                </span>
            </div>
        `;
    }
    
    
    let imageHTML = '';
    if (q.questionimage) {
        imageHTML = `
            <div class="question-image">
                <img src="${q.questionimage}" alt="題目圖片" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    
    let optionsHTML = '';
    q.option.forEach((opt, idx) => {
        let optionClass = 'option';
        
        if (showing) {
            if (idx === q.answer) {
                optionClass += ' correct';
            } else if (idx === userAnswers[originalIndex] && idx !== q.answer) {
                optionClass += ' wrong';
            }
        } else if (userAnswers[originalIndex] === idx) {
            optionClass += ' selected';
        }
        
        optionsHTML += `
            <div class="${optionClass}" onclick="selectOption(${originalIndex}, ${idx})">
                <div class="option-label">${String.fromCharCode(65 + idx)}</div>
                <div class="option-text">${opt}</div>
            </div>
        `;
    });
    
    
    let optionEndHTML = '';
    if (q.optionend && q.optionend.trim()) {
        optionEndHTML = `<div class="option-end-note">${q.optionend}</div>`;
    }
    
    
    let explainHTML = '';
    if (showing && q.explain) {
        explainHTML = `
            <div class="explain-box show">
                <div class="explain-title">💡 解析</div>
                <div>${q.explain}</div>
            </div>
        `;
    }
    
    
    let buttonHTML = '';
    if (showing) {
        buttonHTML = `
            <div class="button-group">
                <button class="btn btn-secondary" onclick="resetAnswer(${originalIndex})">
                    🔄 重新作答
                </button>
            </div>
        `;
    }
    
    return `
        <div class="question-card" id="question-${originalIndex}">
            <div class="question-header">
                <div class="question-number">題目 ${displayIndex + 1}</div>
                ${statusHTML}
            </div>
            <div class="question-text">${q.question}</div>
            ${imageHTML}
            <div class="options" id="options-${originalIndex}">
                ${optionsHTML}
            </div>
            ${optionEndHTML}
            ${buttonHTML}
            ${explainHTML}
        </div>
    `;
}

function selectOption(originalIndex, optionIndex) {
    if (showingAnswer[originalIndex]) return;
    
    
    userAnswers[originalIndex] = optionIndex;
    showingAnswer[originalIndex] = true; 

    updateSingleQuestion(originalIndex);
    
    
    updateStats();
}

function updateSingleQuestion(originalIndex) {
    const card = document.getElementById(`question-${originalIndex}`);
    if (!card) return;
    
    const q = question[originalIndex];
    const displayIndex = filteredQuestions.indexOf(q);
    
    
    const newCardHTML = createQuestionCard(q, displayIndex, originalIndex);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newCardHTML;
    const newCard = tempDiv.firstElementChild;
    
    
    const scrollPos = window.pageYOffset;
    card.replaceWith(newCard);
    window.scrollTo(0, scrollPos);
    
    
    newCard.style.animation = 'none';
    setTimeout(() => {
        newCard.style.animation = '';
    }, 10);
}


function resetAnswer(originalIndex) {
    userAnswers[originalIndex] = null;
    showingAnswer[originalIndex] = false;
    
    
    updateSingleQuestion(originalIndex);
    
    
    updateStats();
}


function updateStats() {
    document.getElementById('totalQuestions').textContent = filteredQuestions.length;
    
    let answered = 0;
    let correct = 0;
    
    question.forEach((q, idx) => {
        if (userAnswers[idx] !== null) {
            answered++;
            if (userAnswers[idx] === q.answer) {
                correct++;
            }
        }
    });
    
    document.getElementById('answeredCount').textContent = answered;
    document.getElementById('correctCount').textContent = correct;
}


function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.querySelector('input[name="filterType"]:checked').value;
    
    filteredQuestions = question.filter((q, idx) => {
        
        if (searchText && !q.question.toLowerCase().includes(searchText)) {
            return false;
        }
        
        
        const answered = userAnswers[idx] !== null;
        const isCorrect = userAnswers[idx] === q.answer;
        
        switch(filterType) {
            case 'all':
                return true;
            case 'unanswered':
                return !answered;
            case 'wrong':
                return answered && !isCorrect;
            case 'correct':
                return answered && isCorrect;
            default:
                return true;
        }
    });
    
    renderAllQuestions();
    updateStats();
}


function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterAll').checked = true;
    applyFilters();
    toggleFilter();
}


function toggleFilter() {
    const modal = document.getElementById('filterModal');
    modal.classList.toggle('show');
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


document.addEventListener('DOMContentLoaded', function() {
    
    
    
    let lastScroll = 0;
    
    const scrollThreshold = 50; 
    
    const scrollDeadZone = 5; 

    window.addEventListener('scroll', function() {
        
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        const header = document.getElementById('mainHeader');

        
        if (!header) return; 
        
        
        
        if (currentScroll <= scrollThreshold) {
            header.classList.remove('scrolled');
            
            lastScroll = currentScroll;
            return;
        }

        
        
        if (Math.abs(currentScroll - lastScroll) < scrollDeadZone) {
            lastScroll = currentScroll; 
            return;
        }
        
        
        
        
        if (currentScroll > lastScroll) {
            
            header.classList.add('scrolled');
        
        
        } else if(currentScroll < lastScroll) { 
            
            header.classList.remove('scrolled');
        }

        
        lastScroll = currentScroll;
    });

    
    init();
});