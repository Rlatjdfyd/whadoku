/**
 * @file UI 관련 로직을 담당하는 파일
 * - DOM 요소 생성, 이벤트 처리, 화면 업데이트 등의 기능을 포함합니다.
 */

import { gameState } from './state.js';

/**
 * 스도쿠 보드를 화면에 생성하고 셀 이벤트를 설정합니다.
 * @param {number[][]} currentBoard - 현재 스도쿠 보드 데이터
 * @param {string} currentTheme - 현재 테마
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 * @param {function} onCellClick - 셀 클릭 시 호출될 콜백 함수
 * @param {boolean} isInitial - 첫 화면 표시 여부
 */
export function createBoard(
  currentBoard,
  currentTheme,
  cellImageVariants,
  onCellClick,
  isInitial = false,
  quoteCellMap = undefined // Changed from quoteChars to quoteCellMap
) {
  const sudokuBoard = document.getElementById('sudoku-board');
  sudokuBoard.style.visibility = 'hidden';
  sudokuBoard.innerHTML = '';

  const fragment = document.createDocumentFragment();
  // let quoteCharIndex = 0; // No longer needed

  // 3x3 블록을 생성
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const sudokuBlock = document.createElement('div');
      sudokuBlock.classList.add('sudoku-block');
      sudokuBlock.dataset.blockRow = blockRow;
      sudokuBlock.dataset.blockCol = blockCol;

      // 각 3x3 블록 내의 셀을 생성
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = blockRow * 3 + r;
          const col = blockCol * 3 + c;

          const cell = document.createElement('div');
          cell.classList.add('cell');

          if (isInitial) {
            // 첫 화면일 경우: customMask 기반으로 위치에 따른 이미지 표시
            if (currentBoard[row][col] === 1) {
              // 위치(row, col)에 따라 1-9 사이의 숫자를 결정론적으로 생성
              const deterministicNum = ((row * 3 + col) % 9) + 1;
              const randomVariant = Math.floor(Math.random() * 3) + 1;
              cell.innerHTML = `<img src="public/images/hwatu/${deterministicNum}-${randomVariant}.png" alt="${deterministicNum}">`;
            }
            // 첫 화면에서는 클릭 이벤트 없음
          } else {
            // 일반 게임 화면일 경우 또는 랜덤 모드
            if (currentBoard[row][col] !== 0) {
              // 고정된 숫자(기본 제공 퍼즐)
              cellImageVariants[row][col] = Math.floor(Math.random() * 3) + 1;
              cell.innerHTML = getValue(
                row,
                col,
                currentBoard[row][col],
                currentTheme,
                cellImageVariants
              );
              cell.classList.add('fixed');
            } else { // 사용자가 채워야 하는 빈 칸
              // Check if this empty cell should display a quote character
              const cellKey = `${row}-${col}`;
              if (quoteCellMap && quoteCellMap.has(cellKey)) {
                cell.textContent = quoteCellMap.get(cellKey);
                cell.classList.add('cell-quote-char'); // Add a class for styling
              }
            }
          }

          cell.dataset.row = row;
          cell.dataset.col = col;
          sudokuBlock.appendChild(cell); // 3x3 블록에 셀 추가
        }
      }
      fragment.appendChild(sudokuBlock); // DocumentFragment에 3x3 블록 추가
    }
  }
  sudokuBoard.appendChild(fragment); // 모든 요소를 한 번에 DOM에 추가
  sudokuBoard.style.visibility = 'visible'; // 그리기가 완료된 후 다시 표시
}

/**
 * 미니 팔레트의 내용을 처음 한 번만 채웁니다.
 * @param {string} currentTheme - 현재 테마
 * @param {function} onPaletteClick - 팔레트 클릭 시 호출될 콜백 함수
 */
/**
 * 미니 팔레트의 내용을 렌더링합니다. (모드에 따라 다르게 그림)
 * @param {string} mode - 'normal' 또는 'hint'
 * @param {object} options - { currentTheme, disabledNumbers, numberToShow }
 */
export function renderMiniPalette(mode, options) {
  const miniPalette = document.getElementById('mini-palette');
  miniPalette.innerHTML = ''; // 이전 내용 초기화

  if (mode === 'normal') {
    const { usedNumbers = [] } = options;
    for (let i = 1; i <= 9; i++) {
      const numberEl = document.createElement('div');
      numberEl.classList.add('mini-number');
      numberEl.dataset.number = i;

      const imgSrc = `public/images/hwatu/${i}-1.png`;
      const innerHTML = `<img src="${imgSrc}" alt="${i}">`;
      numberEl.innerHTML = innerHTML;

      if (usedNumbers.includes(i)) {
        numberEl.classList.add('disabled');
      }
      miniPalette.appendChild(numberEl);
    }
  } else if (mode === 'hint') {
    const { numberToShow } = options;
    for (let variant = 1; variant <= 3; variant++) {
      const numberEl = document.createElement('div');
      numberEl.classList.add('mini-number');
      numberEl.dataset.number = numberToShow;
      numberEl.dataset.variant = variant;
      numberEl.innerHTML = `<img src="public/images/hwatu/${numberToShow}-${variant}.png" alt="${numberToShow}-${variant}">`;
      miniPalette.appendChild(numberEl);
    }
  }
}

/**
 * 특정 셀 옆에 미니 팔레트를 표시합니다. (화면을 벗어나지 않는 최적의 대각선 위치에)
 * @param {HTMLElement} cell - 기준이 될 셀 요소
 */
export function showMiniPalette(cell) {
  const miniPalette = document.getElementById('mini-palette');

  // 팔레트가 보이게 해야 정확한 크기를 측정할 수 있음
  // (visibility: hidden 으로는 크기 측정 가능, display: none 은 불가능)
  miniPalette.style.visibility = 'hidden';
  miniPalette.classList.remove('hidden');

  const paletteRect = miniPalette.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 4가지 대각선 위치 후보 (우선순위 순)
  // 1. 셀의 오른쪽 아래
  // 2. 셀의 왼쪽 아래
  // 3. 셀의 오른쪽 위
  // 4. 셀의 왼쪽 위
  const positions = [
    { top: cellRect.bottom, left: cellRect.right },
    { top: cellRect.bottom, left: cellRect.left - paletteRect.width },
    { top: cellRect.top - paletteRect.height, left: cellRect.right },
    { top: cellRect.top - paletteRect.height, left: cellRect.left - paletteRect.width },
  ];

  let bestPosition = null;

  // 화면 안에 완전히 들어오는 첫 번째 최적의 위치를 찾음
  for (const pos of positions) {
    const fitsHorizontally = pos.left >= 0 && pos.left + paletteRect.width <= viewportWidth;
    const fitsVertically = pos.top >= 0 && pos.top + paletteRect.height <= viewportHeight;

    if (fitsHorizontally && fitsVertically) {
      bestPosition = pos;
      break;
    }
  }

  // 만약 어떤 대각선 위치도 맞지 않으면 (매우 드문 경우), 셀 아래 중앙에 위치시킴
  if (!bestPosition) {
    let top = cellRect.bottom + 5;
    let left = cellRect.left + cellRect.width / 2 - paletteRect.width / 2;

    // 화면 경계 보정
    if (left < 0) left = 5;
    if (left + paletteRect.width > viewportWidth) left = viewportWidth - paletteRect.width - 5;
    if (top + paletteRect.height > viewportHeight) top = cellRect.top - paletteRect.height - 5;
    if (top < 0) top = 5;

    bestPosition = { top, left };
  }

  miniPalette.style.top = `${bestPosition.top + window.scrollY}px`;
  miniPalette.style.left = `${bestPosition.left + window.scrollX}px`;

  // 이제 실제로 보이게 함
  miniPalette.style.visibility = 'visible';
}

/**
 * 미니 팔레트를 숨깁니다.
 */
export function hideMiniPalette() {
  const miniPalette = document.getElementById('mini-palette');
  miniPalette.classList.add('hidden');
}

/**
 * 셀에 표시될 값(숫자 또는 이미지)을 반환합니다.
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} num - 셀의 숫자 값
 * @param {string} currentTheme - 현재 테마
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 * @returns {string|number} HTML 문자열 또는 숫자
 */
export function getValue(row, col, num, currentTheme, cellImageVariants) {
  if (num === 0) {
    return ''; // 값이 0이면 빈 문자열을 반환하여 셀을 비웁니다.
  }
  const variant =
    cellImageVariants[row] && cellImageVariants[row][col] ? cellImageVariants[row][col] : 1;
  return `<img src="public/images/hwatu/${num}-${variant}.png" alt="${num}">`;
}

/**
 * 특정 셀의 내용을 다시 렌더링합니다.
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} num - 셀의 숫자 값
 * @param {string} currentTheme - 현재 테마
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 */
export function renderCell(row, col, num, currentTheme, cellImageVariants) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (cell) {
    cell.innerHTML = getValue(row, col, num, currentTheme, cellImageVariants);
    
    // If a number is being rendered, remove the 'cell-quote-char' class
    if (num !== 0 && cell.classList.contains('cell-quote-char')) {
        cell.classList.remove('cell-quote-char');
    }

    // 애니메이션 클래스 추가
    cell.classList.add('card-place-anim');
    // 애니메이션이 끝난 후 클래스 제거
    cell.addEventListener(
      'animationend',
      () => {
        cell.classList.remove('card-place-anim');
      },
      { once: true }
    );
  }
}

/**
 * 족보 모달의 내용을 현재 족보 데이터에 맞게 업데이트합니다.
 * @param {string} currentTheme - 현재 테마
 */
export function updateJokboModal(currentTheme, jokboData) {
  // jokboData added as parameter
  const jokboGrid = document.getElementById('jokbo-grid');
  jokboGrid.innerHTML = '';

  if (currentTheme === 'hwatu') {
    jokboData.forEach((entry) => {
      const jokboEntry = document.createElement('div');
      jokboEntry.classList.add('jokbo-entry');

      let imageHTML = '';
      if (entry.cards === 'pi') {
        imageHTML =
          '<img src="public/images/hwatu/1-3.png" alt="피"> <span style="font-size:12px;">등 피카드</span>';
      } else if (entry.cards === 'tti') {
        imageHTML =
          '<img src="public/images/hwatu/1-2.png" alt="띠"> <span style="font-size:12px;">등 띠카드</span>';
      } else if (entry.cards) {
        imageHTML = entry.cards
          .slice(0, 6)
          .map(
            (card) =>
              `<img src="public/images/hwatu/${card.num}-${card.variant}.png" alt="${entry.name}">`
          )
          .join('');
        if (entry.cards.length > 6) {
          imageHTML += '<span style="font-size:10px; color:#666;">...</span>';
        }
      }

      jokboEntry.innerHTML = `
                <div class="jokbo-info">
                    <h4>${entry.name === '끗' ? '끗 3장' : entry.name}</h4>
                    <div class="jokbo-score">${entry.score.toLocaleString()}점</div>
                </div>
                <div class="jokbo-images">${imageHTML}</div>
            `;
      jokboGrid.appendChild(jokboEntry);
    });
  }
}

/**
 * 랭크 모달의 내용을 업데이트합니다.
 */
export function updateRankModal(rankRangesData, getRankImageFn) {
  const rankGrid = document.getElementById('rank-grid');
  rankGrid.innerHTML = '';

  rankRangesData.forEach((range) => {
    const rankEntry = document.createElement('div');
    rankEntry.classList.add('rank-entry');

    const rankImageSrc = getRankImageFn(range.min); // 해당 랭크의 이미지 가져오기

    rankEntry.innerHTML = `
            <div class="rank-info">
                <h4><span style="color: #00FF00;">${range.rank} 랭크 - ${range.name}</span></h4>
                <div class="rank-score-range">${range.min.toLocaleString()}점 ~ ${range.max.toLocaleString()}점</div>
            </div>
            <div class="rank-image-display">
                <img src="${rankImageSrc}" alt="Rank ${range.rank}" loading="lazy">
            </div>
        `;
    rankGrid.appendChild(rankEntry);
  });
}

/**
 * 랭크 모달을 표시합니다.
 */
export function showRankModal() {
  const rankModal = document.getElementById('rank-modal');
  rankModal.classList.remove('hidden');
}

/**
 * 랭크 모달을 숨깁니다.
 */
export function hideRankModal() {
  const rankModal = document.getElementById('rank-modal');
  rankModal.classList.add('hidden');
}

/**
 * 족보 달성 시 알림을 표시합니다.
 * @param {Array<object>} newJokbo - 새로 달성된 족보 목록
 */
export function showJokboNotification(newJokboDetailed) {
  if (newJokboDetailed.length === 0) return;

  const notification = document.createElement('div');
  notification.className = 'jokbo-notification';

  // 새로 달성된 족보 이름들을 중복 없이 가져옴
  const newJokboNames = newJokboDetailed
    .map((j) => j.name)
    .filter((value, index, self) => self.indexOf(value) === index);
  // 새로 달성된 족보들의 총 점수를 합산
  const newScore = newJokboDetailed.reduce((sum, j) => sum + j.score, 0);

  notification.innerHTML = `
        <div class="jokbo-notification-title">🎴 족보 달성!</div>
        <div class="jokbo-notification-names">
            ${newJokboNames.join(', ')}
        </div>
        <div class="jokbo-notification-score">
            +${newScore.toLocaleString()}점
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000);
}

/**
 * 감점 알림을 표시합니다.
 * @param {number} penaltyAmount - 감점될 점수
 */
export function showPenaltyNotification(penaltyAmount) {
  const notification = document.createElement('div');
  notification.className = 'penalty-notification';
  notification.innerHTML = `
        <div class="penalty-amount">-${penaltyAmount.toLocaleString()}점</div>
        <div class="penalty-text">오답! 점수 감점</div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 1500);
}

/**
 * 행운의 숫자 알림을 표시합니다.
 * @param {number} bonusAmount - 획득한 보너스 점수
 * @param {number} matchCount - 일치 횟수
 */
export function showLuckyNotification(bonusAmount, matchCount) {
  const notification = document.createElement('div');
  notification.className = 'lucky-notification';
  notification.innerHTML = `
        <div style="font-size: 1.1rem; margin-bottom: 8px;">🍀 행운의 숫자 일치!</div>
        <div style="font-size: 1.3rem; font-weight: bold; color: #e65100;">
            +${bonusAmount.toLocaleString()}점
        </div>
        <div style="font-size: 1rem; margin-top: 4px; color: #bf360c;">
            (${matchCount}회 일치)
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2000); // 2초 후 사라짐
}

/**
 * 족보를 달성한 패들을 하이라이트 처리합니다.
 * @param {string} currentTheme - 현재 테마
 * @param {Array<object>} achievedJokbo - 달성된 족보 목록
 * @param {number[][]} board - 9x9 스도쿠 보드
 * @param {number[][]} cellImageVariants - 셀별 이미지 variant 정보
 */
export function highlightJokboCards(
  currentTheme,
  detailedAchievedJokbos,
  board, // eslint-disable-line no-unused-vars
  cellImageVariants // eslint-disable-line no-unused-vars
) {
  document.querySelectorAll('.cell.hanafuda-highlight').forEach((cell) => {
    cell.classList.remove('hanafuda-highlight');
  });

  if (currentTheme !== 'hwatu' || detailedAchievedJokbos.length === 0) return;

  detailedAchievedJokbos.forEach((jokbo) => {
    if (jokbo.contributingCards && jokbo.contributingCards.length > 0) {
      jokbo.contributingCards.forEach((card) => {
        const cell = document.querySelector(`[data-row="${card.row}"][data-col="${card.col}"]`);
        if (cell) cell.classList.add('hanafuda-highlight');
      });
    }
  });
}

/**
 * 현재 점수와 최고 점수 표시를 업데이트합니다.
 * @param {number} currentScore - 현재 점수
 * @param {number} highScore - 최고 점수
 */
export function updateScoreDisplay(
  currentScore,
  highScore,
  currentRankName,
  highScoreRankName,
  currentRankImgSrc,
  highScoreRankImgSrc
) {
  // Get elements by their specific IDs, which are now unique and reliable
  const currentScoreValueEl = document.getElementById('current-score-value');
  const highScoreValueEl = document.getElementById('high-score-value');
  const currentScoreRankImageEl = document.getElementById('current-score-rank-image');
  const highScoreRankImageEl = document.getElementById('high-score-rank-image');
  
  // Get label elements within their new parent containers
  const highScoreLabelEl = document.querySelector('#high-score-display .score-label');
  const currentScoreLabelEl = document.querySelector('#current-score-display .score-label');

  // Update score values
  if (currentScoreValueEl) {
    currentScoreValueEl.textContent = currentScore.toLocaleString();
  }
  if (highScoreValueEl) {
    highScoreValueEl.textContent = highScore.toLocaleString();
  }

  // Update labels with rank names (as per original logic)
  if (highScoreLabelEl) {
    highScoreLabelEl.textContent = highScoreRankName;
  }
  if (currentScoreLabelEl) {
    currentScoreLabelEl.textContent = currentRankName;
  }

  // Update rank images
  if (currentScoreRankImageEl) {
    currentScoreRankImageEl.src = currentRankImgSrc;
  }
  if (highScoreRankImageEl) {
    highScoreRankImageEl.src = highScoreRankImgSrc;
  }

  // Animate the parent container to give feedback
  const scoreDisplay = document.getElementById('score-display');
  if(scoreDisplay) {
    scoreDisplay.classList.add('score-update');
    setTimeout(() => {
      scoreDisplay.classList.remove('score-update');
    }, 600);
  }
}

/**
 * 랭킹 마트 이미지와 별칭을 업데이트합니다.
 */
export function updateRankDisplay(maxScore, rankImageSrc, rankName) {
  const rankImageEl = document.getElementById('current-rank-image');
  const rankAliasEl = document.getElementById('current-rank-alias');

  if (rankImageEl) {
    rankImageEl.src = rankImageSrc;
  }
  if (rankAliasEl) {
    rankAliasEl.textContent = rankName;
  }
}

/**
 * 힌트 개수 표시를 업데이트합니다。
 * @param {number} count - 현재 힌트 개수
 */
export function updateHintCount(count) {
  const hintCountEl = document.getElementById('hint-count');
  const useHintBtn = document.getElementById('use-hint-btn');
  const hintContainer = document.getElementById('hint-container');

  if (hintCountEl) {
    let hintDisplay = '';
    if (count > 0) {
      hintDisplay = '?'.repeat(count); // 물음표 개수만큼 반복
    } else {
      hintDisplay = '(0)'; // 0개일 때는 (0)으로 표시
    }
    hintCountEl.textContent = hintDisplay;
  }
  if (useHintBtn) {
    useHintBtn.disabled = count <= 0;
  }

  if (hintContainer) {
    hintContainer.classList.remove('hidden'); // 힌트 컨테이너는 항상 보이도록
  }
}

/**
 * 스도쿠 완성 모달을 표시합니다.
 * @param {object} gameState - 현재 게임 상태 객체
 * @param {object} finalScoreData - 최종 점수 데이터
 * @param {object} luckyBonusData - 행운의 숫자 보너스 데이터 ({bonus: number, matches: number})
 */
export function showCompletionModal(
  totalScore,
  finalScoreData,
  luckyBonusInfo,
  difficulty,
  penaltyScore,
  achievedSpecialistBonuses,
  jokboData,
  showFortuneFn,
  selectedPassage // <--- NEW PARAMETER
) {
  const completionModal = document.getElementById('completion-modal');
  const completionScore = document.getElementById('completion-score');
  // 'completion-details' 라는 새로운 컨테이너 ID를 사용합니다. (HTML에 추가 필요)
  const completionDetails = document.getElementById('completion-details');

  // --- 점수 계산 로직 (기존과 유사) ---
  const difficultyBonus = {
    easy: Math.floor(finalScoreData.totalScore * 0.5),
    medium: Math.floor(finalScoreData.totalScore * 1.0),
    hard: Math.floor(finalScoreData.totalScore * 2.0),
    random: Math.floor(finalScoreData.totalScore * 1.5), // Bonus for random mode
  };

  let totalSpecialistBonus = 0;
  let specialistBonusDetails = [];
  if (achievedSpecialistBonuses && achievedSpecialistBonuses.length > 0) {
    achievedSpecialistBonuses.forEach((jokboName) => {
      const jokbo = jokboData.find((j) => j.name === jokboName);
      if (jokbo && typeof jokbo.specialistBonus === 'number') {
        const bonusAmount = Math.floor(finalScoreData.totalScore * jokbo.specialistBonus);
        totalSpecialistBonus += bonusAmount;
        specialistBonusDetails.push({ 
          title: jokbo.specialistTitle, 
          amount: bonusAmount 
        });
      }
    });
  }

  const luckyBonusAmount = (luckyBonusInfo && luckyBonusInfo.bonus) ? luckyBonusInfo.bonus : 0;

  const finalScoreValue =
    finalScoreData.totalScore +
    difficultyBonus[difficulty] -
    penaltyScore +
    totalSpecialistBonus +
    luckyBonusAmount;

  // --- 최종 점수 섹션 업데이트 ---
  completionScore.innerHTML = `
    <span class="score-value">${finalScoreValue.toLocaleString()}점</span>
  `;

  // --- 점수 상세 내역 HTML 생성 ---
  let detailsHTML = '';

  if (difficulty === 'random') {
    // Only show completed passage for random mode
    detailsHTML += `
      <div class="detail-section passage-display">
        <h4>완료된 글귀</h4>
        <p>"${selectedPassage.text}" - ${selectedPassage.author}</p>
      </div>
    `;
  } else {
    // 1. 감점 섹션
    if (penaltyScore > 0) {
      detailsHTML += `
        <div class="detail-section penalty-score">
          <p>🚨 총 감점: -${penaltyScore.toLocaleString()}점</p>
        </div>
      `;
    }

    // 2. 족보 점수 섹션
    detailsHTML += `
      <div class="detail-section jokbo-summary">
        <h4>🏆 족보 점수</h4>
        <p>3x3셀: ${finalScoreData.blockScore.toLocaleString()}점</p>
        <p>가로셀: ${finalScoreData.rowScore.toLocaleString()}점</p>
        <p>세로셀: ${finalScoreData.colScore.toLocaleString()}점</p>
      </div>
    `;

    // 3. 달성 족보 상세 섹션
    if (finalScoreData.achievedJokbo.length > 0) {
      detailsHTML += `
        <div class="detail-section jokbo-list">
          <h4>🏆 족보 상세</h4>
          <ul>
            ${finalScoreData.achievedJokbo
              .map((j) => `<li>• ${j.name}: ${j.score.toLocaleString()}점</li>`)
              .join('')}
          </ul>
        </div>
      `;
    }
    
    // 4. 보너스 섹션 (난이도, 전문가, 행운)
    let bonusHTML = '';
    if (difficultyBonus[difficulty] > 0) {
      bonusHTML += `<p class="bonus-item difficulty-bonus">💎 난이도 보너스: +${difficultyBonus[difficulty].toLocaleString()}점</p>`;
    }
    if (totalSpecialistBonus > 0) {
       specialistBonusDetails.forEach(detail => {
          bonusHTML += `<p class="bonus-item specialist-bonus">✨ ${detail.title}: +${detail.amount.toLocaleString()}점</p>`;
       });
    }
    if (luckyBonusAmount > 0) {
      let bonusText = luckyBonusInfo.justAchieved 
        ? '🏆 오늘의 행운 보너스 첫 달성!' 
        : '🍀 오늘의 행운 보너스 적용!';
      bonusHTML += `<p class="bonus-item lucky-bonus">${bonusText} +${luckyBonusAmount.toLocaleString()}점</p>`;
      if (typeof showFortuneFn === 'function') { // 함수인지 확인
        showFortuneFn();
      }
    }

    if (bonusHTML) {
      detailsHTML += `<div class="detail-section bonus-list">${bonusHTML}</div>`;
    }
  }

  // 생성된 HTML을 completion-details 컨테이너에 삽입
  completionDetails.innerHTML = detailsHTML;

  // 모달 표시
  completionModal.classList.remove('hidden');

  return finalScoreValue; // 최종 점수 반환
}

/**
 * 힌트용 미니 팔레트를 표시합니다. (특정 숫자와 3가지 variant만 보여줌)
 * @param {HTMLElement} cell - 기준이 될 셀 요소
 * @param {number} numberToShow - 보여줄 숫자
 * @param {function} onHintPaletteClick - 힌트 팔레트 클릭 시 호출될 콜백 함수
 */
export function showHintPalette(cell, numberToShow, onHintPaletteClick) {
  const miniPalette = document.getElementById('mini-palette');
  miniPalette.innerHTML = ''; // 팔레트 내용 초기화

  // 3가지 variant 버튼 생성
  for (let variant = 1; variant <= 3; variant++) {
    const numberEl = document.createElement('div');
    numberEl.classList.add('mini-number');
    numberEl.dataset.number = numberToShow;
    numberEl.dataset.variant = variant;
    numberEl.innerHTML = `<img src="public/images/hwatu/${numberToShow}-${variant}.png" alt="${numberToShow}-${variant}">`;
          numberEl.addEventListener('click', (e) => {
            if (gameState.isSoundEnabled) {
              document.getElementById('click-sound').play();
            }
            onHintPaletteClick(e);
          });
  }

  showMiniPalette(cell); // 기존 위치 계산 함수 재활용
}

/**
 * 최고 점수 모달을 열고 내용을 채웁니다.
 */
export function showHighScoreModal(highScores) {
  // highScores added as parameter
  const modal = document.getElementById('high-score-modal');
  const tableBody = document.getElementById('high-score-table-body');
  tableBody.innerHTML = ''; // 기존 내용을 초기화합니다.

  if (highScores.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">아직 기록된 점수가 없습니다.</td></tr>';
  } else {
    highScores.forEach((record, index) => {
      const row = document.createElement('tr');
      const difficultyMap = { easy: '쉬움', medium: '보통', hard: '어려움', random: '랜덤' };

      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.score.toLocaleString()}점</td>
                <td>${difficultyMap[record.difficulty] || '알 수 없음'}</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
            `;
      tableBody.appendChild(row);
    });
  }

  modal.classList.remove('hidden');
}

/**
 * 최고 점수 모달을 닫습니다.
 */
export function hideHighScoreModal() {
  const modal = document.getElementById('high-score-modal');
  modal.classList.add('hidden');
}

/**
 * 가이드 셀들을 하이라이트합니다.
 * @param {number} clickedRow - 클릭된 셀의 행
 * @param {number} clickedCol - 클릭된 셀의 열
 * @param {number} clickedNum - 클릭된 셀의 숫자
 */
export function highlightGuideCells(clickedRow, clickedCol, clickedNum) {
  // 기존 하이라이트 제거
  document.querySelectorAll('.cell.highlight-guide-glow').forEach((cell) => {
    cell.classList.remove('highlight-guide-glow');
  });

  // 클릭된 셀과 같은 숫자를 가진 셀들을 하이라이트
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) {
        // Use gameState.board for checking the actual number value
        if (gameState.board[r][c] === clickedNum && gameState.board[r][c] !== 0) {
            cell.classList.add('highlight-guide-glow');
        }
      }
    }
  }

  // 클릭된 셀 자체도 하이라이트 (가장 마지막에 적용하여 확실히 강조)
  const clickedCell = document.querySelector(
    `[data-row="${clickedRow}"][data-col="${clickedCol}"]`
  );
  if (clickedCell) {
    clickedCell.classList.add('highlight-guide-glow');
  }
}

/**
 * 모든 가이드 하이라이트를 제거합니다.
 */
export function clearAllHighlights() {
  document.querySelectorAll('.cell.highlight-guide-glow').forEach((cell) => {
    cell.classList.remove('highlight-guide-glow');
  });
}

/**
 * 족보에 기여하지 않는 셀들을 흐리게 처리합니다.
 * @param {Set<string>} contributingCells - 족보에 기여하는 셀들의 'row-col' 문자열 Set
 */
export function dimNonJokboCells(contributingCells) {
  document.querySelectorAll('#sudoku-board .cell').forEach((cell) => {
    const row = cell.dataset.row;
    const col = cell.dataset.col;
    if (!contributingCells.has(`${row}-${col}`)) {
      cell.classList.add('dimmed');
    }
  });
}

/**
 * 모든 셀의 흐리게 처리 효과를 제거합니다.
 */
export function undimAllCells() {
  document.querySelectorAll('#sudoku-board .cell.dimmed').forEach((cell) => {
    cell.classList.remove('dimmed');
  });
}

/**
 * 전문가 보너스 달성 시 알림을 표시합니다.
 * @param {string} title - 전문가 칭호
 * @param {number} bonusAmount - 보너스 점수
 */
export function showSpecialistBonusNotification(title, bonusAmount) {
  const storageKey = `specialist-notification-shown-${title}`;
  if (localStorage.getItem(storageKey)) {
    return; // 이미 표시된 경우, 다시 표시하지 않음
  }

  const notification = document.createElement('div');
  notification.className = 'specialist-bonus-notification';

  notification.innerHTML = `
        <div style="font-size: 1.2rem; margin-bottom: 8px;">🏆 전문가 보너스 달성!</div>
        <div style="font-size: 1.4rem; font-weight: bold; color: #ffd600;">${title}</div>
        <div style="font-size: 1.1rem; margin-top: 8px; color: #e0e0e0;">
            +${bonusAmount.toLocaleString()}점
        </div>
    `;
  localStorage.setItem(storageKey, 'true'); // 알림 표시 후 플래그 설정

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 2500); // 2.5초 후 사라짐
}

/**
 * 달성된 족보를 메인 화면에 표시하고, 족보별 개수를 함께 보여줍니다.
 * @param {object} dailyJokboCounts - 일일 족보 달성 횟수 객체 (누적)
 */
export function updateAchievedJokboDisplay(
  totalJokboCounts,
  blockJokboCounts,
  jokboData
) {
  const jokboDisplayContainer = document.getElementById('jokbo-display-container');
  jokboDisplayContainer.innerHTML = ''; // 이전 내용 초기화

  // 족보 이름별로 개수를 집계합니다. (이미 집계된 dailyJokboCounts 사용)
  const jokboCounts = totalJokboCounts;

  // 족보 데이터에서 대표 이미지를 찾기 위한 맵을 생성합니다.
  const jokboImageMap = new Map();
  jokboData.forEach((j) => {
    if (j.mainImage) {
      jokboImageMap.set(j.name, j.mainImage);
    }
  });

  // 집계된 족보들을 화면에 표시합니다.
  const excludedJokbos = ['피 5장', '띠 5장', '끗'];
  let hasContent = false;
  for (const name in jokboCounts) {
    if (jokboImageMap.has(name) && !excludedJokbos.includes(name)) {
      hasContent = true;
      // 피, 띠, 끗 족보 제외
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('jokbo-display-item');
      itemDiv.title = `${name} (${blockJokboCounts[name] || 0}개)`; // 툴팁에 블록 족보 개수 표시

      const img = document.createElement('img');
      img.src = `public/images/hwatu/${jokboImageMap.get(name)}`;
      img.alt = name;

      const countSpan = document.createElement('span');
      countSpan.classList.add('jokbo-count');
      countSpan.textContent = blockJokboCounts[name] || 0; // 아이콘에 블록 족보 개수 표시

      itemDiv.appendChild(img);
      itemDiv.appendChild(countSpan);

      // 여기에 하이라이트 로직 추가
      const highlightCount = blockJokboCounts[name] || 0; // 블록 족보 카운트로 하이라이트
      if (highlightCount >= 5) {
        itemDiv.classList.add('jokbo-individual-highlight');
      }

      jokboDisplayContainer.appendChild(itemDiv);
    }
  }

  if (hasContent) {
    jokboDisplayContainer.classList.remove('hidden');
  } else {
    jokboDisplayContainer.classList.add('hidden');
  }
}

/**
 * 게임 보드에서 보너스 블록을 하이라이트합니다.
 * @param {object} bonusBlock - 보너스 블록의 {row, col} 인덱스 (0-2)
 */
export function highlightBonusBlock(bonusBlock) {
  // 기존 하이라이트 제거
  document.querySelectorAll('.sudoku-block.bonus-block-highlight').forEach(block => {
    block.classList.remove('bonus-block-highlight');
  });

  if (bonusBlock && bonusBlock.row !== -1 && bonusBlock.col !== -1) {
    const targetBlock = document.querySelector(
      `.sudoku-block[data-block-row="${bonusBlock.row}"][data-block-col="${bonusBlock.col}"]`
    );
    if (targetBlock) {
      targetBlock.classList.add('bonus-block-highlight');
    }
  }
}

/**
 * passages.json 파일을 불러와 랜덤 글귀를 화면에 표시하는 함수
 */
export async function displayRandomPassage() {
  try {
    // 1. passages.json 파일 가져오기
    const response = await fetch('./public/data/passages.json');
    const passages = await response.json();

    if (passages.length === 0) {
      console.warn("passages.json 파일에 글귀가 없습니다.");
      return;
    }

    // 2. 랜덤 글귀 선택하기
    const randomIndex = Math.floor(Math.random() * passages.length);
    const randomPassage = passages[randomIndex];

    // 3. HTML 요소에 글귀 표시하기
    const passageElement = document.getElementById('random-passage');
    if (passageElement) {
      passageElement.textContent = `"${randomPassage.text}" - ${randomPassage.author}`;
    }
  } catch (error) {
    console.error('글귀를 불러오는 데 실패했습니다:', error);
  }
}

/**
 * 랜덤 글귀를 표시하는 요소의 가시성을 설정합니다.
 * @param {boolean} show - 글귀를 표시할지 숨길지 여부
 */
export function setPassageVisibility(show) {
  const passageElement = document.getElementById('random-passage');
  if (passageElement) {
    if (show) {
      passageElement.classList.remove('hidden');
    } else {
      passageElement.classList.add('hidden');
    }
  }
}