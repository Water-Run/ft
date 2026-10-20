# 02 文案与人工校对

唯一正文在 `src/js/script.js` 的 NARRATIVE。完整阅读稿为 [SCRIPT-R3](../research/SCRIPT-R3.md)，其逐段表指向 FACTS。制作 cue 从段落自动分出；不要在两处独立改全文。

文案交审命令：

```sh
node videos/standalone/opencart-1-5-admin/tools/export_script.cjs
node kit/tools/script-review.js videos/standalone/opencart-1-5-admin export --lang zh
node kit/tools/script-review.js videos/standalone/opencart-1-5-admin check --lang zh
```

只有最后一项通过且 NOTES 存在真实确认，才能中文配音。任何改标题、章节、实质文字都重新交审。停顿和读法替换可以按试听调整，但不得改变含义，记录在 NOTES。

## 本轮已落实的意见

- WaterRun 指定的 A 风格已经固定，不再让受托模型重新选方向。
- 各子系统完整解释，尤其是登录、权限管理和数据库；不靠术语或源码数量代替机制。
- 先让查询返回，再开始写入；同一订单贯穿，多表结构在写事务前讲清。
- 不引用“上一期第一个问题”；SQL、会话、权限等英文名词有中文解释。
- 本轮实际模型 credit 为 GPT-6 Astra；历史真实贡献保留。
- 文案、分镜、示意数据和 CASE-A 材料一起脱敏。

英文尚未翻译。中文定稿后逐段翻译，保持段落和 cue ID 对应；英文标题、正文和原文引语附中文对照，不把中文的空英文字符串当成可制作稿。
