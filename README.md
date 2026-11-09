# Below — As Cinzas do Juramento

Protótipo de RPG de ação top-down sobre a família Vilar e a corrupção que tomou a floresta de Véspera. O projeto usa Electron para o aplicativo, Python para preparar cada camada e Java para a lógica em tempo real dos chefes.

## Arquitetura

- **Electron + JavaScript:** janela em tela cheia, entrada, desenho, colisões, HUD e efeitos.
- **Python:** gera deterministicamente os dados de cada camada quando o jogador inicia ou desce de nível: expansão do mapa, dificuldade e distribuição adicional de inimigos.
- **Java:** processo persistente durante a partida que calcula movimento, fases e eventos dos chefes. A camada de apresentação executa colisões e materializa ondas, projéteis e invocações.
- **Fallback de navegador:** o HTML continua abrindo para desenvolvimento rápido; sem os processos nativos, usa os geradores de reserva em JavaScript.

## Build Windows

Execute `build-windows.bat` no Windows com Node.js 20+, JDK 17+ (incluindo `javac`/`jlink`) e acesso à internet para baixar Electron e o Python portátil. O resultado é `dist/Below.exe`, com os runtimes necessários incluídos. Quem joga não precisa instalar Python nem Java.

O workflow [Build Below for Windows](.github/workflows/build-windows.yml) também prepara e empacota o jogo no runner Windows. O executável fica disponível como artefato da execução em Actions. O `Below.exe` legado na pasta do projeto não é o pacote independente atualizado.

## Controles

WASD/setas: mover · J/espaço: atacar · Q: habilidade · Shift: esquiva · E: interagir · M: mapa · F/F11: tela cheia · Esc/P: pausa.
