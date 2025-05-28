class TaskManager {
    constructor() {
        this.tasks = {
            ventas: {
                title: 'Organizar Pipeline de Ventas',
                type: 'drag',
                description: 'Arrastra los leads de "Nuevo" a "Ganado"',
                timeLimit: 8,
                elements: [
                    { id: 'lead1', status: 'nuevo', name: 'Lead 1' },
                    { id: 'lead2', status: 'nuevo', name: 'Lead 2' },
                    { id: 'lead3', status: 'nuevo', name: 'Lead 3' }
                ]
            },
            contabilidad: {
                title: 'Balancear Cuenta',
                type: 'math',
                description: 'Resuelve la ecuación: 1500 - 300 - 800 = ?',
                timeLimit: 10,
                equation: '1500 - 300 - 800',
                answer: 400,
                options: [300, 400, 500, 600]
            },
            rrhh: {
                title: 'Aprobar Solicitudes',
                type: 'click',
                description: 'Haz click en "Aprobar" para las solicitudes correctas',
                timeLimit: 12,
                requests: [
                    { id: 'req1', text: 'Solicitud de vacaciones', correct: true },
                    { id: 'req2', text: 'Solicitud de aumento', correct: false },
                    { id: 'req3', text: 'Solicitud de capacitación', correct: true },
                    { id: 'req4', text: 'Solicitud de cambio de horario', correct: true }
                ]
            },
            sistemas: {
                title: 'Reiniciar Servidor',
                type: 'sequence',
                description: 'Sigue la secuencia: Apagar → Esperar → Encender',
                timeLimit: 15,
                steps: ['apagar', 'esperar', 'encender']
            }
        };
    }

    getTaskContent(taskType) {
        const task = this.tasks[taskType];
        if (!task) return null;

        let content = '';
        switch (task.type) {
            case 'drag':
                content = this.createDragTask(task);
                break;
            case 'math':
                content = this.createMathTask(task);
                break;
            case 'click':
                content = this.createClickTask(task);
                break;
            case 'sequence':
                content = this.createSequenceTask(task);
                break;
        }

        return {
            title: task.title,
            description: task.description,
            content: content,
            timeLimit: task.timeLimit
        };
    }

    createDragTask(task) {
        return `
            <div class="task-drag">
                <div class="drag-columns">
                    <div class="drag-column" data-status="nuevo">
                        <h3>Nuevo</h3>
                        ${task.elements.map(lead => `
                            <div class="drag-item" draggable="true" data-id="${lead.id}">
                                ${lead.name}
                            </div>
                        `).join('')}
                    </div>
                    <div class="drag-column" data-status="ganado">
                        <h3>Ganado</h3>
                    </div>
                </div>
            </div>
        `;
    }

    createMathTask(task) {
        return `
            <div class="task-math">
                <div class="equation">${task.equation} = ?</div>
                <div class="options">
                    ${task.options.map(option => `
                        <button class="math-option" data-value="${option}">${option}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createClickTask(task) {
        return `
            <div class="task-click">
                ${task.requests.map(req => `
                    <div class="request-item">
                        <span>${req.text}</span>
                        <div class="request-buttons">
                            <button class="btn-approve" data-id="${req.id}">Aprobar</button>
                            <button class="btn-reject" data-id="${req.id}">Rechazar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createSequenceTask(task) {
        return `
            <div class="task-sequence">
                <div class="sequence-steps">
                    ${task.steps.map((step, index) => `
                        <div class="sequence-step" data-step="${index}">
                            <button class="step-button" data-action="${step}">
                                ${step.charAt(0).toUpperCase() + step.slice(1)}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="sequence-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        `;
    }

    checkTaskCompletion(taskType, taskData) {
        const task = this.tasks[taskType];
        if (!task) return false;

        switch (task.type) {
            case 'drag':
                return this.checkDragTask(task, taskData);
            case 'math':
                return this.checkMathTask(task, taskData);
            case 'click':
                return this.checkClickTask(task, taskData);
            case 'sequence':
                return this.checkSequenceTask(task, taskData);
            default:
                return false;
        }
    }

    checkDragTask(task, taskData) {
        return taskData.every(lead => lead.status === 'ganado');
    }

    checkMathTask(task, taskData) {
        return taskData === task.answer;
    }

    checkClickTask(task, taskData) {
        return task.requests.every(req => 
            (req.correct && taskData[req.id] === 'approve') ||
            (!req.correct && taskData[req.id] === 'reject')
        );
    }

    checkSequenceTask(task, taskData) {
        return taskData.every((step, index) => step === task.steps[index]);
    }
}

// Exportar la clase para uso global
window.TaskManager = TaskManager; 