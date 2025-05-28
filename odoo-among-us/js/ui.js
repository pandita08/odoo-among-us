class UIManager {
    constructor() {
        this.modals = {
            meeting: document.getElementById('meetingModal'),
            voting: document.getElementById('votingModal'),
            task: document.getElementById('taskModal')
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botones de control
        document.getElementById('reportButton').addEventListener('click', () => this.handleReport());
        document.getElementById('useButton').addEventListener('click', () => this.handleUse());
        document.getElementById('sabotageButton').addEventListener('click', () => this.handleSabotage());

        // Eventos de tareas
        document.addEventListener('dragstart', (e) => this.handleDragStart(e));
        document.addEventListener('dragover', (e) => this.handleDragOver(e));
        document.addEventListener('drop', (e) => this.handleDrop(e));

        // Eventos de chat
        document.getElementById('sendMeetingMessage').addEventListener('click', () => this.sendMeetingMessage());
        document.getElementById('meetingInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMeetingMessage();
        });
    }

    // Gestión de modales
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Gestión de tareas
    showTask(taskData) {
        const taskModal = this.modals.task;
        const taskTitle = document.getElementById('taskTitle');
        const taskContent = document.getElementById('taskContent');

        taskTitle.textContent = taskData.title;
        taskContent.innerHTML = taskData.content;
        this.showModal('task');
    }

    updateTaskProgress(progress) {
        const progressBar = document.getElementById('taskProgress');
        const percentage = document.getElementById('taskPercentage');
        
        progressBar.style.width = `${progress}%`;
        percentage.textContent = `${Math.round(progress)}%`;
    }

    // Gestión de reuniones
    startMeeting(duration = 45) {
        this.showModal('meeting');
        this.startMeetingTimer(duration);
    }

    startMeetingTimer(duration) {
        const timerElement = document.getElementById('meetingTime');
        let timeLeft = duration;

        const timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.startVoting();
            }
        }, 1000);
    }

    startVoting(duration = 30) {
        this.hideModal('meeting');
        this.showModal('voting');
        this.startVotingTimer(duration);
    }

    startVotingTimer(duration) {
        const timerElement = document.getElementById('votingTime');
        let timeLeft = duration;

        const timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.endVoting();
            }
        }, 1000);
    }

    // Gestión de chat
    sendMeetingMessage() {
        const input = document.getElementById('meetingInput');
        const message = input.value.trim();
        
        if (message) {
            const chatMessages = document.getElementById('meetingMessages');
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.textContent = `${this.getPlayerName()}: ${message}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            input.value = '';
        }
    }

    // Gestión de arrastre
    handleDragStart(e) {
        if (e.target.classList.contains('drag-item')) {
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
            e.target.classList.add('dragging');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        if (e.target.classList.contains('drag-column')) {
            e.target.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const column = e.target.closest('.drag-column');
        if (!column) return;

        const itemId = e.dataTransfer.getData('text/plain');
        const item = document.querySelector(`[data-id="${itemId}"]`);
        if (item) {
            column.appendChild(item);
            item.classList.remove('dragging');
            column.classList.remove('drag-over');
        }
    }

    // Manejadores de eventos
    handleReport() {
        // Implementar lógica de reporte
        console.log('Reportando...');
    }

    handleUse() {
        // Implementar lógica de uso
        console.log('Usando...');
    }

    handleSabotage() {
        // Implementar lógica de sabotaje
        console.log('Saboteando...');
    }

    // Utilidades
    getPlayerName() {
        // En una implementación real, esto vendría del servidor
        return 'Jugador ' + Math.floor(Math.random() * 1000);
    }

    // Actualización de UI
    updatePlayerList(players) {
        const meetingPlayers = document.getElementById('meetingPlayers');
        const votingPlayers = document.getElementById('votingPlayers');
        
        const playerElements = players.map(player => `
            <div class="player-vote" data-id="${player.id}">
                <div class="player-avatar" style="background-color: ${player.color}"></div>
                <div class="player-name">${player.name}</div>
            </div>
        `).join('');

        if (meetingPlayers) meetingPlayers.innerHTML = playerElements;
        if (votingPlayers) votingPlayers.innerHTML = playerElements;
    }

    showSabotageButton(show) {
        const button = document.getElementById('sabotageButton');
        if (button) {
            button.style.display = show ? 'block' : 'none';
        }
    }

    updateRoleInfo(role) {
        const roleElement = document.getElementById('playerRole');
        if (roleElement) {
            roleElement.textContent = `Rol: ${role}`;
        }
    }
}

// Exportar la clase para uso global
window.UIManager = UIManager; 