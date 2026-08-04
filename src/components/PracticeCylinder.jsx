/**
 * @file PracticeCylinder.jsx
 * @description Practice 區塊（03）的 3D 文字圓柱。以 React Three Fiber 將
 *   各項能力名稱沿圓周排列，緩慢自轉，並可用滑鼠／觸控橫向拖曳，放開後帶慣性滑行。
 *
 *   分兩層：外層 PracticeCylinder 負責 Canvas、DOM 指標事件與進出視窗偵測；
 *   內層 WordRing 住在 Canvas 內，負責排列與每幀動畫（useFrame 只能在 Canvas 內呼叫）。
 *
 *   兩層之間以一個 useRef 物件（drag）溝通 —— 指標事件寫入、useFrame 讀取，
 *   全程不觸發 re-render。
 */
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector2, Color, AdditiveBlending, DoubleSide } from "three";
// ExtraBold 而非 Bold：3D 中的字被透視壓縮又只有 0.4 不透明度，
// 比平面排版更需要字重撐住。等寬字各字重的字寬都是 0.6em，
// 所以 MONO_ADVANCE 與 layoutRing() 的計算不受影響。
import fontUrl from "../assets/fonts/JetBrainsMono-ExtraBold.ttf";

const FONT_SIZE = 0.5;
const LETTER_SPACING = 0.02; // 單位為 em，與 <Text> 的 letterSpacing 同值
const MONO_ADVANCE = 0.6; // JetBrains Mono 的字寬（em）—— 等寬字才能這樣直接算
const GAP = 1.8; // 詞與詞之間的固定弧長間距，加大即全體變鬆（半徑會跟著變大）
const SPEED = 0.2; // 自轉速度（弧度／秒），約 30 秒一圈，對齊原跑馬燈的節奏
const SENS = 0.001; // 拖曳靈敏度：每 px 換算成幾弧度
const FRICTION = 0.94; // 放開後每幀保留的速度比例，越接近 1 滑得越久
const TILT = 0.1; // 前傾角（弧度，約 7°）。正值頂端朝向觀者，負值改為俯視
const FIT_MARGIN = 1.5; // 圓柱直徑之外預留的左右餘裕，窄螢幕據此等比縮小

const SAUCER_R = 2; // 碟身半徑；約佔環內三分之一，留白足夠
// 飛碟＋光柱＋牛整組的垂直位移。文字環固定在 y=0，調高這個值會讓
// 飛碟浮到環的上方、光柱穿過環心落下。相機視野在 z=0 平面約涵蓋 y ∈ [-2.9, 2.9]。
const UFO_Y = 1.8;

/**
 * 依各詞實際弧長排版，回傳每個詞的角度與反推出的半徑。
 *
 * 若改用等角度分配（每個詞都拿 360°/N），長詞會與鄰居相黏、短詞旁邊卻空一大塊。
 * 改成「每個詞佔用的角度正比於自己的弧長，詞間留固定的 GAP」，間距就處處相等，
 * 之後增刪 DISCIPLINES 也會自動重排，不需要手動回來調半徑。
 *
 * @param {string[]} items
 * @returns {{ radius: number, placed: { label: string, angle: number }[] }}
 */
function layoutRing(items) {
    // 等寬字的弧長可直接算，不必實際量測字型
    const widths = items.map(
        (s) => s.length * FONT_SIZE * (MONO_ADVANCE + LETTER_SPACING)
    );
    // 總周長 = 所有詞寬 + N 個間距（最後一個間距繞回第一個詞）
    const circumference = widths.reduce((a, b) => a + b, 0) + items.length * GAP;
    // 由周長反推半徑，讓排版長度與圓周 1:1 對應
    const radius = circumference / (Math.PI * 2);

    let cursor = 0;
    const placed = items.map((label, i) => {
        const angle = ((cursor + widths[i] / 2) / circumference) * Math.PI * 2;
        cursor += widths[i] + GAP;
        return { label, angle };
    });

    return { radius, placed };
}
const SAUCER_SPIN = 0.35; // 飛碟自轉速度（弧度／秒），刻意與文字環反向
const BOB_AMP = 0.12; // 上下浮動振幅（世界單位）
const BOB_FREQ = 0.8; // 上下浮動頻率（弧度／秒）

/**
 * 碟身的側面輪廓線（供 latheGeometry 車削一圈）。
 *
 * 座標為半徑 1 的比例值：x 是離中軸的距離、y 是高度。
 * 關鍵在赤道那點的 x 值最大、上下兩段在此交會成銳角，做出飛碟該有的鋒利邊緣。
 * （壓扁的球做不到：它的赤道是圓鈍的，讀起來就成了帽簷。）
 *
 * 順序必須「由下而上」—— LatheGeometry 依點的先後決定三角面的繞向，
 * 由上而下寫會讓法線全部朝內，實心材質打光後就成了內外翻轉的黑塊。
 * 線框時期看不出這個問題，改實心才會現形。
 */
const SAUCER_PROFILE = [
    [0.0, -0.105], // 底部中心，比上方略淺
    [0.22, -0.1],
    [0.5, -0.085],
    [0.78, -0.05],
    [1.0, 0.0], // 赤道：最寬處，銳利邊緣
    [0.8, 0.045],
    [0.6, 0.07],
    [0.42, 0.09], // 穹頂與碟身交界
    [0.38, 0.14],
    [0.3, 0.21],
    [0.2, 0.26],
    [0.1, 0.29],
    [0.0, 0.3], // 穹頂中心 —— 低而寬，不是高帽冠
];

/** 底部指示燈的顆數 */
const SAUCER_LIGHTS = 6;

const BEAM_COLOR = "#13ea42";
const BEAM_TOP_R = 0.3; // 光柱上緣半徑（SAUCER_R 的倍數），貼著碟底
const BEAM_BOTTOM_R = 1.05; // 下緣半徑，往外擴散
const BEAM_HEIGHT = 2.1; // 光柱長度
const BEAM_STRENGTH = 0.5; // 整體亮度
const BEAM_BANDS = 26; // 掃描條紋的密度
const BEAM_FLOW = 2.2; // 條紋向上流動的速度

/**
 * 光柱的頂點著色器。
 * 除了 uv，另外把法線與「指向相機的方向」帶到片段著色器 ——
 * 邊緣聚光的效果需要知道每個像素的表面朝向與視線的夾角。
 */
const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalMatrix * normal;
    // 在 view space 中相機位於原點，所以指向相機的方向就是座標的反向
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * 光柱的片段著色器。三個因子相乘：
 *
 * 1. 垂直衰減 —— 靠近碟底最濃，往下逐漸散掉（pow 讓衰減不是線性）
 * 2. 邊緣聚光 —— 法線越垂直於視線的地方越亮。這是讓一層薄殼看起來
 *    像有厚度的關鍵：實際光柱的側邊視線穿過較多介質，因此更亮
 * 3. 掃描條紋 —— 向上流動的明暗帶，讓它讀起來是「正在吸取」而非靜態圓錐
 */
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uStrength;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // cylinderGeometry 的 uv.y：底部為 0、頂部為 1
    float vertical = pow(vUv.y, 1.6);

    float rim = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
    rim = pow(rim, 1.4);

    float bands = 0.5 + 0.5 * sin(vUv.y * ${BEAM_BANDS}.0 - uTime * ${BEAM_FLOW});

    float alpha = vertical * (0.25 + 0.75 * rim) * (0.78 + 0.22 * bands);
    gl_FragColor = vec4(uColor, alpha * uStrength);
  }
`;

const COW_SIZE = 0.5; // 整體縮放；牛的本體長度約 1.5 個單位，乘上這個值
const COW_Y = -2.4; // 靜止時的高度，約在光柱中段
const COW_Y_UP = -0.62; // 拖曳中被吸到的高度，剛好貼在碟底下方
const LIFT_EASE = 1.6; // 升降的緩動強度，越大越快到位（約 2 秒走完九成）
const COW_LIFT_SPIN = 2.0; // 上升時額外增加的自轉倍率，表現「被攪動」
const COW_LIFT_SHRINK = 0.28; // 上升時縮小的比例，暗示正被收進船艙
const BEAM_LIFT_BOOST = 0.9; // 吸取中光柱額外增加的亮度倍率
const COW_SPIN = 0.5; // 繞自身垂直軸緩慢打轉（弧度／秒）
const COW_LEAN = -0.45; // 基礎傾角：被吊起來的東西不會保持水平
const COW_BODY = "#ededec"; // 對齊站上的 --fg
const COW_SPOT = "#141416"; // 接近 --bg，斑紋才不會變成第三個顏色
const COW_NOSE = "#ea5413"; // 鼻子與蹄用 accent，把牠繫回站上的色票

/** 四條腿的位置（本體局部座標，尚未乘 COW_SIZE） */
const COW_LEGS = [
    [0.42, -0.4, 0.2],
    [0.42, -0.4, -0.2],
    [-0.38, -0.4, 0.2],
    [-0.38, -0.4, -0.2],
];

/** 身上的斑紋：[x, y, z, 半徑]。球心刻意埋在體內，只露出超出身體的那一塊 */
const COW_SPOTS = [
    [0.12, 0.2, 0.2, 0.17],
    [-0.3, 0.1, -0.24, 0.15],
    [-0.05, -0.14, -0.26, 0.12],
];

/**
 * Cow — 被光柱吸上去的牛（內部組件，僅在 Canvas 內使用）
 *
 * 全部由基本幾何拼成，沒有外部模型。尺寸這麼小，細節不會被看見，
 * 所以只顧輪廓：橫躺的膠囊當身體、球當頭、四根圓柱當腿，再加角、耳、尾。
 *
 * 刻意不放進 Saucer 的 group：牠不該跟著飛碟自轉與上下浮動，
 * 而是以自己的節奏打轉與晃動，讀起來才像懸在光束裡而不是黏在飛碟上。
 */
function Cow({ drag }) {
    const ref = useRef();
    const t = useRef(0);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    useFrame((_, delta) => {
        const g = ref.current;
        const lift = drag.current.lift;

        // 高度、體積、轉速全部由 lift 驅動。
        // 這一段不受 reduceMotion 影響 —— 它是使用者拖曳所產生的直接回饋，
        // 屬於「操作結果」而非「自己動起來的動畫」。
        g.position.y = COW_Y + (COW_Y_UP - COW_Y) * lift;
        g.scale.setScalar(COW_SIZE * (1 - COW_LIFT_SHRINK * lift));

        if (reduceMotion) return;

        // 上升時轉得更急，表現被光束攪動
        t.current += delta * (1 + COW_LIFT_SPIN * lift);
        g.rotation.y = t.current * COW_SPIN;
        // 傾角與飄移各用不同頻率，避免兩個動作同步而顯得機械。
        // 飄移振幅隨 lift 收斂 —— 越接近船艙越被吸得穩定。
        const sway = 1 - 0.7 * lift;
        g.rotation.z = COW_LEAN + Math.sin(t.current * 0.9) * 0.13 * sway;
        g.position.y += Math.sin(t.current * 0.7) * 0.18 * sway;
    });

    return (
        <group ref={ref} position={[0, COW_Y, 0]} scale={COW_SIZE}>
            {/* 身體：膠囊預設沿 Y 軸，繞 Z 轉 90° 才會橫躺 */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.34, 0.78, 6, 20]} />
                <meshStandardMaterial color={COW_BODY} roughness={0.85} />
            </mesh>

            {/* 斑紋：球心埋在體內，只有超出身體半徑的部分露出來 */}
            {COW_SPOTS.map(([x, y, z, r], i) => (
                <mesh key={i} position={[x, y, z]}>
                    <sphereGeometry args={[r, 12, 10]} />
                    <meshStandardMaterial color={COW_SPOT} roughness={0.9} />
                </mesh>
            ))}

            {/* 頭 */}
            <mesh position={[0.82, 0.14, 0]}>
                <sphereGeometry args={[0.26, 16, 14]} />
                <meshStandardMaterial color={COW_BODY} roughness={0.85} />
            </mesh>

            {/* 鼻口 */}
            <mesh position={[1.02, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.13, 0.15, 0.16, 12]} />
                <meshStandardMaterial color={COW_NOSE} roughness={0.7} />
            </mesh>

            {/* 耳朵：壓扁的球，往兩側外張 */}
            {[0.28, -0.28].map((z) => (
                <mesh
                    key={z}
                    position={[0.74, 0.26, z]}
                    scale={[0.5, 0.32, 1]}
                    rotation={[z > 0 ? 0.4 : -0.4, 0, 0]}
                >
                    <sphereGeometry args={[0.17, 10, 8]} />
                    <meshStandardMaterial color={COW_BODY} roughness={0.85} />
                </mesh>
            ))}

            {/* 角 */}
            {[0.12, -0.12].map((z) => (
                <mesh
                    key={z}
                    position={[0.8, 0.38, z]}
                    rotation={[z > 0 ? -0.35 : 0.35, 0, 0]}
                >
                    <coneGeometry args={[0.055, 0.18, 8]} />
                    <meshStandardMaterial color={COW_SPOT} roughness={0.6} />
                </mesh>
            ))}

            {/* 四條腿：被吊著所以往下垂，末端加一小截 accent 當蹄 */}
            {COW_LEGS.map(([x, y, z], i) => (
                <group key={i} position={[x, y, z]}>
                    <mesh>
                        <cylinderGeometry args={[0.075, 0.065, 0.42, 10]} />
                        <meshStandardMaterial color={COW_BODY} roughness={0.85} />
                    </mesh>
                    <mesh position={[0, -0.23, 0]}>
                        <cylinderGeometry args={[0.07, 0.08, 0.08, 10]} />
                        <meshStandardMaterial color={COW_NOSE} roughness={0.6} />
                    </mesh>
                </group>
            ))}

            {/* 尾巴 */}
            <mesh position={[-0.76, 0.06, 0]} rotation={[0, 0, 0.9]}>
                <cylinderGeometry args={[0.03, 0.045, 0.44, 8]} />
                <meshStandardMaterial color={COW_BODY} roughness={0.85} />
            </mesh>
        </group>
    );
}

/**
 * Saucer — 環心的程序化飛碟（內部組件，僅在 Canvas 內使用）
 *
 * 碟身用 latheGeometry 依 SAUCER_PROFILE 車削成形（穹頂與碟身是同一塊），
 * 外加數顆底部指示燈與一道向下的牽引光柱。
 *
 * 光柱不是真的體積光（那需要 ray marching，對這個場景太貴）。
 * 作法是一層開口向下的錐狀薄殼，用自訂 shader 疊加三個因子做出厚度的錯覺：
 * 垂直衰減、邊緣聚光、向上流動的掃描條紋。
 *
 * 碟身用 meshStandardMaterial（受光，才有體積感），懸浮環與指示燈維持
 * meshBasicMaterial —— 它們要的是均勻發亮的線條與亮點，被光影切開反而變髒。
 * 文字環用的也是不受光的材質，所以場景中的燈只會影響碟身，不會動到排版。
 *
 * 動畫獨立於文字環：不隨拖曳轉動，只做自轉與上下浮動。
 */
function Saucer({ drag }) {
    const ref = useRef();
    // 自行累加時間，不用 clock.elapsedTime ——
    // frameloop="never" 期間 clock 仍隨真實時間前進，回到視窗時浮動位置會跳一下
    const t = useRef(0);

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // 輪廓點與燈的座標只跟常數有關，建一次就好
    const profile = useMemo(
        () => SAUCER_PROFILE.map(([x, y]) => new Vector2(x * SAUCER_R, y * SAUCER_R)),
        []
    );
    const lights = useMemo(
        () =>
            Array.from({ length: SAUCER_LIGHTS }, (_, i) => {
                const a = (i / SAUCER_LIGHTS) * Math.PI * 2;
                // y 取比該處碟底（約 -0.07）再低一些，讓小球有一半露在殼外。
                // 線框時期可以直接看穿，實心之後不推出來就整顆埋掉了。
                return [
                    Math.cos(a) * SAUCER_R * 0.62,
                    -SAUCER_R * 0.095,
                    Math.sin(a) * SAUCER_R * 0.62,
                ];
            }),
        []
    );

    // uniforms 必須 memo：每次 render 都建新物件的話，shader 會被判定為變更而重編譯
    const beamRef = useRef();
    const beamUniforms = useMemo(
        () => ({
            uColor: { value: new Color(BEAM_COLOR) },
            uTime: { value: 0 },
            uStrength: { value: BEAM_STRENGTH },
        }),
        []
    );

    useFrame((_, delta) => {
        // 光柱亮度隨吸取進度提升。放在 reduceMotion 判斷之前 ——
        // 這是拖曳的直接回饋，不是自走的動畫。
        beamRef.current.uniforms.uStrength.value =
            BEAM_STRENGTH * (1 + BEAM_LIFT_BOOST * drag.current.lift);

        if (reduceMotion) return;
        t.current += delta;
        ref.current.rotation.y += delta * SAUCER_SPIN;
        ref.current.position.y = Math.sin(t.current * BOB_FREQ) * BOB_AMP;
        // 直接改 uniform，不走 state —— 每幀 setState 會把 React 拖垮
        beamRef.current.uniforms.uTime.value = t.current;
    });

    return (
        <group ref={ref}>
            {/* 碟身：輪廓線繞 Y 軸車削一圈。實心後段數要拉高，否則邊緣會出現稜角 */}
            <mesh castShadow={false} receiveShadow={false}>
                <latheGeometry args={[profile, 64]} />
                <meshStandardMaterial
                    color="#bbbbbb"
                    roughness={0.32}
                    metalness={0.25} // 帶金屬感，讓打光在弧面上拉出高光帶
                />
            </mesh>

            {/* 牽引光柱：開口向下的錐狀薄殼（openEnded，不封頂底）。
                位置讓上緣剛好塞進碟底，往下擴散。 */}
            <mesh position={[0, -SAUCER_R * (0.1 + BEAM_HEIGHT / 2), 0]}>
                <cylinderGeometry
                    args={[
                        SAUCER_R * BEAM_TOP_R,
                        SAUCER_R * BEAM_BOTTOM_R,
                        SAUCER_R * BEAM_HEIGHT,
                        48, // 徑向段數
                        1,
                        true, // openEnded：只要側面那層殼
                    ]}
                />
                <shaderMaterial
                    ref={beamRef}
                    uniforms={beamUniforms}
                    vertexShader={BEAM_VERT}
                    fragmentShader={BEAM_FRAG}
                    transparent
                    // 疊加混合：光是相加的，不會遮住後面的東西
                    blending={AdditiveBlending}
                    // 不寫入深度緩衝，否則薄殼的前後兩面會互相裁切
                    depthWrite={false}
                    // 從外面看到的是背面那層殼，兩面都要畫
                    side={DoubleSide}
                />
            </mesh>
        </group>
    );
}

/**
 * WordRing — 圓周排列與每幀動畫（內部組件，僅在 Canvas 內使用）
 *
 * @param {string[]} items - 要排列的文字
 * @param {React.MutableRefObject} drag - 與外層共享的拖曳狀態
 */
function WordRing({ items, drag }) {
    const groupRef = useRef();
    const { viewport } = useThree();

    // 尊重「減少動態效果」偏好：只關閉自轉，使用者主動拖曳仍然保留
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // 排版只跟 items 有關，不必每幀重算
    const { radius, placed } = useMemo(() => layoutRing(items), [items]);

    // 窄螢幕等比縮小，避免圓柱寬度超出可視範圍；桌機維持原尺寸。
    // 所需寬度由半徑推得，改 GAP 或增刪詞彙時不用回頭調這裡。
    const scale = Math.min(1, viewport.width / (radius * 2 + FIT_MARGIN));

    useFrame((state, delta) => {
        const d = drag.current;

        if (d.dragging) {
            // 速度用「量」的：比對前後兩幀的角度差，
            // 這樣一幀內觸發幾次 pointermove 都不影響準確度
            d.velocity = d.offset - d.prevOffset;
        } else {
            d.velocity *= FRICTION; // 慣性衰減
            d.offset += d.velocity;
            if (!reduceMotion) {
                d.offset -= delta * SPEED; // 自轉
            }
        }

        d.prevOffset = d.offset;
        // rotation.y 只有這一處在寫：自轉與拖曳是同一個 offset 的兩種改法
        groupRef.current.rotation.y = d.offset;

        // 吸取進度：拖曳中趨近 1、放開後回到 0。Cow 與 Saucer 都讀這個值，
        // 由 WordRing 統一更新，避免兩邊各算一份而不同步。
        //
        // 1 - exp(-k·dt) 是「每幀往目標靠近固定比例」的 frame-rate independent 寫法。
        // 直接寫 lift += (target - lift) * 0.05 的話，144Hz 螢幕會比 60Hz 快 2.4 倍。
        const target = d.dragging ? 1 : 0;
        d.lift += (target - d.lift) * (1 - Math.exp(-LIFT_EASE * delta));
    });

    return (
        // 外層只負責靜態的傾斜與縮放，內層才是每幀自轉的那一顆。
        // 拆成兩層是為了避開 Euler 角的套用順序問題 —— 若把 rotation.x
        // 和 rotation.y 放在同一個 group 上，傾斜軸會隨自轉一起跑，變成擺動。
        <group rotation={[TILT, 0, 0]} scale={scale}>
            {/* 飛碟與牛都掛在傾斜層、自轉層之外：跟著整體傾斜，但不被拖曳帶動。
                兩者各自獨立運動 —— 牛不該跟著飛碟同步浮沉。
                外面再包一層只管位移的 group，UFO_Y 就能整組上下移動而不影響
                彼此的相對位置（飛碟、光柱、牛三者的距離都是刻意調過的）。 */}
            <group position={[0, UFO_Y, 0]}>
                <Saucer drag={drag} />
                <Cow drag={drag} />
            </group>

            <group ref={groupRef}>
                {placed.map(({ label, angle }) => (
                    // 極座標：x 用 sin、z 用 cos，使 angle=0 時正對相機；
                    // rotation-y 等於同一個角度，讓文字平面切齊圓柱表面朝外
                    <Text
                        key={label}
                        font={fontUrl}
                        fontSize={FONT_SIZE}
                        color="#ededec"
                        fillOpacity={0.55}
                        anchorX="center"
                        anchorY="bottom"
                        letterSpacing={LETTER_SPACING}
                        // 讓字沿圓柱表面彎曲，而非一片平面 —— 沒有這行
                        // 五個平面排成一圈只會是五邊形。負值代表往後彎
                        // （曲率中心落在文字後方，正好與 group 原點重合）
                        curveRadius={-radius}
                        position={[
                            Math.sin(angle) * radius,
                            0,
                            Math.cos(angle) * radius,
                        ]}
                        rotation={[0, angle, 0]}
                    >
                        {label.toUpperCase()}
                    </Text>
                ))}
            </group>
        </group>
    );
}

/**
 * PracticeCylinder — Canvas 容器與互動層
 *
 * @param {string[]} items - 傳給 WordRing 的文字列表
 */
export default function PracticeCylinder({ items }) {
    // 進出視窗狀態，用來切換 frameloop
    const [visible, setVisible] = useState(false);
    // 跨越 Canvas 邊界的共享狀態盒；用 ref 而非 state，避免每次指標移動都 re-render
    const drag = useRef({
        dragging: false,
        lastX: 0,
        offset: 0, // 圓柱當前總角度
        velocity: 0,
        prevOffset: 0,
        lift: 0, // 牛被吸起的進度 0~1，由 WordRing 每幀緩動、Cow 與 Saucer 讀取
    });
    const wrapRef = useRef(null);

    // 離開視窗就停掉 render loop。frameloop="never" 會保留 WebGL context
    // 與已載入的字型，捲回來時瞬間恢復，比整個 unmount 划算。
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { rootMargin: "200px" } // 提前啟動，避免捲到時看到靜止的一瞬間
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // 指標事件綁在 DOM 容器上（而非 mesh），省去一片隱形的 catcher plane。
    // move / up 綁 window：拖到區塊外仍能追蹤，放開也收得到，不會卡在拖曳狀態。
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const onDown = (e) => {
            drag.current.dragging = true;
            drag.current.lastX = e.clientX;
            el.classList.add("is-dragging");
        };
        const onMove = (e) => {
            if (!drag.current.dragging) return;
            const dx = e.clientX - drag.current.lastX;
            drag.current.lastX = e.clientX;
            drag.current.offset += dx * SENS;
        };
        const onUp = () => {
            drag.current.dragging = false;
            el.classList.remove("is-dragging");
        };

        el.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return () => {
            el.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, []);

    return (
        <div className="practice-3d" ref={wrapRef}>
            <Canvas
                frameloop={visible ? "always" : "never"}
                camera={{ position: [0, 0, 8], fov: 40 }}
                gl={{ alpha: true }} // 讓全站背景影片透出來
                dpr={[1, 2]} // 上限鎖 2，避免在 Retina 上與影片解碼搶 GPU
            >
                {/* 燈只作用在碟身（唯一使用受光材質的物件）。
                    暗底＋單一主光＋冷色補光：讓弧面拉出高光帶而非整片平塗，
                    背面補一盞弱光避免暗側全黑、輪廓糊進背景影片裡。 */}
                <ambientLight intensity={0.55} />
                <directionalLight position={[4, 6, 5]} intensity={2.4} />
                <directionalLight
                    position={[-5, 1, -4]}
                    intensity={0.7}
                    color="#8ab4ff"
                />

                <WordRing items={items} drag={drag} />
            </Canvas>
        </div>
    );
}
