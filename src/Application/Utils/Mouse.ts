import EventEmitter from './EventEmitter';

export default class Mouse extends EventEmitter {
    x: number;
    y: number;
    inComputer: boolean;

    constructor() {
        super();

        // Setup
        this.x = 0;
        this.y = 0;
        this.inComputer = false;

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
