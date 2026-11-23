/**
 * TutorialPanel
 *
 * A dockable lesson panel for the A-Frame course. Sessions are tabs, each
 * session is a scrolling list of tasks. Tasks inspect live app state and tick
 * themselves off, and progress is remembered in localStorage.
 */

const STORAGE_KEY = 'pixelAFrame-aframe-course-progress';

export class TutorialPanel {
    constructor(app, course) {
        this.app = app;
        this.course = course;
        this.element = null;
        this.sessionIndex = 0;
        this.stepIndex = 0;
        this.completedSteps = new Set();
        this.eventLog = new Map();
        this.stepElements = new Map();
        this.checkTimer = null;
        this.isOpen = false;
        this.activeSessionId = course?.sessions?.[0]?.id || null;
    }

    init() {
        this.loadProgress();
        this.createElement();
        this.setupEvents();
        this.checkTimer = setInterval(() => this.checkTasks(), 450);
    }

    /* ------------------------------------------------------------------ */
    /* Persistence                                                        */
    /* ------------------------------------------------------------------ */

    loadProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            this.completedSteps = new Set(Array.isArray(saved.completedSteps) ? saved.completedSteps : []);
            this.activeSessionId = saved.sessionId || this.course.sessions[0].id;
            this.sessionIndex = Math.max(0, this.course.sessions.findIndex((session) => session.id === this.activeSessionId));
            this.stepIndex = Number(saved.stepIndex) || 0;
        } catch (err) {
            this.completedSteps = new Set();
        }
        const session = this.course.sessions[this.sessionIndex];
        if (session) this.stepIndex = Math.min(this.stepIndex, session.steps.length - 1);
    }

    saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                completedSteps: [...this.completedSteps],
                sessionId: this.course.sessions[this.sessionIndex]?.id,
                stepIndex: this.stepIndex
            }));
        } catch (err) {
            // Storage can be unavailable in private mode; the panel still works.
        }
    }

    resetProgress() {
        if (!window.confirm('Reset all lesson progress?')) return;
        this.completedSteps.clear();
        this.sessionIndex = 0;
        this.stepIndex = 0;
        this.saveProgress();
        this.render();
        this.app.ui?.showNotification?.('Lesson progress reset', 'info');
    }

    /* ------------------------------------------------------------------ */
    /* DOM                                                                */
    /* ------------------------------------------------------------------ */

    createElement() {
        if (document.getElementById('lesson-panel')) {
            this.element = document.getElementById('lesson-panel');
            return;
        }

        const panel = document.createElement('aside');
        panel.id = 'lesson-panel';
        panel.className = 'lesson-panel';
        panel.setAttribute('aria-label', 'A-Frame lesson panel');
        panel.innerHTML = `
            <div class="lp-header">
                <div class="lp-brand">
                    <i class="fas fa-graduation-cap"></i>
                    <div class="lp-brand-text">
                        <strong>A-Frame Basics</strong>
                        <span class="lp-subtitle">8 sessions · tasks tick off as you build</span>
                    </div>
                </div>
                <div class="lp-header-actions">
                    <button class="lp-icon-btn" data-lp-reset title="Reset lesson progress" aria-label="Reset lesson progress">
                        <i class="fas fa-rotate-left"></i>
                    </button>
                    <button class="lp-icon-btn" data-lp-close title="Close lessons" aria-label="Close lessons">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="lp-progress"><span class="lp-progress-fill"></span></div>
            <div class="lp-tabs" role="tablist"></div>
            <div class="lp-scroll">
                <div class="lp-session-head">
                    <h3 class="lp-session-title"></h3>
                    <p class="lp-session-description"></p>
                </div>
                <div class="lp-steps"></div>
            </div>
            <div class="lp-footer">
                <button class="lp-nav-btn" data-lp-prev><i class="fas fa-arrow-left"></i> Back</button>
                <span class="lp-step-label"></span>
                <button class="lp-nav-btn primary" data-lp-next>Next <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
        document.body.appendChild(panel);
        this.element = panel;

        this.tabsEl = panel.querySelector('.lp-tabs');
        this.stepsEl = panel.querySelector('.lp-steps');
        this.sessionTitleEl = panel.querySelector('.lp-session-title');
        this.sessionDescEl = panel.querySelector('.lp-session-description');
        this.progressFillEl = panel.querySelector('.lp-progress-fill');
        this.progressTextEl = panel.querySelector('.lp-subtitle');
        this.stepLabelEl = panel.querySelector('.lp-step-label');

        panel.querySelector('[data-lp-close]').addEventListener('click', () => this.close());
        panel.querySelector('[data-lp-reset]').addEventListener('click', () => this.resetProgress());
        panel.querySelector('[data-lp-prev]').addEventListener('click', () => this.previousStep());
        panel.querySelector('[data-lp-next]').addEventListener('click', () => this.nextStep());
    }

    setupEvents() {
        const record = (event) => {
            this.eventLog.set(event.type, Date.now());
        };
        window.addEventListener('aframe-exported', record);
        window.addEventListener('aframe-material-applied', record);
        window.addEventListener('aframe-vr-clicked', record);
    }

    sawEvent(name) {
        return this.eventLog.has(name);
    }

    /* ------------------------------------------------------------------ */
    /* Open / close                                                       */
    /* ------------------------------------------------------------------ */

    open(sessionId) {
        if (!this.element) this.createElement();
        if (sessionId) {
            const index = this.course.sessions.findIndex((session) => session.id === sessionId);
            if (index !== -1) {
                this.sessionIndex = index;
                this.stepIndex = 0;
            }
        }
        this.isOpen = true;
        document.body.classList.add('lessons-open');
        this.render();
        this.element.classList.add('open');
        this.saveProgress();
    }

    close() {
        this.isOpen = false;
        document.body.classList.remove('lessons-open');
        this.element?.classList.remove('open');
    }

    toggle(sessionId) {
        if (this.isOpen) this.close();
        else this.open(sessionId);
    }

    /* ------------------------------------------------------------------ */
    /* Rendering                                                          */
    /* ------------------------------------------------------------------ */

    get session() {
        return this.course.sessions[this.sessionIndex];
    }

    get currentStep() {
        return this.session?.steps[this.stepIndex] || null;
    }

    isStepComplete(stepId) {
        return this.completedSteps.has(stepId);
    }

    isSessionComplete(session) {
        return session.steps.every((step) => this.completedSteps.has(step.id));
    }

    render() {
        if (!this.element) return;
        this.renderTabs();
        this.renderSession();
        this.renderSteps();
        this.updateProgress();
    }

    renderTabs() {
        if (!this.tabsEl) return;
        this.tabsEl.innerHTML = '';
        this.course.sessions.forEach((session, index) => {
            const button = document.createElement('button');
            button.className = 'lp-tab';
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.title = session.title;
            button.dataset.session = session.id;
            const complete = this.isSessionComplete(session);
            if (complete) button.classList.add('complete');
            if (index === this.sessionIndex) button.classList.add('active');
            button.innerHTML = `<span class="lp-tab-num">${index + 1}</span><i class="fas ${complete ? 'fa-check' : session.icon || 'fa-circle'}"></i>`;
            button.addEventListener('click', () => {
                this.sessionIndex = index;
                this.stepIndex = 0;
                this.render();
                this.saveProgress();
                this.element.querySelector('.lp-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
            });
            this.tabsEl.appendChild(button);
        });
    }

    renderSession() {
        const session = this.session;
        if (!session) return;
        if (this.sessionTitleEl) this.sessionTitleEl.textContent = session.title;
        if (this.sessionDescEl) this.sessionDescEl.textContent = session.description || '';
        if (this.stepIndex >= session.steps.length) this.stepIndex = 0;
    }

    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    renderSteps() {
        const session = this.session;
        if (!this.stepsEl || !session) return;
        this.stepsEl.innerHTML = '';
        this.stepElements.clear();

        session.steps.forEach((step, index) => {
            const card = document.createElement('article');
            card.className = 'lp-step';
            card.dataset.step = step.id;
            if (index === this.stepIndex) card.classList.add('active');
            if (this.isStepComplete(step.id)) card.classList.add('complete');

            const header = document.createElement('button');
            header.type = 'button';
            header.className = 'lp-step-header';
            header.innerHTML = `
                <span class="lp-step-status"><i class="fas ${this.isStepComplete(step.id) ? 'fa-check' : 'fa-circle'}"></i></span>
                <span class="lp-step-index">${index + 1}</span>
                <span class="lp-step-heading">${this.escapeHtml(step.heading)}</span>
                <span class="lp-step-chevron"><i class="fas fa-chevron-down"></i></span>
            `;
            header.addEventListener('click', () => {
                this.stepIndex = index;
                this.renderSteps();
                this.updateProgress();
                this.saveProgress();
                this.highlightTarget(step);
            });

            const body = document.createElement('div');
            body.className = 'lp-step-body';
            body.innerHTML = `
                <div class="lp-step-content">${step.content || ''}</div>
                <div class="lp-task">
                    <span class="lp-task-icon"><i class="fas fa-circle-notch"></i></span>
                    <span class="lp-task-text">${this.escapeHtml(step.taskLabel || 'Complete this task to tick it off')}</span>
                </div>
            `;

            card.appendChild(header);
            card.appendChild(body);
            this.stepsEl.appendChild(card);
            this.stepElements.set(step.id, card);
        });

        this.refreshStepStatuses();
        this.scrollToActiveStep();
    }

    refreshStepStatuses() {
        const session = this.session;
        if (!session) return;

        session.steps.forEach((step, index) => {
            const card = this.stepElements.get(step.id);
            if (!card) return;
            const complete = this.isStepComplete(step.id);
            card.classList.toggle('complete', complete);
            card.classList.toggle('active', index === this.stepIndex);
            card.querySelector('.lp-step-status i').className = `fas ${complete ? 'fa-check' : 'fa-circle'}`;
            card.querySelector('.lp-task')?.classList.toggle('done', complete);
            const taskIcon = card.querySelector('.lp-task-icon i');
            if (taskIcon) taskIcon.className = `fas ${complete ? 'fa-check-circle' : 'fa-circle-notch'}`;
            const taskText = card.querySelector('.lp-task-text');
            if (taskText) {
                taskText.textContent = complete
                    ? 'Done — nice work!'
                    : (step.taskLabel || 'Complete this task to tick it off');
            }
        });
    }

    updateProgress() {
        const session = this.session;
        if (!session) return;

        const totalSteps = this.course.sessions.reduce((sum, item) => sum + item.steps.length, 0);
        const doneSteps = this.completedSteps.size;
        const completedSessions = this.course.sessions.filter((item) => this.isSessionComplete(item)).length;

        if (this.progressFillEl) {
            this.progressFillEl.style.width = `${totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0}%`;
        }
        if (this.progressTextEl) {
            this.progressTextEl.textContent = `${completedSessions} of ${this.course.sessions.length} sessions · ${doneSteps}/${totalSteps} tasks`;
        }
        if (this.stepLabelEl) {
            this.stepLabelEl.textContent = `${this.stepIndex + 1} / ${session.steps.length}`;
        }

        const prevBtn = this.element?.querySelector('[data-lp-prev]');
        const nextBtn = this.element?.querySelector('[data-lp-next]');
        if (prevBtn) {
            prevBtn.disabled = this.sessionIndex === 0 && this.stepIndex === 0;
        }
        if (nextBtn) {
            const lastSession = this.sessionIndex === this.course.sessions.length - 1;
            const lastStep = this.stepIndex === session.steps.length - 1;
            nextBtn.innerHTML = lastSession && lastStep
                ? '<i class="fas fa-check"></i> Finish'
                : 'Next <i class="fas fa-arrow-right"></i>';
        }
    }

    scrollToActiveStep() {
        const card = this.stepElements.get(this.session?.steps[this.stepIndex]?.id);
        if (card && this.element) {
            card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    highlightTarget(step) {
        document.querySelectorAll('.lp-target-highlight').forEach((el) => el.classList.remove('lp-target-highlight'));
        const target = step?.elementId ? document.getElementById(step.elementId) : null;
        if (!target) return;
        target.classList.add('lp-target-highlight');
        setTimeout(() => target.classList.remove('lp-target-highlight'), 2200);
    }

    /* ------------------------------------------------------------------ */
    /* Navigation                                                         */
    /* ------------------------------------------------------------------ */

    nextStep() {
        const session = this.session;
        if (!session) return;

        if (this.stepIndex < session.steps.length - 1) {
            this.stepIndex += 1;
            this.renderSteps();
            this.updateProgress();
            this.saveProgress();
            this.highlightTarget(this.currentStep);
            return;
        }

        if (this.sessionIndex < this.course.sessions.length - 1) {
            this.sessionIndex += 1;
            this.stepIndex = 0;
            this.render();
            this.saveProgress();
            this.highlightTarget(this.currentStep);
            this.element.querySelector('.lp-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const complete = this.course.sessions.every((item) => this.isSessionComplete(item));
        this.app.ui?.showNotification?.(
            complete ? 'Course complete! You finished all 8 sessions.' : 'Course finished — some tasks are still open.',
            complete ? 'success' : 'info'
        );
    }

    previousStep() {
        if (this.stepIndex > 0) {
            this.stepIndex -= 1;
        } else if (this.sessionIndex > 0) {
            this.sessionIndex -= 1;
            this.stepIndex = this.session.steps.length - 1;
            this.render();
        }
        this.renderSteps();
        this.updateProgress();
        this.saveProgress();
        this.highlightTarget(this.currentStep);
    }

    /* ------------------------------------------------------------------ */
    /* Task checking                                                      */
    /* ------------------------------------------------------------------ */

    checkTasks() {
        if (!this.isOpen) return;
        const session = this.session;
        if (!session) return;

        let changed = false;
        session.steps.forEach((step) => {
            if (this.completedSteps.has(step.id)) return;
            let passed = false;
            try {
                passed = typeof step.task === 'function' ? !!step.task(this.app) : false;
            } catch (err) {
                passed = false;
            }
            if (passed) {
                this.completedSteps.add(step.id);
                changed = true;
            }
        });

        if (!changed) return;

        this.saveProgress();
        this.refreshStepStatuses();
        this.renderTabs();
        this.updateProgress();

        if (this.isSessionComplete(session)) {
            this.app.ui?.showNotification?.(`${session.title} complete!`, 'success');
        }
    }
}

export default TutorialPanel;
