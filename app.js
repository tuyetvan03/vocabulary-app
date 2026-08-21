document.addEventListener('DOMContentLoaded', () => {
    // Dataset initialization (Built-in dataset removed)
    let defaultDataset = [];

    // App state
    let activeLevel = 'ALL';
    let searchQuery = '';
    let currentWords = [];
    let flashcardIndex = 0;

    // Folders & Lessons state
    let userFolders = [];
    let activeLessonId = null;
    let selectedLessonIds = [];
    let selectedFolderId = null;
    let previewExtractedWords = [];

    // Bookmarks (Set of word IDs)
    let bookmarks = new Set();
    try {
        const savedStars = localStorage.getItem('oxford5000_bookmarks');
        if (savedStars) {
            const parsed = JSON.parse(savedStars);
            if (Array.isArray(parsed)) {
                bookmarks = new Set(parsed);
            }
        }
    } catch (e) {
        console.error('Lỗi đọc localStorage bookmarks:', e);
    }

    // Quiz State
    let quizQuestions = [];
    let currentQIdx = 0;
    let quizScore = 0;
    let quizMode = 'EN_TO_VI'; // 'EN_TO_VI' or 'VI_TO_EN'
    let currentQuestionObj = null;
    let answeredState = false;
    let wrongAnswerWordIds = new Set();

    // DOM Elements - Main Controls
    const searchInput = document.getElementById('vocab-search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const nInput = document.getElementById('vocab-n-input');
    const levelChips = document.querySelectorAll('.level-chip');
    const levelDropdownSelect = document.getElementById('level-dropdown-select');
    const btnGenerate = document.getElementById('btn-generate');
    
    const resultCount = document.getElementById('result-count');
    const currentFilterBadge = document.getElementById('current-filter-badge');
    const starCountSpan = document.getElementById('star-count');

    // DOM Elements - Lesson Selector Bar
    const btnOpenMultiLessonPicker = document.getElementById('btn-open-multi-lesson-picker');
    const multiLessonPickerLabel = document.getElementById('multi-lesson-picker-label');
    const multiLessonDropdown = document.getElementById('multi-lesson-dropdown');
    const multiLessonCheckboxesContainer = document.getElementById('multi-lesson-checkboxes-container');
    const btnMultiLessonSelectAll = document.getElementById('btn-multi-lesson-select-all');
    const btnMultiLessonDeselectAll = document.getElementById('btn-multi-lesson-deselect-all');
    const activeLessonCountBadge = document.getElementById('active-lesson-count');
    const btnOpenFolderMgr = document.getElementById('btn-open-folder-mgr');
    const btnOpenAddVocab = document.getElementById('btn-open-add-vocab');

    // DOM Elements - Views
    const btnViewCards = document.getElementById('btn-view-cards');
    const btnViewTable = document.getElementById('btn-view-table');
    const btnViewFlashcard = document.getElementById('btn-view-flashcard');
    const btnViewQuiz = document.getElementById('btn-view-quiz');

    const viewCardsContainer = document.getElementById('view-cards-container');
    const viewTableContainer = document.getElementById('view-table-container');
    const viewFlashcardContainer = document.getElementById('view-flashcard-container');
    const viewQuizContainer = document.getElementById('view-quiz-container');
    const tableBody = document.getElementById('table-body');

    // DOM Elements - Theme Switcher & Actions
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const themeBtnText = document.getElementById('theme-btn-text');
    const btnClearBookmarks = document.getElementById('btn-clear-bookmarks');
    const btnCopy = document.getElementById('btn-copy');
    const btnExportTxt = document.getElementById('btn-export-txt');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    // DOM Elements - Flashcard
    const flashcardElement = document.getElementById('flashcard-element');
    const fcStarBtn = document.getElementById('fc-star-btn');
    const fcNum = document.getElementById('fc-num');
    const fcWord = document.getElementById('fc-word');
    const fcPos = document.getElementById('fc-pos');
    const fcLevel = document.getElementById('fc-level');
    const fcWordBack = document.getElementById('fc-word-back');
    const fcMeaning = document.getElementById('fc-meaning');
    const fcBtnSpeak = document.getElementById('fc-btn-speak');
    const fcBtnNote = document.getElementById('fc-btn-note');
    const fcDictCambridge = document.getElementById('fc-dict-cambridge');
    const fcPrev = document.getElementById('fc-prev');
    const fcNext = document.getElementById('fc-next');
    const fcCounter = document.getElementById('fc-counter');

    // DOM Elements - Quiz
    const quizSourceSelect = document.getElementById('quiz-source-select');
    const quizModeSelect = document.getElementById('quiz-mode-select');
    const quizTypeSelect = document.getElementById('quiz-type-select');
    const quizCustomLessonsCard = document.getElementById('quiz-custom-lessons-card');
    const quizLessonsCheckboxesContainer = document.getElementById('quiz-lessons-checkboxes-container');
    const btnQuizSelectAllLessons = document.getElementById('btn-quiz-select-all-lessons');
    const btnQuizDeselectAllLessons = document.getElementById('btn-quiz-deselect-all-lessons');
    const btnStartQuiz = document.getElementById('btn-start-quiz');
    const btnQuizRetryHeader = document.getElementById('btn-quiz-retry-header');

    const quizProgressBarContainer = document.getElementById('quiz-progress-bar-container');
    const quizCurrentIdxSpan = document.getElementById('quiz-current-idx');
    const quizTotalIdxSpan = document.getElementById('quiz-total-idx');
    const quizLiveScoreSpan = document.getElementById('quiz-live-score');
    const quizLiveAnsweredSpan = document.getElementById('quiz-live-answered');
    const quizProgressFill = document.getElementById('quiz-progress-fill');
    const examReviewContainer = document.getElementById('exam-review-container');

    const quizQuestionBox = document.getElementById('quiz-question-box');
    const qTag = document.getElementById('q-tag');
    const qPos = document.getElementById('q-pos');
    const qTitle = document.getElementById('q-title');
    const qSubtext = document.getElementById('q-subtext');
    const optionCards = document.querySelectorAll('.option-card');

    const questionFeedback = document.getElementById('question-feedback');
    const feedbackMsg = document.getElementById('feedback-msg');
    const btnNextQuestion = document.getElementById('btn-next-question');
    const btnPrevQuestion = document.getElementById('btn-prev-question');
    const btnPrevQuestionHeader = document.getElementById('btn-prev-question-header');
    const btnNextQuestionHeader = document.getElementById('btn-next-question-header');

    const quizResultsCard = document.getElementById('quiz-results-card');
    const finalScorePercent = document.getElementById('final-score-percent');
    const finalScoreText = document.getElementById('final-score-text');
    const resultsMessage = document.getElementById('results-message');
    const btnRetryQuiz = document.getElementById('btn-retry-quiz');
    const btnSaveWrongStars = document.getElementById('btn-save-wrong-stars');

    // DOM Elements - Vocab Stats Modal
    const btnShowVocabStats = document.getElementById('btn-show-vocab-stats');
    const modalVocabStats = document.getElementById('modal-vocab-stats');
    const btnCloseVocabStatsModal = document.getElementById('btn-close-vocab-stats-modal');
    const btnCloseVocabStatsFooter = document.getElementById('btn-close-vocab-stats-footer');
    const statsDatasetTitle = document.getElementById('stats-dataset-title');
    const statsTotalWordsCount = document.getElementById('stats-total-words-count');
    const statsLevelList = document.getElementById('stats-level-list');

    // DOM Elements - Folder Manager Modal
    const modalFolderMgr = document.getElementById('modal-folder-mgr');
    const btnCloseFolderMgr = document.getElementById('btn-close-folder-mgr');
    const btnAddFolder = document.getElementById('btn-add-folder');
    const folderListContainer = document.getElementById('folder-list-container');
    const currentFolderName = document.getElementById('current-folder-name');
    const currentFolderDesc = document.getElementById('current-folder-desc');
    const btnEditFolder = document.getElementById('btn-edit-folder');
    const btnDeleteFolder = document.getElementById('btn-delete-folder');
    const btnAddLesson = document.getElementById('btn-add-lesson');
    const lessonsGrid = document.getElementById('lessons-grid');

    // DOM Elements - Import Vocab Modal
    const modalImportVocab = document.getElementById('modal-import-vocab');
    const btnCloseImportVocab = document.getElementById('btn-close-import-vocab');
    const btnCancelImport = document.getElementById('btn-cancel-import');
    const importTargetLessonSelect = document.getElementById('import-target-lesson-select');
    const importTabs = document.querySelectorAll('.import-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const inpWord = document.getElementById('inp-word');
    const inpPos = document.getElementById('inp-pos');
    const inpLevel = document.getElementById('inp-level');
    const inpMeaning = document.getElementById('inp-meaning');
    const inpExample = document.getElementById('inp-example');
    const btnAddSingleWord = document.getElementById('btn-add-single-word');
    const bulkTextInput = document.getElementById('bulk-text-input');
    const btnParseBulkText = document.getElementById('btn-parse-bulk-text');

    const inputFileWord = document.getElementById('input-file-word');
    const btnSelectWordFile = document.getElementById('btn-select-word-file');
    const dropzoneWord = document.getElementById('dropzone-word');

    const inputFilePdf = document.getElementById('input-file-pdf');
    const btnSelectPdfFile = document.getElementById('btn-select-pdf-file');
    const dropzonePdf = document.getElementById('dropzone-pdf');

    const inputFileImage = document.getElementById('input-file-image');
    const btnSelectImageFile = document.getElementById('btn-select-image-file');
    const dropzoneImage = document.getElementById('dropzone-image');
    const ocrStatus = document.getElementById('ocr-status');
    const ocrMsg = document.getElementById('ocr-msg');

    const previewCount = document.getElementById('preview-count');
    const btnClearPreview = document.getElementById('btn-clear-preview');
    const previewTableBody = document.getElementById('preview-table-body');
    const btnSaveImportedWords = document.getElementById('btn-save-imported-words');

    // DOM Elements - Word Note Modal
    const modalWordNote = document.getElementById('modal-word-note');
    const noteModalWordTitle = document.getElementById('note-modal-word-title');
    const noteTextInput = document.getElementById('note-text-input');
    const btnCloseNoteModal = document.getElementById('btn-close-note-modal');
    const btnSaveNote = document.getElementById('btn-save-note');
    const btnClearNote = document.getElementById('btn-clear-note');

    // DOM Elements - Manage Lesson Words Modal
    const modalManageLessonWords = document.getElementById('modal-manage-lesson-words');
    const lessonWordsModalTitle = document.getElementById('lesson-words-modal-title');
    const lessonWordsModalCount = document.getElementById('lesson-words-modal-count');
    const lessonWordsFilteredCount = document.getElementById('lesson-words-filtered-count');
    const btnAddWordToLesson = document.getElementById('btn-add-word-to-lesson');
    const btnCloseLessonWordsModal = document.getElementById('btn-close-lesson-words-modal');
    const btnCloseLessonWordsModalFooter = document.getElementById('btn-close-lesson-words-modal-footer');
    const btnOpenImportFromWordsModal = document.getElementById('btn-open-import-from-words-modal');
    const lessonWordsSearchInput = document.getElementById('lesson-words-search-input');
    const lessonWordEditorCard = document.getElementById('lesson-word-editor-card');
    const btnCancelEditLessonWord = document.getElementById('btn-cancel-edit-lesson-word');
    const btnSaveLessonWord = document.getElementById('btn-save-lesson-word');
    const lessonWordsTableBody = document.getElementById('lesson-words-table-body');

    // Lesson Words Management State
    let currentManagingLesson = null;
    let currentLessonWordsFilter = '';

    // Word Notes Data Store
    let userNotes = {};
    let currentNoteWordObj = null;
    let activeViewMode = 'cards';

    // ==========================================
    // INITIALIZATION & DATA STORE
    // ==========================================

    function getOxford5000RawData() {
        if (typeof window !== 'undefined' && Array.isArray(window.OXFORD_5000_DATA) && window.OXFORD_5000_DATA.length > 0) {
            return window.OXFORD_5000_DATA;
        }
        if (Array.isArray(userFolders)) {
            const oxfordFolder = userFolders.find(f => f.id === 'folder_oxford');
            if (oxfordFolder && Array.isArray(oxfordFolder.lessons)) {
                const allLesson = oxfordFolder.lessons.find(l => l.id === 'oxford_all');
                if (allLesson && Array.isArray(allLesson.words) && allLesson.words.length > 0) {
                    return allLesson.words;
                }
            }
        }
        return defaultDataset || [];
    }

    function buildDefaultOxfordFolder() {
        const allWords = getOxford5000RawData();
        if (!allWords || allWords.length === 0) return null;

        const b2Words = allWords.filter(w => w.level === 'B2');
        const c1Words = allWords.filter(w => w.level === 'C1');

        return {
            id: 'folder_oxford',
            name: '📚 Bộ từ vựng chuẩn Oxford 5000',
            description: 'Bộ từ vựng chuẩn Oxford 5000 phân loại B2 và C1 kèm nghĩa Tiếng Việt',
            icon: 'fa-book-atlas',
            isDefault: false,
            lessons: [
                {
                    id: 'oxford_all',
                    folderId: 'folder_oxford',
                    name: 'Oxford 5000 - Tất cả từ vựng',
                    description: `Tổng hợp tất cả ${allWords.length} từ vựng Oxford 5000`,
                    isDefault: false,
                    words: allWords
                },
                {
                    id: 'oxford_b2',
                    folderId: 'folder_oxford',
                    name: 'Oxford 5000 - Cấp độ B2',
                    description: `Danh sách ${b2Words.length} từ vựng cấp độ B2`,
                    isDefault: false,
                    words: b2Words
                },
                {
                    id: 'oxford_c1',
                    folderId: 'folder_oxford',
                    name: 'Oxford 5000 - Cấp độ C1',
                    description: `Danh sách ${c1Words.length} từ vựng cấp độ C1`,
                    isDefault: false,
                    words: c1Words
                }
            ]
        };
    }

    function sanitizeUserFolders(folders) {
        if (!Array.isArray(folders)) return [];
        return folders.map(f => {
            const lessons = Array.isArray(f.lessons)
                ? f.lessons.map(l => {
                    if (Array.isArray(l.words)) {
                        const seen = new Set();
                        const uniqueWords = [];
                        l.words.forEach(w => {
                            const key = (w.word || '').toLowerCase().trim();
                            if (key && !seen.has(key)) {
                                seen.add(key);
                                uniqueWords.push(w);
                            }
                        });
                        return { ...l, words: uniqueWords };
                    }
                    return l;
                })
                : [];
            return { ...f, lessons };
        });
    }

    function ensureValidFolderSelection() {
        userFolders = sanitizeUserFolders(userFolders);

        let oxfordFolder = userFolders.find(f => f.id === 'folder_oxford');
        const defaultOxford = buildDefaultOxfordFolder();

        if (defaultOxford) {
            if (!oxfordFolder) {
                userFolders.unshift(defaultOxford);
                oxfordFolder = defaultOxford;
            } else {
                const allLesson = oxfordFolder.lessons ? oxfordFolder.lessons.find(l => l.id === 'oxford_all') : null;
                if (!allLesson || !allLesson.words || allLesson.words.length === 0) {
                    oxfordFolder.lessons = defaultOxford.lessons;
                }
            }
        }

        let currentFolder = userFolders.find(f => f.id === selectedFolderId);
        if (!currentFolder && userFolders.length > 0) {
            selectedFolderId = userFolders[0].id;
            currentFolder = userFolders[0];
        }

        if (!selectedLessonIds || selectedLessonIds.length === 0) {
            if (oxfordFolder && oxfordFolder.lessons && oxfordFolder.lessons.length > 0) {
                selectedLessonIds = [oxfordFolder.lessons[0].id];
                activeLessonId = oxfordFolder.lessons[0].id;
                selectedFolderId = oxfordFolder.id;
            } else if (currentFolder && currentFolder.lessons && currentFolder.lessons.length > 0) {
                selectedLessonIds = [currentFolder.lessons[0].id];
                activeLessonId = currentFolder.lessons[0].id;
            } else {
                let foundLesson = null;
                for (const f of userFolders) {
                    if (f.lessons && f.lessons.length > 0) {
                        foundLesson = f.lessons[0];
                        selectedFolderId = f.id;
                        break;
                    }
                }
                if (foundLesson) {
                    selectedLessonIds = [foundLesson.id];
                    activeLessonId = foundLesson.id;
                } else {
                    activeLessonId = null;
                }
            }
        }
    }

    function mergeFolderLists(primaryFolders, secondaryFolders) {
        const folderMap = new Map();

        (primaryFolders || []).forEach(f => {
            folderMap.set(f.id, {
                ...f,
                lessons: Array.isArray(f.lessons) ? [...f.lessons] : []
            });
        });

        (secondaryFolders || []).forEach(sf => {
            if (!folderMap.has(sf.id)) {
                folderMap.set(sf.id, {
                    ...sf,
                    lessons: Array.isArray(sf.lessons) ? [...sf.lessons] : []
                });
            } else {
                const existingFolder = folderMap.get(sf.id);
                const existingLessonIds = new Set((existingFolder.lessons || []).map(l => l.id));
                if (Array.isArray(sf.lessons)) {
                    sf.lessons.forEach(sl => {
                        if (!existingLessonIds.has(sl.id)) {
                            existingFolder.lessons.push(sl);
                        }
                    });
                }
            }
        });

        return Array.from(folderMap.values());
    }

    function saveFoldersToLocalOnly() {
        try {
            userFolders = sanitizeUserFolders(userFolders);
            localStorage.setItem('user_vocab_folders_v1', JSON.stringify(userFolders));
        } catch (e) {
            console.error('Lỗi ghi localStorage userFolders:', e);
        }
    }

    function saveFolders() {
        saveFoldersToLocalOnly();
        const payload = { folders: userFolders };
        fetch('/api/save-folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.log('Đã lưu local (Server offline/GitHub Pages):', err));
    }

    function populateActiveLessonSelect() {
        populateMultiLessonPicker();
    }

    function loadUserFolders() {
        let localFolders = [];
        try {
            const savedFolders = localStorage.getItem('user_vocab_folders_v1');
            if (savedFolders) {
                const parsed = JSON.parse(savedFolders);
                if (Array.isArray(parsed)) {
                    localFolders = sanitizeUserFolders(parsed);
                    userFolders = localFolders;
                }
            }
        } catch (e) {
            console.error('Lỗi đọc userFolders local:', e);
        }

        // Disk sync from server.py or fallback user_folders.json
        fetch('/api/load-folders')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Array.isArray(data.folders)) {
                    const cleanServerFolders = sanitizeUserFolders(data.folders);
                    userFolders = mergeFolderLists(cleanServerFolders, localFolders);
                    saveFolders();
                } else if (localFolders.length > 0) {
                    userFolders = localFolders;
                    saveFolders();
                }
            })
            .catch(e => {
                return fetch('user_folders.json')
                    .then(res => res.ok ? res.json() : null)
                    .then(diskData => {
                        if (diskData && Array.isArray(diskData.folders)) {
                            const cleanDiskFolders = sanitizeUserFolders(diskData.folders);
                            userFolders = mergeFolderLists(cleanDiskFolders, localFolders);
                            saveFolders();
                        } else if (localFolders.length > 0) {
                            userFolders = localFolders;
                            saveFoldersToLocalOnly();
                        }
                    });
            })
            .finally(() => {
                ensureValidFolderSelection();
                populateActiveLessonSelect();
                updateDatasetStats();
                generateRandomWords();
            });
    }

    const loadFolders = loadUserFolders;

    // ==========================================
    // USER NOTES MANAGEMENT
    // ==========================================
    function saveNotesToLocalOnly() {
        try {
            localStorage.setItem('user_vocab_notes_v1', JSON.stringify(userNotes));
        } catch (e) {
            console.error('Lỗi ghi notes local:', e);
        }
    }

    function saveNotes() {
        saveNotesToLocalOnly();
        fetch('/api/save-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: userNotes })
        }).catch(e => console.log('Notes saved local only:', e));
    }

    function loadUserNotes() {
        try {
            const saved = localStorage.getItem('user_vocab_notes_v1');
            if (saved) {
                userNotes = JSON.parse(saved) || {};
            }
        } catch (e) {
            console.error('Lỗi đọc local notes:', e);
        }

        fetch('/api/load-notes')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.notes && typeof data.notes === 'object') {
                    userNotes = { ...data.notes, ...userNotes };
                    saveNotesToLocalOnly();
                }
            })
            .catch(e => console.log('Notes disk sync skipped:', e));
    }

    function openWordNoteModal(wordObj) {
        if (!wordObj) return;
        currentNoteWordObj = wordObj;

        const noteKey = String(wordObj.id || wordObj.word);
        const existingNote = userNotes[noteKey] || '';

        if (noteModalWordTitle) noteModalWordTitle.textContent = wordObj.word;
        if (noteTextInput) noteTextInput.value = existingNote;

        if (modalWordNote) modalWordNote.classList.remove('hidden');
    }

    function closeWordNoteModal() {
        if (modalWordNote) modalWordNote.classList.add('hidden');
        currentNoteWordObj = null;
    }

    function saveCurrentNote() {
        if (!currentNoteWordObj) return;
        const noteKey = String(currentNoteWordObj.id || currentNoteWordObj.word);
        const text = noteTextInput ? noteTextInput.value.trim() : '';

        if (text) {
            userNotes[noteKey] = text;
            showToast(`📝 Đã lưu ghi chú cho từ "${currentNoteWordObj.word}"!`);
        } else {
            delete userNotes[noteKey];
            showToast(`Đã xóa ghi chú của từ "${currentNoteWordObj.word}".`);
        }

        saveNotes();
        closeWordNoteModal();
        renderCurrentView();
    }

    function clearCurrentNote() {
        if (!currentNoteWordObj) return;
        const noteKey = String(currentNoteWordObj.id || currentNoteWordObj.word);
        delete userNotes[noteKey];
        if (noteTextInput) noteTextInput.value = '';
        saveNotes();
        showToast(`Đã xóa ghi chú của từ "${currentNoteWordObj.word}".`);
        closeWordNoteModal();
        renderCurrentView();
    }

    function renderCurrentView() {
        if (activeViewMode === 'cards') {
            renderCardsView();
        } else if (activeViewMode === 'table') {
            renderTableView();
        } else if (activeViewMode === 'flashcard') {
            updateFlashcardView();
        }
    }

    function saveFoldersToLocalOnly() {
        try {
            localStorage.setItem('user_vocab_folders_v1', JSON.stringify(userFolders));
        } catch (e) {
            console.error('Lỗi ghi folders local:', e);
        }
    }

    function saveFolders() {
        saveFoldersToLocalOnly();
        fetch('/api/save-folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folders: userFolders })
        }).catch(e => console.log('Saved folders local only:', e));
    }

    const btnSyncToSource = document.getElementById('btn-sync-to-source');
    if (btnSyncToSource) {
        btnSyncToSource.addEventListener('click', () => {
            saveFolders();
            try {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ folders: userFolders }, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "user_folders.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            } catch (e) {
                console.error('Download fallback error:', e);
            }
            showToast("✔ Đã đồng bộ lên Server & lưu file user_folders.json thành công!");
        });
    }

    // Returns active dataset array based on selectedLessonIds (combines multiple lessons if selected)
    function getActiveDataset() {
        if (!selectedLessonIds || selectedLessonIds.length === 0) {
            return [];
        }

        const combinedWords = [];
        const addedKeys = new Set();

        userFolders.forEach(folder => {
            if (Array.isArray(folder.lessons)) {
                folder.lessons.forEach(lesson => {
                    if (selectedLessonIds.includes(lesson.id) && Array.isArray(lesson.words)) {
                        lesson.words.forEach(w => {
                            const key = String(w.id || w.word);
                            if (!addedKeys.has(key)) {
                                addedKeys.add(key);
                                combinedWords.push(w);
                            }
                        });
                    }
                });
            }
        });

        return combinedWords;
    }

    function findLessonById(lessonId) {
        if (!lessonId || !Array.isArray(userFolders)) return null;
        for (const folder of userFolders) {
            if (Array.isArray(folder.lessons)) {
                const found = folder.lessons.find(l => l.id === lessonId);
                if (found) return found;
            }
        }
        return null;
    }

    function updateDatasetStats() {
        const activeData = getActiveDataset();
        const totalElem = document.getElementById('total-count');
        const b2Elem = document.getElementById('b2-count');
        const c1Elem = document.getElementById('c1-count');

        if (totalElem) totalElem.textContent = activeData.length;
        if (b2Elem) b2Elem.textContent = activeData.filter(w => w.level === 'B2').length;
        if (c1Elem) c1Elem.textContent = activeData.filter(w => w.level === 'C1').length;
        if (starCountSpan) starCountSpan.textContent = bookmarks.size;
    }

    function saveBookmarksToLocalOnly() {
        try {
            localStorage.setItem('oxford5000_bookmarks', JSON.stringify(Array.from(bookmarks)));
        } catch (e) {
            console.error('Lỗi ghi localstorage:', e);
        }
        starCountSpan.textContent = bookmarks.size;
    }

    function saveBookmarks() {
        saveBookmarksToLocalOnly();

        if (activeLevel === 'BOOKMARKS' && bookmarks.size > 0) {
            btnClearBookmarks.classList.remove('hidden');
        } else {
            btnClearBookmarks.classList.add('hidden');
        }

        const arr = Array.from(bookmarks);
        fetch('/api/save-bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookmarks: arr })
        }).catch(err => console.log('Đã lưu local (Server offline):', err));
    }

    function getWordId(itemOrId) {
        if (itemOrId === undefined || itemOrId === null) return '';
        if (typeof itemOrId === 'object') {
            const idVal = (itemOrId.id !== undefined && itemOrId.id !== null && itemOrId.id !== '') ? itemOrId.id : itemOrId.word;
            return String(idVal || '').trim();
        }
        return String(itemOrId).trim();
    }

    function hasBookmark(itemOrId) {
        const key = getWordId(itemOrId);
        if (!key) return false;
        if (bookmarks.has(key)) return true;
        const num = Number(key);
        if (!isNaN(num) && bookmarks.has(num)) return true;
        return bookmarks.has(String(key));
    }

    function removeBookmark(itemOrId) {
        const key = getWordId(itemOrId);
        if (!key) return;
        bookmarks.delete(key);
        const num = Number(key);
        if (!isNaN(num)) bookmarks.delete(num);
        bookmarks.delete(String(key));
    }

    function addBookmark(itemOrId) {
        const key = getWordId(itemOrId);
        if (!key) return;
        const num = Number(key);
        if (!isNaN(num) && String(num) === key) {
            bookmarks.add(num);
        }
        bookmarks.add(key);
    }

    function toggleBookmark(itemOrId) {
        const key = getWordId(itemOrId);
        if (!key) return;

        const isStarredCurrently = hasBookmark(key);

        if (isStarredCurrently) {
            removeBookmark(key);
            showToast('Đã xóa 1 từ khỏi "Từ khó nhớ".');
            if (activeLevel === 'BOOKMARKS') {
                currentWords = currentWords.filter(w => hasBookmark(w));
                if (resultCount) resultCount.textContent = currentWords.length;
                renderCardsView();
                renderTableView();
                updateFlashcardView();
                saveBookmarks();
                return;
            }
        } else {
            addBookmark(key);
            showToast('⭐ Đã lưu vào "Từ khó nhớ"!');
        }
        saveBookmarks();
        
        const nowStarred = !isStarredCurrently;
        const safeKey = (window.CSS && window.CSS.escape) ? window.CSS.escape(key) : String(key).replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');

        // Instant DOM element updates for all matching star buttons
        try {
            document.querySelectorAll(`.star-btn[data-id="${safeKey}"], .btn-review-star[data-id="${safeKey}"]`).forEach(starBtn => {
                starBtn.classList.toggle('starred', nowStarred);
                const icon = starBtn.querySelector('i');
                if (icon) {
                    icon.className = nowStarred ? 'fa-solid fa-star' : 'fa-regular fa-star';
                }
            });
        } catch (e) {
            console.warn('Selector error, falling back to class update:', e);
        }

        // Instant update for Flashcard star button if active
        if (typeof currentWords !== 'undefined' && currentWords[flashcardIndex]) {
            const currentFcKey = getWordId(currentWords[flashcardIndex]);
            if (currentFcKey === key && fcStarBtn) {
                fcStarBtn.className = `fc-star-btn ${nowStarred ? 'starred' : ''}`;
                fcStarBtn.innerHTML = `<i class="${nowStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
            }
        }

        // Update header star counter badge
        if (starCountSpan) starCountSpan.textContent = bookmarks.size;
    }

    function clearAllBookmarks() {
        if (bookmarks.size === 0) return;
        if (confirm(`Bạn có chắc chắn muốn bỏ đánh dấu tất cả ${bookmarks.size} từ khó nhớ?`)) {
            bookmarks.clear();
            saveBookmarks();
            showToast('Đã xóa toàn bộ từ khó nhớ.');
            generateRandomWords();
        }
    }

    function exportBookmarksFile() {
        if (bookmarks.size === 0) {
            showToast('Chưa có từ khó nhớ nào để xuất file.');
            return;
        }
        const dataStr = JSON.stringify(Array.from(bookmarks), null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`💾 Đã xuất file dự phòng (${bookmarks.size} từ khó nhớ)!`);
    }

    function importBookmarksFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedIds = JSON.parse(event.target.result);
                if (Array.isArray(importedIds)) {
                    importedIds.forEach(id => bookmarks.add(id));
                    saveBookmarks();
                    showToast(`📂 Đã nạp thành công ${importedIds.length} từ khó từ file!`);
                    generateRandomWords();
                } else {
                    showToast('Cấu trúc file không hợp lệ.');
                }
            } catch (err) {
                showToast('Lỗi đọc file JSON.');
            }
        };
        reader.readAsText(file);
    }

    // ==========================================
    // MULTI-LESSON SELECTOR
    // ==========================================
    function populateMultiLessonPicker() {
        if (!multiLessonCheckboxesContainer) return;
        multiLessonCheckboxesContainer.innerHTML = '';

        if (!userFolders || userFolders.length === 0) {
            multiLessonCheckboxesContainer.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 13px; text-align: center;">
                <i class="fa-solid fa-circle-info"></i> Chưa có bài học nào. Bạn hãy mở "📁 Quản Lý Thư Mục" để tạo bài học mới!
            </div>`;
            updateMultiLessonPickerHeader();
            return;
        }

        userFolders.forEach(folder => {
            if (!Array.isArray(folder.lessons) || folder.lessons.length === 0) return;

            const folderTitle = document.createElement('div');
            folderTitle.style.cssText = 'font-size: 11px; font-weight: 800; color: var(--accent-cyan); margin-top: 6px; padding-left: 2px; text-transform: uppercase;';
            folderTitle.innerHTML = `<i class="fa-solid fa-folder"></i> ${escapeHtml(folder.name)}`;
            multiLessonCheckboxesContainer.appendChild(folderTitle);

            folder.lessons.forEach(lesson => {
                const count = lesson.words ? lesson.words.length : 0;
                const isChecked = selectedLessonIds.includes(lesson.id);

                const item = document.createElement('label');
                item.className = 'multi-lesson-item-option';
                item.innerHTML = `
                    <input type="checkbox" class="multi-lesson-checkbox" value="${escapeHtml(lesson.id)}" ${isChecked ? 'checked' : ''}>
                    <span class="multi-lesson-item-text"><i class="fa-solid fa-book-bookmark"></i> ${escapeHtml(lesson.name)}</span>
                    <span class="multi-lesson-item-badge">${count} từ</span>
                `;
                multiLessonCheckboxesContainer.appendChild(item);
            });
        });

        multiLessonCheckboxesContainer.querySelectorAll('.multi-lesson-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                updateSelectedLessonsFromCheckboxes();
            });
        });

        updateMultiLessonPickerHeader();
    }

    function updateSelectedLessonsFromCheckboxes() {
        const checkedValues = Array.from(document.querySelectorAll('.multi-lesson-checkbox:checked')).map(cb => cb.value);
        selectedLessonIds = checkedValues;

        updateMultiLessonPickerHeader();
        updateDatasetStats();
        generateRandomWords();
    }

    function updateMultiLessonPickerHeader() {
        const activeData = getActiveDataset();
        if (activeLessonCountBadge) {
            activeLessonCountBadge.textContent = `${activeData.length} từ`;
        }

        if (!multiLessonPickerLabel) return;

        if (selectedLessonIds.length === 0) {
            multiLessonPickerLabel.innerHTML = `<i class="fa-solid fa-layer-group"></i> 📚 Chưa chọn bài học nào (${activeData.length} từ)`;
        } else if (selectedLessonIds.length === 1) {
            let lessonName = 'Bài học đã chọn';
            userFolders.forEach(f => {
                if (f.lessons) {
                    f.lessons.forEach(l => {
                        if (l.id === selectedLessonIds[0]) lessonName = l.name;
                    });
                }
            });
            multiLessonPickerLabel.innerHTML = `<i class="fa-solid fa-book"></i> 📖 ${escapeHtml(lessonName)} (${activeData.length} từ)`;
        } else {
            multiLessonPickerLabel.innerHTML = `<i class="fa-solid fa-list-check"></i> 🎯 ${selectedLessonIds.length} Bài học đã chọn (${activeData.length} từ)`;
        }
    }

    // ==========================================
    // FOLDER & LESSON MANAGER MODAL
    // ==========================================
    function openFolderManagerModal() {
        modalFolderMgr.classList.remove('hidden');
        renderFolderSidebar();
        renderFolderDetails();
    }

    function closeFolderManagerModal() {
        modalFolderMgr.classList.add('hidden');
    }

    function renderFolderSidebar() {
        folderListContainer.innerHTML = '';
        if (!userFolders || userFolders.length === 0) {
            folderListContainer.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size: 13px; text-align: center;">Chưa có thư mục nào.</div>`;
            return;
        }

        userFolders.forEach(folder => {
            const item = document.createElement('div');
            item.className = `folder-item ${folder.id === selectedFolderId ? 'active' : ''}`;
            const totalWords = folder.lessons ? folder.lessons.reduce((acc, l) => acc + (l.words ? l.words.length : 0), 0) : 0;
            
            item.innerHTML = `
                <div class="folder-item-info" style="flex: 1; display: flex; align-items: center; gap: 8px; overflow: hidden;">
                    <i class="fa-solid ${folder.icon || 'fa-folder'}"></i>
                    <span class="folder-item-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(folder.name)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="folder-item-count">${totalWords} từ</span>
                    <button type="button" class="btn-del-folder-item" data-id="${folder.id}" title="Xóa thư mục ${escapeHtml(folder.name)}" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;

            item.addEventListener('click', () => {
                selectedFolderId = folder.id;
                renderFolderSidebar();
                renderFolderDetails();
            });

            const delBtn = item.querySelector('.btn-del-folder-item');
            if (delBtn) {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedFolderId = folder.id;
                    deleteFolder();
                });
            }

            folderListContainer.appendChild(item);
        });
    }

    function renderFolderDetails() {
        const folder = userFolders.find(f => f.id === selectedFolderId);
        if (!folder) {
            currentFolderName.textContent = 'Chưa chọn thư mục';
            currentFolderDesc.textContent = '';
            btnEditFolder.style.display = 'none';
            btnDeleteFolder.style.display = 'none';
            lessonsGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); padding: 30px; text-align: center;">
                Chưa chọn thư mục nào hoặc không có thư mục. Bấm nút <strong>"+ Tạo Thư Mục Mới"</strong> để bắt đầu!
            </div>`;
            return;
        }

        currentFolderName.textContent = folder.name;
        currentFolderDesc.textContent = folder.description || 'Chưa có mô tả.';
        btnEditFolder.style.display = 'inline-flex';
        btnDeleteFolder.style.display = 'inline-flex';

        lessonsGrid.innerHTML = '';
        if (!folder.lessons || folder.lessons.length === 0) {
            lessonsGrid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); padding: 30px; text-align: center;">
                Chưa có bài học nào trong thư mục này. Bấm nút <strong>"+ Tạo Bài Học Mới"</strong> để thêm!
            </div>`;
            return;
        }

        folder.lessons.forEach(lesson => {
            const isCurrentActive = (selectedLessonIds.includes(lesson.id) || lesson.id === activeLessonId);
            const count = lesson.words ? lesson.words.length : 0;
            
            const card = document.createElement('div');
            card.className = `lesson-card ${isCurrentActive ? 'active-deck' : ''}`;
            card.innerHTML = `
                <div class="lesson-card-top">
                    <div>
                        <div class="lesson-title"><i class="fa-solid fa-book-open"></i> ${escapeHtml(lesson.name)}</div>
                        <div class="lesson-desc">${escapeHtml(lesson.description || '')}</div>
                    </div>
                    ${isCurrentActive ? '<span class="badge-lesson-count" style="background:var(--primary); color:#fff; font-weight:700;">Đang chọn</span>' : ''}
                </div>
                <div class="lesson-meta">
                    <span class="lesson-word-count">${count} từ vựng</span>
                </div>
                <div class="lesson-actions-wrapper">
                    <button class="btn-primary-sm btn-study-lesson ${isCurrentActive ? 'is-active-lesson' : ''}" data-id="${lesson.id}">
                        <i class="fa-solid ${isCurrentActive ? 'fa-circle-check' : 'fa-graduation-cap'}"></i> ${isCurrentActive ? '✓ Đang học bài này' : 'Học bài này'}
                    </button>
                    <div class="lesson-sub-actions">
                        <button class="tool-btn-sm btn-manage-words-lesson" data-id="${lesson.id}" title="Xem & Quản lý danh sách từ vựng">
                            <i class="fa-solid fa-list-ul"></i> Xem từ (${count})
                        </button>
                        <button class="tool-btn-sm btn-edit-lesson" data-id="${lesson.id}" title="Đổi tên bài học">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="tool-btn-sm danger-btn btn-delete-lesson" data-id="${lesson.id}" title="Xóa bài học">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            lessonsGrid.appendChild(card);
        });

        // Event listeners for lesson actions
        lessonsGrid.querySelectorAll('.btn-study-lesson').forEach(btn => {
            btn.addEventListener('click', () => {
                activeLessonId = btn.dataset.id;
                selectedLessonIds = [activeLessonId];
                activeLevel = 'ALL';
                searchQuery = '';
                if (searchInput) searchInput.value = '';

                populateActiveLessonSelect();
                updateDatasetStats();
                generateRandomWords();
                renderFolderSidebar();
                renderFolderDetails();

                const targetLesson = folder.lessons.find(l => l.id === btn.dataset.id);
                const name = targetLesson ? targetLesson.name : '';
                const wordCount = targetLesson && targetLesson.words ? targetLesson.words.length : 0;

                showToast(`🎓 Đã chuyển bài học: "${name}" (${wordCount} từ)!`);
            });
        });

        lessonsGrid.querySelectorAll('.btn-manage-words-lesson').forEach(btn => {
            btn.addEventListener('click', () => {
                openLessonWordsManager(btn.dataset.id);
            });
        });

        lessonsGrid.querySelectorAll('.btn-edit-lesson').forEach(btn => {
            btn.addEventListener('click', () => editLesson(btn.dataset.id));
        });

        lessonsGrid.querySelectorAll('.btn-delete-lesson').forEach(btn => {
            btn.addEventListener('click', () => deleteLesson(btn.dataset.id));
        });
    }

    function createFolder() {
        const name = prompt('Nhập tên thư mục mới:');
        if (!name || !name.trim()) return;
        const desc = prompt('Nhập mô tả thư mục (tùy chọn):') || '';

        const newFolder = {
            id: 'folder_' + Date.now(),
            name: name.trim(),
            description: desc.trim(),
            icon: 'fa-folder-open',
            isDefault: false,
            lessons: []
        };

        userFolders.push(newFolder);
        selectedFolderId = newFolder.id;
        saveFolders();
        populateActiveLessonSelect();
        renderFolderSidebar();
        renderFolderDetails();
        showToast(`📁 Đã tạo thư mục: "${newFolder.name}"!`);
    }

    function editFolder() {
        const folder = userFolders.find(f => f.id === selectedFolderId);
        if (!folder) return;

        const newName = prompt('Đổi tên thư mục:', folder.name);
        if (!newName || !newName.trim()) return;
        const newDesc = prompt('Đổi mô tả thư mục:', folder.description || '');

        folder.name = newName.trim();
        folder.description = newDesc.trim();
        saveFolders();
        populateActiveLessonSelect();
        renderFolderSidebar();
        renderFolderDetails();
        showToast('Đã cập nhật thư mục thành công!');
    }

    function deleteFolder() {
        const folder = userFolders.find(f => f.id === selectedFolderId);
        if (!folder) return;

        if (confirm(`Bạn có chắc chắn muốn xóa thư mục "${folder.name}" và tất cả bài học bên trong?`)) {
            const deletedLessonIds = new Set((folder.lessons || []).map(l => l.id));
            userFolders = userFolders.filter(f => f.id !== selectedFolderId);
            selectedFolderId = userFolders.length > 0 ? userFolders[0].id : null;

            selectedLessonIds = (selectedLessonIds || []).filter(id => !deletedLessonIds.has(id));
            if (deletedLessonIds.has(activeLessonId)) {
                activeLessonId = selectedLessonIds.length > 0 ? selectedLessonIds[0] : null;
            }

            ensureValidFolderSelection();
            saveFolders();
            populateActiveLessonSelect();
            renderFolderSidebar();
            renderFolderDetails();
            updateDatasetStats();
            generateRandomWords();
            showToast(`Đã xóa thư mục "${folder.name}".`);
        }
    }

    function createLesson() {
        const folder = userFolders.find(f => f.id === selectedFolderId);
        if (!folder) return;

        const name = prompt(`Tạo bài học mới trong thư mục "${folder.name}":`);
        if (!name || !name.trim()) return;
        const desc = prompt('Nhập chủ đề / mô tả bài học:') || '';

        const newLesson = {
            id: 'lesson_' + Date.now(),
            folderId: folder.id,
            name: name.trim(),
            description: desc.trim(),
            isDefault: false,
            words: []
        };

        if (!folder.lessons) folder.lessons = [];
        folder.lessons.push(newLesson);

        activeLessonId = newLesson.id;
        selectedLessonIds = [newLesson.id];

        saveFolders();
        populateActiveLessonSelect();
        renderFolderSidebar();
        renderFolderDetails();
        updateDatasetStats();
        generateRandomWords();
        showToast(`📖 Đã tạo bài học: "${newLesson.name}"!`);

        // Ask user if they want to add words now
        if (confirm(`Bạn có muốn nạp từ vựng vào bài học "${newLesson.name}" ngay bây giờ không?`)) {
            closeFolderManagerModal();
            openImportVocabModal(newLesson.id);
        }
    }

    function editLesson(lessonId) {
        const folder = userFolders.find(f => f.id === selectedFolderId);
        if (!folder) return;
        const lesson = folder.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        const newName = prompt('Đổi tên bài học:', lesson.name);
        if (!newName || !newName.trim()) return;
        const newDesc = prompt('Đổi mô tả / chủ đề bài học:', lesson.description || '');

        lesson.name = newName.trim();
        lesson.description = newDesc.trim();
        saveFolders();
        populateActiveLessonSelect();
        renderFolderSidebar();
        renderFolderDetails();
        showToast('Đã cập nhật bài học!');
    }

    function deleteLesson(lessonId) {
        if (!lessonId) return;

        let targetFolder = null;
        let targetLesson = null;

        for (const f of userFolders) {
            if (Array.isArray(f.lessons)) {
                const found = f.lessons.find(l => l.id === lessonId);
                if (found) {
                    targetFolder = f;
                    targetLesson = found;
                    break;
                }
            }
        }

        if (!targetFolder || !targetLesson) return;

        if (confirm(`Bạn có chắc chắn muốn xóa bài học "${targetLesson.name}"?`)) {
            targetFolder.lessons = targetFolder.lessons.filter(l => l.id !== lessonId);

            selectedFolderId = targetFolder.id;
            selectedLessonIds = (selectedLessonIds || []).filter(id => id !== lessonId);
            if (activeLessonId === lessonId) {
                activeLessonId = selectedLessonIds.length > 0 ? selectedLessonIds[0] : null;
            }

            ensureValidFolderSelection();
            saveFolders();
            populateActiveLessonSelect();
            renderFolderSidebar();
            renderFolderDetails();
            updateDatasetStats();
            generateRandomWords();
            showToast(`Đã xóa bài học "${targetLesson.name}".`);
        }
    }

    // ==========================================
    // LESSON WORDS MANAGEMENT MODAL FUNCTIONS
    // ==========================================
    function openLessonWordsManager(lessonId) {
        let targetLesson = null;
        for (const folder of userFolders) {
            if (Array.isArray(folder.lessons)) {
                const found = folder.lessons.find(l => l.id === lessonId);
                if (found) {
                    targetLesson = found;
                    break;
                }
            }
        }

        if (!targetLesson) {
            showToast('Không tìm thấy bài học.');
            return;
        }

        currentManagingLesson = targetLesson;
        currentLessonWordsFilter = '';

        if (lessonWordsSearchInput) lessonWordsSearchInput.value = '';
        if (lessonWordEditorCard) lessonWordEditorCard.classList.add('hidden');

        updateLessonWordsModalHeader();
        renderLessonWordsTable();

        if (modalManageLessonWords) modalManageLessonWords.classList.remove('hidden');
    }

    function closeLessonWordsManager() {
        if (modalManageLessonWords) modalManageLessonWords.classList.add('hidden');
        currentManagingLesson = null;
    }

    function updateLessonWordsModalHeader() {
        if (!currentManagingLesson) return;
        if (lessonWordsModalTitle) lessonWordsModalTitle.textContent = currentManagingLesson.name;
        const total = currentManagingLesson.words ? currentManagingLesson.words.length : 0;
        if (lessonWordsModalCount) lessonWordsModalCount.textContent = `(${total} từ)`;
    }

    function renderLessonWordsTable() {
        if (!currentManagingLesson || !lessonWordsTableBody) return;

        const words = currentManagingLesson.words || [];
        const query = (currentLessonWordsFilter || '').toLowerCase().trim();

        const filteredWords = words.filter((w) => {
            if (!query) return true;
            const wordMatch = (w.word || '').toLowerCase().includes(query);
            const meaningMatch = (w.meaning || '').toLowerCase().includes(query);
            const posMatch = (w.pos || '').toLowerCase().includes(query);
            return wordMatch || meaningMatch || posMatch;
        });

        if (lessonWordsFilteredCount) lessonWordsFilteredCount.textContent = filteredWords.length;

        lessonWordsTableBody.innerHTML = '';

        if (filteredWords.length === 0) {
            lessonWordsTableBody.innerHTML = `<tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    ${words.length === 0 ? 'Bài học này chưa có từ vựng nào. Bấm nút <strong>"+ Thêm từ mới"</strong> để bắt đầu!' : 'Không tìm thấy từ vựng khớp với từ khóa tìm kiếm.'}
                </td>
            </tr>`;
            return;
        }

        filteredWords.forEach((item) => {
            const realIdx = words.indexOf(item);
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid var(--border-color);';

            const levelBadgeClass = item.level === 'C1' || item.level === 'C2' ? 'badge-c1' : 'badge-b2';

            tr.innerHTML = `
                <td style="text-align: center; color: var(--text-muted); font-size: 12px;">${realIdx + 1}</td>
                <td style="font-weight: 700; color: var(--accent-cyan);">${escapeHtml(item.word)}</td>
                <td style="color: var(--text-muted); font-style: italic;">${escapeHtml(item.pos || 'vocabulary')}</td>
                <td style="text-align: center;"><span class="level-badge ${levelBadgeClass}">${escapeHtml(item.level || 'B2')}</span></td>
                <td>${escapeHtml(item.meaning || item.word)}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 4px; justify-content: center;">
                        <button type="button" class="tool-btn-sm btn-edit-single-word" data-idx="${realIdx}" title="Sửa từ này" style="padding: 3px 8px; font-size: 11px;">
                            <i class="fa-solid fa-pen"></i> Sửa
                        </button>
                        <button type="button" class="tool-btn-sm danger-btn btn-delete-single-word" data-idx="${realIdx}" title="Xóa từ này" style="padding: 3px 8px; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            `;

            lessonWordsTableBody.appendChild(tr);
        });

        // Event Listeners for Edit & Delete buttons
        lessonWordsTableBody.querySelectorAll('.btn-edit-single-word').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                openWordEditorForm(idx);
            });
        });

        lessonWordsTableBody.querySelectorAll('.btn-delete-single-word').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                deleteWordFromLesson(idx);
            });
        });
    }

    function openWordEditorForm(wordIdx = -1) {
        if (!currentManagingLesson) return;

        if (lessonWordEditorCard) lessonWordEditorCard.classList.remove('hidden');

        const editIdxInput = document.getElementById('edit-word-index');
        const editWordInput = document.getElementById('edit-word-input');
        const editPosInput = document.getElementById('edit-pos-input');
        const editLevelInput = document.getElementById('edit-level-input');
        const editMeaningInput = document.getElementById('edit-meaning-input');
        const editorFormTitle = document.getElementById('editor-form-title');

        if (wordIdx >= 0 && currentManagingLesson.words && currentManagingLesson.words[wordIdx]) {
            const item = currentManagingLesson.words[wordIdx];
            if (editIdxInput) editIdxInput.value = wordIdx;
            if (editWordInput) editWordInput.value = item.word || '';
            if (editPosInput) editPosInput.value = item.pos || 'v.';
            if (editLevelInput) editLevelInput.value = item.level || 'B2';
            if (editMeaningInput) editMeaningInput.value = item.meaning || '';
            if (editorFormTitle) editorFormTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Chỉnh Sửa Từ: <strong>${escapeHtml(item.word)}</strong>`;
        } else {
            if (editIdxInput) editIdxInput.value = -1;
            if (editWordInput) editWordInput.value = '';
            if (editPosInput) editPosInput.value = 'v.';
            if (editLevelInput) editLevelInput.value = 'B2';
            if (editMeaningInput) editMeaningInput.value = '';
            if (editorFormTitle) editorFormTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Thêm Từ Vựng Mới Về Bài Học`;
        }

        if (editWordInput) editWordInput.focus();
    }

    function saveWordFromEditorForm() {
        if (!currentManagingLesson) return;

        const editIdxInput = document.getElementById('edit-word-index');
        const editWordInput = document.getElementById('edit-word-input');
        const editPosInput = document.getElementById('edit-pos-input');
        const editLevelInput = document.getElementById('edit-level-input');
        const editMeaningInput = document.getElementById('edit-meaning-input');

        const wStr = editWordInput ? editWordInput.value.trim() : '';
        const mStr = editMeaningInput ? editMeaningInput.value.trim() : '';

        if (!wStr || !mStr) {
            showToast('Vui lòng nhập Từ Tiếng Anh và Nghĩa Tiếng Việt!');
            return;
        }

        const posStr = editPosInput ? (editPosInput.value.trim() || 'vocabulary') : 'vocabulary';
        const levelStr = editLevelInput ? editLevelInput.value : 'B2';
        const idx = editIdxInput ? parseInt(editIdxInput.value, 10) : -1;

        if (!currentManagingLesson.words) currentManagingLesson.words = [];

        if (idx >= 0 && idx < currentManagingLesson.words.length) {
            const existing = currentManagingLesson.words[idx];
            existing.word = wStr;
            existing.pos = posStr;
            existing.level = levelStr;
            existing.meaning = mStr;
            showToast(`✏️ Đã cập nhật từ "${wStr}"!`);
        } else {
            const newWord = {
                id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                word: wStr,
                pos: posStr,
                level: levelStr,
                meaning: mStr
            };
            currentManagingLesson.words.unshift(newWord);
            showToast(`🎉 Đã thêm từ mới "${wStr}" vào bài!`);
        }

        saveFolders();
        updateLessonWordsModalHeader();
        renderLessonWordsTable();
        renderFolderSidebar();
        renderFolderDetails();

        if (selectedLessonIds && selectedLessonIds.includes(currentManagingLesson.id)) {
            updateDatasetStats();
            generateRandomWords();
        }

        if (lessonWordEditorCard) lessonWordEditorCard.classList.add('hidden');
    }

    function deleteWordFromLesson(idx) {
        if (!currentManagingLesson || !currentManagingLesson.words) return;
        if (idx < 0 || idx >= currentManagingLesson.words.length) return;

        const wordItem = currentManagingLesson.words[idx];
        if (confirm(`Bạn có chắc chắn muốn xóa từ "${wordItem.word}" khỏi bài học này?`)) {
            currentManagingLesson.words.splice(idx, 1);
            saveFolders();
            updateLessonWordsModalHeader();
            renderLessonWordsTable();
            renderFolderSidebar();
            renderFolderDetails();

            if (selectedLessonIds && selectedLessonIds.includes(currentManagingLesson.id)) {
                updateDatasetStats();
                generateRandomWords();
            }

            showToast(`🗑️ Đã xóa từ "${wordItem.word}".`);
        }
    }

    // ==========================================
    // IMPORT VOCAB MODAL & FILE PARSERS
    // ==========================================
    function openImportVocabModal(targetLessonId = null) {
        modalImportVocab.classList.remove('hidden');
        populateImportTargetLessonSelect(targetLessonId);
        previewExtractedWords = [];
        renderPreviewTable();
    }

    function closeImportVocabModal() {
        modalImportVocab.classList.add('hidden');
    }

    function populateImportTargetLessonSelect(presetLessonId = null) {
        importTargetLessonSelect.innerHTML = '';
        let foundAny = false;

        userFolders.forEach(folder => {
            if (!Array.isArray(folder.lessons) || folder.lessons.length === 0) return;

            const optGroup = document.createElement('optgroup');
            optGroup.label = `📁 ${folder.name}`;

            folder.lessons.forEach(lesson => {
                const opt = document.createElement('option');
                opt.value = lesson.id;
                opt.textContent = `📖 ${lesson.name} (${lesson.words ? lesson.words.length : 0} từ)`;
                optGroup.appendChild(opt);
                foundAny = true;
            });

            if (folder.lessons.length > 0) {
                importTargetLessonSelect.appendChild(optGroup);
            }
        });

        const newOpt = document.createElement('option');
        newOpt.value = 'CREATE_NEW';
        newOpt.textContent = '➕ [Tạo bài học mới tự động chứa các từ này]';
        importTargetLessonSelect.appendChild(newOpt);

        if (presetLessonId && presetLessonId !== 'CREATE_NEW') {
            importTargetLessonSelect.value = presetLessonId;
        } else if (!foundAny) {
            importTargetLessonSelect.value = 'CREATE_NEW';
        }
    }

    function cleanVietnameseEncoding(str) {
        if (!str) return '';
        let result = str.trim();

        // Standardize common OCR mistranslations & Telex/VNI corruptions
        const replacements = [
            [/\bcdng\b/gi, 'cống'],
            [/\bdan\b/gi, 'dẫn'],
            [/\bb tri\b/gi, 'bố trí'],
            [/\bwong dng\b/gi, 'đường ống'],
            [/\bwong\b/gi, 'đường'],
            [/\bdng\b/gi, 'ống'],
            [/\bcong ranh\b/gi, 'cống rãnh'],
            [/\bduoc xay du\b/gi, 'được xây dựng'],
            [/\bxay du\b/gi, 'xây dựng'],
            [/\bnuwéc\b/gi, 'nước'],
            [/\bnuoc\b/gi, 'nước'],
            [/\bdap\b/gi, 'đập'],
            [/\bdan cw\b/gi, 'dân cư'],
            [/\btir xa\b/gi, 'từ xa'],
            [/\bdiéu khién\b/gi, 'điều khiển'],
            [/\bgan chi1 vai\b/gi, 'gắn chặt với'],
            [/\bgan chit vai\b/gi, 'gắn chặt với'],
            [/\bchwa tirng\b/gi, 'chưa từng'],
            [/\bhoanh trang\b/gi, 'hoành tráng'],
            [/\btui tiêu\b/gi, 'tưới tiêu'],
            [/\bthuy dién\b/gi, 'thủy điện'],
            [/\bnhac lai\b/gi, 'nhắc lại'],
            [/\bvé sinh\b/gi, 'vệ sinh'],
            [/\bde doa\b/gi, 'đe dọa'],
            [/\bnguy hiém\b/gi, 'nguy hiểm'],
            [/\bho chira nuéc\b/gi, 'hồ chứa nước'],
            [/\bnhan tao\b/gi, 'nhân tạo'],
            [/\bDé nhudng chd cho cai gi\b/gi, 'Để nhường chỗ cho cái gì'],
            [/\bmé& dwéng c\b/gi, 'mở đường cho'],
            [/\bva\b/gi, 'và'],
            [/\bduoc\b/gi, 'được']
        ];

        replacements.forEach(([regex, replacement]) => {
            result = result.replace(regex, replacement);
        });

        return result;
    }

    function parseTextIntoWords(rawText) {
        if (!rawText) return [];
        const lines = rawText.split(/\r?\n/);
        const extracted = [];

        const validPosList = ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'phrase', 'idiom', 'noun', 'verb', 'adjective', 'adverb', 'pron.', 'exp.'];

        lines.forEach(line => {
            let trimmed = line.trim();
            if (!trimmed || trimmed.length < 2) return;

            // Skip section titles / headers
            if (/^(danh sách|stt|tên bài|bài học|unit|chapter|vocabulary|word|meaning)/i.test(trimmed)) return;

            // Strip leading bullets, numbers, dashes, symbols (e.g. "• ", "* ", "1. ", "▪ ", "- ")
            trimmed = trimmed.replace(/^[\s\u2022\u25cf\u25aa\u25ab\u2013\u2014\*\-\+\>\•\·\0-9\.\)\:\=]+/, '').trim();
            if (!trimmed || trimmed.length < 2) return;

            let rawWord = '';
            let pos = 'vocabulary';
            let level = 'B2';
            let rawMeaning = '';

            // 1. Check if line has parentheses POS e.g. "bounces off (v.) : phản chiếu"
            const parenPosMatch = trimmed.match(/^([^\(\)]+?)\s*\((n|v|adj|adv|prep|conj|phrase|idiom|noun|verb|adjective|adverb|pron|exp)\.?\)\s*[:\-\=\|\t]?\s*(.+)$/i);
            if (parenPosMatch) {
                rawWord = parenPosMatch[1];
                pos = parenPosMatch[2].toLowerCase() + '.';
                if (!pos.endsWith('.')) pos += '.';
                rawMeaning = parenPosMatch[3];
            } else {
                // 2. Try splitting by ':' first (since colons are most common for definition e.g. "word: meaning")
                let splitIdx = trimmed.indexOf(':');
                if (splitIdx === -1) {
                    // If no colon, try '=' or '-' or tab
                    splitIdx = trimmed.search(/[\-\=\|\t]/);
                }

                if (splitIdx !== -1) {
                    rawWord = trimmed.substring(0, splitIdx);
                    rawMeaning = trimmed.substring(splitIdx + 1);
                } else {
                    rawWord = trimmed;
                    rawMeaning = trimmed;
                }
            }

            // Clean rawWord and rawMeaning
            let word = rawWord.replace(/^[\s\u2022\u25cf\u25aa\u25ab\u2013\u2014\*\-\+\>\•\·\0-9\.\)\:\=\|]+/, '')
                              .replace(/^[:\-\=\|\t\s]+|[:\-\=\|\t\s]+$/g, '').trim();
            
            let meaning = rawMeaning.replace(/^[:\-\=\|\t\s]+|[:\-\=\|\t\s]+$/g, '').trim();

            // Check if rawMeaning leads with a valid POS e.g. "n. - quả táo"
            const posLeadMatch = meaning.match(/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|phrase|idiom|noun|verb|adjective|adverb)\s*[:\-\=\|\t\s]\s*(.+)$/i);
            if (posLeadMatch) {
                pos = posLeadMatch[1].toLowerCase();
                if (!pos.endsWith('.')) pos += '.';
                meaning = posLeadMatch[2].trim();
            }

            // Apply Vietnamese diacritics clean up
            meaning = cleanVietnameseEncoding(meaning);

            // Sanitize POS: If pos is not in valid list, fallback to 'vocabulary'
            const cleanPos = pos.toLowerCase();
            if (!validPosList.includes(cleanPos) && !validPosList.includes(cleanPos + '.')) {
                pos = 'vocabulary';
            }

            if (word && word.length > 0) {
                extracted.push({
                    id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    word: word,
                    pos: pos || 'vocabulary',
                    level: level || 'B2',
                    meaning: meaning || word
                });
            }
        });

        return extracted;
    }

    function addWordToPreview(wordObj) {
        previewExtractedWords.push(wordObj);
        renderPreviewTable();
    }

    function renderPreviewTable() {
        previewCount.textContent = previewExtractedWords.length;
        previewTableBody.innerHTML = '';

        if (previewExtractedWords.length === 0) {
            previewTableBody.innerHTML = `<tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">
                    Chưa có từ nào trong bảng. Dán văn bản / chọn file Word hoặc Ảnh để trích xuất từ vựng.
                </td>
            </tr>`;
            btnSaveImportedWords.disabled = false;
            return;
        }

        btnSaveImportedWords.disabled = false;

        previewExtractedWords.forEach((item, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${idx + 1}</td>
                <td><input type="text" value="${escapeHtml(item.word)}" data-idx="${idx}" data-field="word"></td>
                <td><input type="text" value="${escapeHtml(item.pos)}" data-idx="${idx}" data-field="pos"></td>
                <td>
                    <select data-idx="${idx}" data-field="level" style="background:#0f172a; color:#fff; border:none; padding:4px;">
                        <option value="B1" ${item.level === 'B1' ? 'selected' : ''}>B1</option>
                        <option value="B2" ${item.level === 'B2' ? 'selected' : ''}>B2</option>
                        <option value="C1" ${item.level === 'C1' ? 'selected' : ''}>C1</option>
                        <option value="C2" ${item.level === 'C2' ? 'selected' : ''}>C2</option>
                    </select>
                </td>
                <td><input type="text" value="${escapeHtml(item.meaning)}" data-idx="${idx}" data-field="meaning"></td>
                <td style="text-align: center;">
                    <button class="tool-btn-sm danger-btn btn-del-preview-row" data-idx="${idx}">&times;</button>
                </td>
            `;
            previewTableBody.appendChild(row);
        });

        previewTableBody.querySelectorAll('input, select').forEach(elem => {
            elem.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx, 10);
                const field = e.target.dataset.field;
                if (previewExtractedWords[idx]) {
                    previewExtractedWords[idx][field] = e.target.value.trim();
                }
            });
        });

        previewTableBody.querySelectorAll('.btn-del-preview-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                previewExtractedWords.splice(idx, 1);
                renderPreviewTable();
            });
        });
    }

    function saveImportedWords() {
        // Auto-parse if user directly clicks Save without clicking Extract first
        if (previewExtractedWords.length === 0) {
            const bulkVal = bulkTextInput ? bulkTextInput.value.trim() : '';
            if (bulkVal) {
                const parsed = parseTextIntoWords(bulkVal);
                if (parsed.length > 0) {
                    previewExtractedWords = parsed;
                }
            } else if (inpWord && inpMeaning && inpWord.value.trim() && inpMeaning.value.trim()) {
                previewExtractedWords.push({
                    id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    word: inpWord.value.trim(),
                    pos: inpPos.value.trim() || 'vocabulary',
                    level: inpLevel.value || 'B2',
                    meaning: inpMeaning.value.trim()
                });
            }
        }

        if (previewExtractedWords.length === 0) {
            showToast('Vui lòng dán văn bản, chọn file hoặc nhập từ vựng trước khi lưu!');
            return;
        }

        let targetLessonId = importTargetLessonSelect.value;

        if (targetLessonId === 'CREATE_NEW' || !targetLessonId) {
            let customFolder = userFolders.find(f => !f.isDefault);
            if (!customFolder) {
                customFolder = {
                    id: 'folder_' + Date.now(),
                    name: 'Từ vựng cá nhân',
                    description: 'Thư mục bài học tự tạo',
                    icon: 'fa-folder-open',
                    isDefault: false,
                    lessons: []
                };
                userFolders.push(customFolder);
            }
            const newLesson = {
                id: 'lesson_' + Date.now(),
                folderId: customFolder.id,
                name: `Bài học mới (${new Date().toLocaleDateString('vi-VN')})`,
                description: `${previewExtractedWords.length} từ vựng`,
                isDefault: false,
                words: []
            };
            customFolder.lessons.push(newLesson);
            targetLessonId = newLesson.id;
        }

        let targetLesson = null;
        for (const folder of userFolders) {
            for (const lesson of folder.lessons) {
                if (lesson.id === targetLessonId) {
                    targetLesson = lesson;
                    break;
                }
            }
        }

        if (targetLesson) {
            if (!targetLesson.words) targetLesson.words = [];

            // Deduplicate words so multiple clicks do not multiply words!
            const existingMap = new Map();
            targetLesson.words.forEach(w => {
                const k = (w.word || '').toLowerCase().trim();
                if (k) existingMap.set(k, w);
            });

            let addedCount = 0;
            previewExtractedWords.forEach(w => {
                const k = (w.word || '').toLowerCase().trim();
                if (k && !existingMap.has(k)) {
                    targetLesson.words.push(w);
                    existingMap.set(k, w);
                    addedCount++;
                }
            });

            previewExtractedWords = [];
            renderPreviewTable();

            saveFolders();

            activeLessonId = targetLesson.id;
            selectedLessonIds = [targetLesson.id];
            selectedFolderId = targetLesson.folderId;
            activeLevel = 'ALL';
            searchQuery = '';

            if (levelChips) {
                levelChips.forEach(c => c.classList.remove('active'));
                const allChip = Array.from(levelChips).find(c => c && c.dataset && c.dataset.level === 'ALL');
                if (allChip) allChip.classList.add('active');
            }

            if (searchInput) searchInput.value = '';

            populateActiveLessonSelect();
            renderFolderSidebar();
            renderFolderDetails();
            updateDatasetStats();
            generateRandomWords();

            if (currentManagingLesson) {
                for (const f of userFolders) {
                    for (const l of f.lessons) {
                        if (l.id === currentManagingLesson.id) {
                            currentManagingLesson = l;
                            break;
                        }
                    }
                }
                updateLessonWordsModalHeader();
                renderLessonWordsTable();
            }

            closeImportVocabModal();

            showToast(`🎉 Đã lưu thành công ${addedCount} từ vựng vào "${targetLesson.name}"!`);
            alert(`✅ ĐÃ LƯU THÀNH CÔNG!\n\nĐã nạp ${addedCount} từ vựng mới vào bài học "${targetLesson.name}".\n(Hiện tại bài học có tổng cộng ${targetLesson.words.length} từ vựng).`);
        }
    }

    // Word / JSON / JS / Text File Reading Engine
    function readWordDocxFile(file) {
        if (!file) return;

        // Support for JSON & JS vocabulary files (e.g. oxford5000.json, oxford5000.js)
        if (file.name.endsWith('.json') || file.name.endsWith('.js')) {
            const textReader = new FileReader();
            textReader.onload = function(e) {
                const text = e.target.result;
                let rawList = [];
                try {
                    if (file.name.endsWith('.json')) {
                        const parsed = JSON.parse(text);
                        rawList = Array.isArray(parsed) ? parsed : (parsed.words || parsed.data || parsed.folders || []);
                    } else {
                        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
                        if (jsonMatch) {
                            rawList = JSON.parse(jsonMatch[0]);
                        }
                    }
                } catch (err) {
                    console.error('Lỗi parse JSON/JS:', err);
                }

                if (Array.isArray(rawList) && rawList.length > 0) {
                    let count = 0;
                    rawList.forEach((item, idx) => {
                        if (item && item.word) {
                            addWordToPreview({
                                id: item.id || ('w_' + Date.now() + '_' + idx),
                                word: String(item.word).trim(),
                                pos: item.pos || 'vocabulary',
                                level: item.level || 'B2',
                                meaning: item.meaning || item.word,
                                example: item.example || item.full_entry || ''
                            });
                            count++;
                        }
                    });
                    if (count > 0) {
                        showToast(`📂 Đã nạp ${count} từ vựng từ file ${file.name}!`);
                        return;
                    }
                }

                const words = parseTextIntoWords(text);
                if (words.length > 0) {
                    words.forEach(w => addWordToPreview(w));
                    showToast(`📄 Trích xuất ${words.length} từ vựng từ file!`);
                } else {
                    showToast('Không đọc được dữ liệu từ vựng trong file JSON/JS.');
                }
            };
            textReader.readAsText(file);
            return;
        }

        // Fallback for plain text, csv, tsv
        if (file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
            const textReader = new FileReader();
            textReader.onload = function(e) {
                const words = parseTextIntoWords(e.target.result);
                if (words.length > 0) {
                    words.forEach(w => addWordToPreview(w));
                    showToast(`📄 Trích xuất ${words.length} từ vựng từ file văn bản!`);
                } else {
                    showToast('Không tìm thấy từ vựng trong file.');
                }
            };
            textReader.readAsText(file);
            return;
        }

        if (typeof mammoth === 'undefined') {
            const textReader = new FileReader();
            textReader.onload = function(e) {
                const words = parseTextIntoWords(e.target.result);
                if (words.length > 0) {
                    words.forEach(w => addWordToPreview(w));
                    showToast(`📄 Trích xuất ${words.length} từ vựng từ file!`);
                } else {
                    showToast('Thư viện Mammoth.js chưa sẵn sàng.');
                }
            };
            textReader.readAsText(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                .then(result => {
                    const words = parseTextIntoWords(result.value);
                    if (words.length > 0) {
                        words.forEach(w => addWordToPreview(w));
                        showToast(`📄 Trích xuất thành công ${words.length} từ từ file Word!`);
                    } else {
                        showToast('Không tìm thấy từ vựng rõ ràng trong file Word.');
                    }
                })
                .catch(err => {
                    console.error('Word parse error:', err);
                    // Fallback to text reader
                    const textReader = new FileReader();
                    textReader.onload = function(evt) {
                        const words = parseTextIntoWords(evt.target.result);
                        if (words.length > 0) {
                            words.forEach(w => addWordToPreview(w));
                            showToast(`📄 Trích xuất ${words.length} từ từ file!`);
                        } else {
                            showToast('Lỗi đọc file Word.');
                        }
                    };
                    textReader.readAsText(file);
                });
        };
        reader.readAsArrayBuffer(file);
    }

    // Image OCR Reading Engine
    function readImageOcrFile(file) {
        if (!file) return;
        if (typeof Tesseract === 'undefined') {
            showToast('Thư viện OCR Tesseract.js chưa tải xong. Vui lòng kết nối mạng hoặc thử lại!');
            return;
        }
        ocrStatus.classList.remove('hidden');
        ocrMsg.textContent = 'Đang quét chữ từ ảnh... 0%';

        Tesseract.recognize(file, 'vie+eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const pct = Math.round(m.progress * 100);
                    ocrMsg.textContent = `Đang quét chữ Anh - Việt từ ảnh... ${pct}%`;
                }
            }
        }).then(({ data: { text } }) => {
            ocrStatus.classList.add('hidden');
            const words = parseTextIntoWords(text);
            if (words.length > 0) {
                words.forEach(w => addWordToPreview(w));
                showToast(`🖼️ Quét chữ hoàn tất: Tìm thấy ${words.length} từ!`);
            } else {
                showToast('Không nhận diện được từ vựng từ ảnh. Hãy chụp nét hơn!');
            }
        }).catch(err => {
            console.error('OCR Error:', err);
            ocrStatus.classList.add('hidden');
            showToast('Lỗi xử lý OCR ảnh.');
        });
    }

    // ==========================================
    // EVENT LISTENERS SETUP
    // ==========================================
    // ==========================================
    // EVENT LISTENERS SETUP
    // ==========================================
    function setupEventListeners() {
        // Open Modals
        if (btnOpenFolderMgr) btnOpenFolderMgr.addEventListener('click', openFolderManagerModal);
        if (btnCloseFolderMgr) btnCloseFolderMgr.addEventListener('click', closeFolderManagerModal);

        if (btnOpenAddVocab) btnOpenAddVocab.addEventListener('click', () => openImportVocabModal(activeLessonId));
        if (btnCloseImportVocab) btnCloseImportVocab.addEventListener('click', closeImportVocabModal);
        if (btnCancelImport) btnCancelImport.addEventListener('click', closeImportVocabModal);

        // Folder Manager actions
        if (btnAddFolder) btnAddFolder.addEventListener('click', createFolder);
        if (btnEditFolder) btnEditFolder.addEventListener('click', editFolder);
        if (btnDeleteFolder) btnDeleteFolder.addEventListener('click', deleteFolder);
        if (btnAddLesson) btnAddLesson.addEventListener('click', createLesson);

        // Lesson Words Manager Modal Listeners
        if (btnCloseLessonWordsModal) btnCloseLessonWordsModal.addEventListener('click', closeLessonWordsManager);
        if (btnCloseLessonWordsModalFooter) btnCloseLessonWordsModalFooter.addEventListener('click', closeLessonWordsManager);
        if (btnAddWordToLesson) {
            btnAddWordToLesson.addEventListener('click', () => {
                if (currentManagingLesson) {
                    openImportVocabModal(currentManagingLesson.id);
                } else {
                    openImportVocabModal(activeLessonId);
                }
            });
        }
        if (btnCancelEditLessonWord) btnCancelEditLessonWord.addEventListener('click', () => {
            if (lessonWordEditorCard) lessonWordEditorCard.classList.add('hidden');
        });
        if (btnSaveLessonWord) btnSaveLessonWord.addEventListener('click', saveWordFromEditorForm);
        if (btnOpenImportFromWordsModal) {
            btnOpenImportFromWordsModal.addEventListener('click', () => {
                if (currentManagingLesson) {
                    const targetId = currentManagingLesson.id;
                    closeLessonWordsManager();
                    openImportVocabModal(targetId);
                }
            });
        }

        if (lessonWordsSearchInput) {
            lessonWordsSearchInput.addEventListener('input', (e) => {
                currentLessonWordsFilter = e.target.value;
                renderLessonWordsTable();
            });
        }

        if (modalManageLessonWords) {
            modalManageLessonWords.addEventListener('click', (e) => {
                if (e.target === modalManageLessonWords) closeLessonWordsManager();
            });
        }

        // Import Modal Tabs
        if (importTabs) {
            importTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    importTabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.add('hidden'));
                    
                    tab.classList.add('active');
                    const targetTabId = `import-tab-${tab.dataset.tab}`;
                    const targetElem = document.getElementById(targetTabId);
                    if (targetElem) targetElem.classList.remove('hidden');
                });
            });
        }

        // Direct input single word
        if (btnAddSingleWord) {
            btnAddSingleWord.addEventListener('click', () => {
                const w = inpWord.value.trim();
                const m = inpMeaning.value.trim();
                if (!w || !m) {
                    showToast('Vui lòng nhập Từ Tiếng Anh và Nghĩa Tiếng Việt!');
                    return;
                }

                addWordToPreview({
                    id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                    word: w.toLowerCase(),
                    pos: inpPos.value.trim() || 'vocabulary',
                    level: inpLevel.value,
                    meaning: m,
                    example: inpExample.value.trim() || ''
                });

                inpWord.value = '';
                inpMeaning.value = '';
                inpExample.value = '';
                showToast('Đã thêm từ vào danh sách xem trước!');
            });
        }

        // Bulk text parse
        if (btnParseBulkText) {
            btnParseBulkText.addEventListener('click', () => {
                const text = bulkTextInput.value;
                const words = parseTextIntoWords(text);
                if (words.length > 0) {
                    words.forEach(w => addWordToPreview(w));
                    bulkTextInput.value = '';
                    showToast(`⚡ Đã trích xuất ${words.length} từ vào danh sách xem trước!`);
                } else {
                    showToast('Không tìm thấy từ vựng trong văn bản đã dán.');
                }
            });
        }

        // File Select & Dropzones
        if (btnSelectWordFile && inputFileWord) {
            btnSelectWordFile.addEventListener('click', () => inputFileWord.click());
        }
        if (inputFileWord) {
            inputFileWord.addEventListener('change', (e) => {
                if (e.target.files[0]) readWordDocxFile(e.target.files[0]);
            });
        }

        if (btnSelectImageFile && inputFileImage) {
            btnSelectImageFile.addEventListener('click', () => inputFileImage.click());
        }
        if (inputFileImage) {
            inputFileImage.addEventListener('change', (e) => {
                if (e.target.files[0]) readImageOcrFile(e.target.files[0]);
            });
        }

        // Drag & Drop handlers
        if (dropzoneWord) setupDropzone(dropzoneWord, readWordDocxFile);
        if (dropzoneImage) setupDropzone(dropzoneImage, readImageOcrFile);

        // Save imported words
        if (btnClearPreview) {
            btnClearPreview.addEventListener('click', () => {
                previewExtractedWords = [];
                renderPreviewTable();
            });
        }
        if (btnSaveImportedWords) btnSaveImportedWords.addEventListener('click', saveImportedWords);

        // Multi-Lesson Picker Toggle
        if (btnOpenMultiLessonPicker) {
            btnOpenMultiLessonPicker.addEventListener('click', (e) => {
                e.stopPropagation();
                if (multiLessonDropdown) {
                    multiLessonDropdown.classList.toggle('hidden');
                    if (!multiLessonDropdown.classList.contains('hidden')) {
                        populateMultiLessonPicker();
                    }
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (multiLessonDropdown && !multiLessonDropdown.classList.contains('hidden')) {
                if (!multiLessonDropdown.contains(e.target) && e.target !== btnOpenMultiLessonPicker && (!btnOpenMultiLessonPicker || !btnOpenMultiLessonPicker.contains(e.target))) {
                    multiLessonDropdown.classList.add('hidden');
                }
            }
        });

        // Select All / Deselect All for Multi-Lesson Picker
        if (btnMultiLessonSelectAll) {
            btnMultiLessonSelectAll.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.multi-lesson-checkbox').forEach(cb => cb.checked = true);
                updateSelectedLessonsFromCheckboxes();
            });
        }

        if (btnMultiLessonDeselectAll) {
            btnMultiLessonDeselectAll.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.multi-lesson-checkbox').forEach(cb => cb.checked = false);
                updateSelectedLessonsFromCheckboxes();
            });
        }

        // Search Input listener
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                searchQuery = searchInput.value.trim().toLowerCase();
                if (searchQuery.length > 0) {
                    if (btnClearSearch) btnClearSearch.classList.remove('hidden');
                } else {
                    if (btnClearSearch) btnClearSearch.classList.add('hidden');
                }
                generateRandomWords();
            });
        }

        if (btnClearSearch) {
            btnClearSearch.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                searchQuery = '';
                btnClearSearch.classList.add('hidden');
                generateRandomWords();
            });
        }

        if (nInput) {
            nInput.addEventListener('input', () => generateRandomWords());
            nInput.addEventListener('change', () => generateRandomWords());
            nInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') generateRandomWords(true);
            });
        }

        // Level chips & Level dropdown
        if (levelChips) {
            levelChips.forEach(chip => {
                if (!chip) return;
                chip.addEventListener('click', () => {
                    levelChips.forEach(c => c.classList.remove('active'));
                    if (levelDropdownSelect) {
                        levelDropdownSelect.classList.remove('active');
                        levelDropdownSelect.value = "";
                    }
                    chip.classList.add('active');
                    activeLevel = chip.dataset.level;
                    
                    if (activeLevel === 'BOOKMARKS' && bookmarks.size > 0) {
                        if (btnClearBookmarks) btnClearBookmarks.classList.remove('hidden');
                    } else {
                        if (btnClearBookmarks) btnClearBookmarks.classList.add('hidden');
                    }

                    generateRandomWords(false);
                });
            });
        }

        if (levelDropdownSelect) {
            levelDropdownSelect.addEventListener('change', () => {
                levelChips.forEach(c => c.classList.remove('active'));
                levelDropdownSelect.classList.add('active');
                activeLevel = levelDropdownSelect.value;
                if (btnClearBookmarks) btnClearBookmarks.classList.add('hidden');
                generateRandomWords(false);
            });
        }

        if (btnGenerate) btnGenerate.addEventListener('click', () => generateRandomWords(true));

        // Vocab Stats Modal Listeners
        if (btnShowVocabStats) btnShowVocabStats.addEventListener('click', openVocabStatsModal);
        if (btnCloseVocabStatsModal) btnCloseVocabStatsModal.addEventListener('click', () => modalVocabStats.classList.add('hidden'));
        if (btnCloseVocabStatsFooter) btnCloseVocabStatsFooter.addEventListener('click', () => modalVocabStats.classList.add('hidden'));

        // View toggle
        if (btnViewCards) btnViewCards.addEventListener('click', () => setViewMode('cards'));
        if (btnViewTable) btnViewTable.addEventListener('click', () => setViewMode('table'));
        if (btnViewFlashcard) btnViewFlashcard.addEventListener('click', () => setViewMode('flashcard'));
        if (btnViewQuiz) btnViewQuiz.addEventListener('click', () => setViewMode('quiz'));

        // Bookmarks File buttons
        if (btnClearBookmarks) btnClearBookmarks.addEventListener('click', clearAllBookmarks);

        // Copy button
        if (btnCopy) btnCopy.addEventListener('click', copyToClipboard);

        // Export TXT
        if (btnExportTxt) btnExportTxt.addEventListener('click', exportTxtFile);

        // Flashcard interaction
        if (flashcardElement) {
            flashcardElement.addEventListener('click', () => {
                flashcardElement.classList.toggle('flipped');
            });
        }

        if (fcStarBtn) {
            fcStarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = currentWords[flashcardIndex];
                if (current) toggleBookmark(current);
            });
        }

        if (fcPrev) {
            fcPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                if (flashcardIndex > 0) {
                    flashcardIndex--;
                    updateFlashcardView();
                }
            });
        }

        if (fcNext) {
            fcNext.addEventListener('click', (e) => {
                e.stopPropagation();
                if (flashcardIndex < currentWords.length - 1) {
                    flashcardIndex++;
                    updateFlashcardView();
                }
            });
        }

        if (fcBtnSpeak) {
            fcBtnSpeak.addEventListener('click', (e) => {
                e.stopPropagation();
                const word = currentWords[flashcardIndex]?.word;
                if (word) speakWord(word);
            });
        }

        if (fcBtnNote) {
            fcBtnNote.addEventListener('click', (e) => {
                e.stopPropagation();
                const current = currentWords[flashcardIndex];
                if (current) openWordNoteModal(current);
            });
        }

        // Quiz Listeners
        if (btnStartQuiz) btnStartQuiz.addEventListener('click', startQuiz);
        if (btnQuizRetryHeader) btnQuizRetryHeader.addEventListener('click', startQuiz);
        if (btnNextQuestion) btnNextQuestion.addEventListener('click', nextQuestion);
        if (btnPrevQuestion) btnPrevQuestion.addEventListener('click', prevQuestion);
        if (btnPrevQuestionHeader) btnPrevQuestionHeader.addEventListener('click', prevQuestion);
        if (btnNextQuestionHeader) btnNextQuestionHeader.addEventListener('click', nextQuestion);
        if (btnRetryQuiz) btnRetryQuiz.addEventListener('click', startQuiz);
        if (btnSaveWrongStars) btnSaveWrongStars.addEventListener('click', saveWrongAnswersToBookmarks);

        if (quizSourceSelect) {
            quizSourceSelect.addEventListener('change', () => {
                if (quizSourceSelect.value === 'CUSTOM_LESSONS') {
                    if (quizCustomLessonsCard) quizCustomLessonsCard.classList.remove('hidden');
                    renderQuizLessonsCheckboxes();
                } else {
                    if (quizCustomLessonsCard) quizCustomLessonsCard.classList.add('hidden');
                }
            });
        }

        if (btnQuizSelectAllLessons) {
            btnQuizSelectAllLessons.addEventListener('click', () => {
                document.querySelectorAll('.quiz-lesson-checkbox:not(:disabled)').forEach(cb => cb.checked = true);
            });
        }

        if (btnQuizDeselectAllLessons) {
            btnQuizDeselectAllLessons.addEventListener('click', () => {
                document.querySelectorAll('.quiz-lesson-checkbox').forEach(cb => cb.checked = false);
            });
        }

        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                const optIdx = parseInt(card.dataset.opt, 10);
                handleAnswerSelection(optIdx);
            });
        });

        // Keyboard navigation for Flashcards & Quiz
        document.addEventListener('keydown', (e) => {
            // Avoid triggering shortcuts when typing in inputs/textareas/selects
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
                return;
            }

            if (!viewFlashcardContainer.classList.contains('hidden')) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    flashcardElement.classList.toggle('flipped');
                } else if (e.code === 'ArrowLeft' && flashcardIndex > 0) {
                    flashcardIndex--;
                    updateFlashcardView();
                } else if (e.code === 'ArrowRight' && flashcardIndex < currentWords.length - 1) {
                    flashcardIndex++;
                    updateFlashcardView();
                }
            } else if (!viewQuizContainer.classList.contains('hidden') && !quizQuestionBox.classList.contains('hidden')) {
                if (e.code === 'ArrowLeft') {
                    if (currentQIdx > 0) {
                        e.preventDefault();
                        prevQuestion();
                    }
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    nextQuestion();
                }
            }
        });

        // Theme Switcher Listener
        if (btnToggleTheme) {
            btnToggleTheme.addEventListener('click', () => {
                const isCurrentlyLight = document.body.classList.contains('light-mode');
                applyTheme(!isCurrentlyLight);
                showToast(isCurrentlyLight ? '🌙 Đã chuyển sang Giao diện Tối!' : '☀️ Đã chuyển sang Giao diện Sáng!');
            });
        }
    }

    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            if (themeBtnText) themeBtnText.textContent = 'Giao diện Tối';
            if (btnToggleTheme) {
                const icon = btnToggleTheme.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-moon';
            }
            localStorage.setItem('theme_preference', 'light');
        } else {
            document.body.classList.remove('light-mode');
            if (themeBtnText) themeBtnText.textContent = 'Giao diện Sáng';
            if (btnToggleTheme) {
                const icon = btnToggleTheme.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-sun';
            }
            localStorage.setItem('theme_preference', 'dark');
        }
    }

    function setupDropzone(dropzoneElem, fileHandler) {
        if (!dropzoneElem) return;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzoneElem.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneElem.addEventListener(eventName, () => dropzoneElem.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneElem.addEventListener(eventName, () => dropzoneElem.classList.remove('dragover'), false);
        });

        dropzoneElem.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files[0]) {
                fileHandler(files[0]);
            }
        }, false);
    }

    // ==========================================
    // RANDOM GENERATION & VIEW RENDERING
    // ==========================================
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generateRandomWords(isUserClick = false) {
        const datasetPool = getActiveDataset();
        if (!datasetPool || datasetPool.length === 0) {
            currentWords = [];
            resultCount.textContent = '0';
            renderCardsView();
            renderTableView();
            updateFlashcardView();
            return;
        }

        let filtered = datasetPool;

        // 1. Level & Bookmark Filter
        if (activeLevel === 'BOOKMARKS') {
            filtered = datasetPool.filter(w => hasBookmark(w.id));
        } else if (activeLevel !== 'ALL') {
            filtered = datasetPool.filter(w => w.level === activeLevel);
        }

        // 2. Search Query Filter
        if (searchQuery.length > 0) {
            filtered = filtered.filter(w => {
                const wordMatch = w.word && w.word.toLowerCase().includes(searchQuery);
                const meaningMatch = w.meaning && w.meaning.toLowerCase().includes(searchQuery);
                return wordMatch || meaningMatch;
            });
        }

        let n = parseInt(nInput.value, 10);
        if (isNaN(n) || n <= 0) n = 10;

        if (n > filtered.length) {
            n = Math.max(1, filtered.length);
        }

        if (filtered.length === 0) {
            currentWords = [];
            resultCount.textContent = '0';
        } else {
            if (searchQuery.length > 0) {
                currentWords = filtered; // Show all search results
            } else if (isUserClick) {
                // User explicitly clicked "Tạo n từ ngẫu nhiên" -> Shuffle
                if (selectedLessonIds && selectedLessonIds.length > 1 && activeLevel !== 'BOOKMARKS') {
                    currentWords = sampleEvenlyFromSelectedLessons(selectedLessonIds, n, activeLevel);
                } else {
                    const shuffled = shuffleArray(filtered);
                    currentWords = shuffled.slice(0, n);
                }
            } else {
                // Clicked filter ("Tất cả" or level option) -> Show n words sequentially without generating new random sample
                currentWords = filtered.slice(0, n);
            }
            resultCount.textContent = currentWords.length;
        }

        // Update UI info badge
        let levelText = 'Tất cả';
        if (activeLevel === 'ALL') levelText = 'Tất cả';
        else if (activeLevel === 'BOOKMARKS') levelText = '⭐ Từ khó nhớ';
        else levelText = `Cấp ${activeLevel}`;

        if (searchQuery.length > 0) {
            levelText += ` | Tìm: "${searchQuery}"`;
        }
        
        currentFilterBadge.textContent = `Cấp độ: ${levelText}`;

        flashcardIndex = 0;

        renderCardsView();
        renderTableView();
        updateFlashcardView();

        if (isUserClick && currentWords.length > 0) {
            showToast(`🎲 Đã xáo trộn và tạo ${currentWords.length} từ vựng ngẫu nhiên mới!`);
        }
    }

    function renderCardsView() {
        viewCardsContainer.innerHTML = '';

        if (currentWords.length === 0) {
            let msg = 'Bài học đang chọn hiện chưa có từ vựng hoặc không khớp với bộ lọc cấp độ!';
            let showActions = true;

            if (searchQuery.length > 0) {
                msg = `Không tìm thấy từ vựng nào phù hợp với từ khóa "${escapeHtml(searchQuery)}".`;
                showActions = false;
            } else if (activeLevel === 'BOOKMARKS') {
                msg = 'Chưa có từ nào trong danh sách "Từ khó nhớ". Hãy bấm ⭐ trên các thẻ từ vựng để lưu vào đây!';
                showActions = false;
            }

            viewCardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 20px; font-size: 15px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                <i class="fa-solid fa-folder-open" style="font-size: 40px; color: var(--primary); margin-bottom: 14px; display: block;"></i>
                <p style="margin-bottom: 18px; font-weight: 600; color: var(--text-main);">${msg}</p>
                ${showActions ? `
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button type="button" class="tool-btn highlight-btn" id="btn-empty-open-folder-mgr">
                        <i class="fa-solid fa-folder-gear"></i> Quản Lý Thư Mục & Bài Học
                    </button>
                    <button type="button" class="btn-primary-sm" id="btn-empty-add-vocab">
                        <i class="fa-solid fa-file-circle-plus"></i> Nạp từ vựng vào bài học này
                    </button>
                </div>
                ` : ''}
            </div>`;

            const btnEmptyFolderMgr = document.getElementById('btn-empty-open-folder-mgr');
            if (btnEmptyFolderMgr) {
                btnEmptyFolderMgr.addEventListener('click', openFolderManagerModal);
            }

            const btnAddVocab = document.getElementById('btn-empty-add-vocab');
            if (btnAddVocab) {
                btnAddVocab.addEventListener('click', () => {
                    openImportVocabModal(activeLessonId);
                });
            }
            return;
        }

        currentWords.forEach((item, index) => {
            const wordKey = getWordId(item);
            const isStarred = hasBookmark(item);
            const noteKey = String(item.id || item.word);
            const noteText = userNotes[noteKey] || '';
            const hasNote = noteText.length > 0;

            const card = document.createElement('div');
            card.className = 'vocab-card';
            card.innerHTML = `
                <div class="card-top">
                    <span class="card-idx">#${index + 1}</span>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="note-btn ${hasNote ? 'has-note' : ''}" data-idx="${index}" title="${hasNote ? 'Xem/Sửa ghi chú cá nhân' : 'Thêm ghi chú cá nhân'}">
                            <i class="fa-solid fa-note-sticky"></i>
                            ${hasNote ? '<span class="note-indicator-dot"></span>' : ''}
                        </button>
                        <button class="star-btn ${isStarred ? 'starred' : ''}" data-id="${escapeHtml(wordKey)}" title="${isStarred ? 'Xóa khỏi từ khó nhớ' : 'Đánh dấu từ khó nhớ'}">
                            <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                        </button>
                        <span class="level-badge ${(item.level || 'B2').toLowerCase()}">${item.level || 'B2'}</span>
                    </div>
                </div>
                <div class="card-main">
                    <div class="word-title">${escapeHtml(item.word)}</div>
                    <div class="pos-tag">${escapeHtml(item.pos || 'vocabulary')}</div>
                    <div class="word-meaning">${escapeHtml(item.meaning || '')}</div>
                </div>
                <div class="card-actions">
                    <button class="card-btn btn-speak" data-word="${escapeHtml(item.word)}">
                        <i class="fa-solid fa-volume-high"></i> Nghe
                    </button>
                    <a href="https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(item.word)}" 
                       target="_blank" class="card-btn">
                        <i class="fa-solid fa-book-open"></i> Tra từ
                    </a>
                </div>
            `;
            viewCardsContainer.appendChild(card);
        });

        viewCardsContainer.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wordId = btn.dataset.id;
                toggleBookmark(wordId);
                const isNowStarred = hasBookmark(wordId);
                btn.classList.toggle('starred', isNowStarred);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isNowStarred ? 'fa-solid fa-star' : 'fa-regular fa-star';
                }
            });
        });

        viewCardsContainer.querySelectorAll('.note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx, 10);
                if (!isNaN(idx) && currentWords[idx]) {
                    openWordNoteModal(currentWords[idx]);
                }
            });
        });

        viewCardsContainer.querySelectorAll('.btn-speak').forEach(btn => {
            btn.addEventListener('click', () => speakWord(btn.dataset.word));
        });
    }

    function renderTableView() {
        tableBody.innerHTML = '';
        if (currentWords.length === 0) return;

        currentWords.forEach((item, index) => {
            const wordKey = getWordId(item);
            const isStarred = hasBookmark(item);
            const noteKey = String(item.id || item.word);
            const noteText = userNotes[noteKey] || '';
            const hasNote = noteText.length > 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <button class="star-btn ${isStarred ? 'starred' : ''}" data-id="${escapeHtml(wordKey)}" title="${isStarred ? 'Xóa khỏi từ khó nhớ' : 'Đánh dấu từ khó nhớ'}">
                        <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                    </button>
                </td>
                <td>${index + 1}</td>
                <td class="table-word">
                    ${escapeHtml(item.word)}
                    <button class="note-btn ${hasNote ? 'has-note' : ''}" data-idx="${index}" title="${hasNote ? 'Xem/Sửa ghi chú cá nhân' : 'Thêm ghi chú cá nhân'}" style="margin-left: 6px;">
                        <i class="fa-solid fa-note-sticky"></i>
                        ${hasNote ? '<span class="note-indicator-dot"></span>' : ''}
                    </button>
                </td>
                <td><span class="pos-tag">${escapeHtml(item.pos || 'vocabulary')}</span></td>
                <td><span class="level-badge ${(item.level || 'B2').toLowerCase()}">${item.level || 'B2'}</span></td>
                <td style="color: #93c5fd; font-weight: 600;">
                    ${escapeHtml(item.meaning || '')}
                </td>
                <td style="text-align: center;">
                    <button class="card-btn table-speak-btn" data-word="${escapeHtml(item.word)}" style="display: inline-flex; padding: 6px 12px;">
                        <i class="fa-solid fa-volume-high"></i> Nghe
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        tableBody.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const wordId = btn.dataset.id;
                toggleBookmark(wordId);
                const isNowStarred = hasBookmark(wordId);
                btn.classList.toggle('starred', isNowStarred);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isNowStarred ? 'fa-solid fa-star' : 'fa-regular fa-star';
                }
            });
        });

        tableBody.querySelectorAll('.note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx, 10);
                if (!isNaN(idx) && currentWords[idx]) {
                    openWordNoteModal(currentWords[idx]);
                }
            });
        });

        tableBody.querySelectorAll('.table-speak-btn').forEach(btn => {
            btn.addEventListener('click', () => speakWord(btn.dataset.word));
        });
    }

    function updateFlashcardView() {
        if (currentWords.length === 0) return;

        flashcardElement.classList.remove('flipped');

        const current = currentWords[flashcardIndex];
        const numText = `${flashcardIndex + 1} / ${currentWords.length}`;

        const isStarred = hasBookmark(current);
        fcStarBtn.className = `fc-star-btn ${isStarred ? 'starred' : ''}`;
        fcStarBtn.innerHTML = `<i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;

        fcNum.textContent = numText;
        fcCounter.textContent = numText;
        fcWord.textContent = current.word;
        fcPos.textContent = current.pos || '';

        fcWordBack.textContent = current.word;
        if (fcMeaning) fcMeaning.textContent = current.meaning || '';
        fcLevel.textContent = current.level || 'B2';
        fcDictCambridge.href = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(current.word)}`;

        // Highlight Flashcard Note button if note exists
        const noteKey = String(current.id || current.word);
        const noteText = userNotes[noteKey] || '';
        const hasNote = noteText.length > 0;

        if (fcBtnNote) {
            if (hasNote) {
                fcBtnNote.classList.add('has-note');
                fcBtnNote.style.borderColor = '#f59e0b';
                fcBtnNote.style.color = '#f59e0b';
                fcBtnNote.innerHTML = `<i class="fa-solid fa-note-sticky"></i> Ghi chú <span class="note-indicator-dot" style="position: static; display: inline-block; margin-left: 4px;"></span>`;
            } else {
                fcBtnNote.classList.remove('has-note');
                fcBtnNote.style.borderColor = '';
                fcBtnNote.style.color = '';
                fcBtnNote.innerHTML = `<i class="fa-solid fa-note-sticky"></i> Ghi chú`;
            }
        }

        // Clean up any old inline note box if present
        const oldFcNote = document.getElementById('fc-user-note');
        if (oldFcNote) oldFcNote.remove();

        fcPrev.style.opacity = flashcardIndex === 0 ? '0.5' : '1';
        fcNext.style.opacity = flashcardIndex === currentWords.length - 1 ? '0.5' : '1';
    }

    function setViewMode(mode) {
        activeViewMode = mode;
        btnViewCards.classList.remove('active');
        btnViewTable.classList.remove('active');
        btnViewFlashcard.classList.remove('active');
        btnViewQuiz.classList.remove('active');

        viewCardsContainer.classList.add('hidden');
        viewTableContainer.classList.add('hidden');
        viewFlashcardContainer.classList.add('hidden');
        viewQuizContainer.classList.add('hidden');
        btnQuizRetryHeader.classList.add('hidden');

        if (currentWords.length === 0) {
            generateRandomWords();
        }

        if (mode === 'cards') {
            btnViewCards.classList.add('active');
            viewCardsContainer.classList.remove('hidden');
        } else if (mode === 'table') {
            btnViewTable.classList.add('active');
            viewTableContainer.classList.remove('hidden');
        } else if (mode === 'flashcard') {
            btnViewFlashcard.classList.add('active');
            viewFlashcardContainer.classList.remove('hidden');
            updateFlashcardView();
        } else if (mode === 'quiz') {
            btnViewQuiz.classList.add('active');
            viewQuizContainer.classList.remove('hidden');
            btnQuizRetryHeader.classList.remove('hidden');
            startQuiz();
        }
    }

    // ==========================================
    // QUIZ SYSTEM LOGIC
    // ==========================================
    function renderQuizLessonsCheckboxes() {
        if (!quizLessonsCheckboxesContainer) return;
        quizLessonsCheckboxesContainer.innerHTML = '';

        let totalAvailableLessons = 0;

        userFolders.forEach(folder => {
            if (!Array.isArray(folder.lessons) || folder.lessons.length === 0) return;

            folder.lessons.forEach(lesson => {
                const wordCount = Array.isArray(lesson.words) ? lesson.words.length : 0;
                totalAvailableLessons++;

                const item = document.createElement('label');
                item.className = 'quiz-lesson-item';
                item.innerHTML = `
                    <input type="checkbox" class="quiz-lesson-checkbox" value="${escapeHtml(lesson.id)}" ${wordCount > 0 ? 'checked' : 'disabled'}>
                    <span class="quiz-lesson-item-title" title="${escapeHtml(folder.name)} - ${escapeHtml(lesson.name)}">
                        <i class="fa-solid fa-book"></i> [${escapeHtml(folder.name)}] ${escapeHtml(lesson.name)}
                    </span>
                    <span class="quiz-lesson-item-count">${wordCount} từ</span>
                `;
                quizLessonsCheckboxesContainer.appendChild(item);
            });
        });

        if (totalAvailableLessons === 0) {
            quizLessonsCheckboxesContainer.innerHTML = `<div style="color: var(--text-muted); padding: 12px; font-size: 13px; grid-column: 1/-1; text-align: center;">
                <i class="fa-solid fa-circle-info"></i> Bạn chưa tạo bài học nào. Hãy bấm "📁 Quản Lý Thư Mục & Bài Học" để tạo và nạp từ vựng nhé!
            </div>`;
        }
    }

    function sampleEvenlyFromSelectedLessons(lessonIds, targetCount, levelFilter = 'ALL') {
        const activeDecks = [];

        userFolders.forEach(folder => {
            if (Array.isArray(folder.lessons)) {
                folder.lessons.forEach(lesson => {
                    if (lessonIds.includes(lesson.id) && Array.isArray(lesson.words) && lesson.words.length > 0) {
                        let lessonPool = [...lesson.words];
                        if (levelFilter !== 'ALL') {
                            lessonPool = lessonPool.filter(w => w.level === levelFilter);
                        }
                        if (lessonPool.length > 0) {
                            activeDecks.push({
                                id: lesson.id,
                                words: shuffleArray(lessonPool)
                            });
                        }
                    }
                });
            }
        });

        if (activeDecks.length === 0) return [];

        const sampledWords = [];
        const addedKeys = new Set();
        let deckIndex = 0;
        let attempts = 0;
        const maxAttempts = targetCount * activeDecks.length * 3;

        while (sampledWords.length < targetCount && attempts < maxAttempts) {
            attempts++;
            const currentDeck = activeDecks[deckIndex % activeDecks.length];

            if (currentDeck.words.length > 0) {
                const wordObj = currentDeck.words.shift();
                const key = String(wordObj.id || wordObj.word);
                if (!addedKeys.has(key)) {
                    addedKeys.add(key);
                    sampledWords.push(wordObj);
                }
            }

            deckIndex++;

            if (!activeDecks.some(d => d.words.length > 0)) break;
        }

        // Thoroughly shuffle the sampled words across all selected lessons!
        return shuffleArray(sampledWords);
    }

    const sampleEvenlyFromLessons = sampleEvenlyFromSelectedLessons;

    let quizExecutionMode = 'PRACTICE'; // 'PRACTICE' or 'EXAM'

    function startQuiz() {
        const sourceMode = quizSourceSelect ? quizSourceSelect.value : 'CURRENT';
        const selectedQuizType = quizTypeSelect ? quizTypeSelect.value : 'MIXED';
        quizExecutionMode = quizModeSelect ? quizModeSelect.value : 'PRACTICE';
        const activePool = getActiveDataset();

        let qCount = parseInt(nInput.value, 10);
        if (isNaN(qCount) || qCount <= 0) qCount = 10;

        let pool = activePool;

        if (sourceMode === 'CURRENT' && currentWords.length > 0) {
            pool = currentWords;
        } else if (sourceMode === 'BOOKMARKS') {
            pool = activePool.filter(w => hasBookmark(w.id));
            if (pool.length < 4) {
                showToast('Bạn cần ít nhất 4 từ trong "Từ khó nhớ" để tạo bài test!');
                return;
            }
        } else if (selectedLessonIds && selectedLessonIds.length > 1) {
            pool = sampleEvenlyFromSelectedLessons(selectedLessonIds, qCount, activeLevel);
        }

        if (pool.length < 4) {
            showToast('Bài học này cần ít nhất 4 từ vựng để tạo bài test trắc nghiệm!');
            return;
        }

        qCount = Math.min(qCount, pool.length);

        const shuffled = shuffleArray(pool);
        quizQuestions = shuffled.slice(0, qCount).map(item => {
            let qType = selectedQuizType;
            if (selectedQuizType === 'MIXED') {
                const types = ['EN_TO_VI', 'VI_TO_EN', 'LISTEN_TO_EN', 'LISTEN_TO_VI'];
                qType = types[Math.floor(Math.random() * types.length)];
            } else if (selectedQuizType === 'LISTEN_ALL') {
                const types = ['LISTEN_TO_EN', 'LISTEN_TO_VI'];
                qType = types[Math.floor(Math.random() * types.length)];
            }
            return {
                ...item,
                _questionType: qType,
                _selectedId: null,
                _isCorrect: false,
                _renderedOptions: []
            };
        });

        currentQIdx = 0;
        quizScore = 0;
        wrongAnswerWordIds.clear();

        quizProgressBarContainer.classList.remove('hidden');
        quizQuestionBox.classList.remove('hidden');
        quizResultsCard.classList.add('hidden');
        if (examReviewContainer) examReviewContainer.classList.add('hidden');

        quizTotalIdxSpan.textContent = quizQuestions.length;
        quizLiveScoreSpan.textContent = '0';
        quizLiveAnsweredSpan.textContent = '0';

        const liveScoreContainer = document.getElementById('quiz-live-score-container');
        if (liveScoreContainer) {
            if (quizExecutionMode === 'EXAM') {
                liveScoreContainer.style.display = 'none';
            } else {
                liveScoreContainer.style.display = 'inline-block';
            }
        }

        renderQuizQuestion();
    }

    function prevQuestion() {
        if (currentQIdx > 0) {
            currentQIdx--;
            renderQuizQuestion();
        }
    }

    function nextQuestion() {
        if (currentQIdx < quizQuestions.length - 1) {
            currentQIdx++;
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    }

    function renderQuizQuestion() {
        answeredState = false;
        questionFeedback.classList.add('hidden');

        if (currentQIdx >= quizQuestions.length) {
            showQuizResults();
            return;
        }

        const currentWord = quizQuestions[currentQIdx];
        currentQuestionObj = currentWord;

        const effectiveType = currentWord._questionType || 'EN_TO_VI';

        quizCurrentIdxSpan.textContent = currentQIdx + 1;
        const progressPct = ((currentQIdx) / quizQuestions.length) * 100;
        quizProgressFill.style.width = `${progressPct}%`;

        qTag.textContent = `CÂU HỎI ${currentQIdx + 1} / ${quizQuestions.length}`;
        qPos.textContent = `${currentWord.pos || ''} [${currentWord.level || 'B2'}]`;

        if (btnPrevQuestionHeader) {
            btnPrevQuestionHeader.disabled = (currentQIdx === 0);
            btnPrevQuestionHeader.style.opacity = (currentQIdx === 0) ? '0.5' : '1';
        }
        if (btnPrevQuestion) {
            btnPrevQuestion.disabled = (currentQIdx === 0);
            btnPrevQuestion.style.opacity = (currentQIdx === 0) ? '0.5' : '1';
        }

        if (effectiveType === 'LISTEN_TO_EN') {
            qTitle.innerHTML = `<button type="button" id="btn-quiz-speak" class="quiz-speak-btn">
                <i class="fa-solid fa-volume-high"></i> Bấm để nghe lại phát âm
            </button>`;
            qSubtext.textContent = '🔊 Nghe âm thanh phát âm và chọn từ Tiếng Anh đúng:';
            setTimeout(() => speakWord(currentWord.word), 150);
        } else if (effectiveType === 'LISTEN_TO_VI') {
            qTitle.innerHTML = `<button type="button" id="btn-quiz-speak" class="quiz-speak-btn">
                <i class="fa-solid fa-volume-high"></i> Bấm để nghe lại phát âm
            </button>`;
            qSubtext.textContent = '🔊 Nghe âm thanh phát âm và chọn nghĩa Tiếng Việt đúng:';
            setTimeout(() => speakWord(currentWord.word), 150);
        } else if (effectiveType === 'EN_TO_VI') {
            qTitle.textContent = currentWord.word;
            qSubtext.textContent = 'Chọn nghĩa Tiếng Việt chính xác nhất:';
        } else {
            qTitle.textContent = currentWord.meaning || currentWord.word;
            qSubtext.textContent = 'Chọn từ Tiếng Anh chính xác tương ứng:';
        }

        const btnQuizSpeak = document.getElementById('btn-quiz-speak');
        if (btnQuizSpeak) {
            btnQuizSpeak.addEventListener('click', (e) => {
                e.stopPropagation();
                speakWord(currentWord.word);
            });
        }

        let optionsList = currentWord._renderedOptions;
        if (!optionsList || optionsList.length < 4) {
            const activePool = getActiveDataset();
            const distractors = activePool.filter(w => String(w.id) !== String(currentWord.id));
            const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
            optionsList = shuffleArray([currentWord, ...shuffledDistractors]);
            currentWord._renderedOptions = optionsList;
        }

        optionCards.forEach((card, idx) => {
            card.className = 'option-card';
            const optWordObj = optionsList[idx] || currentWord;
            card.dataset.id = optWordObj.id;

            const optTextElem = document.getElementById(`opt-text-${idx}`);
            if (effectiveType === 'EN_TO_VI' || effectiveType === 'LISTEN_TO_VI') {
                optTextElem.textContent = optWordObj.meaning || optWordObj.word;
            } else {
                optTextElem.textContent = optWordObj.word;
            }
        });

        if (currentWord._selectedId !== null && currentWord._selectedId !== undefined) {
            answeredState = true;
            const isCorrect = currentWord._isCorrect;

            if (quizExecutionMode === 'EXAM') {
                optionCards.forEach(card => {
                    card.className = 'option-card';
                    if (String(card.dataset.id) === String(currentWord._selectedId)) {
                        card.classList.add('selected');
                    }
                });
                feedbackMsg.className = 'feedback-msg';
                feedbackMsg.style.color = '#93c5fd';
                feedbackMsg.innerHTML = '📝 Đã ghi nhận câu trả lời. Bạn có thể bấm chọn lại đáp án khác.';
                questionFeedback.classList.remove('hidden');
            } else {
                optionCards.forEach(card => {
                    card.className = 'option-card';
                    if (String(card.dataset.id) === String(currentWord.id)) {
                        card.classList.add('correct');
                    }
                    if (String(card.dataset.id) === String(currentWord._selectedId) && !isCorrect) {
                        card.classList.add('wrong');
                    }
                });

                if (isCorrect) {
                    feedbackMsg.className = 'feedback-msg is-correct';
                    feedbackMsg.style.color = '';
                    if (effectiveType === 'LISTEN_TO_EN') {
                        feedbackMsg.innerHTML = `🎉 Chính xác! Từ vừa nghe là <strong>${escapeHtml(currentWord.word)}</strong> (${escapeHtml(currentWord.meaning)})`;
                    } else if (effectiveType === 'LISTEN_TO_VI') {
                        feedbackMsg.innerHTML = `🎉 Chính xác! Từ <strong>${escapeHtml(currentWord.word)}</strong> nghĩa là <strong>${escapeHtml(currentWord.meaning)}</strong>`;
                    } else {
                        feedbackMsg.innerHTML = '🎉 Chính xác! Bạn đã chọn đáp án đúng.';
                    }
                } else {
                    feedbackMsg.className = 'feedback-msg is-wrong';
                    feedbackMsg.style.color = '';
                    if (effectiveType === 'LISTEN_TO_EN') {
                        feedbackMsg.innerHTML = `❌ Chưa chính xác. Từ bạn vừa nghe là: <strong>${escapeHtml(currentWord.word)}</strong> (${escapeHtml(currentWord.meaning)})`;
                    } else if (effectiveType === 'LISTEN_TO_VI') {
                        feedbackMsg.innerHTML = `❌ Chưa chính xác. Từ <strong>${escapeHtml(currentWord.word)}</strong> có nghĩa là: <strong>${escapeHtml(currentWord.meaning)}</strong>`;
                    } else if (effectiveType === 'EN_TO_VI') {
                        feedbackMsg.innerHTML = `❌ Chưa chính xác. Đáp án đúng là: <strong>${escapeHtml(currentWord.meaning)}</strong>`;
                    } else {
                        feedbackMsg.innerHTML = `❌ Chưa chính xác. Đáp án đúng là: <strong>${escapeHtml(currentWord.word)}</strong>`;
                    }
                }

                questionFeedback.classList.remove('hidden');
            }
        }
    }

    function handleAnswerSelection(selectedOptIdx) {
        const selectedCard = optionCards[selectedOptIdx];
        if (!selectedCard) return;

        const selectedId = selectedCard.dataset.id;
        const isCorrect = (String(selectedId) === String(currentQuestionObj.id));

        currentQuestionObj._selectedId = selectedId;
        currentQuestionObj._isCorrect = isCorrect;
        const selectedOptObj = (currentQuestionObj._renderedOptions || []).find(w => String(w.id) === String(selectedId));
        currentQuestionObj._selectedOptObj = selectedOptObj;

        answeredState = true;

        const effectiveType = currentQuestionObj._questionType || 'EN_TO_VI';

        if (quizExecutionMode === 'EXAM') {
            optionCards.forEach(card => card.classList.remove('selected'));
            selectedCard.classList.add('selected');

            feedbackMsg.className = 'feedback-msg';
            feedbackMsg.style.color = '#93c5fd';
            feedbackMsg.innerHTML = '📝 Đã ghi nhận/thay đổi câu trả lời. Bạn có thể chọn lại đáp án khác.';
            questionFeedback.classList.remove('hidden');
        } else {
            optionCards.forEach(card => {
                card.className = 'option-card';
                if (String(card.dataset.id) === String(currentQuestionObj.id)) {
                    card.classList.add('correct');
                }
            });

            if (isCorrect) {
                selectedCard.classList.add('correct');
                feedbackMsg.className = 'feedback-msg is-correct';
                feedbackMsg.style.color = '';
                if (effectiveType === 'LISTEN_TO_EN') {
                    feedbackMsg.innerHTML = `🎉 Chính xác! Từ vừa nghe là <strong>${escapeHtml(currentQuestionObj.word)}</strong> (${escapeHtml(currentQuestionObj.meaning)})`;
                } else if (effectiveType === 'LISTEN_TO_VI') {
                    feedbackMsg.innerHTML = `🎉 Chính xác! Từ <strong>${escapeHtml(currentQuestionObj.word)}</strong> nghĩa là <strong>${escapeHtml(currentQuestionObj.meaning)}</strong>`;
                } else {
                    feedbackMsg.innerHTML = '🎉 Chính xác! Bạn đã chọn đáp án đúng.';
                }
            } else {
                selectedCard.classList.add('wrong');
                feedbackMsg.className = 'feedback-msg is-wrong';
                feedbackMsg.style.color = '';
                if (effectiveType === 'LISTEN_TO_EN') {
                    feedbackMsg.innerHTML = `❌ Chưa chính xác. Từ bạn vừa nghe là: <strong>${escapeHtml(currentQuestionObj.word)}</strong> (${escapeHtml(currentQuestionObj.meaning)})`;
                } else if (effectiveType === 'LISTEN_TO_VI') {
                    feedbackMsg.innerHTML = `❌ Chưa chính xác. Từ <strong>${escapeHtml(currentQuestionObj.word)}</strong> có nghĩa là: <strong>${escapeHtml(currentQuestionObj.meaning)}</strong>`;
                } else if (effectiveType === 'EN_TO_VI') {
                    feedbackMsg.innerHTML = `❌ Chưa chính xác. Đáp án đúng là: <strong>${escapeHtml(currentQuestionObj.meaning)}</strong>`;
                } else {
                    feedbackMsg.innerHTML = `❌ Chưa chính xác. Đáp án đúng là: <strong>${escapeHtml(currentQuestionObj.word)}</strong>`;
                }
            }

            questionFeedback.classList.remove('hidden');
        }

        let liveScore = 0;
        let liveAnswered = 0;
        quizQuestions.forEach(q => {
            if (q._selectedId !== null && q._selectedId !== undefined) {
                liveAnswered++;
                if (q._isCorrect) liveScore++;
            }
        });
        quizScore = liveScore;
        quizLiveScoreSpan.textContent = quizScore;
        quizLiveAnsweredSpan.textContent = liveAnswered;
    }

    function showQuizResults() {
        quizQuestionBox.classList.add('hidden');
        quizProgressBarContainer.classList.add('hidden');
        quizResultsCard.classList.remove('hidden');

        quizScore = 0;
        wrongAnswerWordIds.clear();
        quizQuestions.forEach(q => {
            if (q._isCorrect) {
                quizScore++;
            } else {
                wrongAnswerWordIds.add(q.id);
            }
        });

        const total = quizQuestions.length;
        const pct = Math.round((quizScore / total) * 100);

        finalScorePercent.textContent = `${pct}%`;
        finalScoreText.textContent = `${quizScore} / ${total} câu đúng`;

        if (pct >= 80) {
            resultsMessage.textContent = '🌟 Xuất sắc! Bạn ghi nhớ từ vựng rất chuẩn xác.';
        } else if (pct >= 50) {
            resultsMessage.textContent = '👍 Khá tốt! Hãy tiếp tục luyện tập để ghi nhớ lâu hơn.';
        } else {
            resultsMessage.textContent = '💪 Đừng nản lòng! Bạn có thể lưu các từ làm sai vào "Từ khó nhớ" để học lại.';
        }

        if (wrongAnswerWordIds.size > 0) {
            btnSaveWrongStars.style.display = 'inline-flex';
            btnSaveWrongStars.textContent = `⭐ Lưu ${wrongAnswerWordIds.size} từ làm sai vào "Từ khó nhớ"`;
        } else {
            btnSaveWrongStars.style.display = 'none';
        }

        renderExamReview();
    }

    function renderExamReview() {
        if (!examReviewContainer) return;
        examReviewContainer.innerHTML = '';
        examReviewContainer.classList.remove('hidden');

        const titleDiv = document.createElement('div');
        titleDiv.className = 'exam-review-header';
        titleDiv.innerHTML = `<h3><i class="fa-solid fa-list-check"></i> Chi tiết đáp án từng câu hỏi (${quizExecutionMode === 'EXAM' ? 'Chế độ Thi thử' : 'Chế độ Luyện tập'})</h3>`;
        examReviewContainer.appendChild(titleDiv);

        const listDiv = document.createElement('div');
        listDiv.className = 'exam-review-list';

        quizQuestions.forEach((q, idx) => {
            const isCorrect = q._isCorrect;
            const qType = q._questionType || 'EN_TO_VI';
            
            let userText = 'Chưa chọn';
            if (q._selectedOptObj) {
                userText = (qType === 'EN_TO_VI' || qType === 'LISTEN_TO_VI') ? 
                    (q._selectedOptObj.meaning || q._selectedOptObj.word) : q._selectedOptObj.word;
            }

            let correctText = (qType === 'EN_TO_VI' || qType === 'LISTEN_TO_VI') ? 
                (q.meaning || q.word) : q.word;

            const wordKey = getWordId(q);
            const isStarred = hasBookmark(q);

            const card = document.createElement('div');
            card.className = `review-card ${isCorrect ? 'is-correct' : 'is-wrong'}`;
            card.innerHTML = `
                <div class="review-card-top">
                    <div class="review-q-info">
                        <span class="review-q-idx">Câu ${idx + 1}</span>
                        <span class="review-tag">${qType === 'LISTEN_TO_EN' || qType === 'LISTEN_TO_VI' ? '🔊 Câu hỏi Nghe' : (qType === 'EN_TO_VI' ? '📝 Anh ➔ Việt' : '🔤 Việt ➔ Anh')}</span>
                    </div>
                    <span class="review-status-badge ${isCorrect ? 'badge-correct' : 'badge-wrong'}">
                        ${isCorrect ? '<i class="fa-solid fa-circle-check"></i> Đúng' : '<i class="fa-solid fa-circle-xmark"></i> Sai'}
                    </span>
                </div>
                <div class="review-card-body">
                    <div class="review-word-title">
                        <strong class="word-name">${escapeHtml(q.word)}</strong>
                        <span class="pos-tag">${escapeHtml(q.pos || '')}</span>
                        <span class="level-badge ${(q.level || 'B2').toLowerCase()}">${q.level || 'B2'}</span>
                    </div>
                    <div class="review-meaning">Nghĩa tiếng Việt: <strong>${escapeHtml(q.meaning || '')}</strong></div>
                    <div class="review-answers-grid">
                        <div class="review-ans-item">
                            <span class="ans-label">Lựa chọn của bạn:</span>
                            <span class="ans-val ${isCorrect ? 'val-correct' : 'val-wrong'}">${escapeHtml(userText)}</span>
                        </div>
                        ${!isCorrect ? `
                        <div class="review-ans-item">
                            <span class="ans-label">Đáp án đúng:</span>
                            <span class="ans-val val-correct">${escapeHtml(correctText)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="review-card-actions">
                    <button type="button" class="tool-btn-sm btn-review-speak" data-word="${escapeHtml(q.word)}">
                        <i class="fa-solid fa-volume-high"></i> Nghe
                    </button>
                    <button type="button" class="tool-btn-sm star-btn ${isStarred ? 'starred' : ''} btn-review-star" data-id="${escapeHtml(wordKey)}">
                        <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i> Từ khó
                    </button>
                </div>
            `;
            listDiv.appendChild(card);
        });

        examReviewContainer.appendChild(listDiv);

        listDiv.querySelectorAll('.btn-review-speak').forEach(btn => {
            btn.addEventListener('click', () => speakWord(btn.dataset.word));
        });

        listDiv.querySelectorAll('.btn-review-star').forEach(btn => {
            btn.addEventListener('click', () => {
                const wordId = btn.dataset.id;
                toggleBookmark(wordId);
                const isNowStarred = hasBookmark(wordId);
                btn.classList.toggle('starred', isNowStarred);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isNowStarred ? 'fa-solid fa-star' : 'fa-regular fa-star';
                }
            });
        });
    }

    function saveWrongAnswersToBookmarks() {
        if (wrongAnswerWordIds.size === 0) return;
        wrongAnswerWordIds.forEach(id => bookmarks.add(id));
        saveBookmarks();
        showToast(`⭐ Đã lưu ${wrongAnswerWordIds.size} từ làm sai vào "Từ khó nhớ"!`);
        btnSaveWrongStars.style.display = 'none';
    }

    function speakWord(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        } else {
            showToast('Trình duyệt không hỗ trợ phát âm (Speech Synthesis).');
        }
    }

    function copyToClipboard() {
        if (currentWords.length === 0) return;
        const text = currentWords.map((item, idx) => `${idx + 1}. ${item.word} (${item.pos}) [${item.level || 'B2'}]: ${item.meaning || ''}`).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Đã sao chép ${currentWords.length} từ vào bộ nhớ tạm!`);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    }

    function exportTxtFile() {
        if (currentWords.length === 0) return;
        const text = `DANH SÁCH ${currentWords.length} TỪ VỰNG NGẪU NHIÊN\n` +
                     `Bài học: ${activeLessonSelect.options[activeLessonSelect.selectedIndex]?.text || 'Tự chọn'}\n` +
                     `Cấp độ: ${activeLevel}\n` +
                     `==================================================\n\n` +
                     currentWords.map((item, idx) => `${idx + 1}. ${item.word} (${item.pos}) - [${item.level || 'B2'}]: ${item.meaning || ''}`).join('\n');

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vocab_Random_${currentWords.length}_words.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Đã tải file TXT thành công!');
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")
                          .replace(/"/g, "&quot;")
                          .replace(/'/g, "&#039;");
    }

    function initApp() {
        // 1. Restore theme preference (Light / Dark)
        const savedTheme = localStorage.getItem('theme_preference') || 'dark';
        applyTheme(savedTheme === 'light');

        // 2. Ensure dataset is initialized from window.OXFORD_5000_DATA
        if (!defaultDataset || defaultDataset.length === 0) {
            if (typeof window !== 'undefined' && Array.isArray(window.OXFORD_5000_DATA) && window.OXFORD_5000_DATA.length > 0) {
                defaultDataset = window.OXFORD_5000_DATA;
            }
        }

        // 3. Load bookmarks from disk/local
        try {
            const savedBm = localStorage.getItem('oxford5000_bookmarks');
            if (savedBm) {
                const parsedBm = JSON.parse(savedBm);
                if (Array.isArray(parsedBm)) {
                    parsedBm.forEach(id => bookmarks.add(id));
                }
            }
        } catch (e) {
            console.error('Lỗi đọc bookmarks local:', e);
        }

        fetch('bookmarks.json')
            .then(res => res.ok ? res.json() : [])
            .then(diskBookmarks => {
                if (Array.isArray(diskBookmarks) && diskBookmarks.length > 0) {
                    diskBookmarks.forEach(id => bookmarks.add(id));
                    saveBookmarksToLocalOnly();
                }
            })
            .catch(e => console.log('Bookmarks disk sync:', e));

        // Word Note Modal Listeners
        if (btnCloseNoteModal) btnCloseNoteModal.addEventListener('click', closeWordNoteModal);
        if (btnSaveNote) btnSaveNote.addEventListener('click', saveCurrentNote);
        if (btnClearNote) btnClearNote.addEventListener('click', clearCurrentNote);

        if (modalWordNote) {
            modalWordNote.addEventListener('click', (e) => {
                if (e.target === modalWordNote) closeWordNoteModal();
            });
        }

        if (modalVocabStats) {
            modalVocabStats.addEventListener('click', (e) => {
                if (e.target === modalVocabStats) modalVocabStats.classList.add('hidden');
            });
        }

        // 4. Setup all event listeners
        setupEventListeners();

        // 5. Load user notes
        loadUserNotes();

        // 6. Load user folders and render initial vocabulary cards
        loadUserFolders();
    }

    // ==========================================
    // VOCABULARY LEVEL STATISTICS BREAKDOWN MODAL
    // ==========================================
    function openVocabStatsModal() {
        if (!modalVocabStats) return;

        const datasetPool = getActiveDataset();
        const totalWords = datasetPool.length;

        const counts = {
            'A1': 0,
            'A2': 0,
            'B1': 0,
            'B2': 0,
            'C1': 0,
            'C2': 0,
            'BOOKMARKS': 0,
            'OTHER': 0
        };

        datasetPool.forEach(w => {
            if (!w) return;
            const lvl = (w.level || '').toUpperCase().trim();
            if (counts.hasOwnProperty(lvl)) {
                counts[lvl]++;
            } else {
                counts.OTHER++;
            }
            if (hasBookmark(w)) {
                counts.BOOKMARKS++;
            }
        });

        let datasetName = 'Tất cả bài học';
        if (selectedLessonIds && selectedLessonIds.length === 1) {
            const lObj = findLessonById(selectedLessonIds[0]);
            if (lObj) datasetName = lObj.name;
        } else if (selectedLessonIds && selectedLessonIds.length > 1) {
            datasetName = `Đã chọn ${selectedLessonIds.length} bài học kết hợp`;
        } else if (!selectedLessonIds || selectedLessonIds.length === 0) {
            datasetName = 'Chưa chọn bài học nào';
        }

        if (statsDatasetTitle) statsDatasetTitle.textContent = `📚 Bài học đang chọn: ${datasetName}`;
        if (statsTotalWordsCount) statsTotalWordsCount.textContent = totalWords.toLocaleString();

        // Render Visual Bar Chart (Biểu đồ cột)
        const barBox = document.getElementById('stats-bar-chart-box');
        if (barBox) {
            barBox.innerHTML = '';
            
            const chartConfig = [
                { key: 'A1', name: 'A1', full: 'Cấp A1', color: 'linear-gradient(180deg, #34d399, #10b981)' },
                { key: 'A2', name: 'A2', full: 'Cấp A2', color: 'linear-gradient(180deg, #6ee7b7, #059669)' },
                { key: 'B1', name: 'B1', full: 'Cấp B1', color: 'linear-gradient(180deg, #60a5fa, #2563eb)' },
                { key: 'B2', name: 'B2', full: 'Cấp B2', color: 'linear-gradient(180deg, #818cf8, #4f46e5)' },
                { key: 'C1', name: 'C1', full: 'Cấp C1', color: 'linear-gradient(180deg, #a78bfa, #7c3aed)' },
                { key: 'C2', name: 'C2', full: 'Cấp C2', color: 'linear-gradient(180deg, #c084fc, #9333ea)' },
                { key: 'BOOKMARKS', name: '⭐', full: 'Từ khó nhớ', color: 'linear-gradient(180deg, #fbbf24, #d97706)' }
            ];

            let maxCount = 0;
            chartConfig.forEach(item => {
                item.count = counts[item.key] || 0;
                if (item.count > maxCount) maxCount = item.count;
            });

            if (maxCount > 0) {
                chartConfig.forEach(item => {
                    const pctOfTotal = totalWords > 0 ? ((item.count / totalWords) * 100).toFixed(1) : '0.0';
                    const heightPct = maxCount > 0 ? Math.max(6, (item.count / maxCount) * 100) : 0;

                    const colElem = document.createElement('div');
                    colElem.className = 'v-bar-col';
                    colElem.title = `${item.full}: ${item.count.toLocaleString()} từ (${pctOfTotal}%) - Bấm để lọc`;
                    colElem.innerHTML = `
                        <div class="v-bar-val">${item.count > 0 ? `${item.count} <span style="font-size:10px; opacity:0.85;">(${pctOfTotal}%)</span>` : '0'}</div>
                        <div class="v-bar-track">
                            <div class="v-bar-fill" style="height: ${item.count > 0 ? heightPct : 0}%; background: ${item.color};"></div>
                        </div>
                        <div class="v-bar-label">${item.name}</div>
                    `;

                    // Click column to quick filter
                    colElem.addEventListener('click', () => {
                        const targetLvl = item.key;
                        activeLevel = targetLvl;
                        
                        if (targetLvl === 'BOOKMARKS' || targetLvl === 'ALL') {
                            levelChips.forEach(c => {
                                c.classList.remove('active');
                                if (c.dataset.level === targetLvl) c.classList.add('active');
                            });
                            if (levelDropdownSelect) {
                                levelDropdownSelect.classList.remove('active');
                                levelDropdownSelect.value = "";
                            }
                        } else {
                            levelChips.forEach(c => c.classList.remove('active'));
                            if (levelDropdownSelect) {
                                levelDropdownSelect.classList.add('active');
                                levelDropdownSelect.value = targetLvl;
                            }
                        }

                        generateRandomWords(false);
                        modalVocabStats.classList.add('hidden');
                        showToast(`🎯 Đã áp dụng bộ lọc: ${item.full}`);
                    });

                    barBox.appendChild(colElem);
                });
            } else {
                barBox.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; text-align: center; width: 100%;">Chưa có dữ liệu từ vựng</div>`;
            }
        }

        const targetModal = modalVocabStats || document.getElementById('modal-vocab-stats');
        if (targetModal) {
            targetModal.classList.remove('hidden');
        }
    }

    // Expose for inline HTML onclick fallback
    window.openVocabStatsModal = openVocabStatsModal;

    // Launch app
    initApp();
});
