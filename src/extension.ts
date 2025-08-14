// El módulo 'vscode' contiene la API de extensibilidad de VS Code
// Importa el módulo y referencíalo con el alias vscode en tu código
import * as vscode from 'vscode';

class DesxaPanel {
    public static currentPanel: DesxaPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;
        this._update();
    }

    public static createOrShow(extensionContext: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DesxaPanel.currentPanel) {
            DesxaPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'desxaView',
            'Desxa 🐬',
            column || vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        DesxaPanel.currentPanel = new DesxaPanel(panel, extensionContext.extensionPath);
    }

    private _update() {
        this._panel.webview.html = this._getWebviewContent();
    }

    private _getWebviewContent() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .dolphin {
                        width: 200px;
                        height: 200px;
                        animation: swim 4s infinite ease-in-out;
                    }
                    @keyframes swim {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(30px); }
                        100% { transform: translateY(0px); }
                    }
                </style>
            </head>
            <body>
                <div class="dolphin">
                    <!-- Aquí puedes poner tu imagen de Desxa -->
                    🐬
                </div>
            </body>
            </html>
        `;
    }
}

class Desxa {
    private happiness: number = 100;
    private energy: number = 100;
    private hambre: number = 100;
    private carino: number = 100;
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.statusBarItem.text = "🐬 Desxa";
        this.statusBarItem.show();
    }

    public getStatus(): string {
        return `Estado de Desxa:\nFelicidad: ${this.happiness}%\nEnergía: ${this.energy}%\nHambre: ${this.hambre}%\nCariño: ${this.carino}%`;
    }

    public play() {
        this.happiness = Math.min(100, this.happiness + 10);
        this.energy = Math.max(0, this.energy - 20);
        this.hambre = Math.max(0, this.hambre - 15);
        return "¡Desxa está jugando contigo! 🐬";
    }

    public alimentar() {
        this.hambre = Math.min(100, this.hambre + 30);
        this.happiness = Math.min(100, this.happiness + 5);
        return "¡Desxa está comiendo felizmente! 🐟";
    }

    public acariciar() {
        this.carino = Math.min(100, this.carino + 25);
        this.happiness = Math.min(100, this.happiness + 15);
        return "¡Desxa se siente muy querido! 💙";
    }

    public descansar() {
        this.energy = Math.min(100, this.energy + 40);
        this.hambre = Math.max(0, this.hambre - 10);
        return "¡Desxa está descansando! 😴";
    }

    private decreaseStats() {
        this.happiness = Math.max(0, this.happiness - 2);
        this.energy = Math.max(0, this.energy - 3);
        this.hambre = Math.max(0, this.hambre - 5);
        this.carino = Math.max(0, this.carino - 2);
        
        // Mostrar advertencias si algún estado está muy bajo
        if (this.hambre < 20) {
            vscode.window.showWarningMessage('¡Desxa tiene hambre! 🐟');
        }
        if (this.energy < 20) {
            vscode.window.showWarningMessage('¡Desxa está cansado! 😴');
        }
    }

    public guardarEstado(context: vscode.ExtensionContext) {
        context.globalState.update('desxaStats', {
            happiness: this.happiness,
            energy: this.energy,
            hambre: this.hambre,
            carino: this.carino
        });
    }

    public cargarEstado(context: vscode.ExtensionContext) {
        const stats = context.globalState.get('desxaStats');
        if (stats) {
            this.happiness = stats.happiness;
            this.energy = stats.energy;
            this.hambre = stats.hambre;
            this.carino = stats.carino;
        }
    }
}

// Este método se llama cuando tu extensión se activa
// Tu extensión se activa la primera vez que se ejecuta el comando
export function activate(context: vscode.ExtensionContext) {
    const desxa = new Desxa();
    
    // Agregar botón en la barra de estado
    const desxaStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    desxaStatusBar.text = "🐬 Desxa";
    desxaStatusBar.tooltip = "Click para ver opciones de Desxa";
    desxaStatusBar.command = 'desxa-companion.showDesxa';
    desxaStatusBar.show();
    
    desxa.cargarEstado(context);

    // Crear temporizador para actualizar estados cada 5 minutos
    setInterval(() => {
        desxa.decreaseStats();
        desxa.guardarEstado(context);
    }, 5 * 60 * 1000);

	let showDesxa = vscode.commands.registerCommand('desxa-companion.showDesxa', () => {
		vscode.window.showInformationMessage('¡Hola! Soy Desxa, tu delfín virtual 🐬');
		vscode.window.showInformationMessage(desxa.getStatus());
	});

	let playWithDesxa = vscode.commands.registerCommand('desxa-companion.playWithDesxa', () => {
		vscode.window.showInformationMessage(desxa.play());
		vscode.window.showInformationMessage(desxa.getStatus());
	});

	let alimentarDesxa = vscode.commands.registerCommand('desxa-companion.alimentarDesxa', () => {
		vscode.window.showInformationMessage(desxa.alimentar());
		vscode.window.showInformationMessage(desxa.getStatus());
	});

	let acariciarDesxa = vscode.commands.registerCommand('desxa-companion.acariciarDesxa', () => {
		vscode.window.showInformationMessage(desxa.acariciar());
		vscode.window.showInformationMessage(desxa.getStatus());
	});

	let descansarDesxa = vscode.commands.registerCommand('desxa-companion.descansarDesxa', () => {
		vscode.window.showInformationMessage(desxa.descansar());
		vscode.window.showInformationMessage(desxa.getStatus());
	});

	let showDesxaPanel = vscode.commands.registerCommand('desxa-companion.showPanel', () => {
        DesxaPanel.createOrShow(context);
    });

	context.subscriptions.push(showDesxa);
	context.subscriptions.push(playWithDesxa);
	context.subscriptions.push(alimentarDesxa);
	context.subscriptions.push(acariciarDesxa);
	context.subscriptions.push(descansarDesxa);
	context.subscriptions.push(showDesxaPanel);
	context.subscriptions.push(desxaStatusBar);
}

// Este método se llama cuando tu extensión se desactiva
export function deactivate() {}
