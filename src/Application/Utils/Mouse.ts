import EventEmitter from './EventEmitter';
import Application from '../Application';
export default class Mouse extends EventEmitter {
    x: number;
    y: number;
    inComputer: boolean;
    application: Application;

    constructor() {
        super();

        // Setup
        this.x = 0;
        this.y = 0;
        this.inComputer = false;
        // this.application = new Application();
        // this.audio = this.application.world.audio;

        // Resize event
        this.on('mousemove', (event) => {
            const mouseEvent = event as ComputerMouseEvent;
            if (mouseEvent.clientX && mouseEvent.clientY) {
                this.x = mouseEvent.clientX;
                this.y = mouseEvent.clientY;
            }
            this.inComputer = mouseEvent.inComputer ? true : false;
        });
    }
}
