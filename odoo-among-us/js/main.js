// 🎮 ODOO AMONG US - Conexión con servidor multijugador
const SERVER_URL = 'https://odoo-among-us-server-production.up.railway.app';
let socket = null;
let currentRoom = null;
let playerName = null;

class OdooAmongUs {
    constructor() {
        this.gameState = 'menu';
        this.players = [];
        this.myPlayer = null;
        this.isHost = false;
        this.roomCode = null;
        this.currentTasks = [];
    }

    initializeEventListeners() {
        document.getElementById('createGame').addEventListener('click', () => this.createGame());
        document.getElementById('joinGame').addEventListener('click', () => this.showJoinModal());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinGame());
        document.getElementById('closeModal').addEventListener('click', () => this.hideJoinModal());
    }

    connectToServer() {
        if (socket && socket.connected) return;
        
        console.log('🔌 Conectando al servidor...', SERVER_URL);
        socket = io(SERVER_URL);
        
        socket.on('connect', () => {
            console.log('🔌 ¡Conectado al servidor multijugador!');
        });
        
        socket.on('disconnect', () => {
            console.log('🔌 Desconectado del servidor');
        });
        
        socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
            alert('❌ Error conectando al servidor. Verifica tu conexión.');
        });
        
        socket.on('gameCreated', (data) => {
            currentRoom = data.roomCode;
            const message = `🎮 ¡Sala creada exitosamente!

🔢 Código de sala: ${data.roomCode}
👥 Jugadores: ${data.players.length}/8

📱 Para unirse, tus compañeros deben:
1. Ir a: pandita08.github.io/odoo-among-us
2. Click "Unirse a Partida"
3. Ingresar código: ${data.roomCode}

🚀 ¡Multijugador real funcionando!

Una vez que tengas mínimo 4 jugadores, podrás iniciar la partida.`;

            alert(message);
        });
        
        socket.on('joinedGame', (data) => {
            currentRoom = data.roomCode;
            const hostName = data.players.find(p => p.isHost)?.name || 'el host';
            const message = `✅ ¡Te uniste a la sala ${data.roomCode}!

👥 Jugadores en sala: ${data.players.length}/8
⏳ Esperando que ${hostName} inicie la partida...

🎮 ¡Conectado al servidor multijugador!

Necesitan mínimo 4 jugadores para comenzar.`;

            alert(message);
            this.hideJoinModal();
        });
        
        socket.on('joinError', (data) => {
            alert(`❌ Error: ${data.message}`);
        });
        
        socket.on('playerJoined', (data) => {
            const newPlayer = data.newPlayer;
            const playersCount = data.players.length;
            
            let message = `👋 ${newPlayer.name} se unió a la sala!

👥 Jugadores: ${playersCount}/8`;

            if (playersCount >= 4) {
                message += `\n\n🚀 Ya pueden iniciar la partida (mínimo alcanzado)`;
            } else {
                message += `\n\n⏳ Faltan ${4 - playersCount} jugadores para iniciar`;
            }

            alert(message);
        });
        
        socket.on('playerLeft', (data) => {
            const playersCount = data.players.length;
            alert(`👋 Un jugador se desconectó

👥 Jugadores: ${playersCount}/8`);
        });
        
        socket.on('gameStarted', (data) => {
            const roleDescriptions = {
                'empleado': '👔 Empleado: Completa tareas y encuentra saboteadores',
                'saboteador': '🔥 Saboteador: Elimina empleados sin ser descubierto',
                'analista': '🔬 Analista: Ve estadísticas extra del equipo',
                'tecnico': '🔧 Técnico: Repara sabotajes más rápido'
            };
            
            const message = `🎮 ¡El juego ha comenzado!

${roleDescriptions[data.role]}

👥 Jugadores en partida: ${data.players.length}

🎯 ¡Descubre quién sabotea la empresa!

(Funcionalidades de juego completas en desarrollo)`;

            alert(message);
        });
        
        socket.on('error', (data) => {
            alert(`❌ Error: ${data.message}`);
        });
    }

    createGame() {
        if (!playerName) {
            playerName = prompt('¿Cuál es tu nombre?');
            if (!playerName || playerName.trim() === '') {
                alert('❌ Necesitas un nombre para jugar');
                return;
            }
            playerName = playerName.trim();
        }
        
        console.log('🚀 Creando partida para:', playerName);
        this.connectToServer();
        
        // Dar tiempo para conectar
        setTimeout(() => {
            if (socket && socket.connected) {
                socket.emit('createGame', { playerName: playerName });
            } else {
                alert('❌ Error conectando al servidor. Intenta de nuevo en unos segundos.');
            }
        }, 1000);
    }

    joinGame() {
        const code = document.getElementById('roomCode').value.trim();
        if (code.length !== 4) {
            alert('❌ El código debe tener exactamente 4 dígitos');
            return;
        }
        
        if (!playerName) {
            playerName = prompt('¿Cuál es tu nombre?');
            if (!playerName || playerName.trim() === '') {
                alert('❌ Necesitas un nombre para jugar');
                return;
            }
            playerName = playerName.trim();
        }
        
        console.log('🔗 Uniéndose a partida:', code, 'con nombre:', playerName);
        this.connectToServer();
        
        // Dar tiempo para conectar
        setTimeout(() => {
            if (socket && socket.connected) {
                socket.emit('joinGame', { 
                    roomCode: code, 
                    playerName: playerName 
                });
            } else {
                alert('❌ Error conectando al servidor. Intenta de nuevo en unos segundos.');
            }
        }, 1000);
    }

    showJoinModal() {
        const modal = document.getElementById('joinModal');
        modal.style.display = 'flex';
        
        setTimeout(() => {
            document.getElementById('roomCode').focus();
        }, 100);
    }

    hideJoinModal() {
        const modal = document.getElementById('joinModal');
        modal.style.display = 'none';
        document.getElementById('roomCode').value = '';
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Inicializando Odoo Among Us Multijugador...');
    console.log('🌐 Servidor:', SERVER_URL);
    
    window.game = new OdooAmongUs();
    
    setTimeout(() => {
        try {
            window.game.initializeEventListeners();
            console.log('✅ Juego listo - Conectará al servidor al crear/unirse');
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }, 100);
});
