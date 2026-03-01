export class Player {
    x: number = 50;
    y: number = 0;
    width: number = 30;
    height: number = 30;
    velocityY: number = 0;
    gravity: number = 0.6;
    jumpForce: number = -12;
    isGrounded: boolean = false;

    // Frustration variables
    jumpQueueTimer: number | null = null;
    baseY: number = 350; // Ground level

    constructor() {
        this.y = this.baseY;
    }

    update(deltaTime: number, timeScale: number) {
        if (timeScale === 0) return; // Frozen

        // Apply jumping queue if existing
        if (this.jumpQueueTimer !== null) {
            this.jumpQueueTimer -= deltaTime * timeScale;
            if (this.jumpQueueTimer <= 0) {
                this.executeJump();
            }
        }

        // Apply gravity
        this.velocityY += this.gravity * (deltaTime / 16.66) * timeScale;
        this.y += this.velocityY * (deltaTime / 16.66) * timeScale;

        // Floor collision
        if (this.y > this.baseY) {
            this.y = this.baseY;
            this.velocityY = 0;
            this.isGrounded = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw player (a simple colorful block or character representation)
        ctx.fillStyle = '#4ade80'; // Nice green
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 18, this.y + 5, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 22, this.y + 8, 4, 4);

        // Funny frustrated mouth if jump is queued
        if (this.jumpQueueTimer !== null) {
            ctx.beginPath();
            ctx.moveTo(this.x + 15, this.y + 22);
            ctx.lineTo(this.x + 25, this.y + 22);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    jump() {
        if (!this.isGrounded) return;

        // FRUSTRATION MECHANIC: 40% chance of random delay up to 1 second
        if (Math.random() < 0.4) {
            this.jumpQueueTimer = Math.random() * 1000 + 200; // 200ms to 1200ms delay
            return;
        }

        this.executeJump();
    }

    private executeJump() {
        this.jumpQueueTimer = null;
        this.isGrounded = false;

        // FRUSTRATION MECHANIC: Unpredictable jump height
        let force = this.jumpForce;
        const r = Math.random();
        if (r < 0.2) {
            force *= 0.6; // Weak jump
        } else if (r > 0.8) {
            force *= 1.4; // Super jump
        }

        this.velocityY = force;
    }
}
