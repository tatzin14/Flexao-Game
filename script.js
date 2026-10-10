
import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

<<<<<<< HEAD
const $ = (selector) => document.querySelector(selector);
const byId = (id) => document.getElementById(id);
=======
/* =========================================
   ELEMENTOS
========================================= */
>>>>>>> origin/main

const video = byId("video");
const canvas = byId("canvas");
const ctx = canvas.getContext("2d");
const loading = byId("loading");
const status = byId("status");
const startButton = byId("startButton");
const resetButton = byId("resetButton");
const counter = byId("counter");
const hpBar = byId("hpBar");
const hpText = byId("hpText");
const scoreElement = byId("score");
const startMenu = byId("startMenu");
const menuStartButton = byId("menuStartButton");
const phaseNumberElement = byId("phaseNumber");
const enemyNameElement = byId("enemyName");
const phaseCompleteScreen = byId("phaseCompleteScreen");
const phaseCompleteIcon = byId("phaseCompleteIcon");
const phaseCompleteText = byId("phaseCompleteText");
const nextPhaseNumber = byId("nextPhaseNumber");
const nextPhaseButton = byId("nextPhaseButton");
const enemyIcon = $(".enemy-icon");
const hitEffect = byId("hitEffect");
const victoryScreen = byId("victoryScreen");
const finalScore = byId("finalScore");
const victoryReset = byId("victoryReset");
const enemyTitle = $(".enemy-info h2");
const hpProgress = byId("hpProgress");

<<<<<<< HEAD
const phases = [
    { number: 1, name: "FANTASMA", icon: "👻", hp: 10 },
    { number: 2, name: "ESQUELETO", icon: "💀", hp: 15 },
    { number: 3, name: "GOBLIN", icon: "👹", hp: 20 },
    { number: 4, name: "ZUMBI", icon: "🧟", hp: 25 },
    { number: 5, name: "BOSS", icon: "👿", hp: 30 }
];

const CONFIG = {
    detectionFps: 20,
    minVisibility: 0.55,
    topAngle: 155,
    bottomAngle: 95,
    minRepDuration: 450,
    maxRepDuration: 6000,
    cooldown: 900,
    requiredStableFrames: 3,
    maxBodyTiltDegrees: 25,
    maxFloorDifference: 0.12,
    minBodyLength: 0.12
};

let detector = null;
let stream = null;
let cameraStarted = false;
let animationFrame = 0;
let lastDetectionTime = 0;
let lastVideoTime = -1;
let isDetecting = false;

let currentPhaseIndex = 0;
let pushUps = 0;
let score = 0;
let hp = phases[0].hp;
let maxHp = phases[0].hp;
let phaseActive = false;
let waitingForPosition = true;
=======
const loading = document.getElementById("loading");
const status = document.getElementById("status");

const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

const counter = document.getElementById("counter");

const hpBar = document.getElementById("hpBar");
const hpText = document.getElementById("hpText");

const score = document.getElementById("score");

const startMenu = document.getElementById("startMenu");
const menuStartButton =
    document.getElementById("menuStartButton");

const phaseNumber =
    document.getElementById("phaseNumber");

const enemyName =
    document.getElementById("enemyName");

const enemyIcon =
    document.querySelector(".enemy-icon");

const phaseCompleteScreen =
    document.getElementById("phaseCompleteScreen");

const phaseCompleteIcon =
    document.getElementById("phaseCompleteIcon");

const phaseCompleteText =
    document.getElementById("phaseCompleteText");

const nextPhaseNumber =
    document.getElementById("nextPhaseNumber");

const nextPhaseButton =
    document.getElementById("nextPhaseButton");

const hitEffect =
    document.getElementById("hitEffect");

const victoryScreen =
    document.getElementById("victoryScreen");

const finalScore =
    document.getElementById("finalScore");

const victoryReset =
    document.getElementById("victoryReset");


/* =========================================
   FASES
========================================= */

const fases = [

    {
        numero: 1,
        nome: "FANTASMA",
        icone: "👻",
        vida: 10
    },

    {
        numero: 2,
        nome: "ESQUELETO",
        icone: "💀",
        vida: 15
    },

    {
        numero: 3,
        nome: "GOBLIN",
        icone: "👹",
        vida: 20
    },

    {
        numero: 4,
        nome: "ZUMBI",
        icone: "🧟",
        vida: 25
    },

    {
        numero: 5,
        nome: "BOSS",
        icone: "👿",
        vida: 30
    }

];


/* =========================================
   ESTADO
========================================= */

let faseAtual = 0;

let vidaInimigo = 0;

let vidaMaxima = 0;

let flexoes = 0;

let pontos = 0;

const pontosPorFlexao = 100;


/* =========================================
   MEDIAPIPE
========================================= */

let poseLandmarker = null;

let detectorPromise = null;

let cameraStream = null;

let processando = false;
>>>>>>> origin/main

let repState = "top";
let smoothedAngle = null;
let lastRepAt = 0;
let downAt = 0;
let stableFrames = 0;
let currentPoseValid = false;
let lastStatus = "";
let lastValidPoseAt = 0;

const connections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
    [24, 26], [26, 28]
];

function setStatus(message) {
    if (message !== lastStatus) {
        status.textContent = message;
        lastStatus = message;
    }
}

<<<<<<< HEAD
function setLoading(message, visible = true) {
    loading.textContent = message;
    loading.style.display = visible ? "block" : "none";
}

async function createDetector() {
    setLoading("Carregando detector de pose...");

    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );

        const modelUrl =
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

        try {
            detector = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: modelUrl,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.6,
                minPosePresenceConfidence: 0.6,
                minTrackingConfidence: 0.6
            });
        } catch {
            detector = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: modelUrl
                },
                runningMode: "VIDEO",
                numPoses: 1,
                minPoseDetectionConfidence: 0.6,
                minPosePresenceConfidence: 0.6,
                minTrackingConfidence: 0.6
            });
        }

        setLoading("Detector pronto!", false);
        startButton.disabled = false;
        menuStartButton.disabled = false;
=======
/* =========================================
   FLEXÃO
========================================= */

let estadoFlexao = "SUBINDO";

let anguloSuaveEsquerdo = 180;

let anguloSuaveDireito = 180;

let ultimaFlexao = 0;

const tempoMinimoEntreFlexoes = 500;


/* =========================================
   CALCULAR ÂNGULO
========================================= */

function calcularAngulo(a, b, c) {

    const ab = {
        x: a.x - b.x,
        y: a.y - b.y
    };

    const cb = {
        x: c.x - b.x,
        y: c.y - b.y
    };

    const produtoEscalar =
        ab.x * cb.x +
        ab.y * cb.y;

    const tamanhoAB =
        Math.sqrt(
            ab.x * ab.x +
            ab.y * ab.y
        );

    const tamanhoCB =
        Math.sqrt(
            cb.x * cb.x +
            cb.y * cb.y
        );

    if (
        tamanhoAB === 0 ||
        tamanhoCB === 0
    ) {
        return 180;
    }

    let cos =
        produtoEscalar /
        (tamanhoAB * tamanhoCB);

    cos = Math.max(
        -1,
        Math.min(1, cos)
    );

    return (
        Math.acos(cos) *
        180 /
        Math.PI
    );
}


/* =========================================
   CRIAR DETECTOR
========================================= */

async function criarDetector() {

    if (poseLandmarker) {
        return poseLandmarker;
    }


    if (detectorPromise) {
        return detectorPromise;
    }


    detectorPromise = (async () => {

        const vision =
            await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
            );


        try {

            poseLandmarker =
                await PoseLandmarker.createFromOptions(
                    vision,
                    {

                        baseOptions: {

                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",

                            delegate: "GPU"

                        },

                        runningMode: "VIDEO",

                        numPoses: 1,

                        minPoseDetectionConfidence: 0.5,

                        minPosePresenceConfidence: 0.5,

                        minTrackingConfidence: 0.5

                    }
                );


        } catch (erro) {

            console.warn(
                "GPU falhou. Tentando CPU..."
            );


            poseLandmarker =
                await PoseLandmarker.createFromOptions(
                    vision,
                    {

                        baseOptions: {

                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",

                            delegate: "CPU"

                        },

                        runningMode: "VIDEO",

                        numPoses: 1,

                        minPoseDetectionConfidence: 0.5,

                        minPosePresenceConfidence: 0.5,

                        minTrackingConfidence: 0.5

                    }
                );

        }


        console.log(
            "Detector criado com sucesso."
        );


        return poseLandmarker;

    })();


    try {

        return await detectorPromise;

    } catch (erro) {

        detectorPromise = null;

        throw erro;

    }

}


/* =========================================
   CÂMERA
========================================= */

async function iniciarCamera() {

    try {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            throw new Error(
                "getUserMedia não está disponível."
            );

        }


        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(track => track.stop());

        }


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: "user",

                    width: {
                        ideal: 480
                    },

                    height: {
                        ideal: 360
                    },

                    frameRate: {
                        max: 30
                    }

                },

                audio: false

            });


        video.srcObject =
            cameraStream;


        await video.play();


        canvas.width =
            video.videoWidth;


        canvas.height =
            video.videoHeight;


        loading.style.display =
            "none";


        status.textContent =
            "Posicione-se diante da câmera.";


        requestAnimationFrame(
            loopCamera
        );

>>>>>>> origin/main

        setStatus(
            "Detector pronto. Inicie a câmera e posicione-se de lado."
        );
    } catch (error) {
        console.error("Falha ao carregar o detector:", error);

<<<<<<< HEAD
        setLoading("Não foi possível carregar o detector.");
        setStatus(
            "Erro ao carregar o detector. Atualize a página e tente novamente."
        );

        startButton.disabled = true;
        menuStartButton.disabled = true;
=======
        console.error(
            "Erro ao iniciar câmera:",
            erro
        );


        loading.style.display =
            "block";


        status.textContent =
            "Não foi possível acessar a câmera.";

    }

}


/* =========================================
   LOOP DA CÂMERA
========================================= */

async function loopCamera(tempo) {

    requestAnimationFrame(
        loopCamera
    );


    if (
        !poseLandmarker ||
        video.readyState < 2
    ) {

        return;

    }


    if (
        tempo - ultimaDeteccao <
        intervaloDeteccao
    ) {

        return;

    }


    ultimaDeteccao =
        tempo;


    if (processando) {

        return;

    }


    processando =
        true;


    try {

        const resultado =
            poseLandmarker.detectForVideo(
                video,
                performance.now()
            );


        desenharResultado(
            resultado
        );


        analisarFlexao(
            resultado
        );


    } catch (erro) {

        console.error(
            "Erro na detecção:",
            erro
        );

    } finally {

        processando =
            false;

    }

}


/* =========================================
   ESQUELETO
========================================= */

function desenharResultado(resultado) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        !resultado.landmarks ||
        resultado.landmarks.length === 0
    ) {

        return;

>>>>>>> origin/main
    }

async function startCamera() {
    if (cameraStarted) return;

<<<<<<< HEAD
    if (!navigator.mediaDevices?.getUserMedia) {
        setStatus(
            "A câmera exige HTTPS ou localhost e permissão do navegador."
        );
        return;
    }

    try {
        startButton.disabled = true;
        menuStartButton.disabled = true;

        setStatus("Solicitando acesso à câmera...");

        stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30, max: 30 }
            }
        });

        video.srcObject = stream;
        await video.play();

        cameraStarted = true;
        startButton.style.display = "none";

        setLoading("", false);
        resizeCanvas();
        resetRepDetection();
        startDetectionLoop();

        setStatus(
            "Câmera ligada. Fique de lado, com o corpo inteiro visível."
        );
    } catch (error) {
        console.error("Falha ao iniciar a câmera:", error);

        stopCamera();

        setStatus(
            error?.name === "NotAllowedError"
                ? "Permita o acesso à câmera nas configurações do navegador."
                : "Não foi possível iniciar a câmera. Verifique se ela está em uso."
        );

        startButton.disabled = false;
        menuStartButton.disabled = false;
        startButton.style.display = "";
    }
}

function stopCamera() {
    cameraStarted = false;
=======
    const landmarks =
        resultado.landmarks[0];


    const conexoes =
        PoseLandmarker.POSE_CONNECTIONS;

>>>>>>> origin/main

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
    }

<<<<<<< HEAD
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
    }

    if (video) {
        video.srcObject = null;
    }
}

function resizeCanvas() {
    if (!video.videoWidth || !video.videoHeight) return;

    if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
    ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
}

function startDetectionLoop() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    const loop = (now) => {
        animationFrame = requestAnimationFrame(loop);

        if (
            !cameraStarted ||
            !detector ||
            video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
            video.currentTime === lastVideoTime ||
            now - lastDetectionTime < 1000 / CONFIG.detectionFps ||
            isDetecting
        ) {
            return;
        }

        lastDetectionTime = now;
        lastVideoTime = video.currentTime;
        isDetecting = true;

        try {
            resizeCanvas();

            const result = detector.detectForVideo(video, now);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const landmarks = result.landmarks?.[0];

            if (!landmarks) {
                handleLostPose();
                return;
            }

            drawPose(landmarks);
            processPose(landmarks, now);
        } catch (error) {
            console.error("Erro ao detectar pose:", error);

            setStatus(
                "Falha temporária na detecção. Mantenha o corpo visível."
            );
        } finally {
            isDetecting = false;
        }
    };

    animationFrame = requestAnimationFrame(loop);
}

function drawPose(landmarks) {
    ctx.save();

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = Math.max(2, canvas.width / 240);
    ctx.lineCap = "round";

    for (const [aIndex, bIndex] of connections) {
        const a = landmarks[aIndex];
        const b = landmarks[bIndex];

        if (!isVisible(a, 0.35) || !isVisible(b, 0.35)) {
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
=======
    ctx.strokeStyle = "#a855f7";


    for (const conexao of conexoes) {

        const pontoA =
            landmarks[conexao.start];

        const pontoB =
            landmarks[conexao.end];


        if (!pontoA || !pontoB) {

            continue;

        }


        ctx.beginPath();


        ctx.moveTo(
            pontoA.x * canvas.width,
            pontoA.y * canvas.height
        );


        ctx.lineTo(
            pontoB.x * canvas.width,
            pontoB.y * canvas.height
        );


>>>>>>> origin/main
        ctx.stroke();

    }

<<<<<<< HEAD
    ctx.fillStyle = "#ffd21c";

    for (const point of landmarks) {
        if (!isVisible(point, 0.35)) continue;
=======

    ctx.fillStyle =
        "#ffffff";


    for (const ponto of landmarks) {
>>>>>>> origin/main

        ctx.beginPath();


        ctx.arc(
<<<<<<< HEAD
            point.x * canvas.width,
            point.y * canvas.height,
            Math.max(3, canvas.width / 160),
=======
            ponto.x * canvas.width,
            ponto.y * canvas.height,
            4,
>>>>>>> origin/main
            0,
            Math.PI * 2
        );


        ctx.fill();

    }

<<<<<<< HEAD
    ctx.restore();
=======
>>>>>>> origin/main
}

function isVisible(point, threshold = CONFIG.minVisibility) {
    return Boolean(
        point &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        (point.visibility ?? 1) >= threshold
    );
}

<<<<<<< HEAD
function angleAt(a, b, c) {
    const baX = a.x - b.x;
    const baY = a.y - b.y;
    const bcX = c.x - b.x;
    const bcY = c.y - b.y;

    const denominator =
        Math.hypot(baX, baY) * Math.hypot(bcX, bcY);

    if (denominator < 1e-6) return null;

    const cosine = Math.max(
        -1,
        Math.min(
            1,
            (baX * bcX + baY * bcY) / denominator
        )
    );

    return Math.acos(cosine) * 180 / Math.PI;
}

function bodyTiltDegrees(shoulder, ankle) {
    const dx = ankle.x - shoulder.x;
    const dy = ankle.y - shoulder.y;

    if (Math.hypot(dx, dy) < 1e-6) {
        return 90;
    }

    return Math.abs(
        Math.atan2(dy, dx) * 180 / Math.PI
    );
}

function chooseVisibleSide(landmarks) {
    const sides = [
        {
            shoulder: 11,
            elbow: 13,
            wrist: 15,
            hip: 23,
            ankle: 27
        },
        {
            shoulder: 12,
            elbow: 14,
            wrist: 16,
            hip: 24,
            ankle: 28
        }
    ];

    const candidates = sides.map((side) => {
        const points = Object.fromEntries(
            Object.entries(side).map(
                ([key, index]) => [key, landmarks[index]]
            )
        );

        const keys = [
            "shoulder",
            "elbow",
            "wrist",
            "hip",
            "ankle"
        ];

        const visible = keys.every(
            (key) => isVisible(points[key], 0.45)
        );

        const confidence = keys.reduce(
            (sum, key) =>
                sum + (points[key]?.visibility ?? 0),
            0
        );

        return {
            ...points,
            visible,
            confidence
        };
    });

    return candidates
        .filter((candidate) => candidate.visible)
        .sort((a, b) => b.confidence - a.confidence)[0] ?? null;
=======
/* =========================================
   ANALISAR FLEXÃO
========================================= */

function analisarFlexao(resultado) {

    if (
        !resultado.landmarks ||
        resultado.landmarks.length === 0
    ) {

        return;

    }


    const p =
        resultado.landmarks[0];


    const ombroEsquerdo =
        p[11];

    const cotoveloEsquerdo =
        p[13];

    const pulsoEsquerdo =
        p[15];


    const ombroDireito =
        p[12];

    const cotoveloDireito =
        p[14];

    const pulsoDireito =
        p[16];


    if (
        !ombroEsquerdo ||
        !cotoveloEsquerdo ||
        !pulsoEsquerdo ||
        !ombroDireito ||
        !cotoveloDireito ||
        !pulsoDireito
    ) {

        return;

    }


    const anguloEsquerdo =
        calcularAngulo(
            ombroEsquerdo,
            cotoveloEsquerdo,
            pulsoEsquerdo
        );


    const anguloDireito =
        calcularAngulo(
            ombroDireito,
            cotoveloDireito,
            pulsoDireito
        );


    const anguloMedio =
        (
            anguloEsquerdo +
            anguloDireito
        ) / 2;


    if (
        estadoFlexao === "SUBINDO" &&
        anguloMedio < 125
    ) {

        estadoFlexao =
            "DESCENDO";

        return;

    }


    if (
        estadoFlexao === "DESCENDO" &&
        anguloMedio > 145
    ) {

        const agora =
            Date.now();


        if (
            agora - ultimaFlexao >=
            tempoMinimoEntreFlexoes
        ) {

            ultimaFlexao =
                agora;


            registrarFlexao();


            estadoFlexao =
                "SUBINDO";

        }

    }

>>>>>>> origin/main
}

function analyzePushUpPose(landmarks) {
    const side = chooseVisibleSide(landmarks);

<<<<<<< HEAD
    if (!side) {
        return {
            valid: false,
            reason: "Mostre ombro, cotovelo, mão, quadril e tornozelo."
        };
    }
=======
/* =========================================
   REGISTRAR FLEXÃO
========================================= */
>>>>>>> origin/main

    const { shoulder, elbow, wrist, hip, ankle } = side;

<<<<<<< HEAD
    const armAngle = angleAt(shoulder, elbow, wrist);

    if (armAngle === null) {
        return {
            valid: false,
            reason: "Não consegui medir o ângulo do braço."
        };
    }

    const bodyLength = Math.hypot(
        ankle.x - shoulder.x,
        ankle.y - shoulder.y
    );

    if (bodyLength < CONFIG.minBodyLength) {
        return {
            valid: false,
            reason: "Afaste um pouco a câmera e mostre o corpo inteiro."
        };
    }

    const bodyTilt = bodyTiltDegrees(shoulder, ankle);

    const shoulderHipDistance = Math.hypot(
        hip.x - shoulder.x,
        hip.y - shoulder.y
    );

    const hipAnkleDistance = Math.hypot(
        ankle.x - hip.x,
        ankle.y - hip.y
    );

    const proportionsValid =
        shoulderHipDistance > 0.04 &&
        hipAnkleDistance > 0.04 &&
        bodyTilt <= CONFIG.maxBodyTiltDegrees;

    const floorDifference = Math.abs(wrist.y - ankle.y);

    const floorAligned =
        floorDifference <= CONFIG.maxFloorDifference;

    const handShoulderDistance = Math.hypot(
        wrist.x - shoulder.x,
        wrist.y - shoulder.y
    );

    const handPlacementValid =
        handShoulderDistance > 0.04 &&
        handShoulderDistance < bodyLength * 0.9;

    const valid =
        floorAligned &&
        proportionsValid &&
        handPlacementValid;

    let reason = "Postura correta. Desça dobrando os cotovelos.";

    if (!floorAligned) {
        reason =
            "Alinhe as mãos e os pés com o chão; deixe o corpo inteiro visível.";
    } else if (!proportionsValid) {
        reason =
            "Mantenha cabeça, costas, quadril e pernas alinhados.";
    } else if (!handPlacementValid) {
        reason =
            "Ajuste as mãos abaixo da linha dos ombros.";
    }

    return {
        valid,
        reason,
        angle: armAngle,
        bodyTilt,
        floorDifference
    };
}

function processPose(landmarks, now) {
    const pose = analyzePushUpPose(landmarks);

    currentPoseValid = pose.valid;

    if (!pose.valid) {
        stableFrames = 0;

        if (!waitingForPosition && repState === "down") {
            setStatus(
                "Mantenha o corpo visível para confirmar a flexão."
            );
        } else {
            setStatus(pose.reason);
        }

        return;
    }

    lastValidPoseAt = now;
    stableFrames++;

    if (stableFrames < CONFIG.requiredStableFrames) {
        setStatus("Confirmando postura...");
        return;
    }

    if (waitingForPosition) {
        if (pose.angle >= CONFIG.topAngle) {
            waitingForPosition = false;
            phaseActive = true;
            repState = "top";
            smoothedAngle = pose.angle;
            downAt = 0;

            setStatus(
                "Posição correta! Desça controladamente."
            );
        } else {
            setStatus(
                "Entre na posição de flexão com os braços estendidos."
            );
        }
=======
    flexoes++;

    pontos +=
        pontosPorFlexao;

    vidaInimigo--;


    atualizarInterface();


    animarAtaque();


    console.log(
        "Flexão contabilizada:",
        flexoes
    );


    if (
        vidaInimigo <= 0
    ) {

        vidaInimigo = 0;

        atualizarInterface();

        concluirFase();

    }

}


/* =========================================
   INTERFACE
========================================= */

function atualizarInterface() {

    counter.textContent =
        flexoes;


    score.textContent =
        pontos;
>>>>>>> origin/main

        return;
    }

<<<<<<< HEAD
    smoothedAngle =
        smoothedAngle === null
            ? pose.angle
            : smoothedAngle * 0.65 + pose.angle * 0.35;
=======
    const porcentagem =
        Math.max(
            0,
            (
                vidaInimigo /
                vidaMaxima
            ) * 100
        );


    hpBar.style.width =
        porcentagem + "%";


    hpText.textContent =
        `${vidaInimigo} / ${vidaMaxima} HP`;

}


/* =========================================
   ATAQUE
========================================= */

function animarAtaque() {
>>>>>>> origin/main

    if (repState === "top") {
        if (smoothedAngle <= CONFIG.bottomAngle) {
            repState = "down";
            downAt = now;

<<<<<<< HEAD
            setStatus(
                "Boa! Agora estenda os braços para completar."
            );
        } else {
            setStatus(
                "Postura válida. Desça até dobrar os cotovelos."
            );
        }

        return;
    }

    if (repState === "down") {
        const downDuration = now - downAt;

        if (downDuration > CONFIG.maxRepDuration) {
            repState = "top";
            downAt = 0;
            smoothedAngle = pose.angle;

            setStatus(
                "Movimento reiniciado. Desça e suba de forma controlada."
            );

            return;
        }

        if (smoothedAngle >= CONFIG.topAngle) {
            const enoughDuration =
                downDuration >= CONFIG.minRepDuration;

            const cooldownPassed =
                now - lastRepAt >= CONFIG.cooldown;

            repState = "top";
            downAt = 0;
            smoothedAngle = pose.angle;

            if (
                enoughDuration &&
                cooldownPassed &&
                phaseActive &&
                currentPoseValid
            ) {
                lastRepAt = now;
                registerPushUp();
            } else {
                setStatus(
                    "Movimento muito rápido. Faça a flexão de forma controlada."
                );
            }
        }
    }
}

function handleLostPose() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stableFrames = 0;
    currentPoseValid = false;

    if (waitingForPosition) {
        setStatus(
            "Não detectei seu corpo. Afaste a câmera e mostre o corpo inteiro."
        );
    } else if (performance.now() - lastValidPoseAt > 700) {
        setStatus(
            "Corpo fora de visão. Volte para o enquadramento."
        );
    }
}

function resetRepDetection() {
    repState = "top";
    smoothedAngle = null;
    lastRepAt = 0;
    downAt = 0;
    stableFrames = 0;
    currentPoseValid = false;
    lastValidPoseAt = 0;
    waitingForPosition = true;
    phaseActive = false;
}

function registerPushUp() {
    if (
        !phaseActive ||
        waitingForPosition ||
        hp <= 0
    ) {
        return;
    }

    pushUps++;
    score += 100;
    hp = Math.max(0, hp - 1);

    counter.textContent = String(pushUps);
    scoreElement.textContent = String(score);

    updateHp();

    if (enemyIcon) {
        enemyIcon.classList.remove("hit");
        void enemyIcon.offsetWidth;
        enemyIcon.classList.add("hit");

        window.setTimeout(
            () => enemyIcon.classList.remove("hit"),
            400
        );
    }

    if (hitEffect) {
        hitEffect.classList.remove("show");
        void hitEffect.offsetWidth;
        hitEffect.classList.add("show");

        window.setTimeout(
            () => hitEffect.classList.remove("show"),
            500
        );
    }

    setStatus(`💥 ATAQUE! Flexão ${pushUps}`);

    if (hp <= 0) {
        completePhase();
    }
}

function completePhase() {
    phaseActive = false;
    waitingForPosition = true;

    const phase = phases[currentPhaseIndex];

    if (currentPhaseIndex < phases.length - 1) {
        phaseCompleteIcon.textContent = phase.icon;
        phaseCompleteText.textContent =
            `Você derrotou o ${phase.name}!`;

        nextPhaseNumber.textContent =
            `FASE ${currentPhaseIndex + 2}`;

        phaseCompleteScreen.classList.add("show");
    } else {
        showVictory();
    }
=======

    void enemyIcon.offsetWidth;


    enemyIcon.classList.add(
        "hit"
    );


    hitEffect.classList.remove(
        "show"
    );


    void hitEffect.offsetWidth;


    hitEffect.classList.add(
        "show"
    );


    setTimeout(() => {

        hitEffect.classList.remove(
            "show"
        );

    }, 500);

>>>>>>> origin/main
}

function preparePhase() {
    const phase = phases[currentPhaseIndex];

<<<<<<< HEAD
    hp = phase.hp;
    maxHp = phase.hp;
    pushUps = 0;
=======
/* =========================================
   PREPARAR FASE
========================================= */
>>>>>>> origin/main

    resetRepDetection();

    counter.textContent = "0";
    scoreElement.textContent = String(score);

<<<<<<< HEAD
    phaseNumberElement.textContent = `FASE ${phase.number}`;
    enemyNameElement.textContent = `${phase.icon} ${phase.name}`;

    if (enemyIcon) {
        enemyIcon.textContent = phase.icon;
    }

    if (enemyTitle) {
        enemyTitle.textContent = phase.name;
    }
=======

    vidaMaxima =
        fase.vida;


    vidaInimigo =
        fase.vida;


    flexoes =
        0;


    phaseNumber.textContent =
        `FASE ${fase.numero}`;


    enemyName.textContent =
        `${fase.icone} ${fase.nome}`;


    enemyIcon.textContent =
        fase.icone;


    estadoFlexao =
        "SUBINDO";
>>>>>>> origin/main

    updateHp();

<<<<<<< HEAD
    setStatus(
        cameraStarted
            ? "Fique de lado, com o corpo inteiro visível e as mãos no chão."
            : "Inicie a câmera para preparar sua posição."
    );
}
=======
    anguloSuaveEsquerdo =
        180;
>>>>>>> origin/main

function updateHp() {
    const percentage =
        maxHp > 0 ? (hp / maxHp) * 100 : 0;

<<<<<<< HEAD
    hpBar.style.width = `${percentage}%`;

    hpText.textContent =
        hp <= 0 ? "DERROTADO!" : `${hp} / ${maxHp} HP`;

    if (hpProgress) {
        hpProgress.setAttribute(
            "aria-valuemax",
            String(maxHp)
        );

        hpProgress.setAttribute(
            "aria-valuenow",
            String(hp)
        );
    }
}
=======
    anguloSuaveDireito =
        180;
>>>>>>> origin/main

function showVictory() {
    finalScore.textContent = String(score);
    victoryScreen.classList.add("show");
}

<<<<<<< HEAD
function resetGame({ showMenu = false } = {}) {
    score = 0;
    currentPhaseIndex = 0;

    phaseCompleteScreen.classList.remove("show");
    victoryScreen.classList.remove("show");

    preparePhase();

    scoreElement.textContent = "0";

    if (showMenu) {
        startMenu.classList.remove("hidden");

        setStatus(
            "Pronto para jogar. Comece a fase e ligue a câmera."
        );
    }
}

startButton.addEventListener("click", startCamera);

menuStartButton.addEventListener("click", async () => {
    if (!detector) {
        setStatus("O detector ainda está carregando.");
        return;
    }

    startMenu.classList.add("hidden");

    preparePhase();

    await startCamera();
});

nextPhaseButton.addEventListener("click", () => {
    phaseCompleteScreen.classList.remove("show");

    currentPhaseIndex = Math.min(
        currentPhaseIndex + 1,
        phases.length - 1
    );
=======
    ultimaFlexao =
        0;


    atualizarInterface();


    phaseCompleteScreen.classList.remove(
        "show"
    );


    victoryScreen.classList.remove(
        "show"
    );

}
>>>>>>> origin/main

    preparePhase();
});

<<<<<<< HEAD
resetButton.addEventListener("click", () => {
    resetGame();
});

if (victoryReset) {
    victoryReset.addEventListener("click", () => {
        resetGame({ showMenu: true });
    });
}
=======
/* =========================================
   CONCLUIR FASE
========================================= */

function concluirFase() {

    if (
        faseAtual >=
        fases.length - 1
    ) {

        mostrarVitoria();

        return;

    }


    phaseCompleteIcon.textContent =
        fases[faseAtual].icone;


    phaseCompleteText.textContent =
        `Você derrotou o ${fases[faseAtual].nome}!`;


    nextPhaseNumber.textContent =
        `FASE ${fases[faseAtual + 1].numero}`;


    phaseCompleteScreen.classList.add(
        "show"
    );

}


/* =========================================
   PRÓXIMA FASE
========================================= */

nextPhaseButton.addEventListener(
    "click",
    function () {

        faseAtual++;

        prepararFase();

    }
);


/* =========================================
   VITÓRIA
========================================= */

function mostrarVitoria() {

    finalScore.textContent =
        pontos;


    victoryScreen.classList.add(
        "show"
    );

}


/* =========================================
   RESET
========================================= */

function resetarJogo() {

    faseAtual =
        0;


    pontos =
        0;


    prepararFase();


    status.textContent =
        "Posicione seu corpo na câmera.";

}


resetButton.addEventListener(
    "click",
    function () {

        resetarJogo();

    }
);


victoryReset.addEventListener(
    "click",
    function () {

        victoryScreen.classList.remove(
            "show"
        );


        resetarJogo();

    }
);


/* =========================================
   BOTÃO DA CÂMERA
========================================= */

startButton.addEventListener(
    "click",
    async function () {

        await iniciarCamera();

    }
);


/* =========================================
   BOTÃO COMEÇAR
========================================= */

menuStartButton.addEventListener(
    "click",
    async function () {

        console.log(
            "BOTÃO COMEÇAR CLICADO"
        );


        menuStartButton.disabled =
            true;


        menuStartButton.textContent =
            "⏳ CARREGANDO...";


        status.textContent =
            "Carregando detector...";


        try {

            await criarDetector();


            console.log(
                "Detector pronto. Iniciando jogo."
            );


            prepararFase();


            startMenu.classList.add(
                "hidden"
            );


            await iniciarCamera();


            menuStartButton.textContent =
                "🎮 COMEÇAR FASE 1";


            menuStartButton.disabled =
                false;


        } catch (erro) {

            console.error(
                "ERRO AO COMEÇAR:",
                erro
            );


            menuStartButton.disabled =
                false;


            menuStartButton.textContent =
                "🎮 COMEÇAR FASE 1";


            status.textContent =
                "Erro ao carregar o jogo.";

        }

    }
);
>>>>>>> origin/main

window.addEventListener("beforeunload", () => {
    stopCamera();
    detector?.close();
});

<<<<<<< HEAD
startButton.disabled = true;
menuStartButton.disabled = true;

preparePhase();
createDetector();
=======
/* =========================================
   INICIALIZAÇÃO
========================================= */

prepararFase();


/*
 * Começa a carregar o detector
 * em segundo plano.
 *
 * O botão usa a mesma promessa,
 * então nunca são criados dois
 * detectores ao mesmo tempo.
 */

criarDetector().catch(
    erro => {

        console.error(
            "Erro ao carregar detector:",
            erro
        );

    }
);
>>>>>>> origin/main
