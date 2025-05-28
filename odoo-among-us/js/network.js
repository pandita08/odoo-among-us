class SimpleNetwork {
    constructor() {
        this.isHost = false;
        this.gameData = {};
        this.roomCode = null;
        this.updateInterval = null;
    }

    createRoom() {
        this.isHost = true;
        this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        this.gameData = {
            players: [],
            gameState: 'lobby',
            tasks: [],
            sabotages: [],
            votes: {}
        };
        this.saveGameState();
        return this.roomCode;
    }

    joinRoom(code) {
        const gameData = localStorage.getItem(`game_${code}`);
        if (gameData) {
            this.roomCode = code;
            this.gameData = JSON.parse(gameData);
            this.startPolling();
            return true;
        }
        return false;
    }

    saveGameState() {
        if (this.roomCode) {
            localStorage.setItem(`game_${this.roomCode}`, JSON.stringify(this.gameData));
        }
    }

    startPolling() {
        // Simular actualizaciones en tiempo real
        this.updateInterval = setInterval(() => {
            this.checkForUpdates();
        }, 1000);
    }

    stopPolling() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    checkForUpdates() {
        if (!this.roomCode) return;

        const gameData = localStorage.getItem(`game_${this.roomCode}`);
        if (gameData) {
            const newData = JSON.parse(gameData);
            if (JSON.stringify(newData) !== JSON.stringify(this.gameData)) {
                this.gameData = newData;
                this.onGameUpdate(this.gameData);
            }
        }
    }

    addPlayer(player) {
        if (!this.gameData.players) {
            this.gameData.players = [];
        }
        this.gameData.players.push(player);
        this.saveGameState();
    }

    removePlayer(playerId) {
        this.gameData.players = this.gameData.players.filter(p => p.id !== playerId);
        this.saveGameState();
    }

    updatePlayerPosition(playerId, x, y) {
        const player = this.gameData.players.find(p => p.id === playerId);
        if (player) {
            player.x = x;
            player.y = y;
            this.saveGameState();
        }
    }

    submitVote(voterId, targetId) {
        if (!this.gameData.votes) {
            this.gameData.votes = {};
        }
        this.gameData.votes[voterId] = targetId;
        this.saveGameState();
    }

    triggerSabotage(type) {
        if (!this.gameData.sabotages) {
            this.gameData.sabotages = [];
        }
        this.gameData.sabotages.push({
            type,
            timestamp: Date.now()
        });
        this.saveGameState();
    }

    completeTask(playerId, taskId) {
        const player = this.gameData.players.find(p => p.id === playerId);
        if (player && player.tasks) {
            const task = player.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = true;
                this.saveGameState();
            }
        }
    }

    onGameUpdate(data) {
        // Este método será sobrescrito por el juego principal
        console.log('Game state updated:', data);
    }
}

// Exportar la clase para uso global
window.SimpleNetwork = SimpleNetwork; 