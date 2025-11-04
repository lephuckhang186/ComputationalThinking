/* Floating chat */

/**
 * Initialize floating chat button functionality
 */
export function initFloatingChat() {
    const floatingChat = document.getElementById('floatingChat');
    const chatbotPopup = document.getElementById('chatbotPopup');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotPopupBody = document.getElementById('chatbotPopupBody');
    const backToTopBtn = document.getElementById('backToTop');
    const chatbotMenuBtn = document.getElementById('chatbotMenuBtn');
    const chatbotMenu = document.getElementById('chatbotMenu');
    const chatbotReset = document.getElementById('chatbotReset');
    const chatbotHistory = document.getElementById('chatbotHistory');
    const chatbotExport = document.getElementById('chatbotExport');
    const chatbotSettings = document.getElementById('chatbotSettings');
    const chatbotHelp = document.getElementById('chatbotHelp');
    const suggestedPrompts = document.getElementById('suggestedPrompts');
    const typingIndicator = document.getElementById('typingIndicator');
    const chatbotAttach = document.getElementById('chatbotAttach');
    const chatbotFileInput = document.getElementById('chatbotFileInput');
    const chatbotVoice = document.getElementById('chatbotVoice');
    const chatbotStop = document.getElementById('chatbotStop');
    const chatbotDarkMode = document.getElementById('chatbotDarkMode');

    if (!floatingChat || !chatbotPopup) return;

    // Get initial message HTML for reset
    const initialMessageHTML = chatbotPopupBody.innerHTML;
    let attachedFile = null;
    let isRecording = false;
    let isPaused = false;
    let recognition = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordingStartTime = null;
    let pausedDuration = 0;
    let pauseStartTime = null;
    let recordingTimer = null;
    let currentRecordingIndicator = null;
    let stopGeneration = false;
    let currentGenerationTimeout = null;
    let isDarkMode = localStorage.getItem('chatbot_dark_mode') === 'true';
    
    // Apply dark mode if saved
    if (isDarkMode) {
        chatbotPopup.classList.add('dark-mode');
    }

    // Function to open popup
    const openPopup = () => {
        chatbotPopup.classList.add('active');
        floatingChat.classList.add('chat-open');
        if (backToTopBtn) {
            backToTopBtn.classList.add('chat-open');
        }
        chatbotInput.focus();
    };

    // Function to close popup
    const closePopup = () => {
        // Add closing animation
        chatbotPopup.classList.add('closing');
        chatbotPopup.classList.remove('active');
        
        // Wait for closing animation to complete
        setTimeout(() => {
            chatbotPopup.classList.remove('closing');
            
            // Remove chat-open class from floating button
            floatingChat.classList.remove('chat-open');
            
            if (backToTopBtn) {
                backToTopBtn.classList.remove('chat-open');
            }
        }, 250); // Match the closing animation duration
    };

    // Toggle popup on floating chat button click
    floatingChat.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatbotPopup.classList.contains('active')) {
            // If chat is open, close it
            closePopup();
        } else {
            // If chat is closed, open it
            openPopup();
        }
    });

    // Close popup
    chatbotClose.addEventListener('click', closePopup);

    // Close on outside click
    chatbotPopup.addEventListener('click', (e) => {
        if (e.target === chatbotPopup) {
            closePopup();
        }
    });

    // Helper function to attach message actions
    const attachMessageActions = (msgElement, messageText) => {
        const actionButtons = msgElement.querySelectorAll('.msg-action-btn, .msg-reaction-btn');
        
        actionButtons.forEach(btn => {
            const action = btn.getAttribute('data-action') || btn.getAttribute('data-reaction');
            
            if (action === 'copy') {
                btn.addEventListener('click', () => {
                    navigator.clipboard.writeText(messageText).then(() => {
                        const icon = btn.querySelector('svg');
                        const originalHTML = icon.outerHTML;
                        icon.outerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        `;
                        setTimeout(() => {
                            btn.querySelector('svg').outerHTML = originalHTML;
                        }, 2000);
                    });
                });
            } else if (action === 'regenerate') {
                btn.addEventListener('click', () => {
                    // Remove current bot message
                    const botMsg = btn.closest('.bot-msg-wrapper');
                    if (botMsg) {
                        const suggestedReplies = botMsg.nextElementSibling;
                        if (suggestedReplies?.classList.contains('suggested-replies')) {
                            suggestedReplies.remove();
                        }
                        botMsg.remove();
                    }
                    // Regenerate response
                    const lastUserMsg = Array.from(chatbotPopupBody.querySelectorAll('.user-msg-wrapper')).pop();
                    if (lastUserMsg) {
                        const userText = lastUserMsg.querySelector('.user-msg')?.textContent || '';
                        sendMessage(userText);
                    }
                });
            } else if (action === 'like') {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('liked');
                });
            }
        });
    };

    // Send message
    const sendMessage = (customMessage = null) => {
        const message = customMessage || chatbotInput.value.trim();
        if (!message && !attachedFile) return;

        // Hide suggested prompts after first message
        if (suggestedPrompts && !suggestedPrompts.classList.contains('hidden')) {
            suggestedPrompts.classList.add('hidden');
        }

        // Save message to history
        if (message) {
            const history = JSON.parse(localStorage.getItem('zenjourney_chat_history') || '[]');
            history.push({
                message: message,
                date: new Date().toLocaleString('vi-VN'),
                timestamp: Date.now()
            });
            // Keep only last 50 conversations
            if (history.length > 50) {
                history.shift();
            }
            localStorage.setItem('zenjourney_chat_history', JSON.stringify(history));
        }

        // Add user message
        const userWrapper = document.createElement('div');
        userWrapper.className = 'user-msg-wrapper';
        userWrapper.dataset.editable = 'true';
        
        let userMsgHTML = '';
        if (attachedFile) {
            const fileSize = (attachedFile.size / 1024).toFixed(1);
            userMsgHTML += `<div class="chat-file-preview" style="margin-bottom: 8px;">
                ${attachedFile.type.startsWith('image/') ? 
                    `<img src="${URL.createObjectURL(attachedFile)}" alt="Attached image">` : 
                    `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>`
                }
                <div class="chat-file-preview-info">
                    <div class="chat-file-preview-name">${attachedFile.name}</div>
                    <div class="chat-file-preview-size">${fileSize} KB</div>
                </div>
            </div>`;
        }
        if (message) {
            userMsgHTML += `<div class="user-msg">${message}</div>`;
        }
        userMsgHTML += `<div class="msg-actions">
            <button class="msg-action-btn" data-action="copy" title="Sao chép">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
            <button class="msg-action-btn" data-action="edit" title="Chỉnh sửa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="msg-action-btn" data-action="delete" title="Xóa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>`;
        userWrapper.innerHTML = userMsgHTML + `<img src="https://i.pravatar.cc/40" alt="User" class="user-avatar">`;
        
        chatbotPopupBody.appendChild(userWrapper);
        
        // Attach actions to user message
        if (message) {
            attachMessageActions(userWrapper, message);
        }
        
        // Handle edit/delete for user messages
        const editBtn = userWrapper.querySelector('[data-action="edit"]');
        const deleteBtn = userWrapper.querySelector('[data-action="delete"]');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const msgElement = userWrapper.querySelector('.user-msg');
                const currentText = msgElement.textContent;
                chatbotInput.value = currentText;
                chatbotInput.focus();
                userWrapper.style.opacity = '0.5';
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
                    userWrapper.remove();
                }
            });
        }

        // Clear input and file
        chatbotInput.value = '';
        attachedFile = null;
        updateFilePreview();

        // Scroll to bottom
        chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;

        // Show typing indicator and stop button
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;
        }
        if (chatbotStop) {
            chatbotStop.style.display = 'flex';
            stopGeneration = false;
        }

        // Simulate bot response
        currentGenerationTimeout = setTimeout(() => {
            if (stopGeneration) {
                if (typingIndicator) typingIndicator.style.display = 'none';
                if (chatbotStop) chatbotStop.style.display = 'none';
                return;
            }
            
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
            if (chatbotStop) {
                chatbotStop.style.display = 'none';
            }
            
            const botWrapper = document.createElement('div');
            botWrapper.className = 'bot-msg-wrapper';
            const botResponse = message.includes('thư giãn') || message.includes('relax') 
                ? 'Tôi hiểu bạn cần một chuyến đi thư giãn! 🌿 Hãy cho tôi biết bạn thích núi non hay biển cả nhé?' 
                : message.includes('Việt Nam') || message.includes('Vietnam')
                ? 'Việt Nam có rất nhiều điểm đến tuyệt vời! 🇻🇳 Bạn có thể thử Dalat, Sapa, Phu Quoc, hoặc Hội An. Bạn muốn tìm hiểu về địa điểm nào cụ thể?'
                : message.includes('lịch trình') || message.includes('itinerary')
                ? 'Tôi sẽ giúp bạn lên lịch trình chi tiết! 📅 Bạn muốn đi đâu và trong bao lâu?'
                : message.includes('ngân sách') || message.includes('budget')
                ? 'Với ngân sách 5 triệu VNĐ, bạn có thể có một chuyến đi tuyệt vời! 💰 Tôi sẽ đề xuất các gói phù hợp nhất cho bạn.'
                : 'Cảm ơn bạn đã nhắn tin! Tôi sẽ giúp bạn tìm chuyến đi phù hợp nhất. 🌿 Hãy cho tôi biết thêm về sở thích của bạn nhé!';
            
            const msgId = Date.now();
            botWrapper.dataset.msgId = msgId;
            botWrapper.innerHTML = `
                <img src="assets/img/Screenshot 2025-10-28 224509.png" alt="Zenjourney AI" class="bot-avatar">
                <div class="bot-msg-container">
                    <div class="bot-msg">${botResponse}</div>
                    <div class="msg-actions">
                        <button class="msg-action-btn" data-action="copy" aria-label="Copy message" title="Sao chép">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button class="msg-action-btn" data-action="regenerate" aria-label="Regenerate" title="Tạo lại">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                <path d="M21 3v5h-5"></path>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                <path d="M3 21v-5h5"></path>
                            </svg>
                        </button>
                        <button class="msg-reaction-btn" data-reaction="like" aria-label="Like" title="Thích">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            chatbotPopupBody.appendChild(botWrapper);
            attachMessageActions(botWrapper, botResponse);
            
            // Add suggested replies
            const suggestedReplies = document.createElement('div');
            suggestedReplies.className = 'suggested-replies';
            const replies = [
                'Cảm ơn bạn! Tôi muốn tìm hiểu thêm',
                'Tôi cần gợi ý cụ thể hơn',
                'Bạn có thể đề xuất khách sạn không?'
            ];
            replies.forEach(reply => {
                const btn = document.createElement('button');
                btn.className = 'suggested-reply';
                btn.textContent = reply;
                btn.addEventListener('click', () => {
                    chatbotInput.value = reply;
                    sendMessage(reply);
                    suggestedReplies.remove();
                });
                suggestedReplies.appendChild(btn);
            });
            chatbotPopupBody.appendChild(suggestedReplies);
            
            chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;
        }, 1500);
    };

    // File handling
    const updateFilePreview = () => {
        // Remove existing file preview
        const existingPreview = chatbotPopupBody.querySelector('.chat-file-preview-standalone');
        if (existingPreview) {
            existingPreview.remove();
        }

        if (attachedFile) {
            const preview = document.createElement('div');
            preview.className = 'chat-file-preview chat-file-preview-standalone';
            const fileSize = (attachedFile.size / 1024).toFixed(1);
            preview.innerHTML = `
                ${attachedFile.type.startsWith('image/') ? 
                    `<img src="${URL.createObjectURL(attachedFile)}" alt="Preview">` : 
                    `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>`
                }
                <div class="chat-file-preview-info">
                    <div class="chat-file-preview-name">${attachedFile.name}</div>
                    <div class="chat-file-preview-size">${fileSize} KB</div>
                </div>
                <button class="chat-file-preview-remove" aria-label="Remove file">×</button>
            `;
            chatbotPopupBody.appendChild(preview);
            
            preview.querySelector('.chat-file-preview-remove').addEventListener('click', () => {
                attachedFile = null;
                preview.remove();
            });
        }
    };

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Suggested prompts
    if (suggestedPrompts) {
        const promptButtons = suggestedPrompts.querySelectorAll('.suggested-prompt');
        promptButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                chatbotInput.value = prompt;
                chatbotInput.focus();
                sendMessage(prompt);
            });
        });
    }

    // File attach
    if (chatbotAttach && chatbotFileInput) {
        chatbotAttach.addEventListener('click', () => {
            chatbotFileInput.click();
        });

        chatbotFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                attachedFile = file;
                updateFilePreview();
            }
        });
    }

    // Attach actions to initial message
    const initialMsgWrapper = chatbotPopupBody.querySelector('.bot-msg-wrapper');
    if (initialMsgWrapper) {
        const initialMsg = initialMsgWrapper.querySelector('.bot-msg')?.textContent || '';
        attachMessageActions(initialMsgWrapper, initialMsg);
    }

    // Helper function to format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper function to update timer
    const updateTimer = () => {
        if (!currentRecordingIndicator || !recordingStartTime || isPaused) return;
        const now = Date.now();
        const elapsed = Math.floor((now - recordingStartTime - pausedDuration) / 1000);
        const timerEl = currentRecordingIndicator.querySelector('.voice-recording-timer');
        if (timerEl) {
            timerEl.textContent = formatTime(elapsed);
        }
    };

    // Helper function to stop recording and cleanup
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (recognition && isRecording) {
            recognition.stop();
        }
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        isRecording = false;
        isPaused = false;
        pausedDuration = 0;
        pauseStartTime = null;
    };

    // Voice input with audio recording
    if (chatbotVoice) {
        chatbotVoice.addEventListener('click', async () => {
            if (!isRecording) {
                // Start recording
                try {
                    // Request microphone permission
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    // Setup MediaRecorder
                    audioChunks = [];
                    mediaRecorder = new MediaRecorder(stream);
                    
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = () => {
                        stream.getTracks().forEach(track => track.stop());
                        // Audio is saved when user clicks save button
                    };

                    // Start MediaRecorder
                    mediaRecorder.start();
                    
                    // Also start Speech Recognition for transcription
                    if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        recognition = new SpeechRecognition();
                        recognition.lang = 'vi-VN';
                        recognition.continuous = true;
                        recognition.interimResults = false;

                        recognition.onresult = (event) => {
                            let transcript = '';
                            for (let i = event.resultIndex; i < event.results.length; i++) {
                                transcript += event.results[i][0].transcript;
                            }
                            chatbotInput.value = transcript;
                        };

                        recognition.onerror = () => {
                            // Continue recording even if recognition fails
                        };
                        
                        recognition.start();
                    }

                    isRecording = true;
                    isPaused = false;
                    recordingStartTime = Date.now();
                    pausedDuration = 0;
                    pauseStartTime = null;
                    
                    // Update button
                    chatbotVoice.classList.add('recording');
                    chatbotVoice.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                        </svg>
                    `;
                    
                    // Create recording indicator with controls
                    currentRecordingIndicator = document.createElement('div');
                    currentRecordingIndicator.className = 'voice-recording';
                    currentRecordingIndicator.innerHTML = `
                        <div class="voice-recording-dot"></div>
                        <div class="voice-waveform">
                            <div class="voice-waveform-bar"></div>
                            <div class="voice-waveform-bar"></div>
                            <div class="voice-waveform-bar"></div>
                            <div class="voice-waveform-bar"></div>
                            <div class="voice-waveform-bar"></div>
                            <div class="voice-waveform-bar"></div>
                        </div>
                        <span class="voice-recording-timer">00:00</span>
                        <div class="voice-recording-controls">
                            <button class="voice-control-btn pause-btn" title="${isPaused ? 'Tiếp tục' : 'Tạm dừng'}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    ${isPaused ? 
                                        `<polygon points="5 3 19 12 5 21"></polygon>` :
                                        `<rect x="6" y="4" width="4" height="16"></rect>
                                         <rect x="14" y="4" width="4" height="16"></rect>`
                                    }
                                </svg>
                            </button>
                            <button class="voice-control-btn save-btn save" title="Lưu và gửi">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                            </button>
                            <button class="voice-control-btn stop-btn" title="Dừng và xóa">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                                </svg>
                            </button>
                        </div>
                    `;
                    
                    chatbotPopupBody.appendChild(currentRecordingIndicator);
                    chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;
                    
                    // Update timer
                    recordingTimer = setInterval(updateTimer, 1000);
                    
                    // Pause/Resume button
                    const pauseBtn = currentRecordingIndicator.querySelector('.pause-btn');
                    pauseBtn.addEventListener('click', () => {
                        if (isPaused) {
                            // Resume
                            mediaRecorder.resume();
                            if (recognition) recognition.start();
                            if (pauseStartTime) {
                                pausedDuration += Date.now() - pauseStartTime;
                                pauseStartTime = null;
                            }
                            isPaused = false;
                            pauseBtn.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                            `;
                            pauseBtn.title = 'Tạm dừng';
                        } else {
                            // Pause
                            mediaRecorder.pause();
                            if (recognition) recognition.stop();
                            pauseStartTime = Date.now();
                            isPaused = true;
                            pauseBtn.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5 3 19 12 5 21"></polygon>
                                </svg>
                            `;
                            pauseBtn.title = 'Tiếp tục';
                        }
                    });
                    
                    // Save button
                    const saveBtn = currentRecordingIndicator.querySelector('.save-btn');
                    saveBtn.addEventListener('click', async () => {
                        stopRecording();
                        
                        if (audioChunks.length > 0) {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            
                            // Download audio file
                            const url = URL.createObjectURL(audioBlob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `voice_recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            // Get transcript and send
                            const transcript = chatbotInput.value.trim();
                            if (transcript) {
                                sendMessage(transcript);
                            } else {
                                sendMessage('Tôi đã gửi một đoạn ghi âm');
                            }
                        }
                        
                        if (currentRecordingIndicator) {
                            currentRecordingIndicator.remove();
                            currentRecordingIndicator = null;
                        }
                        
                        chatbotVoice.classList.remove('recording');
                        chatbotVoice.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        `;
                    });
                    
                    // Stop button
                    const stopBtn = currentRecordingIndicator.querySelector('.stop-btn');
                    stopBtn.addEventListener('click', () => {
                        stopRecording();
                        
                        if (currentRecordingIndicator) {
                            currentRecordingIndicator.remove();
                            currentRecordingIndicator = null;
                        }
                        
                        chatbotVoice.classList.remove('recording');
                        chatbotVoice.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        `;
                        
                        chatbotInput.value = '';
                        audioChunks = [];
                    });
                    
                } catch (error) {
                    console.error('Error accessing microphone:', error);
                    alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
                }
            }
        });
    }

    // Stop generation
    if (chatbotStop) {
        chatbotStop.addEventListener('click', () => {
            stopGeneration = true;
            if (currentGenerationTimeout) {
                clearTimeout(currentGenerationTimeout);
            }
            if (typingIndicator) typingIndicator.style.display = 'none';
            chatbotStop.style.display = 'none';
        });
    }

    // Dark mode toggle
    if (chatbotDarkMode) {
        chatbotDarkMode.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            chatbotPopup.classList.toggle('dark-mode');
            localStorage.setItem('chatbot_dark_mode', isDarkMode);
            chatbotMenu.classList.remove('active');
            
            // Update dark mode icon
            const icon = chatbotDarkMode.querySelector('svg');
            if (isDarkMode) {
                icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>`;
            } else {
                icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
            }
        });
        
        // Update icon based on current mode
        const icon = chatbotDarkMode.querySelector('svg');
        if (isDarkMode) {
            icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>`;
        }
    }

    // Menu toggle
    if (chatbotMenuBtn && chatbotMenu) {
        chatbotMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbotMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!chatbotMenu.contains(e.target) && !chatbotMenuBtn.contains(e.target)) {
                chatbotMenu.classList.remove('active');
            }
        });
    }

    // Reset chat
    if (chatbotReset) {
        chatbotReset.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn xóa cuộc trò chuyện này? Tin nhắn hiện tại sẽ bị xóa nhưng lịch sử vẫn được giữ lại.')) {
                chatbotPopupBody.innerHTML = initialMessageHTML;
                chatbotPopupBody.scrollTop = 0;
                chatbotMenu.classList.remove('active');
                attachedFile = null;
                if (suggestedPrompts) {
                    suggestedPrompts.classList.remove('hidden');
                }
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
                // Re-attach copy button to initial message
                const initialMsgWrapper = chatbotPopupBody.querySelector('.bot-msg-wrapper');
                if (initialMsgWrapper) {
                    const initialMsg = initialMsgWrapper.querySelector('.bot-msg')?.textContent || '';
                    const copyBtn = initialMsgWrapper.querySelector('.msg-action-btn');
                    if (copyBtn) {
                        copyBtn.addEventListener('click', () => {
                            navigator.clipboard.writeText(initialMsg.trim()).then(() => {
                                copyBtn.innerHTML = `
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                `;
                                setTimeout(() => {
                                    copyBtn.innerHTML = `
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    `;
                                }, 2000);
                            });
                        });
                    }
                }
            }
        });
    }

    // Chat history
    if (chatbotHistory) {
        chatbotHistory.addEventListener('click', () => {
            chatbotMenu.classList.remove('active');
            const history = JSON.parse(localStorage.getItem('zenjourney_chat_history') || '[]');
            if (history.length === 0) {
                alert('Chưa có lịch sử chat nào được lưu.');
                return;
            }
            // Show history in a simple alert (can be enhanced with a modal later)
            const historyText = history.map((item, idx) => 
                `${idx + 1}. ${item.date}: ${item.message.substring(0, 50)}...`
            ).join('\n');
            alert(`Lịch sử chat (${history.length} cuộc trò chuyện):\n\n${historyText}`);
        });
    }

    // Export chat
    if (chatbotExport) {
        chatbotExport.addEventListener('click', () => {
            chatbotMenu.classList.remove('active');
            const messages = Array.from(chatbotPopupBody.querySelectorAll('.bot-msg-wrapper, .user-msg-wrapper'));
            if (messages.length === 0) {
                alert('Không có tin nhắn nào để xuất.');
                return;
            }

            let exportText = 'Zenjourney AI Chat Export\n';
            exportText += '========================\n\n';

            messages.forEach(msg => {
                const isUser = msg.classList.contains('user-msg-wrapper');
                const messageText = msg.querySelector('.user-msg, .bot-msg')?.textContent || '';
                const timestamp = new Date().toLocaleString('vi-VN');
                exportText += `${isUser ? 'User' : 'Zenjourney AI'}: ${messageText}\n`;
                exportText += `Thời gian: ${timestamp}\n\n`;
            });

            // Create download link
            const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zenjourney_chat_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Settings
    if (chatbotSettings) {
        chatbotSettings.addEventListener('click', () => {
            chatbotMenu.classList.remove('active');
            alert('Tính năng cài đặt đang được phát triển. Sẽ có sớm!');
        });
    }

    // Help
    if (chatbotHelp) {
        chatbotHelp.addEventListener('click', () => {
            chatbotMenu.classList.remove('active');
            const helpText = `Trợ giúp Zenjourney AI\n\n` +
                `• Nhập câu hỏi của bạn vào ô chat và nhấn Enter hoặc nút gửi\n` +
                `• Sử dụng nút menu (3 chấm) để truy cập các tính năng\n` +
                `• Xóa cuộc trò chuyện: Menu → Xóa cuộc trò chuyện\n` +
                `• Xuất chat: Menu → Xuất cuộc trò chuyện\n` +
                `• Xem lịch sử: Menu → Lịch sử chat\n\n` +
                `Nếu cần hỗ trợ thêm, vui lòng liên hệ: support@zenjourney.com`;
            alert(helpText);
        });
    }
}

