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
  <strong>涓枃</strong> |
  <a href="README.ja.md">鏃ユ湰瑾?/a>
</p>

OSpec 鏄竴涓潰鍚?AI 瀵硅瘽鍗忎綔鐨勬枃妗ｉ┍鍔ㄥ紑鍙戝伐浣滄祦锛岃浣犲厛鐢ㄦ枃妗ｆ槑纭渶姹備笌鍙樻洿锛屽啀椹卞姩 AI 瀹炵幇銆侀獙璇佷笌褰掓。銆?

<p align="center">
  <a href="docs/README.zh-CN.md">鏂囨。鍏ュ彛</a> |
  <a href="docs/prompt-guide.zh-CN.md">鎻愮ず璇嶆枃妗?/a> |
  <a href="docs/usage.zh-CN.md">浣跨敤璇存槑</a> |
  <a href="docs/project-overview.zh-CN.md">椤圭洰浠嬬粛</a> |
  <a href="docs/installation.zh-CN.md">瀹夎璇存槑</a> |
  <a href="https://github.com/clawplays/ospec/issues">Issues</a>
</p>
本项目现已正式更名为 OSpec，主仓库现已切换为 https://github.com/clawplays/ospec 。

## npm 瀹夎

```bash
npm install -g @clawplays/ospec-cli
```

## 鎺ㄨ崘鎻愮ず璇?

澶у鏁板洟闃熶娇鐢?OSpec锛屽彧瑕?3 姝ワ細

1. 鍦ㄤ綘鐨勯」鐩洰褰曞垵濮嬪寲椤圭洰
2. 涓烘枃妗ｆ洿鏂般€侀渶姹傚紑鍙戞垨 Bug 淇鍒涘缓骞舵帹杩涗竴涓?change
3. 鍦ㄩ渶姹傞獙鏀堕€氳繃鍚庡綊妗ｈ繖涓?change

### 1. 鍦ㄤ綘鐨勯」鐩洰褰曞垵濮嬪寲椤圭洰

鎺ㄨ崘鎻愮ず璇嶏細

```text
浣跨敤 OSpec 鍒濆鍖栬繖涓」鐩€?
```

Claude / Codex Skill 鏂瑰紡锛?

```text
浣跨敤 $ospec 鍒濆鍖栬繖涓」鐩€?
```

<details>
<summary>鍛戒护琛?/summary>

```bash
ospec init .
ospec init . --summary "杩愯惀鍚庡彴"
ospec init . --summary "杩愯惀鍚庡彴" --tech-stack node,react,postgres
ospec init . --architecture "鍗曚綋 Web 搴旂敤 + API + 缁熶竴閴存潈" --document-language zh-CN
```

鍛戒护琛岃鏄庯細

- `--summary`锛氶」鐩鍐碉紝浼氬啓鍏ョ敓鎴愮殑椤圭洰鏂囨。
- `--tech-stack`锛氭妧鏈爤锛屼娇鐢ㄩ€楀彿鍒嗛殧锛屼緥濡?`node,react,postgres`
- `--architecture`锛氱畝鐭殑鏋舵瀯璇存槑
- `--document-language`锛氱敓鎴愭枃妗ｇ殑璇█锛岄€氬父浣跨敤 `zh-CN` 鎴?`en-US`
- 浼犱簡杩欎簺鍙傛暟锛屽氨鎸変綘鎻愪緵鐨勫唴瀹圭敓鎴愰」鐩鏄?
- 涓嶄紶鏃讹紝OSpec 浼氫紭鍏堝鐢ㄧ幇鏈夋枃妗ｏ紱濡傛灉娌℃湁锛屽氨鍏堢敓鎴愬緟琛ュ厖鐨勯粯璁ゆ枃妗?

</details>

### 2. 鍒涘缓骞舵帹杩涗竴涓?Change

鏂囨。鏇存柊銆侀渶姹傚紑鍙戙€侀噸鏋勩€丅ug 淇锛岄兘浣跨敤杩欎竴绫绘柟寮忋€?

鎺ㄨ崘鎻愮ず璇嶏細

```text
浣跨敤 OSpec 涓鸿繖涓渶姹傚垱寤哄苟鎺ㄨ繘涓€涓?change銆?
```

Claude / Codex Skill 鏂瑰紡锛?

```text
浣跨敤 $ospec-change 涓鸿繖涓渶姹傚垱寤哄苟鎺ㄨ繘涓€涓?change銆?
```

![OSpec Change Slash Command 绀轰緥](docs/assets/ospecchange-slash-command.zh-CN.svg)

<details>
<summary>鍛戒护琛?/summary>

```bash
ospec new docs-homepage-refresh .
ospec new fix-login-timeout .
ospec new update-billing-copy .
```

</details>

### 3. 楠屾敹閫氳繃鍚庡綊妗?

褰撻渶姹傚凡缁忓畬鎴愰儴缃层€佹祴璇曘€丵A 鎴栦笟鍔￠獙鏀跺悗锛屽啀褰掓。杩欎釜 change銆?

鎺ㄨ崘鎻愮ず璇嶏細

```text
浣跨敤 OSpec 褰掓。杩欎釜宸查獙鏀堕€氳繃鐨?change銆?
```

Claude / Codex Skill 鏂瑰紡锛?

```text
浣跨敤 $ospec 褰掓。杩欎釜宸查獙鏀堕€氳繃鐨?change銆?
```

<details>
<summary>鍛戒护琛?/summary>

```bash
ospec verify changes/active/<change-name>
ospec finalize changes/active/<change-name>
```

褰掓。璇存槑锛?

- 鍏堝畬鎴愪綘椤圭洰鑷繁鐨勯儴缃层€佹祴璇曘€丵A 鎴栭獙鏀舵祦绋?
- 浣跨敤 `ospec verify` 纭褰撳墠 change 宸叉弧瓒冲綊妗ｆ潯浠?
- 浣跨敤 `ospec finalize` 閲嶅缓绱㈠紩骞跺綊妗ｈ繖涓凡楠屾敹閫氳繃鐨?change

</details>

## OSpec 鐨勫伐浣滄柟寮?

```text
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 1. 鐢ㄦ埛鎻愬嚭闇€姹?                                               鈹?
鈹?    鈥滀娇鐢?OSpec 涓鸿繖涓换鍔″垱寤哄苟鎺ㄨ繘涓€涓?change銆傗€?            鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 2. 鍒濆鍖栧埌 change-ready                                       鈹?
鈹?    ospec init                                                  鈹?
鈹?    - .skillrc                                                  鈹?
鈹?    - .ospec/                                                   鈹?
鈹?    - changes/active + changes/archived                         鈹?
鈹?    - 鏍圭洰褰?SKILL 鏂囦欢鍜?for-ai 瑙勫垯鏂囨。                       鈹?
鈹?    - docs/project/* 鍩虹鐭ヨ瘑鏂囨。                               鈹?
鈹?    - 澶嶇敤宸叉湁鏂囨。鎴栧洖閫€鍒板崰浣嶆枃妗?                             鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 3. 鎵ц                                                        鈹?
鈹?    ospec new <change-name>                                     鈹?
鈹?    ospec progress                                              鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 4. 閮ㄧ讲骞堕獙璇?                                                 鈹?
鈹?    椤圭洰閮ㄧ讲 / 娴嬭瘯 / QA                                        鈹?
鈹?    ospec verify                                                鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
                              鈹?
                              鈻?
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
鈹? 5. 褰掓。                                                        鈹?
鈹?    ospec finalize                                              鈹?
鈹?    閲嶅缓绱㈠紩 + archive                                           鈹?
鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?
```

## 涓変釜鏍稿績姒傚康

| 姒傚康 | 璇存槑 |
|------|------|
| **鍗忚澹?* | 鏈€灏忓崗浣滈鏋讹紝鍖呮嫭 `.skillrc`銆乣.ospec/`銆乣changes/`銆佹牴鐩綍 `SKILL.md`銆乣SKILL.index.json` 鍜?`for-ai/` 瑙勫垯鏂囨。銆?|
| **椤圭洰鐭ヨ瘑灞?* | 缁?AI 鎸佺画璇诲彇鐨勯」鐩笂涓嬫枃锛屼緥濡?`docs/project/*`銆佸垎灞傛妧鑳芥枃浠跺拰绱㈠紩鐘舵€併€?|
| **Active Change** | 鍗曚釜闇€姹傜殑鐙珛鎵ц瀹瑰櫒锛岄€氬父鍖呭惈 `proposal.md`銆乣tasks.md`銆乣state.json`銆乣verification.md`銆乣review.md`銆?|

## 鍔熻兘鐗规€?

- **涓€姝ュ埌 change-ready 鐨勫垵濮嬪寲**锛歚ospec init` 涓€娆℃€у垱寤哄崗璁３鍜屽熀纭€椤圭洰鐭ヨ瘑鏂囨。銆?
- **甯﹁拷闂兘鍔涚殑鍒濆鍖?*锛氬湪 AI 鍗忎綔鍒濆鍖栦腑锛屽鏋滅己灏戦」鐩鍐垫垨鎶€鏈爤锛屽彲浠ュ彧杩介棶涓€娆★紱绾?CLI 鍒濆鍖栧垯鐩存帴钀藉崰浣嶆枃妗ｃ€?
- **鐭ヨ瘑灞傜淮鎶ゅ懡浠?*锛歚ospec docs generate` 鐢ㄤ簬鍚庣画鍒锋柊銆佷慨澶嶆垨琛ラ綈椤圭洰鐭ヨ瘑灞傘€?
- **闇€姹傛墽琛屽彲杩借釜**锛氫竴涓?change 鍙互鎸佺画瀵归綈 proposal銆乼asks銆乻tate銆乿erification銆乺eview銆?
- **鏄惧紡闃熷垪鑳藉姏**锛歚queue` 鍜?`run` 鐢ㄤ簬澶?change 鍦烘櫙锛屼笉浼氶粯璁ゅ伔鍋疯繘鍏ラ槦鍒楁ā寮忋€?
- **鎻掍欢宸ヤ綔娴侀棬绂?*锛氬唴缃敮鎸?Stitch 璁捐瀹℃牳鍜?Checkpoint 鑷姩鍖栨鏌ャ€?
- **skills 绠＄悊**锛氭敮鎸?Codex 鍜?Claude Code 鐨?OSpec skill 瀹夎涓庢鏌ャ€?
- **鏍囧噯鏀跺彛璺緞**锛歚finalize` 璐熻矗楠岃瘉銆侀噸寤虹储寮曞拰褰掓。锛孏it 鎻愪氦浠嶄繚鎸佹墜鍔ㄥ彲鎺с€?

## 鎻掍欢鍔熻兘

OSpec 鍐呯疆涓や釜鍙€夋彃浠讹紝鐢ㄦ潵鎶?UI 瀹℃牳鍜屾祦绋嬮獙璇佹帴鍏ュ埌鏂囨。椹卞姩浜や粯娴佺▼涓€?

### Stitch

鐢ㄤ簬椤甸潰璁捐瀹℃牳涓庨瑙堝崗浣滐紝閫傚悎钀藉湴椤点€佽惀閿€椤靛拰 UI 鍙樺寲杈冨鐨勯渶姹傘€?

AI 瀵硅瘽鏂瑰紡锛?

```text
浣跨敤 OSpec 甯垜鎵撳紑 Stitch 鎻掍欢銆?
```

Claude / Codex Skill 鏂瑰紡锛?

```text
浣跨敤 $ospec 甯垜鎵撳紑 Stitch 鎻掍欢銆?
```

<details>
<summary>鍛戒护琛?/summary>

```bash
ospec plugins enable stitch .
```

</details>

### Checkpoint

鐢ㄤ簬搴旂敤娴佺▼楠岃瘉涓庤嚜鍔ㄥ寲妫€鏌ワ紝閫傚悎鎻愪氦娴佺▼銆佸叧閿矾寰勫拰楠屾敹鍓嶇殑杩愯楠岃瘉銆?

AI 瀵硅瘽鏂瑰紡锛?

```text
浣跨敤 OSpec 甯垜鎵撳紑 Checkpoint 鎻掍欢銆?
```

Claude / Codex Skill 鏂瑰紡锛?

```text
浣跨敤 $ospec 甯垜鎵撳紑 Checkpoint 鎻掍欢銆?
```

<details>
<summary>鍛戒护琛?/summary>

```bash
ospec plugins enable checkpoint . --base-url http://127.0.0.1:3000
```

璇存槑锛?

- `--base-url` 鐢ㄦ潵鎸囧畾杩愯涓殑搴旂敤鍦板潃锛屼緵鑷姩鍖栨鏌ヤ娇鐢?

</details>

## 鏂囨。鍏ュ彛

### 鏍稿績鏂囨。

- [鏂囨。鎬昏](docs/README.zh-CN.md)
- [鎻愮ず璇嶆枃妗(docs/prompt-guide.zh-CN.md)
- [浣跨敤璇存槑](docs/usage.zh-CN.md)
- [椤圭洰浠嬬粛](docs/project-overview.zh-CN.md)
- [瀹夎璇存槑](docs/installation.zh-CN.md)
- [Skills 瀹夎璇存槑](docs/skills-installation.zh-CN.md)

### 鎻掍欢楂樼骇璇存槑

- [Stitch 鎻掍欢瑙勮寖](docs/stitch-plugin-spec.zh-CN.md)
- [Checkpoint 鎻掍欢瑙勮寖](docs/checkpoint-plugin-spec.zh-CN.md)

## 浠撳簱缁撴瀯

```text
dist/                       缂栬瘧鍚庣殑 CLI 杩愯鏃?
assets/                     鎵樼鍗忚璧勪骇銆乭ooks 鍜?skill 杞借嵎
docs/                       瀵瑰鏂囨。
scripts/                    鍙戝竷鍜屽畨瑁呰緟鍔╄剼鏈?
.ospec/templates/hooks/     闅忓寘鍒嗗彂鐨?Git hook 妯℃澘
```

## License

鏈」鐩娇鐢?[MIT License](LICENSE)銆?
