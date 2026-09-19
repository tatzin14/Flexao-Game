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

const scoreElement = document.getElementById("score");

const startMenu =
    document.getElementById("startMenu");

const menuStartButton =
    document.getElementById("menuStartButton");

const phaseNumberElement =
    document.getElementById("phaseNumber");

const enemyNameElement =
    document.getElementById("enemyName");

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

const enemyIcon =
    document.querySelector(".enemy-icon");

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

let faseAtual = 0;

let flexoes = 0;

let pontuacao = 0;

const pontosPorFlexao = 100;

let hp = fases[0].vida;

let maxHP = fases[0].vida;

let faseIniciada = false;

let aguardandoPosicao = true;


/* =========================================
   DETECTOR
   ========================================= */

let poseLandmarker = null;

let cameraStarted = false;

let estado = "cima";

let ultimaDeteccao = 0;

const intervaloDeteccao = 1000 / 20;


/*
   Suavização original
*/

let anguloSuavizado = null;

const suavizacao = 0.55;

let ultimaFlexao = 0;

const tempoMinimoEntreFlexoes = 500;


/*
   Controle extra da flexão
*/

let posturaFlexaoValida = false;

let yCorpoInicial = null;

let yCorpoBaixo = null;


/* =========================================
   CRIAR DETECTOR
   ========================================= */

async function criarDetector() {

    try {

        loading.textContent =
            "Carregando MediaPipe...";

        const vision =
            await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
            );

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

                    numPoses: 1
                }
            );

        loading.textContent =
            "Detector pronto!";

        console.log(
            "MediaPipe carregado!"
        );

    } catch (erro) {

        console.error(erro);

        loading.textContent =
            "Erro ao carregar MediaPipe.";

        status.textContent =
            "Erro no detector. Tentando CPU...";

        try {

            const vision =
                await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
                );

            poseLandmarker =
                await PoseLandmarker.createFromOptions(
                    vision,
                    {
                        baseOptions: {

                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
                        },

                        runningMode: "VIDEO",

                        numPoses: 1
                    }
                );

            loading.textContent =
                "Detector pronto!";

        } catch (erro2) {

            console.error(erro2);

            loading.textContent =
                "Não foi possível carregar o detector.";
        }
    }
}


/* =========================================
   CÂMERA
   ========================================= */

async function iniciarCamera() {

    try {

        const stream =
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
                        ideal: 30,
                        max: 30
                    }
                },

                audio: false
            });

        video.srcObject = stream;

        cameraStarted = true;

        startButton.style.display =
            "none";

        status.textContent =
            "Câmera ligada! Posicione o corpo.";

        loading.style.display =
            "none";

        await video.play();

        if (video.readyState >= 1) {

            ajustarCanvas();
        }

        detectarPose();

    } catch (erro) {

        console.error(erro);

        status.textContent =
            "Não foi possível acessar a câmera.";
    }
}


/* =========================================
   CANVAS
   ========================================= */

function ajustarCanvas() {

    if (
        video.videoWidth === 0 ||
        video.videoHeight === 0
    ) {
        return;
    }

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;
}


/* =========================================
   DETECTAR POSE
   ========================================= */

async function detectarPose() {

    requestAnimationFrame(
        detectarPose
    );

    if (
        !poseLandmarker ||
        !cameraStarted ||
        video.readyState < 2
    ) {
        return;
    }

    const agora =
        performance.now();

    if (
        agora - ultimaDeteccao <
        intervaloDeteccao
    ) {
        return;
    }

    ultimaDeteccao = agora;

    if (
        canvas.width !==
            video.videoWidth ||

        canvas.height !==
            video.videoHeight
    ) {

        ajustarCanvas();
    }

    let resultado;

    try {

        resultado =
            poseLandmarker.detectForVideo(
                video,
                agora
            );

    } catch (erro) {

        console.error(
            "Erro na detecção:",
            erro
        );

        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (
        resultado.landmarks &&
        resultado.landmarks.length > 0
    ) {

        const pontos =
            resultado.landmarks[0];

        desenharCorpo(pontos);

        detectarFlexao(pontos);
    }
}


/* =========================================
   ESQUELETO
   ========================================= */

function desenharCorpo(pontos) {

    const conexoes = [

        [11, 12],

        [11, 13],
        [13, 15],

        [12, 14],
        [14, 16],

        [11, 23],
        [12, 24],

        [23, 24],

        [23, 25],
        [25, 27],

        [24, 26],
        [26, 28]

    ];

    ctx.strokeStyle =
        "#a855f7";

    ctx.lineWidth = 3;

    ctx.lineCap =
        "round";

    for (
        const [a, b]
        of conexoes
    ) {

        const A = pontos[a];
        const B = pontos[b];

        if (!A || !B) {
            continue;
        }

        if (
            A.visibility < 0.35 ||
            B.visibility < 0.35
        ) {
            continue;
        }

        ctx.beginPath();

        ctx.moveTo(
            A.x * canvas.width,
            A.y * canvas.height
        );

        ctx.lineTo(
            B.x * canvas.width,
            B.y * canvas.height
        );

        ctx.stroke();
    }

    ctx.fillStyle =
        "#ffd21c";

    for (
        const ponto
        of pontos
    ) {

        if (
            !ponto ||
            ponto.visibility < 0.35
        ) {
            continue;
        }

        ctx.beginPath();

        ctx.arc(

            ponto.x *
                canvas.width,

            ponto.y *
                canvas.height,

            4,

            0,

            Math.PI * 2
        );

        ctx.fill();
    }
}


/* =========================================
   DETECÇÃO DA FLEXÃO
   ========================================= */

function detectarFlexao(pontos) {

    const ombroEsquerdo = pontos[11];
    const ombroDireito = pontos[12];

    const cotoveloEsquerdo = pontos[13];
    const cotoveloDireito = pontos[14];

    const maoEsquerda = pontos[15];
    const maoDireita = pontos[16];

    const quadrilEsquerdo = pontos[23];
    const quadrilDireito = pontos[24];

    const joelhoEsquerdo = pontos[25];
    const joelhoDireito = pontos[26];


    // Todos os pontos importantes precisam estar visíveis

    const pontosImportantes = [
        ombroEsquerdo,
        ombroDireito,
        cotoveloEsquerdo,
        cotoveloDireito,
        maoEsquerda,
        maoDireita,
        quadrilEsquerdo,
        quadrilDireito,
        joelhoEsquerdo,
        joelhoDireito
    ];

    const corpoVisivel =
        pontosImportantes.every(
            ponto =>
                ponto &&
                ponto.visibility > 0.55
        );

    if (!corpoVisivel) {

        posturaFlexaoValida = false;

        return;
    }


    // ==========================================
    // ÂNGULOS DOS BRAÇOS
    // ==========================================

    const esquerdo = obterAnguloBraco(
        ombroEsquerdo,
        cotoveloEsquerdo,
        maoEsquerda
    );

    const direito = obterAnguloBraco(
        ombroDireito,
        cotoveloDireito,
        maoDireita
    );

    if (
        esquerdo === null ||
        direito === null
    ) {

        return;
    }

    const angulo =
        (esquerdo + direito) / 2;


    // ==========================================
    // POSIÇÃO DO CORPO
    // ==========================================

    const ombroY =
        (ombroEsquerdo.y + ombroDireito.y) / 2;

    const quadrilY =
        (quadrilEsquerdo.y + quadrilDireito.y) / 2;

    const joelhoY =
        (joelhoEsquerdo.y + joelhoDireito.y) / 2;

    const maoY =
        (maoEsquerda.y + maoDireita.y) / 2;


    // As mãos precisam estar abaixo/próximas dos ombros.

    const maosNaBase =
        maoY > ombroY - 0.08 &&
        maoY < quadrilY + 0.20;


    // ==========================================
    // CORPO RELATIVAMENTE ALINHADO
    // ==========================================

    const diferencaOmbroQuadril =
        Math.abs(
            ombroY - quadrilY
        );

    const diferencaQuadrilJoelho =
        Math.abs(
            quadrilY - joelhoY
        );


    // Evita considerar uma pessoa simplesmente em pé.

    const corpoAcompanhando =
        diferencaOmbroQuadril < 0.38 &&
        diferencaQuadrilJoelho < 0.45;


    // ==========================================
    // POSIÇÃO INICIAL
    // ==========================================

    if (aguardandoPosicao) {

        const bracosEstendidos =
            esquerdo > 150 &&
            direito > 150;

        if (
            bracosEstendidos &&
            maosNaBase &&
            corpoAcompanhando
        ) {

            aguardandoPosicao = false;

            faseIniciada = true;

            estado = "cima";

            anguloSuavizado =
                angulo;

            yCorpoInicial =
                (ombroY + quadrilY) / 2;

            yCorpoBaixo = null;

            posturaFlexaoValida = true;

            status.textContent =
                "✅ POSIÇÃO CORRETA! VALENDO!";
        }

        return;
    }


    // ==========================================
    // SUAVIZAÇÃO DO ÂNGULO
    // ==========================================

    if (anguloSuavizado === null) {

        anguloSuavizado =
            angulo;

    } else {

        anguloSuavizado =
            (anguloSuavizado * (1 - suavizacao)) +
            (angulo * suavizacao);
    }


    // ==========================================
    // DESCIDA
    // ==========================================

    if (
        anguloSuavizado < 110 &&
        estado === "cima" &&
        maosNaBase &&
        corpoAcompanhando
    ) {

        estado = "baixo";

        yCorpoBaixo =
            (ombroY + quadrilY) / 2;

        posturaFlexaoValida = true;

        status.textContent =
            "⬇️ Desceu!";
    }


    // ==========================================
    // SUBIDA + CONFIRMAÇÃO DA FLEXÃO
    // ==========================================

    if (
        anguloSuavizado > 150 &&
        estado === "baixo"
    ) {

        const corpoSubiu =
            yCorpoBaixo !== null &&
            Math.abs(
                (
                    (ombroY + quadrilY) / 2
                ) -
                yCorpoBaixo
            ) > 0.015;

        const posturaFinalValida =
            maosNaBase &&
            corpoAcompanhando &&
            posturaFlexaoValida &&
            corpoSubiu;

        const agora =
            performance.now();

        if (
            posturaFinalValida &&
            agora - ultimaFlexao >
                tempoMinimoEntreFlexoes
        ) {

            estado = "cima";

            ultimaFlexao =
                agora;

            posturaFlexaoValida =
                false;

            yCorpoBaixo =
                null;

            registrarFlexao();
        }
    }
}


/* =========================================
   ÂNGULO DO BRAÇO
   ========================================= */

function obterAnguloBraco(
    ombro,
    cotovelo,
    mao
) {

    if (
        !ombro ||
        !cotovelo ||
        !mao
    ) {

        return null;
    }

    if (
        ombro.visibility < 0.35 ||
        cotovelo.visibility < 0.35 ||
        mao.visibility < 0.35
    ) {

        return null;
    }

    return calcularAngulo(
        ombro,
        cotovelo,
        mao
    );
}


function calcularAngulo(
    a,
    b,
    c
) {

    const BA = {
        x: a.x - b.x,
        y: a.y - b.y
    };

    const BC = {
        x: c.x - b.x,
        y: c.y - b.y
    };

    const produto =
        BA.x * BC.x +
        BA.y * BC.y;

    const tamanhoBA =
        Math.sqrt(
            BA.x ** 2 +
            BA.y ** 2
        );

    const tamanhoBC =
        Math.sqrt(
            BC.x ** 2 +
            BC.y ** 2
        );

    if (
        tamanhoBA === 0 ||
        tamanhoBC === 0
    ) {

        return null;
    }

    const cos =
        produto /
        (
            tamanhoBA *
            tamanhoBC
        );

    const limitado =
        Math.max(
            -1,
            Math.min(
                1,
                cos
            )
        );

    return Math.acos(
        limitado
    ) * (
        180 / Math.PI
    );
}


/* =========================================
   REGISTRAR FLEXÃO
   ========================================= */

function registrarFlexao() {

    if (
        !faseIniciada ||
        aguardandoPosicao
    ) {

        return;
    }

    flexoes++;

    pontuacao +=
        pontosPorFlexao;

    scoreElement.textContent =
        pontuacao;

    if (hp > 0) {

        hp--;
    }

    counter.textContent =
        flexoes;

    atualizarHP();


    /* EFEITO VISUAL DO INIMIGO */

    enemyIcon.classList.remove(
        "hit"
    );

    void enemyIcon.offsetWidth;

    enemyIcon.classList.add(
        "hit"
    );

    setTimeout(() => {

        enemyIcon.classList.remove(
            "hit"
        );

    }, 400);


    /* EFEITO VISUAL DE ATAQUE */

    if (hitEffect) {

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


    status.textContent =
        "💥 ATAQUE! Flexão " +
        flexoes;


    if (hp <= 0) {

        hp = 0;

        hpText.textContent =
            "DERROTADO!";

        concluirFase();
    }
}


/* =========================================
   CONCLUIR FASE
   ========================================= */

function concluirFase() {

    faseIniciada = false;

    aguardandoPosicao = true;

    const fase =
        fases[faseAtual];


    if (
        faseAtual <
        fases.length - 1
    ) {

        phaseCompleteIcon.textContent =
            fase.icone;

        phaseCompleteText.textContent =
            "Você derrotou o " +
            fase.nome +
            "!";

        nextPhaseNumber.textContent =
            "FASE " +
            (faseAtual + 2);

        phaseCompleteScreen.classList.add(
            "show"
        );

    } else {

        mostrarVitoria();
    }
}


/* =========================================
   PREPARAR FASE
   ========================================= */

function prepararFase() {

    const fase =
        fases[faseAtual];

    hp =
        fase.vida;

    maxHP =
        fase.vida;

    flexoes = 0;

    faseIniciada = false;

    aguardandoPosicao = true;

    estado = "cima";

    anguloSuavizado = null;

    ultimaFlexao = 0;

    counter.textContent =
        "0";

    scoreElement.textContent =
        pontuacao;

    phaseNumberElement.textContent =
        "FASE " +
        fase.numero;

    enemyNameElement.textContent =
        fase.icone +
        " " +
        fase.nome;

    enemyIcon.textContent =
        fase.icone;


    const enemyTitle =
        document.querySelector(
            ".enemy-info h2"
        );

    if (enemyTitle) {

        enemyTitle.textContent =
            fase.nome;
    }


    atualizarHP();

    status.textContent =
        "Posicione seu corpo na câmera.";
}


/* =========================================
   HP
   ========================================= */

function atualizarHP() {

    const porcentagem =
        (hp / maxHP) * 100;

    hpBar.style.width =
        porcentagem + "%";

    hpText.textContent =
        hp +
        " / " +
        maxHP +
        " HP";
}


/* =========================================
   VITÓRIA
   ========================================= */

function mostrarVitoria() {

    finalScore.textContent =
        flexoes;

    victoryScreen.classList.add(
        "show"
    );
}


/* =========================================
   BOTÃO DE CÂMERA
   ========================================= */

startButton.addEventListener(
    "click",
    async function () {

        if (!poseLandmarker) {

            status.textContent =
                "Detector ainda carregando...";

            return;
        }

        await iniciarCamera();
    }
);


/* =========================================
   BOTÃO DO MENU
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
   PRÓXIMA FASE
   ========================================= */

nextPhaseButton.addEventListener(
    "click",
    function () {

        phaseCompleteScreen.classList.remove(
            "show"
        );

        faseAtual++;

        prepararFase();
    }
);


/* =========================================
   RESET
   ========================================= */

resetButton.addEventListener(
    "click",
    function () {

        flexoes = 0;

        pontuacao = 0;

        faseAtual = 0;

        hp =
            fases[0].vida;

        maxHP =
            fases[0].vida;

        faseIniciada = false;

        aguardandoPosicao = true;

        estado = "cima";

        anguloSuavizado = null;

        ultimaFlexao = 0;

        counter.textContent =
            "0";

        scoreElement.textContent =
            "0";

        phaseCompleteScreen.classList.remove(
            "show"
        );

        victoryScreen.classList.remove(
            "show"
        );

        prepararFase();

        status.textContent =
            "Posicione seu corpo na câmera.";
    }
);


/* =========================================
   JOGAR NOVAMENTE
   ========================================= */

if (victoryReset) {

    victoryReset.addEventListener(
        "click",
        function () {

            victoryScreen.classList.remove(
                "show"
            );

            faseAtual = 0;

            pontuacao = 0;

            prepararFase();

            startMenu.classList.remove(
                "hidden"
            );
        }
    );
}


/* =========================================
   INICIALIZAÇÃO
   ========================================= */

prepararFase();

criarDetector();