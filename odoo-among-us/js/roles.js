class RoleManager {
    constructor() {
        this.roles = {
            empleado: {
                name: 'Empleado',
                color: '#7C3AED',
                abilities: [],
                description: 'Completa tareas para mantener la productividad de la empresa.'
            },
            saboteador: {
                name: 'Saboteador',
                color: '#EF4444',
                abilities: ['sabotage', 'kill'],
                description: 'Elimina empleados y sabotea la empresa.',
                cooldowns: {
                    sabotage: 30,
                    kill: 25
                }
            },
            analista: {
                name: 'Analista',
                color: '#10B981',
                abilities: ['analyze'],
                description: 'Puede ver estadísticas adicionales de productividad.',
                cooldowns: {
                    analyze: 20
                }
            },
            tecnico: {
                name: 'Técnico',
                color: '#3B82F6',
                abilities: ['repair'],
                description: 'Repara sabotajes más rápido que los demás.',
                cooldowns: {
                    repair: 15
                }
            }
        };

        this.activeCooldowns = {};
    }

    getRoleInfo(role) {
        return this.roles[role] || null;
    }

    canUseAbility(playerId, ability) {
        const player = this.getPlayerRole(playerId);
        if (!player) return false;

        const role = this.roles[player.role];
        if (!role || !role.abilities.includes(ability)) return false;

        const cooldownKey = `${playerId}_${ability}`;
        const lastUse = this.activeCooldowns[cooldownKey];
        if (!lastUse) return true;

        const cooldownTime = role.cooldowns[ability] * 1000;
        return Date.now() - lastUse >= cooldownTime;
    }

    useAbility(playerId, ability) {
        if (!this.canUseAbility(playerId, ability)) return false;

        const player = this.getPlayerRole(playerId);
        const role = this.roles[player.role];
        const cooldownKey = `${playerId}_${ability}`;
        
        this.activeCooldowns[cooldownKey] = Date.now();
        return true;
    }

    getAbilityCooldown(playerId, ability) {
        const player = this.getPlayerRole(playerId);
        if (!player) return 0;

        const role = this.roles[player.role];
        if (!role || !role.abilities.includes(ability)) return 0;

        const cooldownKey = `${playerId}_${ability}`;
        const lastUse = this.activeCooldowns[cooldownKey];
        if (!lastUse) return 0;

        const cooldownTime = role.cooldowns[ability] * 1000;
        const remaining = cooldownTime - (Date.now() - lastUse);
        return Math.max(0, Math.ceil(remaining / 1000));
    }

    getPlayerRole(playerId) {
        // En una implementación real, esto vendría del servidor
        return {
            id: playerId,
            role: 'empleado' // Por defecto
        };
    }

    // Métodos específicos de cada rol
    analyzeProductivity(playerId) {
        if (!this.canUseAbility(playerId, 'analyze')) return null;

        this.useAbility(playerId, 'analyze');
        return {
            overall: Math.random() * 100,
            byDepartment: {
                ventas: Math.random() * 100,
                contabilidad: Math.random() * 100,
                rrhh: Math.random() * 100,
                sistemas: Math.random() * 100
            }
        };
    }

    repairSabotage(playerId, sabotageType) {
        if (!this.canUseAbility(playerId, 'repair')) return false;

        this.useAbility(playerId, 'repair');
        return true;
    }

    triggerSabotage(playerId, sabotageType) {
        if (!this.canUseAbility(playerId, 'sabotage')) return false;

        this.useAbility(playerId, 'sabotage');
        return true;
    }

    eliminatePlayer(playerId, targetId) {
        if (!this.canUseAbility(playerId, 'kill')) return false;

        this.useAbility(playerId, 'kill');
        return true;
    }
}

// Exportar la clase para uso global
window.RoleManager = RoleManager; 