class LobbyManager {
    constructor() {
        this.network = new SimpleNetwork();
        this.roomCode = new URLSearchParams(window.location.search).get('room');
        this.isHost = false;
        this.players = [];
        this.initializeEventListeners();
        this.joinLobby();
    }

    initializeEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('leaveLobby').addEventListener('click', () => this.leaveLobby());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    joinLobby() {
        if (!this.roomCode) {
            window.location.href = 'index.html';
            return;
        }

        // Mostrar código de sala
        document.getElementById('roomCodeDisplay').textContent = this.roomCode;

        // Intentar unirse a la sala
        if (this.network.joinRoom(this.roomCode)) {
            this.isHost = this.network.gameData.players.length === 0;
            this.updateUI();
        } else {
            alert('Sala no encontrada');
            window.location.href = 'index.html';
        }

        // Configurar callback de actualizaciones
        this.network.onGameUpdate = (data) => this.handleGameUpdate(data);
    }

    handleGameUpdate(data) {
        this.players = data.players || [];
        this.updateUI();
    }

    updateUI() {
        // Actualizar lista de jugadores
        const playersList = document.getElementById('playersList');
        playersList.innerHTML = '';

        this.players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-slot';
            playerElement.innerHTML = `
                <div class="player-avatar" style="background-color: ${player.color}"></div>
                <div class="player-name">${player.name}</div>
            `;
            playersList.appendChild(playerElement);
        });

        // Actualizar contador de jugadores
        document.querySelector('.player-list h3').textContent = 
            `Jugadores (${this.players.length}/8)`;

        // Mostrar/ocultar botón de iniciar juego
        const startButton = document.getElementById('startGame');
        startButton.style.display = this.isHost ? 'block' : 'none';

        // Deshabilitar inicio si no hay suficientes jugadores
        startButton.disabled = this.players.length < 4;
    }

    startGame() {
        if (!this.isHost) return;
        
        this.network.gameData.gameState = 'playing';
        this.network.saveGameState();
        window.location.href = `game.html?room=${this.roomCode}`;
    }

    leaveLobby() {
        this.network.stopPolling();
        window.location.href = 'index.html';
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            const chatMessages = document.getElementById('chatMessages');
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.textContent = `${this.getPlayerName()}: ${message}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            input.value = '';
        }
    }

    getPlayerName() {
        // En una implementación real, esto vendría del servidor
        return 'Jugador ' + Math.floor(Math.random() * 1000);
    }
}

// Inicializar el lobby cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.lobby = new LobbyManager();
}); 