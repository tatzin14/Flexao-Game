const {
    PoseLandmarker,
    FilesetResolver
} = await import(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1"
);


/* =========================================
   ELEMENTOS
========================================= */

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

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
    document.getElementById(
        "phaseCompleteScreen"
    );

const phaseCompleteIcon =
    document.getElementById(
        "phaseCompleteIcon"
    );

const phaseCompleteText =
    document.getElementById(
        "phaseCompleteText"
    );

const nextPhaseNumber =
    document.getElementById(
        "nextPhaseNumber"
    );

const nextPhaseButton =
    document.getElementById(
        "nextPhaseButton"
    );

const hitEffect =
    document.getElementById(
        "hitEffect"
    );

const victoryScreen =
    document.getElementById(
        "victoryScreen"
    );

const finalScore =
    document.getElementById(
        "finalScore"
    );

const victoryReset =
    document.getElementById(
        "victoryReset"
    );


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

let cameraStream = null;

let processando = false;

let ultimaDeteccao = 0;

const intervaloDeteccao =
    1000 / 20;


/* =========================================
   DETECÇÃO DE FLEXÃO
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

}


/* =========================================
   INICIAR CÂMERA
========================================= */

async function iniciarCamera() {

    try {

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


    } catch (erro) {

        console.error(erro);


        status.textContent =
            "Não foi possível acessar a câmera.";


        loading.style.display =
            "block";

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
   DESENHAR ESQUELETO
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

    }


    const landmarks =
        resultado.landmarks[0];


    const conexoes =
        PoseLandmarker.POSE_CONNECTIONS;


    ctx.lineWidth =
        3;


    ctx.strokeStyle =
        "#a855f7";


    for (const conexao of conexoes) {

        const pontoA =
            landmarks[conexao.start];


        const pontoB =
            landmarks[conexao.end];


        if (

            !pontoA ||

            !pontoB

        ) {

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


        ctx.stroke();

    }


    ctx.fillStyle =
        "#ffffff";


    for (const ponto of landmarks) {

        ctx.beginPath();


        ctx.arc(

            ponto.x * canvas.width,

            ponto.y * canvas.height,

            4,

            0,

            Math.PI * 2

        );


        ctx.fill();

    }

}


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


    const confiancaMinima =
        0.5;


    if (

        (ombroEsquerdo.visibility ?? 1) <
            confiancaMinima ||

        (cotoveloEsquerdo.visibility ?? 1) <
            confiancaMinima ||

        (pulsoEsquerdo.visibility ?? 1) <
            confiancaMinima ||

        (ombroDireito.visibility ?? 1) <
            confiancaMinima ||

        (cotoveloDireito.visibility ?? 1) <
            confiancaMinima ||

        (pulsoDireito.visibility ?? 1) <
            confiancaMinima

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


    /* =====================================
       SUAVIZAÇÃO
    ===================================== */

    anguloSuaveEsquerdo =

        anguloSuaveEsquerdo * 0.7 +

        anguloEsquerdo * 0.3;


    anguloSuaveDireito =

        anguloSuaveDireito * 0.7 +

        anguloDireito * 0.3;


    const anguloMedio =

        (

            anguloSuaveEsquerdo +

            anguloSuaveDireito

        ) / 2;


    /* =====================================
       DESCIDA
    ===================================== */

    if (

        estadoFlexao === "SUBINDO" &&

        anguloMedio < 125

    ) {

        estadoFlexao =
            "DESCENDO";


        status.textContent =
            "Desceu! Agora suba.";


        return;

    }


    /* =====================================
       SUBIDA
    ===================================== */

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

}


/* =========================================
   REGISTRAR FLEXÃO
========================================= */

function registrarFlexao() {

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

        vidaInimigo =
            0;


        atualizarInterface();


        concluirFase();

    }

}


/* =========================================
   ATUALIZAR INTERFACE
========================================= */

function atualizarInterface() {

    counter.textContent =
        flexoes;


    score.textContent =
        pontos;


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
   ANIMAÇÃO DE ATAQUE
========================================= */

function animarAtaque() {

    enemyIcon.classList.remove(
        "hit"
    );


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

}


/* =========================================
   PREPARAR FASE
========================================= */

function prepararFase() {

    const fase =
        fases[faseAtual];


    vidaMaxima =
        fase.vida;


    vidaInimigo =
        fase.vida;


    flexoes =
        0;


    faseNumber.textContent =
        `FASE ${fase.numero}`;


    enemyName.textContent =
        `${fase.icone} ${fase.nome}`;


    enemyIcon.textContent =
        fase.icone;


    estadoFlexao =
        "SUBINDO";


    anguloSuaveEsquerdo =
        180;


    anguloSuaveDireito =
        180;


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
   BOTÃO INICIAR CÂMERA
========================================= */

startButton.addEventListener(

    "click",

    async function () {

        await iniciarCamera();

    }

);


/* =========================================
   BOTÃO COMEÇAR FASE
========================================= */

menuStartButton.addEventListener(

    "click",

    async function () {

        if (!poseLandmarker) {

            status.textContent =
                "Detector ainda carregando...";

            return;

        }


        startMenu.classList.add(
            "hidden"
        );


        prepararFase();


        await iniciarCamera();

    }

);


/* =========================================
   INICIALIZAÇÃO
========================================= */

prepararFase();


criarDetector();