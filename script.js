<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Juego 3D: Recolector Neón</title>
    <!-- Importamos PlayCanvas -->
    <script src="https://code.playcanvas.com/playcanvas-stable.min.js"></script>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background-color: #000; }
        canvas { display: block; width: 100vw; height: 100vh; }
        #interfaz {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            font-family: system-ui, sans-serif;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #ffe58a;
            box-shadow: 0 0 15px #ffe58a44;
        }
        #puntos { color: #ffe58a; font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>

    <div id="interfaz">
        Puntos: <span id="puntos">0</span><br>
        <span style="font-size: 14px; color: #a2aec9;">Usa FLECHAS o WASD para atrapar el cubo</span>
    </div>

    <!-- Pizarra 3D -->
    <canvas id="mundo3D"></canvas>

    <script>
        // 1. INICIALIZAR MOTOR Y TECLADO
        const canvas = document.getElementById('mundo3D');
        const spanPuntos = document.getElementById('puntos');
        const app = new pc.Application(canvas, { keyboard: new pc.Keyboard(window) });
        app.start();
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        app.setCanvasResolution(pc.RESOLUTION_AUTO);
        window.addEventListener('resize', () => app.resizeCanvas());

        // 2. ESCENARIO: Cámara, Luz y Suelo
        const camara = new pc.Entity();
        camara.addComponent('camera', { clearColor: new pc.Color(0.05, 0.08, 0.15) });
        camara.setPosition(0, 10, 14);
        camara.lookAt(0, 0, 0);
        app.root.addChild(camara);

        const luz = new pc.Entity();
        luz.addComponent('light', { type: 'directional', color: new pc.Color(1, 1, 1), intensity: 1.2 });
        luz.setEulerAngles(45, 30, 0);
        app.root.addChild(luz);

        const suelo = new pc.Entity();
        suelo.addComponent('render', { type: 'plane' });
        suelo.setLocalScale(20, 1, 20); // Plataforma de 20x20
        const matSuelo = new pc.StandardMaterial();
        matSuelo.diffuse.set(0.1, 0.15, 0.3); // Azul oscuro
        matSuelo.update();
        suelo.render.material = matSuelo;
        app.root.addChild(suelo);

        // 3. JUGADOR (Esfera Cian)
        const jugador = new pc.Entity();
        jugador.addComponent('render', { type: 'sphere' });
        jugador.setPosition(0, 0.5, 0);
        const matJugador = new pc.StandardMaterial();
        matJugador.diffuse.set(0.2, 0.9, 0.8); // Color Cian
        matJugador.update();
        jugador.render.material = matJugador;
        app.root.addChild(jugador);

        // 4. OBJETIVO (Cubo Dorado)
        const objetivo = new pc.Entity();
        objetivo.addComponent('render', { type: 'box' });
        objetivo.setLocalScale(0.6, 0.6, 0.6); // Más pequeño que el jugador
        const matObj = new pc.StandardMaterial();
        matObj.diffuse.set(1, 0.8, 0.2); // Dorado
        matObj.update();
        objetivo.render.material = matObj;
        app.root.addChild(objetivo);

        let puntos = 0;

        // Función para cambiar el cubo a una coordenada aleatoria en la plataforma
        function moverObjetivo() {
            let xAleatorio = (Math.random() - 0.5) * 18; // Entre -9 y 9
            let zAleatorio = (Math.random() - 0.5) * 18; // Entre -9 y 9
            objetivo.setPosition(xAleatorio, 0.5, zAleatorio);
        }
        moverObjetivo(); // Posicionar al inicio

        // 5. BUCLE DEL JUEGO
        app.on('update', function (dt) {
            // Movimiento del jugador
            let velocidad = 10 * dt;
            let x = 0; let z = 0;

            if (app.keyboard.isPressed(pc.KEY_LEFT) || app.keyboard.isPressed(pc.KEY_A)) x -= velocidad;
            if (app.keyboard.isPressed(pc.KEY_RIGHT) || app.keyboard.isPressed(pc.KEY_D)) x += velocidad;
            if (app.keyboard.isPressed(pc.KEY_UP) || app.keyboard.isPressed(pc.KEY_W)) z -= velocidad;
            if (app.keyboard.isPressed(pc.KEY_DOWN) || app.keyboard.isPressed(pc.KEY_S)) z += velocidad;

            jugador.translate(x, 0, z);
            
            // Animación: Hacer que el cubo dorado flote y gire
            objetivo.rotate(45 * dt, 90 * dt, 0);
            // Efecto de flotación usando la función matemática Seno
            let alturaFlotando = 0.5 + Math.sin(app.time * 3) * 0.2;
            objetivo.setLocalPosition(objetivo.getPosition().x, alturaFlotando, objetivo.getPosition().z);

            // 6. DETECCIÓN DE COLISIONES MATEMÁTICA
            // En 3D, medimos la distancia entre el centro de la esfera y el centro del cubo
            let posJugador = jugador.getPosition();
            let posObj = objetivo.getPosition();
            
            // Teorema de Pitágoras para calcular la distancia en el suelo (Ejes X y Z)
            let dx = posJugador.x - posObj.x;
            let dz = posJugador.z - posObj.z;
            let distancia = Math.sqrt(dx * dx + dz * dz);

            // Si la distancia es menor a 1 metro, significa que se tocaron
            if (distancia < 1.0) {
                puntos++;
                spanPuntos.textContent = puntos;
                moverObjetivo();
            }
        });
    </script>
</body>
</html>