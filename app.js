import wasm_init, { App } from "./wasmwow.js";
import { SpriteLoader } from "./sprite_loader.js";

// Init wasm stuff
wasm_init()
    .then(() => {
        let sprite_loader = new SpriteLoader();

        let app = new App();

        // Init canvas
        let canvas = document.getElementById("canvas")
        let ctx = canvas.getContext('2d', { alpha: false });

        function color_to_css({ r, g, b, a }) {
            return `rgba(${r * 100}%, ${g * 100}%, ${b * 100}%, ${a * 100}%)`;
        }

        function render_to_canvas(cmd) {
            if (cmd.Sprite) {
                let pos = cmd.Sprite.position;
                let filepath = cmd.Sprite.filepath;

                let image = sprite_loader.get_sprite(`assets/${filepath}`);
                if (image === null) return;

                ctx.drawImage(image, pos.x, pos.y);
            } else if (cmd.Polygon) {
                let color = color_to_css(cmd.Polygon.color);
                ctx.strokeStyle = color;

                let start = cmd.Polygon.vertices[0]
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                for (let vert of cmd.Polygon.vertices) {
                    ctx.lineTo(vert.x, vert.y);
                }
                ctx.closePath();
                ctx.stroke();
            } else if (cmd.Text) {
                let color = color_to_css(cmd.Text.color);
                ctx.fillStyle = color;
                let pos = cmd.Text.position;
                ctx.font = '12px sans-serif';
                ctx.fillText(cmd.Text.text, pos.x, pos.y);
            } else if (cmd.Clear) {
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (cmd.Rect) {
                let pos = cmd.Rect.position;
                let size = cmd.Rect.size;
                let color = color_to_css(cmd.Rect.color);

                ctx.fillStyle = color;
                ctx.fillRect(pos.x, pos.y, size.x, size.y);
            } else {
                console.error("render command not recognized:", cmd, typeof cmd);
            }
        }

        // Resource loading
        function load_resource(cmd) {
            if (cmd.LoadImage) {
                let id = cmd.LoadImage.id;
                let file = cmd.LoadImage.filepath;
                sprite_loader.load_sprite(id, `assets/${file}`)
                    .then((load_info) => {
                        app.image_loaded(load_info);
                    })
            } else {
                console.error("resource command not recognized:", cmd, typeof cmd);
            }
        }

        // Commands
        function handle_commands(commands) {
            for (let command of commands) {
                if (command.Render) {
                    render_to_canvas(command.Render);
                } else if (command.Resource) {
                    load_resource(command.Resource);
                } else {
                    console.error("command not recognized:", command, typeof command);
                }
            }
        }

        // Init render size
        let canvas_rect = canvas.getBoundingClientRect();
        app.set_canvas_size(canvas_rect.width, canvas_rect.height);

        // Hookup events
        document.onmousemove = function (ev) {
            let canvas_rect = canvas.getBoundingClientRect();
            let rel_x = ev.clientX - canvas_rect.left;
            let rel_y = ev.clientY - canvas_rect.top;

            app.mouse_move(rel_x, rel_y);
        }
        function convert_keycode(keycode) {
            if (typeof keycode !== "string") {
                console.warn("bad keycode", keycode);
                return "Key0";
            }
            return keycode.replace("Digit", "Key");
        }
        window.onkeydown = function (ev) {
            if (ev.repeat) return;
            let button = convert_keycode(ev.code);
            app.button_pressed(button);
        }
        window.onkeyup = function (ev) {
            if (ev.repeat) return;
            let button = convert_keycode(ev.code);
            app.button_released(button);
        }

        // TODO requestAnimationFrame

        // Main loop
        setInterval(function () {
            let v = app.update(0.01666);
            handle_commands(v);
        }, 16);

    });