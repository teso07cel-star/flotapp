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
    <title>Guía de Inducción FlotApp | Transformación Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --neon-blue: #00f2ff;
            --neon-purple: #bc13fe;
            --bg-dark: #020617;
        }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-dark); color: #f8fafc; scroll-behavior: smooth; overflow-x: hidden; }
        .font-futuristic { font-family: 'Orbitron', sans-serif; }
        
        /* BACKGROUND PARTICLES EFFECT */
        .bg-grid {
            mask-image: radial-gradient(circle at center, black, transparent 80%);
            background-image: 
                linear-gradient(to right, rgba(0, 242, 255, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 242, 255, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .section { min-height: 100vh; padding: 4rem 2rem; position: relative; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* COVER STYLES */
        .glow-text {
            text-shadow: 0 0 20px rgba(0, 242, 255, 0.5), 0 0 40px rgba(0, 242, 255, 0.2);
        }
        .reveal-loader {
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--neon-blue), transparent);
            animation: load 3s ease-in-out infinite;
        }
        @keyframes load {
            0% { width: 0; left: 0; }
            50% { width: 100%; left: 0; }
            100% { width: 0; left: 100%; }
        }

        .card { 
            background: rgba(15, 23, 42, 0.6); 
            border: 1px solid rgba(0, 242, 255, 0.1); 
            border-radius: 2rem; 
            padding: 2.5rem; 
            backdrop-filter: blur(20px); 
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .card:hover {
            border-color: var(--neon-blue);
            box-shadow: 0 0 30px rgba(0, 242, 255, 0.1);
            transform: translateY(-10px);
        }

        .step-badge { 
            display: inline-block; 
            padding: 0.5rem 1.5rem; 
            background: linear-gradient(90deg, #2563eb, #7c3aed); 
            color: #fff; 
            border-radius: 12px; 
            font-weight: 900; 
            text-transform: uppercase; 
            letter-spacing: 0.2em; 
            font-size: 0.7rem; 
            margin-bottom: 2rem; 
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
        }

        .img-panel { 
            border-radius: 2.5rem; 
            overflow: hidden; 
            border: 4px solid rgba(255,255,255,0.05); 
            box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5); 
            background: #000; 
            transition: transform 0.8s ease;
        }
        .img-panel:hover img { transform: scale(1.05); }
        .img-panel img { transition: transform 0.8s ease; }

        .highlight { border: 3px solid var(--neon-blue); box-shadow: 0 0 20px var(--neon-blue); border-radius: 50%; position: absolute; animation: pulse 2s infinite; pointer-events: none; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }

        /* PRINT */
        @media print {
            .section { height: 100vh; page-break-after: always; padding: 2rem; background: white; color: black; border: none; }
            .card { background: white; border: 1px solid #ddd; box-shadow: none; color: black; }
            .step-badge { background: #2563eb; color: white; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
            body { background: white; color: black; }
            h1, h2, h3 { color: black !important; }
            p, li { color: #333 !important; }
        }
    </style>
</head>
<body>
    <!-- FUTURISTIC COVER -->
    <section class="section flex flex-col justify-center items-center text-center overflow-hidden">
        <div class="absolute inset-0 bg-grid opacity-30 z-0"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full z-0"></div>
        
        <div class="container relative z-10 space-y-8 animate-in fade-in zoom-in duration-1000">
            <div class="inline-flex p-1 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-3xl mb-4 group hover:rotate-6 transition-transform duration-500">
                <div class="bg-slate-950 p-6 rounded-[calc(1.5rem-4px)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#blue-purple-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <defs>
                            <linearGradient id="blue-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#00f2ff;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#bc13fe;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-2">
                <p class="font-futuristic text-cyan-400 font-bold uppercase tracking-[0.5em] text-sm animate-pulse">Iniciando protocolo de inducción...</p>
                <h1 class="font-futuristic text-7xl md:text-9xl font-black tracking-tighter leading-none text-white glow-text">
                    FLOT<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">APP</span>
                </h1>
            </div>

            <div class="max-w-2xl mx-auto space-y-6">
                <div class="relative h-1 w-64 mx-auto bg-slate-800 rounded-full overflow-hidden">
                    <div class="reveal-loader absolute inset-0"></div>
                </div>
                <p class="text-xl text-gray-400 font-medium leading-relaxed">
                    Bienvenido a la herramienta que está <span class="text-white font-bold">transformando</span> la gestión logística de nuestra compañía. Empezamos de a poco, para llegar a <span class="text-cyan-400 font-bold">mucho</span>.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-16 no-print max-w-4xl mx-auto">
                <a href="#interno" class="group relative card text-left overflow-hidden">
                    <div class="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p class="font-futuristic text-cyan-400 font-black uppercase text-[10px] tracking-widest mb-2">Acceso de Red</p>
                    <h3 class="text-3xl font-black text-white group-hover:translate-x-2 transition-transform">CHOFER INTERNO &rarr;</h3>
                    <p class="text-gray-500 mt-4 text-sm font-medium leading-tight">Personal de planta y operativa estratégica diaria.</p>
                </a>
                <a href="#externo" class="group relative card text-left overflow-hidden">
                    <div class="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p class="font-futuristic text-purple-400 font-black uppercase text-[10px] tracking-widest mb-2">Acceso de Terceros</p>
                    <h3 class="text-3xl font-black text-white group-hover:translate-x-2 transition-transform">PROVEEDOR EXT. &rarr;</h3>
                    <p class="text-gray-500 mt-4 text-sm font-medium leading-tight">Transportistas tercerizados y servicios de distribución.</p>
                </a>
            </div>
        </div>
    </section>

    <!-- INTERNAL SECTION -->
    <div id="interno" class="h-1 bg-gradient-to-r from-cyan-500 to-transparent no-print"></div>
    <section class="section py-32">
        <div class="container space-y-40">
            <div class="flex flex-col items-center text-center space-y-4">
                <div class="h-12 w-1 bg-cyan-500 rounded-full"></div>
                <h2 class="font-futuristic text-6xl font-black text-white uppercase tracking-tighter">01. Operativa Interna</h2>
                <div class="h-1 w-64 bg-slate-800 rounded-full"></div>
            </div>

            <!-- PASO 1 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8 animate-in slide-in-from-left duration-1000">
                    <span class="step-badge">Paso 01</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Identidad y Biometría Digital</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        El primer paso hacia la eficiencia. Buscá tu nombre en la red y, una vez validado, usá tu <span class="text-cyan-400 italic font-bold">huella digital</span> para accesos futuros en milisegundos.
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-6 p-4 bg-slate-900/40 rounded-[3rem] border border-white/5">
                    <div class="img-panel scale-95 hover:scale-100 transition-transform"><img src="${images.interno.lista}" class="w-full"></div>
                    <div class="img-panel scale-95 hover:scale-100 transition-transform"><img src="${images.interno.huella}" class="w-full"></div>
                </div>
            </div>

            <!-- PASO 2 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="img-panel order-last lg:order-first border-cyan-500/20">
                    <img src="${images.interno.unidad}" class="w-full">
                </div>
                <div class="space-y-8">
                    <span class="step-badge">Paso 02</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Asignación de Activo</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Vinculá tu servicio con la **Patente** exacta. La precisión aquí permite que la compañía optimice el mantenimiento predictivo de tu unidad.
                    </p>
                </div>
            </div>

            <!-- PASO 3 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8">
                    <span class="step-badge">Paso 03</span>
                    <h3 class="text-5xl font-black text-cyan-400 leading-tight">Sincronización de Odómetro</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Cargá el kilometraje actual. El sistema cruza datos en tiempo real con el último reporte para evitar discrepancias y asegurar la integridad de la base de datos.
                    </p>
                </div>
                <div class="img-panel relative">
                    <img src="${images.interno.km}" class="w-full">
                    <div class="highlight" style="top:55%; left:50%; width: 180px; height: 60px; margin-left: -90px;"></div>
                </div>
            </div>

            <!-- PASO 4 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="img-panel order-last lg:order-first relative">
                    <img src="${images.interno.sucursales}" class="w-full">
                    <div class="highlight" style="top:55%; left:30%; width: 60px; height: 60px;"></div>
                </div>
                <div class="space-y-8">
                    <span class="step-badge">Paso 04</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Itinerario Dinámico</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Marcá tus paradas tácticas. Cada sucursal tildada genera un punto de control que permite a la gerencia visualizar el progreso de la ruteada en vivo.
                    </p>
                </div>
            </div>

            <!-- PASO 5 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8">
                    <span class="step-badge">Paso 05</span>
                    <h3 class="text-5xl font-black text-cyan-400 font-bold italic">Flujo Flash (Hiper-Velocidad)</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        La inteligencia de FlotApp reconoce tu sesión activa. Si cambias de unidad durante el mismo turno, entrás con <span class="text-white font-bold">1 solo clic</span> sin repetir formularios.
                    </p>
                </div>
                <div class="img-panel relative group">
                    <img src="${images.interno.flash}" class="w-full">
                    <div class="highlight" style="top:75%; left:65%; width: 140px; height: 60px;"></div>
                </div>
            </div>

            <!-- PASO 6 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="grid grid-cols-2 gap-6 order-last lg:order-first">
                    <div class="img-panel"><img src="${images.interno.cerrar}" class="w-full"></div>
                    <div class="img-panel"><img src="${images.interno.finalizar}" class="w-full"></div>
                </div>
                <div class="space-y-8">
                    <span class="step-badge bg-rose-600">Paso 06</span>
                    <h3 class="text-5xl font-black text-rose-500 leading-tight">Cierre de Telemetría</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Al finalizar, declarás KM final y combustible. Tu ubicación se encripta y se guarda para el cierre de auditoría diario.
                    </p>
                    <div class="p-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 italic text-sm text-rose-300">
                        Protocolo: "Finalizar Transmisión" &rarr; Datos asegurados en la nube.
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- EXTERNAL SECTION -->
    <div id="externo" class="h-1 bg-gradient-to-r from-purple-500 to-transparent no-print"></div>
    <section class="section py-32 bg-slate-900/20">
        <div class="container space-y-40">
            <div class="flex flex-col items-center text-center space-y-4">
                <div class="h-12 w-1 bg-purple-500 rounded-full"></div>
                <h2 class="font-futuristic text-6xl font-black text-white uppercase tracking-tighter">02. Red de Proveedores</h2>
                <div class="h-1 w-64 bg-slate-800 rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8">
                    <span class="step-badge bg-purple-600">Acceso</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Portal Logístico Externo</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Validación mediante **Patente y Nombre**. Esta conexión permite al transportista tercerizado integrarse al ecosistema digital de la empresa sin fricciones.
                    </p>
                </div>
                <div class="img-panel border-purple-500/20">
                    <img src="${images.externo.patente}" class="w-full">
                </div>
            </div>

            <!-- AUDITORIA -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="img-panel order-last lg:order-first relative">
                    <img src="${images.externo.fotos}" class="w-full">
                    <div class="highlight" style="top:50%; left:50%; width: 220px; height: 160px; margin-left: -110px; margin-top: -80px;"></div>
                </div>
                <div class="space-y-8">
                    <span class="step-badge bg-purple-600">Certificación</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Auditoría Visual Mensual</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Exigimos excelencia. Una vez al mes, la app activa la grilla de cámaras para capturar el estado físico de la unidad. 
                    </p>
                    <p class="text-lg font-bold text-purple-400 italic">8 Puntos de control visual requeridos.</p>
                </div>
            </div>

            <!-- DOCS -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="space-y-8">
                    <span class="step-badge bg-purple-600">Vigencia</span>
                    <h3 class="text-5xl font-black text-white leading-tight">Control de Caducidad</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Carga inteligente de vencimientos (VTV/Seguro). El sistema genera alertas automáticas 15 días antes para asegurar que nunca te quedes fuera de ruta.
                    </p>
                </div>
                <div class="img-panel"><img src="${images.externo.fechas}" class="w-full"></div>
            </div>

            <!-- CHECKIN DIARIO -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div class="img-panel order-last lg:order-first relative border-emerald-500/20">
                    <img src="${images.externo.checkin}" class="w-full">
                    <div class="highlight" style="top:75%; left:50%; width: 220px; height: 100px; margin-left: -110px; margin-top: -50px;"></div>
                </div>
                <div class="space-y-8">
                    <span class="step-badge bg-emerald-600">Operación</span>
                    <h3 class="text-5xl font-black text-emerald-500 italic">One-Tap Check-In</h3>
                    <p class="text-xl text-gray-400 leading-relaxed font-medium">
                        Para el transportista diario, el tiempo es dinero. Con auditoría al día, el ingreso es instantáneo mediante el pulsador biométrico virtual.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- FUTURISTIC FOOTER -->
    <section class="section text-center flex flex-col justify-center items-center overflow-hidden bg-slate-950">
        <div class="absolute inset-0 bg-grid opacity-10"></div>
        <div class="container space-y-16 relative z-10">
            <h2 class="font-futuristic text-7xl md:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">
                EL FUTURO<br>ESTÁ EN MARCHA
            </h2>
            <div class="max-w-2xl mx-auto space-y-8">
                <p class="text-gray-500 text-xl font-medium">
                    FlotApp no es solo una aplicación; es el inicio de una nueva era de transparencia y eficiencia operativa. Gracias por ser parte de este cambio.
                </p>
                <div class="pt-8 no-print">
                    <button onclick="window.print()" class="group relative px-16 py-8 bg-white text-black font-futuristic font-black rounded-2xl hover:bg-cyan-400 transition-all overflow-hidden uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        <span class="relative z-10">Exportar Master PDF</span>
                        <div class="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </button>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;

fs.writeFileSync(masterHtmlFile, content);

console.log('Guía Maestra FUTURISTA generada con éxito.');
