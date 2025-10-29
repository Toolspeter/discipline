// 全域變數
let filteredQuestions = [];
let userAnswers = [];
let showingAnswer = [];

// 初始化
function init() {
    // 初始化答題狀態陣列
    userAnswers = new Array(question.length).fill(null);
    showingAnswer = new Array(question.length).fill(false);
    
    // 預設顯示全部題目
    applyFilters();
    updateStats();
}

// 渲染所有題目
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

// 創建單個題目卡片
function createQuestionCard(q, displayIndex, originalIndex) {
    const answered = userAnswers[originalIndex] !== null;
    const isCorrect = userAnswers[originalIndex] === q.answer;
    const showing = showingAnswer[originalIndex];
    
    // 狀態標籤
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
    
    // 圖片HTML
    let imageHTML = '';
    if (q.questionimage) {
        imageHTML = `
            <div class="question-image">
                <img src="${q.questionimage}" alt="題目圖片" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    // 選項HTML
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
    
    // optionend 獨立顯示在選項後面
    let optionEndHTML = '';
    if (q.optionend && q.optionend.trim()) {
        optionEndHTML = `<div class="option-end-note">${q.optionend}</div>`;
    }
    
    // 解析HTML - 選擇後立即顯示
    let explainHTML = '';
    if (showing && q.explain) {
        explainHTML = `
            <div class="explain-box show">
                <div class="explain-title">💡 解析</div>
                <div>${q.explain}</div>
            </div>
        `;
    }
    
    // 重新作答按鈕
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


// 選擇選項 - 優化版本，只更新單個卡片
function selectOption(originalIndex, optionIndex) {
    if (showingAnswer[originalIndex]) return;
    
    // 更新答案
    userAnswers[originalIndex] = optionIndex;
    showingAnswer[originalIndex] = true; // 選擇後立即顯示答案
    
    // 只更新這一題的卡片
    updateSingleQuestion(originalIndex);
    
    // 更新統計
    updateStats();
}

// 更新單個題目卡片 - 不重新渲染整頁
function updateSingleQuestion(originalIndex) {
    const card = document.getElementById(`question-${originalIndex}`);
    if (!card) return;
    
    const q = question[originalIndex];
    const displayIndex = filteredQuestions.indexOf(q);
    
    // 使用 innerHTML 更新卡片內容
    const newCardHTML = createQuestionCard(q, displayIndex, originalIndex);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newCardHTML;
    const newCard = tempDiv.firstElementChild;
    
    // 保持滾動位置
    const scrollPos = window.pageYOffset;
    card.replaceWith(newCard);
    window.scrollTo(0, scrollPos);
    
    // 添加動畫效果
    newCard.style.animation = 'none';
    setTimeout(() => {
        newCard.style.animation = '';
    }, 10);
}

// 重新作答 - 優化版本
function resetAnswer(originalIndex) {
    userAnswers[originalIndex] = null;
    showingAnswer[originalIndex] = false;
    
    // 只更新這一題
    updateSingleQuestion(originalIndex);
    
    // 更新統計
    updateStats();
}

// 更新統計資訊
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

// 應用篩選
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.querySelector('input[name="filterType"]:checked').value;
    
    filteredQuestions = question.filter((q, idx) => {
        // 搜尋關鍵字
        if (searchText && !q.question.toLowerCase().includes(searchText)) {
            return false;
        }
        
        // 篩選類型
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

// 重置篩選
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterAll').checked = true;
    applyFilters();
    toggleFilter();
}

// 切換篩選模態框
function toggleFilter() {
    const modal = document.getElementById('filterModal');
    modal.classList.toggle('show');
}

// 防抖函數 - 優化搜尋性能
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

// 事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    // 搜尋輸入 - 使用防抖優化
    const debouncedFilter = debounce(applyFilters, 300);
    document.getElementById('searchInput').addEventListener('input', debouncedFilter);
    
    // 點擊模態框外部關閉
    document.getElementById('filterModal').addEventListener('click', function(e) {
        if (e.target === this) {
            toggleFilter();
        }
    });
    
    // 初始化
    init();
});