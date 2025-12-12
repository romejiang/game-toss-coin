import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game-container',
        width: '100%',
        height: '100%'
    },
}

new Phaser.Game(config);
