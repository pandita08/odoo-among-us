class OdooAmongUs {
    constructor() {
        this.gameState = 'menu'; // menu, lobby, playing, meeting, ended
        this.players = [];
        this.myPlayer = null;
        this.isHost = false;
        this.roomCode = null;
        this.currentTasks = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('createGame').addEventListener('click', () => this.createGame());
        document.getElementById('joinGame').addEventListener('click', () => this.showJoinModal());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinGame());
        document.getElementById('closeModal').addEventListener('click', () => this.hideJoinModal());
    }

    createGame() {
        this.isHost = true;
        this.roomCode = Math.floor(1000 + Math.random() * 9000).toString();
        this.gameState = 'lobby';
        this.redirectToLobby();
    }

    joinGame() {
        const code = document.getElementById('roomCode').value;
        if (code.length !== 4) {
            alert('Por favor ingresa un código de 4 dígitos');
            return;
        }

        // Simular verificación de sala
        if (this.verifyRoom(code)) {
            this.roomCode = code;
            this.gameState = 'lobby';
            this.redirectToLobby();
        } else {
            alert('Código de sala inválido');
        }
    }

    verifyRoom(code) {
        // Simulación simple - en una implementación real, esto verificaría contra un servidor
        return code.length === 4 && /^\d+$/.test(code);
    }

    showJoinModal() {
        const modal = document.getElementById('joinModal');
        modal.style.display = 'flex';
    }

    hideJoinModal() {
        const modal = document.getElementById('joinModal');
        modal.style.display = 'none';
    }

    redirectToLobby() {
        window.location.href = `lobby.html?room=${this.roomCode}`;
    }

    startGame() {
        if (!this.isHost) return;
        
        this.gameState = 'playing';
        this.assignRoles();
        this.assignTasks();
        window.location.href = `game.html?room=${this.roomCode}`;
    }

    assignRoles() {
        const totalPlayers = this.players.length;
        const roles = [];

        // Asignar saboteadores (1-2)
        const numSaboteurs = totalPlayers <= 6 ? 1 : 2;
        for (let i = 0; i < numSaboteurs; i++) {
            roles.push('saboteador');
        }

        // Asignar roles especiales
        roles.push('analista');
        roles.push('tecnico');

        // Llenar el resto con empleados
        while (roles.length < totalPlayers) {
            roles.push('empleado');
        }

        // Mezclar roles
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }

        // Asignar roles a jugadores
        this.players.forEach((player, index) => {
            player.role = roles[index];
        });
    }

    assignTasks() {
        const taskTypes = ['ventas', 'contabilidad', 'rrhh', 'sistemas'];
        this.players.forEach(player => {
            if (player.role !== 'saboteador') {
                player.tasks = taskTypes.map(type => ({
                    type,
                    completed: false
                }));
            }
        });
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new OdooAmongUs();
}); 