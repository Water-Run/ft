#!/usr/bin/env python3
"""历史测绘入口已停用；使用新的匿名白名单测绘器。"""
import sys
print("旧入口曾输出业务相对路径与源文件哈希，2026-10-19 起不再生成这种公开包。", file=sys.stderr)
print("请从仓库根目录运行 node videos/standalone/opencart-1-5-admin/research/lab/18_case_deep_audit.cjs --date YYYY-MM-DD --out <输出文件>；输入工作区只通过 CASE_REPO 环境变量提供。", file=sys.stderr)
print("out_01_case_inventory.json 是 2026-10-09 历史统计的匿名收紧版，不能用当前代码复跑冒充旧快照。", file=sys.stderr)
sys.exit(2)
