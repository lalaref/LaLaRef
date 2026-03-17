/**
 * Mall Gift Redemption Queue System
 * Flow: Customer scans QR → auto gets ticket from server → optionally adds phone for WhatsApp
 * All data stored server-side via queue-api.php
 */

const API = 'queue-api.php';

const app = {
    // State
    currentTicketId: null,
    staffCounter: null,
    staffId: null,
    refreshInterval: null,

    // ===== Init =====
    init() {
        // Check if this browser tab already has an active ticket
        const savedId = sessionStorage.getItem('mq_my_ticket_id');
        if (savedId) {
            this.currentTicketId = parseInt(savedId);
            this.showPage('customer-ticket');
            this.refreshCustomerTicket();
        } else {
            // First visit — auto join queue immediately
            this.autoJoinQueue();
        }
        // Refresh every 2 seconds
        this.refreshInterval = setInterval(() => this.refreshAll(), 2000);
    },

    // ===== Page Navigation =====
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');
        if (pageId === 'staff-dashboard') this.refreshStaffDashboard();
        if (pageId === 'admin-dashboard') this.refreshAdminDashboard();
        if (pageId === 'display-board') this.refreshDisplayBoard();
        if (pageId === 'counter-display') this.refreshCounterDisplay();
    },

    // ===== CUSTOMER: Auto Join =====
    async autoJoinQueue() {
        try {
            const res = await fetch(`${API}?action=join`);
            const data = await res.json();
            if (!data.success) {
                document.getElementById('ticket-number').textContent = '已滿';
                document.getElementById('ticket-status').innerHTML =
                    '<span class="status-dot" style="background:#E17055"></span><span>排隊已滿，請稍後再試 Queue full</span>';
                document.getElementById('wa-optin-card').classList.add('hidden');
                return;
            }
            this.currentTicketId = data.ticket.id;
            sessionStorage.setItem('mq_my_ticket_id', String(data.ticket.id));
            this.showPage('customer-ticket');
            // Render initial data
            document.getElementById('ticket-number').textContent = data.ticket.ticket;
            document.getElementById('ticket-position').textContent = data.position;
            document.getElementById('ticket-wait').textContent = data.estWait;
            this.refreshCustomerTicket();
        } catch (e) {
            document.getElementById('ticket-number').textContent = 'ERR';
            document.getElementById('ticket-status').innerHTML =
                '<span class="status-dot" style="background:#E17055"></span><span>無法連接伺服器 Server error</span>';
        }
    },

    // ===== CUSTOMER: Submit Phone for WhatsApp =====
    async submitPhone(e) {
        e.preventDefault();
        if (!this.currentTicketId) return;
        const prefix = document.getElementById('phone-prefix').value;
        const phone = document.getElementById('phone-input').value.trim().replace(/\s+/g, '');
        if (!phone) return;

        try {
            await fetch(`${API}?action=phone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: this.currentTicketId, phone, prefix }),
            });
        } catch (e) { /* ignore */ }

        document.getElementById('wa-optin-card').classList.add('hidden');
        document.getElementById('wa-confirmed').classList.remove('hidden');
        document.getElementById('wa-confirmed-phone').textContent = `+${prefix} ${phone}`;
        this.toast('📱 WhatsApp通知已開啟', 'success');
    },

    // ===== CUSTOMER: Refresh Ticket Status =====
    async refreshCustomerTicket() {
        if (!this.currentTicketId) return;
        try {
            const res = await fetch(`${API}?action=status&id=${this.currentTicketId}`);
            const data = await res.json();
            if (!data.success) return;

            const entry = data.ticket;

            // If ticket is done
            if (data.done) {
                this.currentTicketId = null;
                sessionStorage.removeItem('mq_my_ticket_id');
                document.getElementById('ticket-status').innerHTML =
                    '<span class="status-dot" style="background:#636E72"></span><span>已完成 Completed</span>';
                document.getElementById('wa-optin-card').classList.add('hidden');
                return;
            }

            document.getElementById('ticket-number').textContent = entry.ticket;
            document.getElementById('ticket-position').textContent = data.position;
            document.getElementById('ticket-wait').textContent = data.estWait;

            // Currently serving
            document.getElementById('ticket-serving').textContent =
                data.serving && data.serving.length > 0 ? data.serving.join(', ') : '--';

            // Status & alerts
            const statusEl = document.getElementById('ticket-status');
            const almostAlert = document.getElementById('almost-turn-alert');
            const calledAlert = document.getElementById('called-alert');

            almostAlert.classList.add('hidden');
            calledAlert.classList.add('hidden');

            if (entry.status === 'serving' || entry.status === 'called') {
                statusEl.innerHTML = '<span class="status-dot called"></span><span>到你了！Your Turn!</span>';
                calledAlert.classList.remove('hidden');
                if (entry.counter) {
                    document.getElementById('called-counter').textContent = `Counter ${entry.counter}`;
                }
                this.playSound();
            } else if (data.position <= data.alertBefore && data.position > 0) {
                statusEl.innerHTML = '<span class="status-dot waiting"></span><span>快到了 Almost!</span>';
                almostAlert.classList.remove('hidden');
            } else {
                statusEl.innerHTML = '<span class="status-dot waiting"></span><span>等候中 Waiting</span>';
            }

            // Show/hide WA opt-in
            if (entry.whatsappOptIn) {
                document.getElementById('wa-optin-card').classList.add('hidden');
                document.getElementById('wa-confirmed').classList.remove('hidden');
            }
        } catch (e) { /* server not reachable, keep last state */ }
    },

    async leaveQueueConfirm() {
        if (!this.currentTicketId) return;
        this.showModal('確定要取消排隊嗎？\nCancel your queue?', async () => {
            try {
                await fetch(`${API}?action=leave`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: this.currentTicketId }),
                });
            } catch (e) { /* ignore */ }
            this.currentTicketId = null;
            sessionStorage.removeItem('mq_my_ticket_id');
            document.getElementById('ticket-number').textContent = '---';
            document.getElementById('ticket-status').innerHTML =
                '<span class="status-dot" style="background:#636E72"></span><span>已取消 Cancelled</span>';
            document.getElementById('wa-optin-card').classList.add('hidden');
            document.getElementById('wa-confirmed').classList.add('hidden');
            this.toast('已取消排隊', 'warning');
        });
    },

    // ===== STAFF =====
    staffLogin(e) {
        e.preventDefault();
        const id = document.getElementById('staff-id').value.trim();
        const pin = document.getElementById('staff-pin').value;
        const counter = document.getElementById('staff-counter').value;
        if (pin !== '1234') { this.toast('密碼錯誤 Wrong PIN', 'error'); return; }
        this.staffId = id;
        this.staffCounter = parseInt(counter);
        document.getElementById('staff-counter-label').textContent = `Counter ${counter}`;
        this.showPage('staff-dashboard');
    },

    staffLogout() { this.staffId = null; this.staffCounter = null; this.showPage('landing-page'); },

    async refreshStaffDashboard() {
        try {
            const res = await fetch(`${API}?action=queue`);
            const data = await res.json();
            if (!data.success) return;

            const waiting = data.waiting;
            const servingNow = data.serving.find(q => q.counter === this.staffCounter);

            document.getElementById('staff-waiting-count').textContent = waiting;
            document.getElementById('staff-served-count').textContent = data.servedToday;
            document.getElementById('staff-avg-time').textContent = data.avgService || '0';

            // Serving card
            const card = document.getElementById('serving-card');
            const callBtn = document.getElementById('call-next-btn');
            if (servingNow) {
                card.classList.remove('hidden');
                callBtn.classList.add('hidden');
                document.getElementById('serving-number').textContent = servingNow.ticket;
                document.getElementById('serving-phone').textContent = servingNow.phone ? `+${servingNow.fullPhone}` : '(無電話)';
                const waBadge = document.getElementById('serving-wa-badge');
                if (servingNow.whatsappOptIn) waBadge.classList.remove('hidden');
                else waBadge.classList.add('hidden');
            } else {
                card.classList.add('hidden');
                callBtn.classList.remove('hidden');
            }

            // Queue list
            const listEl = document.getElementById('staff-queue-list');
            const active = data.queue || [];
            document.getElementById('staff-list-count').textContent = active.length;

            if (active.length === 0) {
                listEl.innerHTML = '<div class="hint">暫無排隊 Empty</div>';
                return;
            }
            listEl.innerHTML = active.map(q => {
                const statusText = { waiting: '等候', serving: '服務中' }[q.status] || q.status;
                const time = new Date(q.joinedAt).toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
                const waIcon = q.whatsappOptIn ? ' 📱' : '';
                return `<div class="queue-item">
                    <div class="queue-item-number">${q.ticket}</div>
                    <div class="queue-item-info">
                        <div class="queue-item-name">${time}${waIcon}</div>
                        <div class="queue-item-meta">${q.phone ? '+' + q.fullPhone : '無電話'}</div>
                    </div>
                    <span class="queue-item-status status-${q.status}">${statusText}</span>
                </div>`;
            }).join('');
        } catch (e) { /* server not reachable */ }
    },

    async callNext() {
        try {
            const res = await fetch(`${API}?action=call-next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter: this.staffCounter }),
            });
            const data = await res.json();
            if (!data.success) {
                this.toast('沒有等候中的顧客 No one waiting', 'warning');
                return;
            }
            this.playSound();
            this.toast(`叫號 ${data.called.ticket}`, 'success');
            this.refreshStaffDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async markServed() {
        try {
            await fetch(`${API}?action=mark-served`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter: this.staffCounter }),
            });
            this.toast('✓ 已完成', 'success');
            this.refreshStaffDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async markNoShow() {
        try {
            await fetch(`${API}?action=mark-noshow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter: this.staffCounter }),
            });
            this.toast('未到 No Show', 'warning');
            this.refreshStaffDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async requeue() {
        try {
            await fetch(`${API}?action=requeue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter: this.staffCounter }),
            });
            this.toast('已重新排隊', 'success');
            this.refreshStaffDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    // ===== ADMIN =====
    adminLogin(e) {
        e.preventDefault();
        const u = document.getElementById('admin-user').value.trim();
        const p = document.getElementById('admin-pass').value;
        if (u === 'admin' && p === 'admin') { this.showPage('admin-dashboard'); }
        else { this.toast('帳號或密碼錯誤', 'error'); }
    },
    adminLogout() { this.showPage('landing-page'); },

    showAdminTab(tabId, btn) {
        document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('tab-' + tabId)?.classList.add('active');
        btn?.classList.add('active');
        if (tabId === 'settings') this.loadSettings();
        if (tabId === 'whatsapp') this.loadWhatsAppSettings();
        if (tabId === 'reports') this.initReportDates();
    },

    async refreshAdminDashboard() {
        try {
            const res = await fetch(`${API}?action=queue`);
            const data = await res.json();
            if (!data.success) return;

            document.getElementById('admin-total-waiting').textContent = data.waiting;
            document.getElementById('admin-total-served').textContent = data.servedToday;
            document.getElementById('admin-avg-wait').textContent = data.avgWait;
            document.getElementById('admin-no-show').textContent = data.noshowToday;

            // Admin queue control — show serving status for selected counter
            const counter = this.getAdminCounter();
            const servingNow = (data.serving || []).find(q => q.counter === counter);
            const numEl = document.getElementById('admin-serving-number');
            const phoneEl = document.getElementById('admin-serving-phone');
            const callBtn = document.getElementById('admin-call-next-btn');
            const actionsEl = document.getElementById('admin-serving-actions');

            if (servingNow) {
                numEl.textContent = servingNow.ticket;
                phoneEl.textContent = servingNow.phone ? `📱 +${servingNow.fullPhone}` : '';
                callBtn.classList.add('hidden');
                actionsEl.classList.remove('hidden');
            } else {
                numEl.textContent = '--';
                phoneEl.textContent = '';
                callBtn.classList.remove('hidden');
                actionsEl.classList.add('hidden');
            }

            // Live queue
            const listEl = document.getElementById('admin-queue-list');
            const active = data.queue || [];
            if (active.length === 0) {
                listEl.innerHTML = '<div class="hint">暫無排隊</div>';
            } else {
                listEl.innerHTML = active.map(q => {
                    const st = { waiting: '等候', serving: '服務中' }[q.status] || q.status;
                    const wa = q.whatsappOptIn ? ' 📱' : '';
                    return `<div class="queue-item">
                        <div class="queue-item-number">${q.ticket}</div>
                        <div class="queue-item-info"><div class="queue-item-name">${q.phone ? '+' + q.fullPhone : '無電話'}${wa}</div></div>
                        <span class="queue-item-status status-${q.status}">${st}</span>
                    </div>`;
                }).join('');
            }
        } catch (e) { /* server not reachable */ }
    },

    // ===== Admin Queue Control =====
    getAdminCounter() {
        return parseInt(document.getElementById('admin-op-counter')?.value || '1');
    },

    async adminCallNext() {
        const counter = this.getAdminCounter();
        try {
            const res = await fetch(`${API}?action=call-next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter }),
            });
            const data = await res.json();
            if (!data.success) { this.toast('沒有等候中的顧客', 'warning'); return; }
            this.playSound();
            this.toast(`叫號 ${data.called.ticket} → Counter ${counter}`, 'success');
            this.refreshAdminDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async adminMarkServed() {
        const counter = this.getAdminCounter();
        try {
            await fetch(`${API}?action=mark-served`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter }),
            });
            this.toast('✓ 已完成', 'success');
            this.refreshAdminDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async adminMarkNoShow() {
        const counter = this.getAdminCounter();
        try {
            await fetch(`${API}?action=mark-noshow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter }),
            });
            this.toast('未到 No Show', 'warning');
            this.refreshAdminDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async adminRequeue() {
        const counter = this.getAdminCounter();
        try {
            await fetch(`${API}?action=requeue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ counter }),
            });
            this.toast('已重新排隊', 'success');
            this.refreshAdminDashboard();
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    // ===== Settings =====
    async loadSettings() {
        try {
            const res = await fetch(`${API}?action=settings`);
            const data = await res.json();
            if (!data.success) return;
            const s = data.settings;
            document.getElementById('setting-service-time').value = s.serviceTime;
            document.getElementById('setting-max-queue').value = s.maxQueue;
            document.getElementById('setting-counters').value = s.counters;
            document.getElementById('setting-alert-before').value = s.alertBefore;
            document.getElementById('setting-sound').checked = s.soundEnabled;
        } catch (e) { /* use defaults in HTML */ }
    },

    async saveSettings() {
        const settings = {
            serviceTime: parseInt(document.getElementById('setting-service-time').value) || 3,
            maxQueue: parseInt(document.getElementById('setting-max-queue').value) || 0,
            counters: parseInt(document.getElementById('setting-counters').value) || 2,
            alertBefore: parseInt(document.getElementById('setting-alert-before').value) || 3,
            soundEnabled: document.getElementById('setting-sound').checked,
        };
        try {
            await fetch(`${API}?action=save-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            this.toast('設定已儲存 ✓', 'success');
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    // ===== Reports =====
    initReportDates() {
        document.getElementById('report-from').value = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        document.getElementById('report-to').value = new Date().toISOString().split('T')[0];
    },

    async generateReport() {
        try {
            const res = await fetch(`${API}?action=export`);
            const data = await res.json();
            const from = document.getElementById('report-from').value;
            const to = document.getElementById('report-to').value;
            const served = data.served || [];
            const byDate = {};
            served.forEach(s => {
                if (!s.completedAt) return;
                const d = s.completedAt.split('T')[0];
                if (d < from || d > to) return;
                if (!byDate[d]) byDate[d] = { total: 0, served: 0, noshow: 0, totalWait: 0 };
                byDate[d].total++;
                if (s.status === 'served') {
                    byDate[d].served++;
                    if (s.joinedAt && s.calledAt) byDate[d].totalWait += (new Date(s.calledAt) - new Date(s.joinedAt)) / 60000;
                }
                if (s.status === 'noshow') byDate[d].noshow++;
            });

            let tAll = 0, tServed = 0, tNo = 0, tWait = 0;
            Object.values(byDate).forEach(d => { tAll += d.total; tServed += d.served; tNo += d.noshow; tWait += d.totalWait; });

            document.getElementById('report-summary').innerHTML = `
                <div class="report-stat"><span class="report-stat-value">${tAll}</span><span class="report-stat-label">總排隊</span></div>
                <div class="report-stat"><span class="report-stat-value">${tServed}</span><span class="report-stat-label">已服務</span></div>
                <div class="report-stat"><span class="report-stat-value">${tNo}</span><span class="report-stat-label">未到</span></div>
                <div class="report-stat"><span class="report-stat-value">${tServed > 0 ? Math.round(tWait / tServed) : 0}</span><span class="report-stat-label">平均等候(分鐘)</span></div>`;

            document.getElementById('report-tbody').innerHTML = Object.keys(byDate).sort().map(d => {
                const v = byDate[d]; const avg = v.served > 0 ? Math.round(v.totalWait / v.served) : 0;
                return `<tr><td>${d}</td><td>${v.total}</td><td>${v.served}</td><td>${v.noshow}</td><td>${avg}m</td></tr>`;
            }).join('');
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    async resetQueue() {
        this.showModal('確定清空所有排隊？\nReset all?', async () => {
            try {
                await fetch(`${API}?action=reset`, { method: 'POST' });
                this.refreshAdminDashboard();
                this.toast('已清空', 'success');
            } catch (e) { this.toast('伺服器錯誤', 'error'); }
        });
    },

    async exportData() {
        try {
            const res = await fetch(`${API}?action=export`);
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `queue-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
            this.toast('已匯出', 'success');
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    // ===== Counter Display (tablet at CS counter) =====
    counterDisplayCounter: 1,

    showCounterDisplaySetup() {
        const counter = prompt('請輸入櫃台編號 Enter counter number (1-4):', '1');
        if (!counter) return;
        const num = parseInt(counter);
        if (num < 1 || num > 4 || isNaN(num)) { this.toast('請輸入 1-4', 'error'); return; }
        this.counterDisplayCounter = num;
        document.getElementById('counter-display-title').textContent = `CS 櫃台 Counter ${num}`;
        this.showPage('counter-display');
    },

    async refreshCounterDisplay() {
        try {
            const res = await fetch(`${API}?action=queue`);
            const data = await res.json();
            if (!data.success) return;

            const serving = data.serving || [];
            const queue = data.queue || [];
            const waiting = queue.filter(q => q.status === 'waiting');

            // Show the number currently being served at this counter
            const myServing = serving.find(s => s.counter === this.counterDisplayCounter);
            document.getElementById('cd-serving-number').textContent = myServing ? myServing.ticket : '--';

            // Stats
            document.getElementById('cd-waiting-count').textContent = waiting.length;
            document.getElementById('cd-served-count').textContent = data.servedToday;

            // Next up (first 5 waiting)
            const nextEl = document.getElementById('cd-next-list');
            nextEl.innerHTML = waiting.slice(0, 5).map(q =>
                `<div class="counter-next-item">${q.ticket}</div>`
            ).join('') || '<div class="counter-next-item">--</div>';
        } catch (e) { /* server not reachable */ }
    },

    async counterTakeNumber() {
        try {
            const res = await fetch(`${API}?action=join`);
            const data = await res.json();
            if (!data.success) {
                this.toast('排隊已滿 Queue full', 'error');
                return;
            }
            // Show the issued ticket
            const el = document.getElementById('cd-last-issued');
            el.classList.remove('hidden');
            document.getElementById('cd-last-ticket').textContent = data.ticket.ticket;
            this.toast(`已發出 ${data.ticket.ticket}`, 'success');
            this.playSound();
            this.refreshCounterDisplay();
            // Auto-hide after 8 seconds
            setTimeout(() => el.classList.add('hidden'), 8000);
        } catch (e) { this.toast('伺服器錯誤', 'error'); }
    },

    // ===== Display Board =====
    async refreshDisplayBoard() {
        try {
            const res = await fetch(`${API}?action=queue`);
            const data = await res.json();
            if (!data.success) return;

            const serving = data.serving || [];
            const queue = data.queue || [];
            const waiting = queue.filter(q => q.status === 'waiting');

            const el = document.getElementById('display-serving-numbers');
            el.innerHTML = serving.length > 0
                ? serving.map(s => `<div class="display-number-card">${s.ticket}<div style="font-size:1rem;opacity:0.7;margin-top:0.5rem">Counter ${s.counter}</div></div>`).join('')
                : '<div class="display-number-card">--</div>';

            const nextEl = document.getElementById('display-next-list');
            nextEl.innerHTML = waiting.slice(0, 5).map(q => `<div class="display-next-item">${q.ticket}</div>`).join('') || '<div class="display-next-item">--</div>';

            document.getElementById('display-waiting').textContent = data.waiting;
            document.getElementById('display-served').textContent = data.servedToday;
        } catch (e) { /* server not reachable */ }
    },

    // ===== WhatsApp Admin =====
    async loadWhatsAppSettings() {
        try {
            const res = await fetch('whatsapp-api.php?action=get-config');
            const data = await res.json();
            if (data.success && data.config) {
                const c = data.config;
                document.getElementById('wa-enabled').checked = c.enabled || false;
                document.getElementById('wa-phone-id').value = c.phoneNumberId || '';
                document.getElementById('wa-waba-id').value = c.wabaId || '';
                document.getElementById('wa-template-almost').value = c.templateAlmost || 'queue_almost_turn';
                document.getElementById('wa-template-called').value = c.templateCalled || 'queue_your_turn';
                document.getElementById('wa-template-lang').value = c.templateLang || 'zh_HK';
                if (c.tokenMasked) document.getElementById('wa-token').placeholder = c.tokenMasked;
            }
        } catch (e) { /* no server */ }
        this.loadWhatsAppLogs();
    },

    async saveWhatsAppSettings() {
        const config = {
            enabled: document.getElementById('wa-enabled').checked,
            token: document.getElementById('wa-token').value.trim(),
            phoneNumberId: document.getElementById('wa-phone-id').value.trim(),
            wabaId: document.getElementById('wa-waba-id').value.trim(),
            templateAlmost: document.getElementById('wa-template-almost').value.trim(),
            templateCalled: document.getElementById('wa-template-called').value.trim(),
            templateLang: document.getElementById('wa-template-lang').value,
        };
        try {
            const res = await fetch('whatsapp-api.php?action=save-config', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
            });
            const data = await res.json();
            if (data.success) { this.toast('WhatsApp設定已儲存 ✓', 'success'); return; }
        } catch (e) { /* no server */ }
        this.toast('儲存失敗', 'error');
    },

    async testWhatsApp() {
        const phone = prompt('輸入測試電話 (含區號，例如 85291234567):');
        if (!phone) return;
        try {
            const res = await fetch('whatsapp-api.php?action=test', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            this.toast(data.success ? '✅ 測試訊息已發送' : '❌ ' + (data.error || 'Failed'), data.success ? 'success' : 'error');
        } catch (e) { this.toast('❌ 需要PHP伺服器', 'error'); }
        this.loadWhatsAppLogs();
    },

    async loadWhatsAppLogs() {
        const el = document.getElementById('wa-log-list');
        if (!el) return;
        try {
            const res = await fetch('whatsapp-api.php?action=logs&limit=20');
            const data = await res.json();
            if (data.success && data.logs && data.logs.length > 0) {
                el.innerHTML = data.logs.map(l => {
                    const t = new Date(l.timestamp).toLocaleString('zh-HK');
                    const type = { almost: '快到了', called: '到你了', test: '測試' }[l.type] || l.type;
                    return `<div class="wa-log-item ${l.success ? '' : 'wa-log-error'}">
                        <span>${l.success ? '✅' : '❌'}</span>
                        <div class="wa-log-info"><span class="wa-log-ticket">${l.ticket}</span><span class="wa-log-type">${type}</span><span class="wa-log-phone">${l.phone}</span></div>
                        <span class="wa-log-time">${t}</span>
                    </div>`;
                }).join('');
            } else { el.innerHTML = '<div class="hint">暫無記錄</div>'; }
        } catch (e) { el.innerHTML = '<div class="hint">需要PHP伺服器</div>'; }
    },

    // ===== Refresh All =====
    refreshAll() {
        const active = document.querySelector('.page.active');
        if (!active) return;
        switch (active.id) {
            case 'customer-ticket': this.refreshCustomerTicket(); break;
            case 'staff-dashboard': this.refreshStaffDashboard(); break;
            case 'admin-dashboard': this.refreshAdminDashboard(); break;
            case 'display-board': this.refreshDisplayBoard(); break;
            case 'counter-display': this.refreshCounterDisplay(); break;
        }
    },

    // ===== UI Helpers =====
    toast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.textContent = msg;
        c.appendChild(t); setTimeout(() => t.remove(), 3000);
    },
    showModal(msg, onConfirm) {
        const o = document.getElementById('modal-overlay');
        document.getElementById('modal-body').textContent = msg;
        o.classList.remove('hidden');
        const btn = document.getElementById('modal-confirm');
        const handler = () => { o.classList.add('hidden'); btn.removeEventListener('click', handler); onConfirm?.(); };
        btn.addEventListener('click', handler);
    },
    closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); },
    playSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
    },
};

document.addEventListener('DOMContentLoaded', () => app.init());
