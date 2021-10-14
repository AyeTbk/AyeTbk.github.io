import wasm_init, { App } from "./game_wasm.js";
import { SpriteLoader } from "./sprite_loader.js";
import { version } from "./version.js";

// Display version
document.getElementById("version").innerText = version

// Init wasm stuff
wasm_init()
    .then(() => {
        let sprite_loader = new SpriteLoader();

        let app = new App();

        // Patch some browser stuff out
        document.body.oncontextmenu = function () { return false; };

        // Init canvas
        let canvas = document.getElementById("canvas")
        let ctx = canvas.getContext('2d', { alpha: false });

        function color_to_css({ r, g, b, a }) {
            const gamma = 1.0 / 2.2;
            const rr = Math.floor(Math.pow(r, gamma) * 255);
            const gg = Math.floor(Math.pow(g, gamma) * 255);
            const bb = Math.floor(Math.pow(b, gamma) * 255);
            return `rgba(${rr}, ${gg}, ${bb}, ${a})`;
        }

        function render_to_canvas(cmd) {
            if (cmd.Sprite) {
                let pos = cmd.Sprite.position;
                let filepath = cmd.Sprite.filepath;

                let image = sprite_loader.get_sprite(`assets/${filepath}`);
                if (image === null) return;

                ctx.drawImage(image, pos.x, pos.y);
            } else if (cmd.Polygon) {
                ctx.strokeStyle = color_to_css(cmd.Polygon.color);
                ctx.fillStyle = color_to_css({ ...cmd.Polygon.color, a: 0.5 });

                let start = cmd.Polygon.vertices[0]
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                for (let vert of cmd.Polygon.vertices) {
                    ctx.lineTo(vert.x, vert.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (cmd.Text) {
                let color = color_to_css(cmd.Text.color);
                ctx.fillStyle = color;
                let pos = cmd.Text.position;
                ctx.font = '12px sans-serif';
                ctx.fillText(cmd.Text.text, pos.x, pos.y);
            } else if (cmd.Camera) {
                ctx.scale(cmd.Camera.zoom.x, cmd.Camera.zoom.y);
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

            // Reset canvas transform
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        // Init render size
        function update_canvas_size() {
            let canvas_rect = canvas.getBoundingClientRect();
            canvas.width = canvas_rect.width;
            canvas.height = canvas_rect.height;
            app.set_canvas_size(canvas.width, canvas.height);

            ctx.imageSmoothingEnabled = false; // No filtering
        }
        update_canvas_size();

        // Hookup events
        window.onresize = function (ev) {
            update_canvas_size();
        }
        document.onmousemove = function (ev) {
            let canvas_rect = canvas.getBoundingClientRect();
            let rel_x = ev.clientX - canvas_rect.left;
            let rel_y = ev.clientY - canvas_rect.top;

            app.mouse_move(rel_x, rel_y);
        }
        function convert_mouse_button(button) {
            switch (button) {
                case 0: return "MouseLeft";
                case 2: return "MouseRight";
                case 1: return "MouseMiddle";
            }
        }
        window.onmousedown = function (ev) {
            app.button_pressed(convert_mouse_button(ev.button));
        }
        window.onmouseup = function (ev) {
            app.button_released(convert_mouse_button(ev.button));
        }
        function convert_keycode(keycode) {
            if (typeof keycode !== "string") {
                console.warn("bad keycode", keycode);
                return "Key0";
            }
            return keycode.replace("Digit", "Key");
        }
        window.onkeydown = function (ev) {
            if (ev.code !== "F12") {
                ev.preventDefault();
            }
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
            try {
                let v = app.update(0.01666);
                handle_commands(v);
            } catch {
                alert("Uh oh... my trash code caused an exception, see console.");
            }
        }, 16);

    });