// ===== CONFIGURATION SECTION =====
// Update these phone numbers for your business
const CONFIG = {
    BUSINESS_WHATSAPP: '85293211378',  // Your business WhatsApp (for client contact)
    ADMIN_WHATSAPP: '85293211378',     // Admin WhatsApp (receives booking notifications)
    BUSINESS_NAME: '籃球專業服務',
    AUTO_SEND_DELAY: 500  // Delay before opening admin WhatsApp (milliseconds)
};

// ===== TRANSLATIONS =====
const translations = {
    zh: {
        header: {
            title: 'GoGoRef 球證預訂系統',
            subtitle: '為您的籃球比賽尋找專業裁判和工作人員',
            schedule: '查看比賽時間表'
        },
        form: {
            dateTime: {
                title: '選擇日期和時間',
                date: '日期：',
                startTime: '開始時間：',
                endTime: '結束時間：'
            },
            venue: {
                title: '場地詳情',
                name: '體育館：',
                select: '請選擇場地',
                other: '其它指定場地：',
                addressPlaceholder: '請輸入完整場地地址，包括街道、區域、城市'
            },
            gameType: {
                title: '比賽類型',
                fullCourt: '全場',
                halfCourt: '半場'
            },
            referees: {
                title: '裁判人數'
            },
            tables: {
                title: '紀錄台'
            },
            services: {
                title: '其它服務(如影相)',
                label: '服務詳情：',
                placeholder: '請輸入所需的其它服務，例如：攝影、錄影、直播、音響設備等'
            },
            contact: {
                title: '聯絡資料',
                name: '您的姓名：',
                namePlaceholder: '請輸入您的姓名',
                phone: '電話號碼：',
                phonePlaceholder: '請輸入您的電話號碼'
            },
            submit: '立即預訂',
            whatsappNote: '請務必透過Whatsapp 傳送申請資料,以作核實'
        },
        modal: {
            title: '預訂確認',
            summary: '預訂摘要',
            success: '預訂詳情已發送給我們的團隊！',
            followUp: '我們將盡快聯絡您確認球證供應情況及價格。',
            contactTitle: '需要協助？聯絡我們',
            whatsapp: 'WhatsApp 對話',
            bookingId: '預訂編號：',
            date: '日期：',
            time: '時間：',
            venue: '體育館：',
            address: '完整地址：',
            gameType: '比賽類型：',
            referees: '裁判：',
            tables: '紀錄台：',
            services: '其它服務：',
            contact: '聯絡人：',
            people: '人'
        },
        validation: {
            date: '日期',
            startTime: '開始時間',
            endTime: '結束時間',
            venueName: '場地名稱',
            venueAddress: '場地地址',
            gameType: '比賽類型',
            clientName: '姓名',
            clientPhone: '電話號碼',
            fillField: '請填寫',
            selectVenue: '請選擇體育館或填寫完整地址',
            timeError: '結束時間必須在開始時間之後',
            phoneError: '請輸入有效的電話號碼'
        }
    },
    en: {
        header: {
            title: 'GoGoRef Referee Booking System',
            subtitle: 'Find Professional Referees and Staff for Your Basketball Games',
            schedule: 'View Game Schedule'
        },
        form: {
            dateTime: {
                title: 'Select Date and Time',
                date: 'Date:',
                startTime: 'Start Time:',
                endTime: 'End Time:'
            },
            venue: {
                title: 'Venue Details',
                name: 'Sports Center:',
                select: 'Please select a venue',
                other: 'Other Specified Venue:',
                addressPlaceholder: 'Please enter complete venue address, including street, district, city'
            },
            gameType: {
                title: 'Game Type',
                fullCourt: 'Full Court',
                halfCourt: 'Half Court'
            },
            referees: {
                title: 'Number of Referees'
            },
            tables: {
                title: 'Scoring Table'
            },
            services: {
                title: 'Additional Services (e.g. Photography)',
                label: 'Service Details:',
                placeholder: 'Please enter required additional services, e.g.: photography, videography, live streaming, audio equipment, etc.'
            },
            contact: {
                title: 'Contact Information',
                name: 'Your Name:',
                namePlaceholder: 'Please enter your name',
                phone: 'Phone Number:',
                phonePlaceholder: 'Please enter your phone number'
            },
            submit: 'Book Now',
            whatsappNote: 'Please send application details via WhatsApp for verification'
        },
        modal: {
            title: 'Booking Confirmation',
            summary: 'Booking Summary',
            success: 'Booking details have been sent to our team!',
            followUp: 'We will contact you soon to confirm referee availability and pricing.',
            contactTitle: 'Need Assistance? Contact Us',
            whatsapp: 'WhatsApp Chat',
            bookingId: 'Booking ID:',
            date: 'Date:',
            time: 'Time:',
            venue: 'Sports Center:',
            address: 'Full Address:',
            gameType: 'Game Type:',
            referees: 'Referees:',
            tables: 'Scoring Table:',
            services: 'Additional Services:',
            contact: 'Contact:',
            people: 'person(s)'
        },
        validation: {
            date: 'Date',
            startTime: 'Start Time',
            endTime: 'End Time',
            venueName: 'Venue Name',
            venueAddress: 'Venue Address',
            gameType: 'Game Type',
            clientName: 'Name',
            clientPhone: 'Phone Number',
            fillField: 'Please fill in',
            selectVenue: 'Please select a sports center or enter complete address',
            timeError: 'End time must be after start time',
            phoneError: 'Please enter a valid phone number'
        }
    }
};

// Current language
let currentLang = localStorage.getItem('preferredLanguage') || 'zh';

// Global variables
let refereeCount = 2;
let tableCount = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    setupEventListeners();
    initializeLanguage();
});

// ===== LANGUAGE SWITCHING =====
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translated elements
    updateTranslations();
    
    // Track language change
    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_changed', {
            event_category: 'user_interaction',
            event_label: lang
        });
    }
}

function initializeLanguage() {
    // Set active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        }
    });
    
    // Apply translations
    updateTranslations();
}

function updateTranslations() {
    const t = translations[currentLang];
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(t, key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getNestedTranslation(t, key);
        if (translation) {
            element.placeholder = translation;
        }
    });
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function getTranslation(key) {
    return getNestedTranslation(translations[currentLang], key);
}

// Set minimum date to today and set default to today
function initializeDatePicker() {
    const dateInput = document.getElementById('bookingDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today; // Set default to today
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
    
    // Venue selection tracking and conditional validation
    document.getElementById('venueName').addEventListener('change', function(event) {
        if (typeof gtag !== 'undefined' && event.target.value) {
            gtag('event', 'venue_selected', {
                event_category: 'user_interaction',
                event_label: event.target.value
            });
        }
        updateVenueValidation();
    });
    
    // Address field tracking
    document.getElementById('venueAddress').addEventListener('input', function(event) {
        updateVenueValidation();
    });
    
    // Game type selection tracking
    document.querySelectorAll('input[name="gameType"]').forEach(radio => {
        radio.addEventListener('change', function(event) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_type_selected', {
                    event_category: 'user_interaction',
                    event_label: event.target.value
                });
            }
        });
    });
    
    // Date selection tracking
    document.getElementById('bookingDate').addEventListener('change', function(event) {
        if (typeof gtag !== 'undefined' && event.target.value) {
            gtag('event', 'date_selected', {
                event_category: 'user_interaction',
                event_label: event.target.value
            });
        }
    });
    
    // Modal close events
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Counter functions
function changeCount(type, delta) {
    if (type === 'referees') {
        const newCount = refereeCount + delta;
        if (newCount >= 0 && newCount <= 5) {
            refereeCount = newCount;
            document.getElementById('refereesCount').textContent = refereeCount;
            document.getElementById('referees').value = refereeCount;
            
            // Track referee count change
            if (typeof gtag !== 'undefined') {
                gtag('event', 'referee_count_changed', {
                    event_category: 'user_interaction',
                    event_label: `referees_${newCount}`,
                    value: newCount
                });
            }
            
            // Update button states
            const minusBtn = document.querySelector('[onclick="changeCount(\'referees\', -1)"]');
            const plusBtn = document.querySelector('[onclick="changeCount(\'referees\', 1)"]');
            minusBtn.disabled = refereeCount <= 0;
            plusBtn.disabled = refereeCount >= 5;
        }
    } else if (type === 'tables') {
        const newCount = tableCount + delta;
        if (newCount >= 0 && newCount <= 3) {
            tableCount = newCount;
            document.getElementById('tablesCount').textContent = tableCount;
            document.getElementById('tables').value = tableCount;
            
            // Track table count change
            if (typeof gtag !== 'undefined') {
                gtag('event', 'table_count_changed', {
                    event_category: 'user_interaction',
                    event_label: `tables_${newCount}`,
                    value: newCount
                });
            }
            
            // Update button states
            const minusBtn = document.querySelector('[onclick="changeCount(\'tables\', -1)"]');
            const plusBtn = document.querySelector('[onclick="changeCount(\'tables\', 1)"]');
            minusBtn.disabled = tableCount <= 0;
            plusBtn.disabled = tableCount >= 3;
        }
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        // Track validation failure
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_validation_failed', {
                event_category: 'booking_form',
                event_label: 'validation_error'
            });
        }
        return;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Generate booking ID once for both WhatsApp and modal
    const bookingId = `GO${Date.now().toString().slice(-6)}`;
    formData.bookingId = bookingId;
    
    // Track successful form submission
    if (typeof gtag !== 'undefined') {
        gtag('event', 'booking_form_submitted', {
            event_category: 'booking',
            event_label: formData.venueName,
            custom_parameters: {
                venue_name: formData.venueName,
                game_type: formData.gameType,
                referee_count: formData.referees,
                table_count: formData.tables,
                booking_date: formData.date
            }
        });
        
        // Track conversion
        gtag('event', 'conversion', {
            send_to: 'G-XXXXXXXXXX/conversion_id',
            value: 1,
            currency: 'HKD'
        });
    }
    
    // Send booking details to WhatsApp
    sendBookingToWhatsApp(formData);
    
    // Show payment modal
    showPaymentModal(formData);
}

// Validate form data
function validateForm() {
    const requiredFields = [
        'bookingDate',
        'startTime',
        'endTime',
        'gameType',
        'clientName',
        'clientPhone'
    ];
    
    const t = translations[currentLang].validation;
    
    // Check basic required fields
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (!field || !field.value.trim()) {
            alert(`${t.fillField}${t[fieldId] || fieldId}`);
            if (field) field.focus();
            return false;
        }
    }
    
    // Validate venue: either venueName OR venueAddress must be filled
    const venueName = document.getElementById('venueName').value.trim();
    const venueAddress = document.getElementById('venueAddress').value.trim();
    
    if (!venueName && !venueAddress) {
        alert(t.selectVenue);
        document.getElementById('venueName').focus();
        return false;
    }
    
    // Validate time range
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (startTime >= endTime) {
        alert(t.timeError);
        document.getElementById('endTime').focus();
        return false;
    }
    
    // Validate phone number format
    const phonePattern = /^[+]?[\d\s\-\(\)]{8,}$/;
    const phone = document.getElementById('clientPhone').value;
    if (!phonePattern.test(phone)) {
        alert(t.phoneError);
        document.getElementById('clientPhone').focus();
        return false;
    }
    
    return true;
}

// Collect form data
function collectFormData() {
    const gameTypeElement = document.querySelector('input[name="gameType"]:checked');
    const t = translations[currentLang];
    const gameTypeText = gameTypeElement.value === '5v5-full' 
        ? `5 vs 5 (${t.form.gameType.fullCourt})` 
        : `3 x 3 (${t.form.gameType.halfCourt})`;
    
    // Format time slot from separate start and end time inputs
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const timeSlot = `${startTime} - ${endTime}`;
    
    return {
        date: document.getElementById('bookingDate').value,
        timeSlot: timeSlot,
        venueName: document.getElementById('venueName').value,
        venueAddress: document.getElementById('venueAddress').value,
        gameType: gameTypeText,
        referees: refereeCount,
        tables: tableCount,
        additionalServices: document.getElementById('additionalServices').value,
        clientName: document.getElementById('clientName').value,
        clientPhone: document.getElementById('clientPhone').value
    };
}

// Show payment modal with booking summary
function showPaymentModal(formData) {
    const modal = document.getElementById('paymentModal');
    const summaryContent = document.getElementById('summaryContent');
    const t = translations[currentLang].modal;
    
    // Format date for display
    const bookingDate = new Date(formData.date);
    const formattedDate = bookingDate.toLocaleDateString(currentLang === 'zh' ? 'zh-HK' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create booking summary HTML
    summaryContent.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">${t.bookingId}</span>
            <span class="summary-value">${formData.bookingId}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">${t.date}</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">${t.time}</span>
            <span class="summary-value">${formData.timeSlot}</span>
        </div>
        ${formData.venueName ? `
        <div class="summary-item">
            <span class="summary-label">${t.venue}</span>
            <span class="summary-value">${formData.venueName}</span>
        </div>` : ''}
        ${formData.venueAddress ? `
        <div class="summary-item">
            <span class="summary-label">${t.address}</span>
            <span class="summary-value">${formData.venueAddress}</span>
        </div>` : ''}
        <div class="summary-item">
            <span class="summary-label">${t.gameType}</span>
            <span class="summary-value">${formData.gameType}</span>
        </div>

        <div class="summary-item">
            <span class="summary-label">${t.referees}</span>
            <span class="summary-value">${formData.referees} ${t.people}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">${t.tables}</span>
            <span class="summary-value">${formData.tables} ${t.people}</span>
        </div>
        ${formData.additionalServices ? `
        <div class="summary-item">
            <span class="summary-label">${t.services}</span>
            <span class="summary-value">${formData.additionalServices}</span>
        </div>` : ''}
        <div class="summary-item">
            <span class="summary-label">${t.contact}</span>
            <span class="summary-value">${formData.clientName} (${formData.clientPhone})</span>
        </div>
    `;
    
    // Update WhatsApp link for client contact
    const whatsappMessage = createWhatsAppMessage(formData);
    const whatsappLink = document.getElementById('whatsappLink');
    whatsappLink.href = `https://wa.me/${CONFIG.BUSINESS_WHATSAPP}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Send booking details to admin WhatsApp
function sendBookingToWhatsApp(formData) {
    const adminMessage = createAdminWhatsAppMessage(formData);
    
    // Track WhatsApp admin notification
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_admin_sent', {
            event_category: 'communication',
            event_label: 'admin_notification',
            custom_parameters: {
                booking_id: formData.bookingId,
                venue_name: formData.venueName
            }
        });
    }
    
    // Open WhatsApp with admin message in a new tab
    const adminWhatsAppUrl = `https://wa.me/${CONFIG.ADMIN_WHATSAPP}?text=${encodeURIComponent(adminMessage)}`;
    
    // Use a small delay to ensure the payment modal shows first
    setTimeout(() => {
        window.open(adminWhatsAppUrl, '_blank');
    }, CONFIG.AUTO_SEND_DELAY);
}

// Create WhatsApp message for admin notification
function createAdminWhatsAppMessage(formData) {
    const bookingDate = new Date(formData.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Hong_Kong',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `🚨 新預訂提醒 🚨

📋 預訂編號: ${formData.bookingId}
⏰ 提交時間: ${timestamp}

📅 比賽日期: ${formattedDate}
🕐 時間段: ${formData.timeSlot}
${formData.venueName ? `📍 體育館: ${formData.venueName}` : ''}${formData.venueAddress ? `
🏢 完整地址: ${formData.venueAddress}` : ''}

🏀 比賽詳情:
• 類型: ${formData.gameType}
• 所需裁判: ${formData.referees} 人
• 紀錄台: ${formData.tables} 人${formData.additionalServices ? `
• 其它服務: ${formData.additionalServices}` : ''}

👤 客戶資料:
• 姓名: ${formData.clientName}
• 電話: ${formData.clientPhone}`;
}

// Create WhatsApp message for client (used in payment modal)
function createWhatsAppMessage(formData) {
    const bookingDate = new Date(formData.date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `🏀 籃球預訂申請

📅 日期: ${formattedDate}
⏰ 時間: ${formData.timeSlot}
${formData.venueName ? `📍 體育館: ${formData.venueName}` : ''}${formData.venueAddress ? `
🏢 完整地址: ${formData.venueAddress}` : ''}
🎯 比賽類型: ${formData.gameType}
👨‍⚖️ 裁判: ${formData.referees} 人
📊 紀錄台: ${formData.tables} 人${formData.additionalServices ? `
📷 其它服務: ${formData.additionalServices}` : ''}

👤 聯絡人: ${formData.clientName}
📱 電話: ${formData.clientPhone}

請確認場地供應情況及價格。謝謝！`;
}

// Close modal
function closeModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Generate QR Code (placeholder function - you can integrate with a real QR code library)
function generateQRCode() {
    // This is a placeholder. In a real implementation, you would:
    // 1. Use a QR code library like qrcode.js
    // 2. Generate QR code with FPS payment details
    // 3. Update the QR code image source
    
    console.log('QR Code generation would happen here');
}

// Utility function to format phone number
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as needed (this is a simple example)
    if (cleaned.length === 8) {
        return cleaned.replace(/(\d{4})(\d{4})/, '$1 $2');
    } else if (cleaned.length === 11 && cleaned.startsWith('852')) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '+$1 $2 $3');
    }
    
    return phone;
}

// Add input formatting for phone number
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('clientPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Allow user to type freely, just validate on submit
            // You can add real-time formatting here if needed
        });
    }
});

// Prevent form submission on Enter key in input fields (except submit button)
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.type !== 'submit') {
                e.preventDefault();
            }
        });
    });
});

// Update venue validation visual feedback
function updateVenueValidation() {
    const venueName = document.getElementById('venueName').value.trim();
    const venueAddress = document.getElementById('venueAddress').value.trim();
    const venueLabel = document.querySelector('label[for="venueName"]');
    const addressLabel = document.querySelector('label[for="venueAddress"]');
    
    if (venueName || venueAddress) {
        // At least one is filled, remove any error styling
        venueLabel.style.color = '';
        addressLabel.style.color = '';
    } else {
        // Neither is filled, could add warning styling if needed
        // venueLabel.style.color = '#e53e3e';
        // addressLabel.style.color = '#e53e3e';
    }
}

// Initialize counter button states
document.addEventListener('DOMContentLoaded', function() {
    // Set initial button states
    const refMinusBtn = document.querySelector('[onclick="changeCount(\'referees\', -1)"]');
    const tabMinusBtn = document.querySelector('[onclick="changeCount(\'tables\', -1)"]');
    
    // Referees start at 2, so minus button is enabled
    if (refMinusBtn) refMinusBtn.disabled = false;
    // Tables start at 0, so minus button is disabled
    if (tabMinusBtn) tabMinusBtn.disabled = true;
});

// Add smooth scrolling for better UX
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== SERVICE RECORDS TOGGLE =====
function toggleRecords() {
    const content = document.getElementById('recordsContent');
    const icon = document.getElementById('toggleIcon');
    
    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        // Collapse
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
        
        // Track collapse event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'service_records_collapsed', {
                event_category: 'user_interaction',
                event_label: 'records_toggle'
            });
        }
    } else {
        // Expand
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
        
        // Track expand event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'service_records_expanded', {
                event_category: 'user_interaction',
                event_label: 'records_toggle'
            });
        }
    }
}




// ===== GOOGLE ADSENSE INTEGRATION =====

// AdSense Event Tracking
function trackAdEvents() {
    // Track ad impressions and clicks
    if (typeof gtag !== 'undefined') {
        // Track when ads are loaded
        window.addEventListener('load', function() {
            gtag('event', 'ads_loaded', {
                event_category: 'advertising',
                event_label: 'page_load'
            });
        });
        
        // Track ad visibility
        const adContainers = document.querySelectorAll('.ad-container');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adType = entry.target.className.split(' ').find(cls => cls.startsWith('ad-'));
                    gtag('event', 'ad_viewed', {
                        event_category: 'advertising',
                        event_label: adType || 'unknown',
                        value: 1
                    });
                }
            });
        }, { threshold: 0.5 });
        
        adContainers.forEach(ad => observer.observe(ad));
    }
}

// AdSense Auto-Refresh (Optional - for better revenue)
function setupAdRefresh() {
    // Refresh ads every 30 seconds if user is active
    let refreshTimer;
    let userActive = true;
    
    function refreshAds() {
        if (userActive && typeof adsbygoogle !== 'undefined') {
            try {
                // Push new ad requests
                const ads = document.querySelectorAll('.adsbygoogle');
                ads.forEach(ad => {
                    if (ad.getAttribute('data-adsbygoogle-status') === 'done') {
                        // Only refresh if ad was successfully loaded
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    }
                });
                
                // Track refresh event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ads_refreshed', {
                        event_category: 'advertising',
                        event_label: 'auto_refresh'
                    });
                }
            } catch (error) {
                console.log('Ad refresh error:', error);
            }
        }
    }
    
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            userActive = true;
            clearTimeout(refreshTimer);
            refreshTimer = setTimeout(() => {
                userActive = false;
            }, 30000); // 30 seconds of inactivity
        }, { passive: true });
    });
    
    // Set up refresh interval (every 30 seconds)
    setInterval(refreshAds, 30000);
}

// AdSense Error Handling
function handleAdErrors() {
    window.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'INS' && e.target.className.includes('adsbygoogle')) {
            // Track ad loading errors
            if (typeof gtag !== 'undefined') {
                gtag('event', 'ad_error', {
                    event_category: 'advertising',
                    event_label: 'loading_error',
                    value: 1
                });
            }
            
            // Hide failed ad container
            const adContainer = e.target.closest('.ad-container');
            if (adContainer) {
                adContainer.style.display = 'none';
            }
        }
    });
}

// AdSense Revenue Optimization
function optimizeAdRevenue() {
    // Lazy load ads for better performance
    const lazyAds = document.querySelectorAll('.adsbygoogle');
    const adObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const ad = entry.target;
                if (!ad.getAttribute('data-loaded')) {
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        ad.setAttribute('data-loaded', 'true');
                    } catch (error) {
                        console.log('Lazy ad loading error:', error);
                    }
                }
                adObserver.unobserve(ad);
            }
        });
    }, { rootMargin: '100px' });
    
    lazyAds.forEach(ad => adObserver.observe(ad));
}

// Initialize AdSense features
document.addEventListener('DOMContentLoaded', function() {
    // Wait for AdSense to load
    setTimeout(() => {
        trackAdEvents();
        handleAdErrors();
        optimizeAdRevenue();
        
        // Optional: Enable auto-refresh (uncomment if needed)
        // setupAdRefresh();
    }, 1000);
});

// AdSense Responsive Behavior
function handleAdResponsiveness() {
    window.addEventListener('resize', function() {
        // Refresh ads on orientation change (mobile)
        if (window.innerHeight !== window.innerWidth) {
            setTimeout(() => {
                try {
                    const ads = document.querySelectorAll('.adsbygoogle[data-adsbygoogle-status="done"]');
                    ads.forEach(ad => {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    });
                } catch (error) {
                    console.log('Responsive ad refresh error:', error);
                }
            }, 500);
        }
    });
}

// Initialize responsive behavior
handleAdResponsiveness();

// AdSense Performance Monitoring
function monitorAdPerformance() {
    // Monitor ad loading times
    const adLoadStart = performance.now();
    
    window.addEventListener('load', function() {
        const adLoadEnd = performance.now();
        const loadTime = adLoadEnd - adLoadStart;
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_performance', {
                event_category: 'advertising',
                event_label: 'load_time',
                value: Math.round(loadTime)
            });
        }
    });
    
    // Monitor ad revenue (if available)
    if (typeof googletag !== 'undefined') {
        googletag.cmd.push(function() {
            googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_rendered', {
                        event_category: 'advertising',
                        event_label: event.slot.getSlotElementId(),
                        value: event.isEmpty ? 0 : 1
                    });
                }
            });
        });
    }
}

// Initialize performance monitoring
monitorAdPerformance();