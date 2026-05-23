# Agentic Study Cards

> 来自我个人的 agent 参与式学习 workflow：零散课堂材料进去，source-backed 学习卡片和笔记出来。

[English](README.md)

<img src="docs/assets/social-preview.png" alt="Agentic Study Cards social preview" width="100%">

这是一个移动端优先的静态学习卡片 starter，设计目标是让用户把零散学习材料交给自己的 AI agent 维护，而不是手动整理每一张卡片。
公开发布身份准备为 `benie-studio-oss`。

它不只是一个 flashcard UI，而是一套小而清楚、方便检查的学习内容维护流程：

```text
input/ 原始材料 -> agent 抽取 -> JSON -> 校验 -> 人类确认 -> 静态部署
```

JSON 是发布内容的 source of truth，原始图片、PDF、音频、笔记放在被 git 忽略的 `input/` 里。Agent 根据 skill 抽取 source-backed cards、texts、notes 和可选音频。验证通过后，由人类确认，再 push 到 GitHub，通过 Vercel、Cloudflare Pages 或 GitHub Pages 自动发布。

## 给人类

- 把 PDF、图片、音频、转写文本或笔记放进 `input/`。
- 让你的 agent 按 `docs/AGENT_WORKFLOW.md` 工作。
- 检查生成的 `data/decks/*.json` diff。
- 运行 `npm run validate`。
- 确认内容，再 commit / push，让静态托管平台重新部署。

## 给 Agents

从这里开始：

1. 读 `docs/AGENT_WORKFLOW.md`。
2. 读 `docs/SCHEMA.md`。
3. 读 `AGENTS.md`，了解这个 repo 给 agent 的本地操作规则。
4. 需要领域提示时，参考 `docs/skills/`。
5. 只更新 `data/` 下的可发布内容，以及 `audio/` 下的可选音频。
6. 运行 `node scripts/validate-content.js`。
7. commit 或 publish 前必须请人类确认。

关键约束：

- Cards 和 texts 必须 source-backed。
- 不要编造 source references。
- 不要用 TTS 覆盖 source audio。
- 词汇、概念、问答和技术术语都写成 `cards[]`。
- Agent runtime / adapter 的 glue code 留在静态 app 契约之外。

## 这个 Starter 包含什么

- 一套 agent 参与维护学习材料的 workflow，而不只是卡片 UI。
- 一个移动端优先的 liquid-glass 学习界面。
- 通用 `cards[]` 和 `texts[]` 数据结构，可用于语言学习、考试备考、技术认证或自定义学科。
- 可选的卡片音频和文本音频，并区分 source audio 与 TTS。
- Texts 页支持单条循环播放和常用语速选择。
- 与模型无关的 agent workflow 文档和 starter skill 模板。
- 无第三方依赖的内容校验脚本，检查 catalog、deck、必填字段、重复项和音频引用。

## 截图

<table>
  <tr>
    <td><img src="docs/assets/screenshots/library-day.png" alt="白天主题 Library 页面" width="220"></td>
    <td><img src="docs/assets/screenshots/cards-start-night.png" alt="夜间主题 Cards 开始页面" width="220"></td>
  </tr>
  <tr>
    <td><img src="docs/assets/screenshots/card-detail-night.png" alt="夜间主题卡片详情页面" width="220"></td>
    <td><img src="docs/assets/screenshots/text-reader-night.png" alt="带音频控制的 Text reader 页面" width="220"></td>
  </tr>
</table>

## 快速开始

```bash
python -m http.server 4173
```

然后打开 `http://localhost:4173`。

运行校验：

```bash
npm run validate
```

## 平台兼容

这不是 Windows-only 项目。App 是纯静态 HTML/CSS/JS，校验脚本只使用 Node 内置模块。

- macOS/Linux：`python3 -m http.server 4173`
- Windows：`python -m http.server 4173`
- 任意系统：用 `npm run validate` 做内容校验

JSON 里统一使用 repo-relative 路径和正斜杠，例如 `data/decks/example.json` 或 `audio/texts/example.mp3`。这样同一份内容可以在 macOS、Windows、Linux、GitHub 和静态托管平台上使用。

## 仓库结构

- `index.html`：静态 app 外壳。
- `assets/`：前端 JavaScript 和 CSS。
- `data/catalog.json`：公开 deck registry。
- `data/decks/`：可编辑的 deck JSON。
- `audio/`：deck JSON 引用的可选音频。
- `input/`：被 git 忽略的原始材料 inbox。
- `docs/`：设计、workflow、adapter、schema 和校验文档。
- `docs/skills/`：不同学习场景的 starter skills。
- `scripts/validate-content.js`：无依赖内容校验脚本。

## Adapter 思路

现在 agent 框架很多，所以这个 starter 不绑定任何一个 runtime。

最小 adapter 其实就是一个有纪律的文件交接：

1. 把用户材料放进 `input/`。
2. 让 agent 生成或更新 `data/decks/*.json`。
3. 需要音频时，把文件放进 `audio/`。
4. 运行校验。
5. 请人类确认。
6. 确认后再 commit 和 publish。

如果你的框架有 gateway、queue、tools 或定时 worker，把这些 glue code 放在 app 外面，同时保持同一套文件契约。更多边界见 `docs/ADAPTERS.md`。

## 音频原则

卡片音频和文本音频都是可选的。

- 如果文本已经有 source audio，使用 `kind: "source"` 引用它。
- 如果没有 source audio，而用户需要听力练习，agent 可以生成 TTS，并标记为 `kind: "tts"`。
- source audio 不能被 TTS 覆盖。
- 校验脚本只检查被引用的音频文件是否存在且非空，不负责生成音频。

## 最小 Deck 示例

```json
{
  "schema": "agentic-study-cards.deck.v1",
  "id": "sample",
  "title": "Sample Deck",
  "cards": [
    {
      "id": "card-1",
      "front": "What does IaaS mean?",
      "back": "Infrastructure as a Service",
      "detail": "A cloud model for renting compute, storage, and networking.",
      "tags": ["cloud", "fundamentals"],
      "sourceRefs": ["input/example.pdf#page=2"]
    }
  ],
  "texts": [
    {
      "id": "text-1",
      "title": "Short Reading",
      "body": "A source-backed text or transcript.",
      "translation": "Optional translation or explanation.",
      "audio": {
        "kind": "tts",
        "file": "audio/texts/text-1.mp3"
      }
    }
  ]
}
```

更多设计说明见 `docs/PUBLIC_STARTER_DESIGN.md`，JSON contract 见 `docs/SCHEMA.md`。发布公开仓库前可参考 `docs/PUBLIC_RELEASE_CHECKLIST.md`。

> [!NOTE]
> No "buy me a coffee" button here. If this saves you time, buy Codex and GLM tokens instead. The machines are thirsty. 🤖🥤
