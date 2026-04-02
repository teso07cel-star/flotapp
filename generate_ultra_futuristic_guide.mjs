import fs from 'fs';
import path from 'path';

const assetsDir = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\scratch\\flota-app\\docs\\manuals\\assets';
const masterHtmlFile = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\scratch\\flota-app\\Guia_Induccion_FlotApp.html';

function getBase64(file) {
    const filePath = path.join(assetsDir, file);
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return '';
    }
    const bitmap = fs.readFileSync(filePath);
    return `data:image/png;base64,${bitmap.toString('base64')}`;
}

const images = {
    interno: {
        lista: getBase64('2_interno_lista.png'),
        huella: getBase64('3_interno_huella.png'),
        unidad: getBase64('4_interno_unidad.png'),
        km: getBase64('5_interno_km.png'),
        sucursales: getBase64('interno_sucursales.png'),
        flash: getBase64('7_interno_rapido.png'),
        cerrar: getBase64('8_interno_cerrar.png'),
        finalizar: getBase64('9_interno_finalizar.png')
    },
    externo: {
        portal: getBase64('1_externo_portal.png'),
        patente: getBase64('2_externo_patente.png'),
        bitacora: getBase64('3_externo_bitacora.png'),
        fotos: getBase64('externo_auditoria_fotos.png'),
        fechas: getBase64('externo_auditoria_fechas.png'),
        checkin: getBase64('4_externo_checkin.png'),
        km: getBase64('5_externo_km.png'),
        checkout: getBase64('6_externo_finalizar.png')
    }
};

const content = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guía de Inducción FlotApp | El Futuro está en Marcha</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --neon-blue: #00f2ff;
            --neon-purple: #bc13fe;
            --deep-slate: #020617;
            --accent-green: #10b981;
        }
        
        * { cursor: default; }
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: var(--deep-slate); 
            color: #f8fafc; 
            scroll-behavior: smooth; 
            overflow-x: hidden;
            margin: 0;
        }

        .font-futuristic { font-family: 'Orbitron', sans-serif; }

        /* GRID ANIMATION */
        .bg-matrix {
            position: fixed;
            inset: 0;
            background-image: 
                linear-gradient(rgba(0, 242, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 242, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
            z-index: -1;
            transform: perspective(500px) rotateX(60deg);
            transform-origin: top;
            animation: moveGrid 20s linear infinite;
        }
        @keyframes moveGrid {
            0% { background-position: 0 0; }
            100% { background-position: 0 1000px; }
        }

        .hero-glow {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            height: 60vh;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
            filter: blur(80px);
            z-index: -1;
        }

        .section { min-height: 100vh; padding: 6rem 2rem; position: relative; }
        .container { max-width: 1200px; margin: 0 auto; z-index: 10; }

        /* HUD PANEL STYLE */
        .hud-panel {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(0, 242, 255, 0.2);
            border-radius: 1.5rem;
            padding: 3rem;
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
        }
        .hud-panel::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, var(--neon-blue), transparent);
            animation: scanline 4s linear infinite;
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }

        .glow-text {
            text-shadow: 0 0 15px rgba(0, 242, 255, 0.6);
        }

        /* LOADING PROTOCOL */
        .loading-bar {
            height: 4px;
            background: #1e293b;
            border-radius: 10px;
            overflow: hidden;
            width: 100%;
            max-width: 300px;
            margin: 2rem auto;
        }
        .loading-progress {
            height: 100%;
            background: linear-gradient(90deg, var(--neon-blue), var(--neon-purple));
            width: 40%;
            animation: progressMove 2s ease-in-out infinite alternate;
        }
        @keyframes progressMove {
            0% { transform: translateX(-100%); width: 20%; }
            50% { width: 60%; }
            100% { transform: translateX(200%); width: 20%; }
        }

        /* CARDS */
        .access-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .access-card:hover {
            transform: translateY(-12px) scale(1.02);
            border-color: var(--neon-blue);
            box-shadow: 0 20px 40px -10px rgba(0, 242, 255, 0.2);
        }

        .img-viewport {
            border-radius: 2rem;
            border: 6px solid #0f172a;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            background: #000;
            overflow: hidden;
        }
        .img-viewport img {
            transition: transform 0.6s ease;
        }
        .img-viewport:hover img {
            transform: scale(1.03);
        }

        .badge-futuristic {
            background: rgba(0, 242, 255, 0.1);
            border-left: 4px solid var(--neon-blue);
            padding: 0.5rem 1.5rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: var(--neon-blue);
            margin-bottom: 1.5rem;
            display: inline-block;
        }

        .scroll-indicator {
            position: absolute;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            animation: bounce 2s infinite;
        }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);} 40% {transform: translateY(-10px) translateX(-50%);} 60% {transform: translateY(-5px) translateX(-50%);} }

        /* PRINT */
        @media print {
            .bg-matrix, .hero-glow, .scroll-indicator, .no-print { display: none; }
            body { background: white; color: black; }
            .hud-panel { background: white; border: 1px solid #ccc; color: black; }
            .section { min-height: auto; page-break-after: always; padding: 2rem; }
            h1, h2, h3, p { color: black !important; text-shadow: none !important; }
            .img-viewport { border: 2px solid #ccc; }
        }
    </style>
</head>
<body>
    <div class="bg-matrix"></div>
    <div class="hero-glow"></div>

    <!-- HERO SECTION -->
    <section class="section flex flex-col justify-center items-center text-center">
        <div class="container space-y-10">
            <!-- LOGO ICON -->
            <div class="inline-block p-1 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                <div class="bg-slate-950 p-8 rounded-[calc(1.5rem-2px)]">
                    <svg class="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
            </div>

            <div class="space-y-4">
                <p class="font-futuristic text-cyan-500 font-bold uppercase tracking-[0.6em] text-xs opacity-80">Syncing Corporate Protocol v1.0.0</p>
                <h1 class="font-futuristic text-7xl md:text-9xl font-black tracking-tighter leading-none text-white glow-text">
                    FLOT<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">APP</span>
                    <br><span class="text-4xl md:text-5xl opacity-40">GUÍA DE INDUCCIÓN</span>
                </h1>
            </div>

            <div class="max-w-2xl mx-auto space-y-8">
                <div class="loading-bar"><div class="loading-progress"></div></div>
                <p class="text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
                    Usted está ingresando a la herramienta que está <span class="text-white font-bold border-b-2 border-cyan-500 pb-1">cambiando esta compañía</span>. 
                    Empezamos de a poco, para llegar a <span class="text-cyan-400 font-black italic">MUCHO</span>.
                </p>
                <p class="text-sm font-futuristic text-slate-500 uppercase tracking-widest">Transformación Digital e Inteligencia Logística</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 no-print max-w-4xl mx-auto w-full">
                <a href="#interno" class="hud-panel access-card text-left group">
                    <div class="flex justify-between items-start mb-6">
                        <span class="font-futuristic text-[10px] text-cyan-500 bg-cyan-500/10 px-2 py-1">AUTH: LEVEL 01</span>
                        <svg class="w-6 h-6 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <h3 class="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">CHOFER INTERNO</h3>
                    <p class="text-slate-400 mt-4 text-sm leading-tight">Operativa de ruteo, gestión de sucursales y paradas de guardia.</p>
                </a>
                <a href="#externo" class="hud-panel access-card text-left group">
                    <div class="flex justify-between items-start mb-6">
                        <span class="font-futuristic text-[10px] text-purple-500 bg-purple-500/10 px-2 py-1">AUTH: EXTERNAL</span>
                        <svg class="w-6 h-6 text-slate-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </div>
                    <h3 class="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">PROVEEDOR EXT.</h3>
                    <p class="text-slate-400 mt-4 text-sm leading-tight">Control de auditoría, documentación y check-in logístico.</p>
                </a>
            </div>
        </div>

        <div class="scroll-indicator no-print">
            <svg class="w-8 h-8 text-cyan-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>
    </section>

    <!-- SECTION 01: INTERNAL -->
    <section id="interno" class="section">
        <div class="container space-y-32">
            <div class="flex items-center space-x-10">
                <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent to-cyan-500/50"></div>
                <h2 class="font-futuristic text-5xl md:text-7xl font-black text-center text-white">01. RUTA INTERNA</h2>
                <div class="flex-1 h-[2px] bg-gradient-to-l from-transparent to-cyan-500/50"></div>
            </div>

            <!-- PASO 1 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="space-y-6">
                    <div class="badge-futuristic">Identificación</div>
                    <h3 class="text-5xl font-black text-white">Fase de Autenticación</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        Seleccione su identidad de la terminal central. Una vez validado, active el **sensor biométrico** para ingresos instantáneos. La vanguardia en seguridad protege su acceso.
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="img-viewport"><img src="${images.interno.lista}" class="w-full"></div>
                    <div class="img-viewport"><img src="${images.interno.huella}" class="w-full"></div>
                </div>
            </div>

            <!-- PASO 2: KM -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="img-viewport order-last lg:order-first relative">
                    <img src="${images.interno.km}" class="w-full">
                    <div class="absolute inset-0 border-2 border-cyan-500/30 rounded-2xl pointer-events-none"></div>
                </div>
                <div class="space-y-6">
                    <div class="badge-futuristic">Metría Inicial</div>
                    <h3 class="text-5xl font-black text-cyan-400">Captura de Odómetro</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        El sistema requiere la lectura exacta del kilometraje previo al despacho. Esta métrica es vital para el cálculo de eficiencia y mantenimiento predictivo.
                    </p>
                </div>
            </div>

            <!-- PASO 3: BRANCHES -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="space-y-6">
                    <div class="badge-futuristic">Logística Táctica</div>
                    <h3 class="text-5xl font-black text-white italic">Itinerario de Sucursales</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        Cumpla su hoja de ruta marcando cada sucursal visitada. La plataforma rastrea el progreso en tiempo real, optimizando los tiempos de entrega generales.
                    </p>
                </div>
                <div class="img-viewport">
                    <img src="${images.interno.sucursales}" class="w-full">
                </div>
            </div>

            <!-- PASO 4: FLASH FLOW -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="img-viewport order-last lg:order-first border-emerald-500/30">
                    <img src="${images.interno.flash}" class="w-full">
                </div>
                <div class="space-y-6">
                    <div class="badge-futuristic">Alta Velocidad</div>
                    <h3 class="text-5xl font-black text-emerald-400">Flujo Flash de Re-ingreso</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        Evite redundancias. Si el sistema detecta su sesión activa tras un cambio de turno o unidad, podrá continuar con **un solo toque**. La tecnología al servicio de su tiempo.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- SECTION 02: EXTERNAL -->
    <section id="externo" class="section bg-slate-900/40">
        <div class="container space-y-32">
            <div class="flex items-center space-x-10">
                <div class="flex-1 h-[2px] bg-gradient-to-r from-transparent to-purple-500/50"></div>
                <h2 class="font-futuristic text-5xl md:text-7xl font-black text-center text-white">02. RED DE TERCEROS</h2>
                <div class="flex-1 h-[2px] bg-gradient-to-l from-transparent to-purple-500/50"></div>
            </div>

            <!-- EX-PASO 1 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="space-y-6">
                    <div class="badge-futuristic !border-purple-500 !text-purple-500">Validación</div>
                    <h3 class="text-5xl font-black text-white">Portal de Tercerizados</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        El ingreso se realiza mediante **Patente de Unidad**. Este identificador único vincula sus servicios y cobros directamente con nuestra base de datos centralizada.
                    </p>
                </div>
                <div class="img-viewport">
                    <img src="${images.externo.patente}" class="w-full">
                </div>
            </div>

            <!-- EX-PASO 2: AUDIT -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="img-viewport order-last lg:order-first border-red-500/20">
                    <img src="${images.externo.fotos}" class="w-full">
                </div>
                <div class="space-y-6">
                    <div class="badge-futuristic !border-red-500 !text-red-500">Control Crítico</div>
                    <h3 class="text-5xl font-black text-white leading-tight">Auditoría de 8 Cámaras</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        Garantice su calidad. La auditoría visual mensual es **obligatoria**. Capture imágenes de todos los ángulos para asegurar que su unidad cumple con los estándares operativos corporativos.
                    </p>
                    <div class="p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 font-bold text-sm tracking-widest italic">
                        REQUISITO BLOQUEANTE PARA EL COBRO DE FLETES
                    </div>
                </div>
            </div>

            <!-- EX-PASO 3: CHECKIN -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div class="space-y-6">
                    <div class="badge-futuristic !border-emerald-500 !text-emerald-500">Optimización</div>
                    <h3 class="text-5xl font-black text-emerald-400 italic">One-Touch Check-In</h3>
                    <p class="text-lg text-slate-400 leading-relaxed">
                        Si sus documentos y auditorías están en regla, su ingreso diario se reduce a un solo botón gigante. Eficiencia logística aplicada a su jornada.
                    </p>
                </div>
                <div class="img-viewport border-emerald-500/20">
                    <img src="${images.externo.checkin}" class="w-full">
                </div>
            </div>
        </div>
    </section>

    <!-- MASTER FOOTER -->
    <section class="section flex flex-col justify-center items-center text-center overflow-hidden">
        <div class="container space-y-16 py-32">
            <div class="space-y-4">
                <h2 id="final-tag" class="font-futuristic text-7xl md:text-9xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-600 glow-text">
                    EL FUTURO<br>ESTÁ EN MARCHA
                </h2>
                <div class="h-1 w-full max-w-4xl mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>

            <div class="max-w-3xl mx-auto space-y-12">
                <p class="text-2xl text-slate-400 font-light italic">
                    "FlotApp no es solo software, es el nuevo estándar de transparencia para nuestra logística."
                </p>
                <div class="pt-8 no-print">
                    <button onclick="window.print()" class="group relative px-20 py-10 bg-white text-black font-futuristic font-black rounded-none skew-x-[-15deg] hover:bg-cyan-400 transition-all overflow-hidden uppercase tracking-[0.4em] shadow-[10px_10px_0_rgba(0,242,255,1)] hover:shadow-[0_0_50px_rgba(0,242,255,0.8)]">
                        <span class="relative z-10 block skew-x-[15deg]">DESCARGAR MASTER PDF</span>
                        <div class="absolute inset-0 bg-cyan-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    </button>
                </div>
            </div>
            
            <p class="pt-24 text-slate-600 font-futuristic text-[10px] tracking-[0.8em]">END OF PROTOCOL | FLOTAPP CORPORATE 2026</p>
        </div>
    </section>
</body>
</html>`;

fs.writeFileSync(masterHtmlFile, content);

console.log('Guía Maestra ULTRA-FUTURISTA generada con éxito.');
