export class Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    passed: boolean = false;
    color: string;
    type: 'wall' | 'tree';

    constructor(startX: number, speed: number) {
        this.x = startX;
        this.speed = speed;
        this.type = Math.random() > 0.5 ? 'wall' : 'tree';

        if (this.type === 'wall') {
            this.width = Math.random() * 20 + 20; // 20-40 wide
            this.height = Math.random() * 40 + 30; // 30-70 tall
            this.color = '#e94560'; // Red
        } else {
            this.width = 15; // Trunk
            this.height = Math.random() * 50 + 40; // 40-90 tall
            this.color = '#8b4513'; // Brown trunk
        }

        this.y = 380 - this.height; // Assuming canvas height 400, ground 380
    }

    update(deltaTime: number, timeScale: number) {
        this.x -= this.speed * (deltaTime / 16.66) * timeScale;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.type === 'wall') {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Brick pattern
            ctx.strokeStyle = '#c2334d';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width, this.y + this.height / 2);
            ctx.stroke();
        } else {
            // Tree
            // Trunk
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Leaves (using simple overlapping circles)
            ctx.fillStyle = '#228b22'; // Forest green
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 10, 25, 0, Math.PI * 2);
            ctx.arc(this.x + this.width / 2 - 15, this.y + 10, 20, 0, Math.PI * 2);
            ctx.arc(this.x + this.width / 2 + 15, this.y + 10, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    collidesWith(player: { x: number, y: number, width: number, height: number }): boolean {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}
