class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.network = new SimpleNetwork();
        this.taskManager = new TaskManager();
        this.roleManager = new RoleManager();
        this.ui = new UIManager();
        
        this.roomCode = new URLSearchParams(window.location.search).get('room');
        this.playerId = this.generatePlayerId();
        this.players = [];
        this.tasks = [];
        this.sabotages = [];
        
        this.initializeCanvas();
        this.initializeGame();
        this.startGameLoop();
    }

    initializeCanvas() {
        // Ajustar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initializeGame() {
        if (!this.roomCode) {
            window.location.href = 'index.html';
            return;
        }

        // Unirse a la sala
        if (this.network.joinRoom(this.roomCode)) {
            this.setupNetworkCallbacks();
            this.addPlayer();
        } else {
            alert('Sala no encontrada');
            window.location.href = 'index.html';
        }
    }

    setupNetworkCallbacks() {
        this.network.onGameUpdate = (data) => {
            this.players = data.players || [];
            this.tasks = data.tasks || [];
            this.sabotages = data.sabotages || [];
            this.updateUI();
        };
    }

    addPlayer() {
        const player = {
            id: this.playerId,
            name: this.generatePlayerName(),
            color: this.generatePlayerColor(),
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: Math.random() * (this.canvas.height - 100) + 50,
            role: 'empleado' // Por defecto
        };

        this.network.addPlayer(player);
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    update() {
        // Actualizar posiciones de jugadores
        this.players.forEach(player => {
            if (player.id === this.playerId) {
                this.handlePlayerMovement(player);
            }
        });

        // Actualizar sabotajes
        this.updateSabotages();

        // Verificar colisiones con tareas
        this.checkTaskCollisions();
    }

    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar mapa
        this.renderMap();

        // Dibujar tareas
        this.renderTasks();

        // Dibujar jugadores
        this.renderPlayers();

        // Dibujar sabotajes
        this.renderSabotages();
    }

    renderMap() {
        // Dibujar áreas del mapa
        const areas = {
            recepcion: { x: 0, y: 0, width: 200, height: 200 },
            ventas: { x: 200, y: 0, width: 200, height: 200 },
            contabilidad: { x: 400, y: 0, width: 200, height: 200 },
            rrhh: { x: 0, y: 200, width: 200, height: 200 },
            sistemas: { x: 200, y: 200, width: 200, height: 200 },
            almacen: { x: 400, y: 200, width: 200, height: 200 },
            juntas: { x: 0, y: 400, width: 200, height: 200 },
            cafeteria: { x: 200, y: 400, width: 200, height: 200 }
        };

        Object.entries(areas).forEach(([name, area]) => {
            this.ctx.fillStyle = '#f3f4f6';
            this.ctx.fillRect(area.x, area.y, area.width, area.height);
            this.ctx.strokeStyle = '#6b7280';
            this.ctx.strokeRect(area.x, area.y, area.width, area.height);
            
            this.ctx.fillStyle = '#1f2937';
            this.ctx.font = '14px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(name.toUpperCase(), area.x + area.width/2, area.y + area.height/2);
        });
    }

    renderTasks() {
        this.tasks.forEach(task => {
            this.ctx.fillStyle = task.completed ? '#10B981' : '#7C3AED';
            this.ctx.beginPath();
            this.ctx.arc(task.x, task.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderPlayers() {
        this.players.forEach(player => {
            // Dibujar círculo del jugador
            this.ctx.fillStyle = player.color;
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
            this.ctx.fill();

            // Dibujar nombre
            this.ctx.fillStyle = '#1f2937';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(player.name, player.x, player.y - 30);
        });
    }

    renderSabotages() {
        this.sabotages.forEach(sabotage => {
            switch (sabotage.type) {
                case 'lights':
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    break;
                case 'doors':
                    // Dibujar puertas bloqueadas
                    break;
                case 'slow':
                    // Efecto visual de sistema lento
                    break;
            }
        });
    }

    handlePlayerMovement(player) {
        // Implementar controles de movimiento
        // Por ahora, movimiento simple con las flechas
        const speed = 5;
        if (this.keys.ArrowUp) player.y -= speed;
        if (this.keys.ArrowDown) player.y += speed;
        if (this.keys.ArrowLeft) player.x -= speed;
        if (this.keys.ArrowRight) player.x += speed;

        // Mantener al jugador dentro del canvas
        player.x = Math.max(20, Math.min(this.canvas.width - 20, player.x));
        player.y = Math.max(20, Math.min(this.canvas.height - 20, player.y));

        // Actualizar posición en el servidor
        this.network.updatePlayerPosition(player.id, player.x, player.y);
    }

    checkTaskCollisions() {
        const player = this.players.find(p => p.id === this.playerId);
        if (!player) return;

        this.tasks.forEach(task => {
            const distance = Math.hypot(player.x - task.x, player.y - task.y);
            if (distance < 35 && !task.completed) {
                this.startTask(task);
            }
        });
    }

    startTask(task) {
        const taskData = this.taskManager.getTaskContent(task.type);
        if (taskData) {
            this.ui.showTask(taskData);
        }
    }

    updateSabotages() {
        this.sabotages = this.sabotages.filter(sabotage => {
            return Date.now() - sabotage.timestamp < 15000; // 15 segundos
        });
    }

    updateUI() {
        // Actualizar lista de jugadores
        this.ui.updatePlayerList(this.players);

        // Actualizar información del rol
        const player = this.players.find(p => p.id === this.playerId);
        if (player) {
            this.ui.updateRoleInfo(player.role);
            this.ui.showSabotageButton(player.role === 'saboteador');
        }

        // Actualizar progreso de tareas
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalTasks = this.tasks.length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        this.ui.updateTaskProgress(progress);
    }

    // Utilidades
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    generatePlayerName() {
        return 'Jugador ' + Math.floor(Math.random() * 1000);
    }

    generatePlayerColor() {
        const colors = ['#7C3AED', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameManager();
}); 