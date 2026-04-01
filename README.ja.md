<h1><a href="https://ospec.ai/" target="_blank" rel="noopener noreferrer">OSpec.ai</a></h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@clawplays/ospec-cli"><img src="https://img.shields.io/npm/v/%40clawplays%2Fospec-cli?style=for-the-badge&logo=npm&label=npm" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@clawplays/ospec-cli"><img src="https://img.shields.io/npm/dm/%40clawplays%2Fospec-cli?style=for-the-badge&logo=npm&label=downloads&cacheSeconds=300" alt="npm downloads"></a>
  <a href="https://github.com/clawplays/ospec/stargazers"><img src="https://img.shields.io/github/stars/clawplays/ospec?style=for-the-badge&logo=github" alt="GitHub stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/clawplays/ospec?style=for-the-badge&color=green" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/npm-8%2B-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm 8+">
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/workflow-3_steps-0F766E?style=flat-square" alt="3-step workflow">
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh-CN.md">涓枃</a> |
  <strong>鏃ユ湰瑾?/strong>
</p>

OSpec 銇?AI 瀵捐┍銈炽儵銉溿儸銉笺偡銉с兂鍚戙亼銇儔銈儱銉°兂銉堥鍕曢枊鐧恒儻銉笺偗銉曘儹銉笺仹銇欍€傛渶鍒濄伀銉夈偔銉ャ儭銉炽儓銇ц浠躲仺澶夋洿銈掓槑纰恒伀銇椼€併仢銇緦 AI 銇ㄣ伄鍗旇銇у疅瑁呫€佹瑷笺€併偄銉笺偒銈ゃ儢銈掗€层倎銇俱仚銆?

<p align="center">
  <a href="docs/README.ja.md">銉夈偔銉ャ儭銉炽儓</a> |
  <a href="docs/prompt-guide.ja.md">銉椼儹銉炽儣銉堛偓銈ゃ儔</a> |
  <a href="docs/usage.md">浣裤亜鏂?/a> |
  <a href="docs/project-overview.md">姒傝</a> |
  <a href="docs/installation.md">銈ゃ兂銈广儓銉笺儷</a> |
  <a href="https://github.com/clawplays/ospec/issues">Issues</a>
</p>
本プロジェクトは正式名称を OSpec に変更し、メインリポジトリは https://github.com/clawplays/ospec に移行しました。

## npm 銇с偆銉炽偣銉堛兗銉?

```bash
npm install -g @clawplays/ospec-cli
```

## 鎺ㄥエ銉椼儹銉炽儣銉?

OSpec 銇埄鐢ㄣ伅銆併伝銇ㄣ倱銇┿伄鍫村悎銇撱伄 3 銈广儐銉冦儣銇у崄鍒嗐仹銇欍€?

1. 銉椼儹銈搞偋銈儓銉囥偅銉偗銉堛儶銇?OSpec 銈掑垵鏈熷寲銇欍倠
2. 瑕佷欢銆併儔銈儱銉°兂銉堟洿鏂般€併儛銈颁慨姝ｃ伄銇熴倎銇?change 銈掍綔鎴愩仐銇﹂€层倎銈?
3. 鍙椼亼鍏ャ倢瀹屼簡寰屻伀銇濄伄 change 銈掋偄銉笺偒銈ゃ儢銇欍倠

### 1. 銉椼儹銈搞偋銈儓銉囥偅銉偗銉堛儶銇у垵鏈熷寲銇欍倠

鎺ㄥエ銉椼儹銉炽儣銉?

```text
OSpec 銈掍娇銇ｃ仸銇撱伄銉椼儹銈搞偋銈儓銈掑垵鏈熷寲銇椼仸銇忋仩銇曘亜銆?
```

Claude / Codex skill:

```text
$ospec 銈掍娇銇ｃ仸銇撱伄銉椼儹銈搞偋銈儓銈掑垵鏈熷寲銇椼仸銇忋仩銇曘亜銆?
```

<details>
<summary>銈炽優銉炽儔銉┿偆銉?/summary>

```bash
ospec init .
ospec init . --summary "Internal admin portal for operations"
ospec init . --summary "Internal admin portal for operations" --tech-stack node,react,postgres
ospec init . --architecture "Single web app with API and shared auth" --document-language ja-JP
```

銉°儮:

- `--summary`: 鐢熸垚銉夈偔銉ャ儭銉炽儓銇浉銇嶈炯銈€銉椼儹銈搞偋銈儓姒傝
- `--tech-stack`: `node,react,postgres` 銇倛銇嗐仾銈兂銉炲尯鍒囥倞銇妧琛撱偣銈裤儍銈?
- `--architecture`: 鐭亜銈兗銈儐銈儊銉ｈ鏄?
- `--document-language`: 鐢熸垚銉夈偔銉ャ儭銉炽儓銇█瑾炪€傞€氬父銇?`en-US`銆乣zh-CN`銆乣ja-JP`
- 鍊ゃ倰娓°仐銇熷牬鍚堛伅銇濄伄鍐呭銈掍娇銇ｃ仸銉夈偔銉ャ儭銉炽儓銈掔敓鎴愩仐銇俱仚
- 鍊ゃ倰娓°仌銇亜鍫村悎銇棦瀛樸儔銈儱銉°兂銉堛倰鍎厛鍒╃敤銇椼€佺劇銇戙倢銇拌瀹岀敤銇儣銉兗銈广儧銉儉銈掔敓鎴愩仐銇俱仚

</details>

### 2. Change 銈掍綔鎴愩仐銇﹂€层倎銈?

瑕佷欢瀹熻銆併儔銈儱銉°兂銉堟洿鏂般€併儶銉曘偂銈偪銆併儛銈颁慨姝ｃ伅銇撱伄娴併倢銈掍娇銇勩伨銇欍€?

鎺ㄥエ銉椼儹銉炽儣銉?

```text
OSpec 銈掍娇銇ｃ仸銇撱伄瑕佷欢銇?change 銈掍綔鎴愩仐銇﹂€层倎銇︺亸銇犮仌銇勩€?
```

Claude / Codex skill:

```text
$ospec-change 銈掍娇銇ｃ仸銇撱伄瑕佷欢銇?change 銈掍綔鎴愩仐銇﹂€层倎銇︺亸銇犮仌銇勩€?
```

![OSpec Change slash command example](docs/assets/ospecchange-slash-command.ja.svg)

<details>
<summary>銈炽優銉炽儔銉┿偆銉?/summary>

```bash
ospec new docs-homepage-refresh .
ospec new fix-login-timeout .
ospec new update-billing-copy .
```

</details>

### 3. 鍙椼亼鍏ャ倢瀹屼簡寰屻伀銈兗銈偆銉栥仚銈?

銉囥儣銉偆銆併儐銈广儓銆丵A銆併伨銇熴伅銇濄伄浠栥伄鍙椼亼鍏ャ倢纰鸿獚銇岀祩銈忋仯銇熷緦銇€佺⒑瑾嶆笀銇裤伄 change 銈掋偄銉笺偒銈ゃ儢銇椼伨銇欍€?

鎺ㄥエ銉椼儹銉炽儣銉?

```text
OSpec 銈掍娇銇ｃ仸鎵胯獚娓堛伩銇?change 銈掋偄銉笺偒銈ゃ儢銇椼仸銇忋仩銇曘亜銆?
```

Claude / Codex skill:

```text
$ospec 銈掍娇銇ｃ仸鎵胯獚娓堛伩銇?change 銈掋偄銉笺偒銈ゃ儢銇椼仸銇忋仩銇曘亜銆?
```

<details>
<summary>銈炽優銉炽儔銉┿偆銉?/summary>

```bash
ospec verify changes/active/<change-name>
ospec finalize changes/active/<change-name>
```

銉°儮:

- 鍏堛伀銉椼儹銈搞偋銈儓鍥烘湁銇儑銉椼儹銈ゃ€併儐銈广儓銆丵A 銈掑疅琛屻仐銇俱仚
- `ospec verify` 銇?change 銇屻偄銉笺偒銈ゃ儢鍙兘銇嬬⒑瑾嶃仐銇俱仚
- `ospec finalize` 銇с偆銉炽儑銉冦偗銈广倰鍐嶆绡夈仐銆乧hange 銈掋偄銉笺偒銈ゃ儢銇椼伨銇?

</details>

## OSpec 銇嫊浣溿偆銉°兗銈?

```text
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 1. USER REQUEST                                               鈹?
鈹?    "Use OSpec to create and advance a change for this task."  鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 2. INIT TO CHANGE-READY                                       鈹?
鈹?    ospec init                                                 鈹?
鈹?    - .skillrc                                                 鈹?
鈹?    - .ospec/                                                  鈹?
鈹?    - changes/active + changes/archived                        鈹?
鈹?    - root SKILL files and for-ai guidance                     鈹?
鈹?    - docs/project/* baseline knowledge docs                   鈹?
鈹?    - reuse docs or fall back to placeholders                  鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 3. EXECUTION                                                  鈹?
鈹?    ospec new <change-name>                                    鈹?
鈹?    ospec progress                                             鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 4. DEPLOY + VALIDATE                                          鈹?
鈹?    project deploy / test / QA                                 鈹?
鈹?    ospec verify                                               鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 5. ARCHIVE                                                    鈹?
鈹?    ospec finalize                                             鈹?
鈹?    rebuild index + archive                                    鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
```

## 3 銇ゃ伄涓昏姒傚康

| 姒傚康 | 瑾槑 |
|------|------|
| **Protocol Shell** | `.skillrc`銆乣.ospec/`銆乣changes/`銆併儷銉笺儓銇?`SKILL.md`銆乣SKILL.index.json`銆乣for-ai/` 銈掑惈銈€鏈€灏忋伄鍗旇楠ㄦ牸 |
| **Project Knowledge Layer** | `docs/project/*`銆併儸銈ゃ儰銉笺儔 skill 銉曘偂銈ゃ儷銆乮ndex 鐘舵厠銇仼 AI 銇岀稒缍氱殑銇弬鐓с仚銈嬨偝銉炽儐銈偣銉?|
| **Active Change** | 1 銇ゃ伄瑕佷欢灏傜敤銇疅琛屻偝銉炽儐銉娿€傞€氬父 `proposal.md`銆乣tasks.md`銆乣state.json`銆乣verification.md`銆乣review.md` 銈掓寔銇?|

## 涓汇仾姗熻兘

- **change-ready 鍒濇湡鍖?*: `ospec init` 銇?protocol shell 銇ㄥ熀绀庛儔銈儱銉°兂銉堛倰涓€搴︺伀鐢熸垚
- **銈偆銉変粯銇嶅垵鏈熷寲**: AI 鏀彺鏅傘伅涓嶈冻銇椼仸銇勩倠姒傝銈勬妧琛撱偣銈裤儍銈倰 1 鍥炪仩銇戠⒑瑾嶅彲鑳?
- **銉夈偔銉ャ儭銉炽儓淇濆畧**: `ospec docs generate` 銇у緦銇嬨倝鐭ヨ瓨銉偆銉ゃ倰鏇存柊銉讳慨寰?
- **change 瀹熻銇拷璺?*: proposal銆乼asks銆乻tate銆乿erification銆乺eview 銈掔稒缍氱殑銇弮銇堛倠
- **銈儱銉兼敮鎻?*: `queue` 銇?`run` 銇ц鏁?change 銇槑绀虹殑銇疅琛屻倰绠＄悊
- **銉椼儵銈般偆銉炽偛銉笺儓**: Stitch 銇儑銈躲偆銉炽儸銉撱儱銉笺仺 Checkpoint 銇嚜鍕曞寲銉併偋銉冦偗銈掋偟銉濄兗銉?
- **妯欐簴銈儹銉笺偤銈偊銉?*: `finalize` 銇屾瑷笺€併偆銉炽儑銉冦偗銈瑰啀妲嬬瘔銆併偄銉笺偒銈ゃ儢銈掕銇?

## 銉椼儵銈般偆銉虫鑳?

OSpec 銇伅銆佹枃鏇搁鍕曘儻銉笺偗銉曘儹銉笺伀 UI 銉儞銉ャ兗銇ㄣ儠銉兗妞滆銈掕拷鍔犮仚銈?2 銇ゃ伄銈儣銈枫儳銉炽儣銉┿偘銈ゃ兂銇屻亗銈娿伨銇欍€?

### Stitch

Stitch 銇儦銉笺偢銉囥偠銈ゃ兂銉儞銉ャ兗銇ㄣ儣銉儞銉ャ兗鍏辨湁銇娇銇勩伨銇欍€傘儵銉炽儑銈ｃ兂銈般儦銉笺偢銈?UI 澶夋洿銇屽銇?change 銇悜銇勩仸銇勩伨銇欍€?

AI 瀵捐┍:

```text
OSpec 銈掍娇銇ｃ仸 Stitch 銉椼儵銈般偆銉炽倰鏈夊姽銇仐銇︺亸銇犮仌銇勩€?
```

Claude / Codex skill:

```text
$ospec 銈掍娇銇ｃ仸 Stitch 銉椼儵銈般偆銉炽倰鏈夊姽銇仐銇︺亸銇犮仌銇勩€?
```

<details>
<summary>銈炽優銉炽儔銉┿偆銉?/summary>

```bash
ospec plugins enable stitch .
```

</details>

### Checkpoint

Checkpoint 銇敾闈儠銉兗妞滆銇ㄨ嚜鍕曘儊銈с儍銈伀浣裤亜銇俱仚銆傞噸瑕併儠銉兗銈勫彈銇戝叆銈屽墠銇儵銉炽偪銈ゃ儬妞滆銇悜銇勩仸銇勩伨銇欍€?

AI 瀵捐┍:

```text
OSpec 銈掍娇銇ｃ仸 Checkpoint 銉椼儵銈般偆銉炽倰鏈夊姽銇仐銇︺亸銇犮仌銇勩€?
```

Claude / Codex skill:

```text
$ospec 銈掍娇銇ｃ仸 Checkpoint 銉椼儵銈般偆銉炽倰鏈夊姽銇仐銇︺亸銇犮仌銇勩€?
```

<details>
<summary>銈炽優銉炽儔銉┿偆銉?/summary>

```bash
ospec plugins enable checkpoint . --base-url http://127.0.0.1:3000
```

銉°儮:

- `--base-url` 銇嚜鍕曘儊銈с儍銈璞°仺銇倠璧峰嫊涓偄銉椼儶銇?URL 銈掓寚瀹氥仐銇俱仚

</details>

## 銉夈偔銉ャ儭銉炽儓

### 銈炽偄銉夈偔銉ャ儭銉炽儓

- [Docs Index](docs/README.ja.md)
- [Prompt Guide](docs/prompt-guide.ja.md)
- [Usage](docs/usage.md)
- [Project Overview](docs/project-overview.md)
- [Installation](docs/installation.md)
- [Skills Installation](docs/skills-installation.md)

### 銉椼儵銈般偆銉充粫妲?

- [Stitch Plugin Spec](docs/stitch-plugin-spec.zh-CN.md)
- [Checkpoint Plugin Spec](docs/checkpoint-plugin-spec.zh-CN.md)

## 銉儩銈搞儓銉鎴?

```text
dist/                       銈炽兂銉戙偆銉笀銇?CLI 銉┿兂銈裤偆銉?
assets/                     绠＄悊瀵捐薄銉椼儹銉堛偝銉硣鐢ｃ€乭ooks銆乻kill payload
docs/                       鍏枊銉夈偔銉ャ儭銉炽儓
scripts/                    銉儶銉笺偣銇ㄣ偆銉炽偣銉堛兗銉鍔┿偣銈儶銉椼儓
.ospec/templates/hooks/     銉戙儍銈便兗銈稿悓姊便伄 Git hook 銉嗐兂銉椼儸銉笺儓
```

## License

This project is licensed under the [MIT License](LICENSE).
