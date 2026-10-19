// 由 tools/gen_data.py 从研究记录生成，不要手改。
(function(root){
const data = {
  "provenance": {
    "physical": {
      "file": "research/lab/out_03_decode.json",
      "sha256": "0406eb9c23fb2935d395b64673b348b8601d1fa4bf3fe758c9599712d1ce2ca9"
    },
    "survey": {
      "file": "research/lab/out_04_survey.json",
      "sha256": "f6b00d5ed4ca1c1f6617a9e91ee72cc2ef4adaa6e04f5a676450c0be5a6dd1c9"
    },
    "style": {
      "file": "research/lab/out_05_style.json",
      "sha256": "9c1bf41a2e70219c5694ed3347e3c730a1c496a69d4fb65f3b0de5a6975c91f2"
    },
    "compare": {
      "file": "research/lab/out_08_compare.json",
      "sha256": "96c0400ff2f780f4f04524b33fe14c42158616399914313637e0cbf031b98639"
    }
  },
  "physical": {
    "schema": 1,
    "source": "out_01_probe.json",
    "source_sha256": "4e82f3998271448c855c39a41c0461f1aad899f66c3d20aacea0597c7acb9476",
    "version": "PostgreSQL 18.4 on x86_64-windows, compiled by msvc-19.44.35226, 64-bit",
    "checked_items": 62,
    "checks": {
      "uncommitted_reader_sees_30": true,
      "conflicting_update_times_out": true,
      "rc_next_statement_sees_31": true,
      "rr_keeps_30": true,
      "old_version_retained_for_snapshot": true,
      "old_version_reclaimed_after_release": true,
      "new_ctid_changed": true,
      "duplicate_primary_key_rejected": true,
      "two_table_rollback": true,
      "concurrent_booking_waits": true,
      "overlapping_booking_rejected": true,
      "adjacent_booking_accepted": true,
      "unknown_user_foreign_key_rejected": true,
      "committed_update_survives": true,
      "uncommitted_update_invisible": true
    },
    "layout": [
      {
        "relname": "notes",
        "relfilenode": 16440,
        "path": "base/5/16440",
        "bytes": 8192,
        "amname": "heap"
      },
      {
        "relname": "users",
        "relfilenode": 16430,
        "path": "base/5/16430",
        "bytes": 8192,
        "amname": "heap"
      },
      {
        "relname": "users_name_idx",
        "relfilenode": 16439,
        "path": "base/5/16439",
        "bytes": 16384,
        "amname": "btree"
      },
      {
        "relname": "users_pkey",
        "relfilenode": 16437,
        "path": "base/5/16437",
        "bytes": 16384,
        "amname": "btree"
      }
    ],
    "plans": {
      "small": "Seq Scan",
      "many": "Index Scan"
    },
    "snapshots": {
      "before": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 56,
        "upper": 7808,
        "free_bytes": 7752,
        "rows": [
          {
            "lp": 1,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 30,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,1)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0100000017616c6963652020202020001e00"
          },
          {
            "lp": 2,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          }
        ],
        "sha256": "126d642983922433eb30a80d649dbc2fa23cf9fef951034a1974caa53c452275"
      },
      "uncommitted": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 60,
        "upper": 7760,
        "free_bytes": 7700,
        "rows": [
          {
            "lp": 1,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 30,
            "xmin": 755,
            "xmax": 763,
            "ctid": "(0,9)",
            "hot_updated": true,
            "heap_only": false,
            "data_hex": "0100000017616c6963652020202020001e00"
          },
          {
            "lp": 2,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7760,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 0,
            "ctid": "(0,9)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          }
        ],
        "sha256": "3e23bc6b51e142f25dde2e63efc5f261f03c94bb53631c895e0a7cf8adce44ac"
      },
      "committed_pinned": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 60,
        "upper": 7760,
        "free_bytes": 7700,
        "rows": [
          {
            "lp": 1,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 30,
            "xmin": 755,
            "xmax": 763,
            "ctid": "(0,9)",
            "hot_updated": true,
            "heap_only": false,
            "data_hex": "0100000017616c6963652020202020001e00"
          },
          {
            "lp": 2,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7760,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 0,
            "ctid": "(0,9)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          }
        ],
        "sha256": "1b12b6bc6618f10bc3c0d33de3bcb4e6c462c5ffd9494d8ecd6a87930c02a349"
      },
      "vacuum_pinned": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 60,
        "upper": 7760,
        "free_bytes": 7700,
        "rows": [
          {
            "lp": 1,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 30,
            "xmin": 755,
            "xmax": 763,
            "ctid": "(0,9)",
            "hot_updated": true,
            "heap_only": false,
            "data_hex": "0100000017616c6963652020202020001e00"
          },
          {
            "lp": 2,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7760,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 0,
            "ctid": "(0,9)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          }
        ],
        "sha256": "1b12b6bc6618f10bc3c0d33de3bcb4e6c462c5ffd9494d8ecd6a87930c02a349"
      },
      "vacuum_released": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 60,
        "upper": 7808,
        "free_bytes": 7748,
        "rows": [
          {
            "lp": 1,
            "offset": 9,
            "flags": 2,
            "length": 0
          },
          {
            "lp": 2,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 0,
            "ctid": "(0,9)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          }
        ],
        "sha256": "d42f4d555c10887327b5f699781aa7663da3216eef9dba742ec844b5f15d00fe"
      },
      "indexed_update": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 64,
        "upper": 7760,
        "free_bytes": 7696,
        "rows": [
          {
            "lp": 1,
            "offset": 9,
            "flags": 2,
            "length": 0
          },
          {
            "lp": 2,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 767,
            "ctid": "(0,10)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          },
          {
            "lp": 10,
            "offset": 7760,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alicia",
            "age": 31,
            "xmin": 767,
            "xmax": 0,
            "ctid": "(0,10)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0100000017616c6963696120202020001f00"
          }
        ],
        "sha256": "5c6d2f842e6ac1453a53cb45a2e0c63dd1f0cd93c2f854713082c7017800c6d4"
      },
      "after_recovery": {
        "header_bytes": 24,
        "item_bytes": 4,
        "page_bytes": 8192,
        "lower": 68,
        "upper": 7712,
        "free_bytes": 7644,
        "rows": [
          {
            "lp": 1,
            "offset": 9,
            "flags": 2,
            "length": 0
          },
          {
            "lp": 2,
            "offset": 8144,
            "flags": 1,
            "length": 42,
            "id": 2,
            "name": "bob",
            "age": 25,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,2)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "0200000017626f6220202020202020001900"
          },
          {
            "lp": 3,
            "offset": 8096,
            "flags": 1,
            "length": 42,
            "id": 3,
            "name": "carol",
            "age": 41,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,3)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "03000000176361726f6c2020202020002900"
          },
          {
            "lp": 4,
            "offset": 8048,
            "flags": 1,
            "length": 42,
            "id": 4,
            "name": "dave",
            "age": 19,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,4)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "040000001764617665202020202020001300"
          },
          {
            "lp": 5,
            "offset": 8000,
            "flags": 1,
            "length": 42,
            "id": 5,
            "name": "erin",
            "age": 33,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,5)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "05000000176572696e202020202020002100"
          },
          {
            "lp": 6,
            "offset": 7952,
            "flags": 1,
            "length": 42,
            "id": 6,
            "name": "frank",
            "age": 52,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,6)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "06000000176672616e6b2020202020003400"
          },
          {
            "lp": 7,
            "offset": 7904,
            "flags": 1,
            "length": 42,
            "id": 7,
            "name": "grace",
            "age": 28,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,7)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "070000001767726163652020202020001c00"
          },
          {
            "lp": 8,
            "offset": 7856,
            "flags": 1,
            "length": 42,
            "id": 8,
            "name": "heidi",
            "age": 36,
            "xmin": 755,
            "xmax": 0,
            "ctid": "(0,8)",
            "hot_updated": false,
            "heap_only": false,
            "data_hex": "080000001768656964692020202020002400"
          },
          {
            "lp": 9,
            "offset": 7808,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alice",
            "age": 31,
            "xmin": 763,
            "xmax": 767,
            "ctid": "(0,10)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963652020202020001f00"
          },
          {
            "lp": 10,
            "offset": 7760,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alicia",
            "age": 31,
            "xmin": 767,
            "xmax": 779,
            "ctid": "(0,11)",
            "hot_updated": true,
            "heap_only": false,
            "data_hex": "0100000017616c6963696120202020001f00"
          },
          {
            "lp": 11,
            "offset": 7712,
            "flags": 1,
            "length": 42,
            "id": 1,
            "name": "alicia",
            "age": 32,
            "xmin": 779,
            "xmax": 0,
            "ctid": "(0,11)",
            "hot_updated": false,
            "heap_only": true,
            "data_hex": "0100000017616c6963696120202020002000"
          }
        ],
        "sha256": "cf6feb2ecd64293bfa55ba8f2c7b613d00038a6febfc4372e49d480f69c4610a"
      }
    },
    "bookings": [
      {
        "id": 1,
        "user_id": 1,
        "device": 1,
        "slot": "[\"2026-01-01 09:00:00\",\"2026-01-01 10:00:00\")"
      },
      {
        "id": 3,
        "user_id": 1,
        "device": 1,
        "slot": "[\"2026-01-01 10:00:00\",\"2026-01-01 11:00:00\")"
      }
    ],
    "extensions": [
      {
        "extname": "btree_gist",
        "extversion": "1.8"
      },
      {
        "extname": "hstore",
        "extversion": "1.8"
      },
      {
        "extname": "pageinspect",
        "extversion": "1.13"
      },
      {
        "extname": "plpgsql",
        "extversion": "1.0"
      }
    ],
    "after_recovery": [
      {
        "id": 1,
        "name": "alicia    ",
        "age": 32
      },
      {
        "id": 2,
        "name": "bob       ",
        "age": 25
      }
    ]
  },
  "survey": {
    "schema": 1,
    "checked_at": "2026-10-19",
    "attribution": "Stack Exchange Inc. / Stack Overflow Developer Survey，按年署名。2026 数据 ODbL 1.0。",
    "warning": "多选自报开发使用，非全球市场份额；不同年份样本不能当同一批用户迁移。",
    "years": [
      {
        "year": 2022,
        "source": "https://survey.stackoverflow.co/2022/",
        "scope": "All Respondents / used / multiple choice",
        "table_id": "databasespfb1",
        "source_sha256": "b8459eb00a079392b3d08b821dbf2d8baa30fab20c75509ab11983aaa860e110",
        "data": [
          {
            "name": "MySQL",
            "percent": 46.85,
            "respondents": 28520
          },
          {
            "name": "PostgreSQL",
            "percent": 43.59,
            "respondents": 26538
          }
        ]
      },
      {
        "year": 2023,
        "source": "https://survey.stackoverflow.co/2023/",
        "scope": "All Respondents / used / multiple choice",
        "table_id": "databasedmk1u",
        "source_sha256": "11b6968aa6d397ac0a95a6f84393fad617c9b37e62aa476f7be07963310db777",
        "data": [
          {
            "name": "PostgreSQL",
            "percent": 45.55,
            "respondents": 34909
          },
          {
            "name": "MySQL",
            "percent": 41.09,
            "respondents": 31489
          }
        ]
      },
      {
        "year": 2026,
        "source": "https://survey.stackoverflow.co/2026/technology/data/databases",
        "scope": "All Respondents / used / multiple choice",
        "question_n": 12061,
        "source_sha256": "36804dd7a6bda9c2718b6a845998154c12421aced5d43345975dbe7fdae09b1e",
        "data": [
          {
            "name": "PostgreSQL",
            "percent": 57.9,
            "respondents": 6984
          },
          {
            "name": "MySQL",
            "percent": 35.1,
            "respondents": 4235
          }
        ],
        "licence": {
          "name": "ODbL 1.0",
          "url": "https://opendatacommons.org/licenses/odbl/1-0/",
          "holder": "Stack Exchange Inc."
        }
      }
    ]
  },
  "style": {
    "checked_at": "2026-10-19",
    "source_page": "https://wiki.postgresql.org/wiki/File:PostgreSQL_logo.3colors.svg",
    "svg_url": "https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg",
    "svg_sha256": "51f93e19516081fc7d6fe6ab9bbab07abe5f7819e28016eefacea6dea691bc54",
    "svg_colors": [
      "#000000",
      "#336791",
      "#ffffff"
    ],
    "palette": {
      "blue": "#336791",
      "paper": "#f4f5f6",
      "graphite": "#20282e",
      "white": "#ffffff",
      "alert": "#a94819"
    },
    "contrast": [
      {
        "text": "graphite",
        "background": "paper",
        "ratio": 13.699,
        "normal_text_pass": true
      },
      {
        "text": "blue",
        "background": "paper",
        "ratio": 5.513,
        "normal_text_pass": true
      },
      {
        "text": "white",
        "background": "blue",
        "ratio": 6.018,
        "normal_text_pass": true
      },
      {
        "text": "alert",
        "background": "paper",
        "ratio": 5.303,
        "normal_text_pass": true
      }
    ],
    "status": "方案数值校验；未制作关键帧或确认观感"
  },
  "compare": {
    "schema": 1,
    "checked_at": "2026-10-19T02:09:31.015724+08:00",
    "scope": "同一合成任务表；索引语义与实际计划核对，不进行跨数据库吞吐/延迟比较",
    "environment": {
      "os": "Windows",
      "work": "research/_src/compare-a1345c3752f7",
      "python": "3.14.3",
      "psycopg": "3.3.5",
      "server": {
        "version": "PostgreSQL 18.4 on x86_64-windows, compiled by msvc-19.44.35226, 64-bit",
        "version_num": "180004",
        "isolation": "read committed"
      }
    },
    "commands": [
      {
        "program": "initdb",
        "exit": 0,
        "output": "The files belonging to this database system will be owned by user \"user\".\nThis user must also own the server process.\n\nThe database cluster will be initialized with locale \"C\".\nThe default text search configuration will be set to \"english\".\n\nData page checksums are enabled.\n\ncreating directory <video>/research/_src/compare-a1345c3752f7/cluster ... ok\ncreating subdirectories ... ok\nselecting dynamic shared memory implementation ... windows\nselecting default \"max_connections\" ... 100\nselecting default \"shared_buffers\" ... 128MB\nselecting default time zone ... Asia/Shanghai\ncreating configuration files ... ok\nrunning bootstrap script ... ok\nperforming post-bootstrap initialization ... ok\nsyncing data to disk ... ok\n\nSuccess. You can now start the database server using:\n\n    ^\"C^:^\\Program^ Files^\\PostgreSQL^\\18^\\bin^\\pg^_ctl^\" -D ^\"D^:^\\Coding^\\ft^\\videos^\\series^\\database^-engines^\\postgresql^\\research^\\^_src^\\compare^-a1345c3752f7^\\cluster^\" -l logfile start\n\n"
      },
      {
        "program": "pg_ctl",
        "exit": 0,
        "output": "waiting for server to start.... done\nserver started\n"
      },
      {
        "program": "pg_ctl",
        "exit": 0,
        "output": "waiting for server to shut down.... done\nserver stopped\n"
      }
    ],
    "queries": [
      {
        "sql": "SELECT version() AS version,current_setting('server_version_num') AS version_num,current_setting('default_transaction_isolation') AS isolation",
        "rows": [
          {
            "version": "PostgreSQL 18.4 on x86_64-windows, compiled by msvc-19.44.35226, 64-bit",
            "version_num": "180004",
            "isolation": "read committed"
          }
        ],
        "status": "SELECT 1"
      },
      {
        "sql": "CREATE TABLE jobs (id integer PRIMARY KEY,status text NOT NULL,meta jsonb NOT NULL)",
        "rows": [],
        "status": "CREATE TABLE"
      },
      {
        "sql": "INSERT INTO jobs SELECT i,CASE WHEN i%100=0 THEN 'open' ELSE 'done' END,jsonb_build_object('kind',CASE WHEN i%97=0 THEN 'alert' ELSE 'normal' END,'user_id',i%1000) FROM generate_series(1,20000) AS i",
        "rows": [],
        "status": "INSERT 0 20000"
      },
      {
        "sql": "CREATE INDEX jobs_open_idx ON jobs(id) WHERE status='open'",
        "rows": [],
        "status": "CREATE INDEX"
      },
      {
        "sql": "CREATE INDEX jobs_meta_gin ON jobs USING gin(meta)",
        "rows": [],
        "status": "CREATE INDEX"
      },
      {
        "sql": "ANALYZE jobs",
        "rows": [],
        "status": "ANALYZE"
      },
      {
        "sql": "SELECT count(*) AS total,count(*) FILTER (WHERE status='open') AS open,count(*) FILTER (WHERE meta @> '{\"kind\":\"alert\"}') AS alert FROM jobs",
        "rows": [
          {
            "total": 20000,
            "open": 200,
            "alert": 206
          }
        ],
        "status": "SELECT 1"
      },
      {
        "sql": "EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT id FROM jobs WHERE status='open' ORDER BY id LIMIT 10",
        "rows": [
          {
            "QUERY PLAN": [
              {
                "Plan": {
                  "Node Type": "Limit",
                  "Parallel Aware": false,
                  "Async Capable": false,
                  "Startup Cost": 0.14,
                  "Total Cost": 0.99,
                  "Plan Rows": 10,
                  "Plan Width": 4,
                  "Actual Startup Time": 0.069,
                  "Actual Total Time": 0.073,
                  "Actual Rows": 10.0,
                  "Actual Loops": 1,
                  "Disabled": false,
                  "Shared Hit Blocks": 10,
                  "Shared Read Blocks": 1,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0,
                  "Plans": [
                    {
                      "Node Type": "Index Only Scan",
                      "Parent Relationship": "Outer",
                      "Parallel Aware": false,
                      "Async Capable": false,
                      "Scan Direction": "Forward",
                      "Index Name": "jobs_open_idx",
                      "Relation Name": "jobs",
                      "Alias": "jobs",
                      "Startup Cost": 0.14,
                      "Total Cost": 17.14,
                      "Plan Rows": 200,
                      "Plan Width": 4,
                      "Actual Startup Time": 0.068,
                      "Actual Total Time": 0.072,
                      "Actual Rows": 10.0,
                      "Actual Loops": 1,
                      "Disabled": false,
                      "Heap Fetches": 10,
                      "Index Searches": 1,
                      "Shared Hit Blocks": 10,
                      "Shared Read Blocks": 1,
                      "Shared Dirtied Blocks": 0,
                      "Shared Written Blocks": 0,
                      "Local Hit Blocks": 0,
                      "Local Read Blocks": 0,
                      "Local Dirtied Blocks": 0,
                      "Local Written Blocks": 0,
                      "Temp Read Blocks": 0,
                      "Temp Written Blocks": 0
                    }
                  ]
                },
                "Planning": {
                  "Shared Hit Blocks": 15,
                  "Shared Read Blocks": 4,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0
                },
                "Planning Time": 0.272,
                "Triggers": [],
                "Execution Time": 0.08
              }
            ]
          }
        ],
        "status": "EXPLAIN"
      },
      {
        "sql": "EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT id FROM jobs WHERE meta @> '{\"kind\":\"alert\"}'",
        "rows": [
          {
            "QUERY PLAN": [
              {
                "Plan": {
                  "Node Type": "Bitmap Heap Scan",
                  "Parallel Aware": false,
                  "Async Capable": false,
                  "Relation Name": "jobs",
                  "Alias": "jobs",
                  "Startup Cost": 22.43,
                  "Total Cost": 250.82,
                  "Plan Rows": 182,
                  "Plan Width": 4,
                  "Actual Startup Time": 0.116,
                  "Actual Total Time": 0.2,
                  "Actual Rows": 206.0,
                  "Actual Loops": 1,
                  "Disabled": false,
                  "Recheck Cond": "(meta @> '{\"kind\": \"alert\"}'::jsonb)",
                  "Rows Removed by Index Recheck": 0,
                  "Exact Heap Blocks": 206,
                  "Lossy Heap Blocks": 0,
                  "Shared Hit Blocks": 217,
                  "Shared Read Blocks": 0,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0,
                  "Plans": [
                    {
                      "Node Type": "Bitmap Index Scan",
                      "Parent Relationship": "Outer",
                      "Parallel Aware": false,
                      "Async Capable": false,
                      "Index Name": "jobs_meta_gin",
                      "Startup Cost": 0.0,
                      "Total Cost": 22.39,
                      "Plan Rows": 182,
                      "Plan Width": 0,
                      "Actual Startup Time": 0.096,
                      "Actual Total Time": 0.096,
                      "Actual Rows": 206.0,
                      "Actual Loops": 1,
                      "Disabled": false,
                      "Index Cond": "(meta @> '{\"kind\": \"alert\"}'::jsonb)",
                      "Index Searches": 1,
                      "Shared Hit Blocks": 11,
                      "Shared Read Blocks": 0,
                      "Shared Dirtied Blocks": 0,
                      "Shared Written Blocks": 0,
                      "Local Hit Blocks": 0,
                      "Local Read Blocks": 0,
                      "Local Dirtied Blocks": 0,
                      "Local Written Blocks": 0,
                      "Temp Read Blocks": 0,
                      "Temp Written Blocks": 0
                    }
                  ]
                },
                "Planning": {
                  "Shared Hit Blocks": 7,
                  "Shared Read Blocks": 0,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0
                },
                "Planning Time": 0.068,
                "Triggers": [],
                "Execution Time": 0.213
              }
            ]
          }
        ],
        "status": "EXPLAIN"
      },
      {
        "sql": "SELECT c.relname,a.amname,pg_get_expr(i.indpred,i.indrelid) AS predicate,pg_relation_size(c.oid) AS bytes FROM pg_class c JOIN pg_index i ON i.indexrelid=c.oid JOIN pg_am a ON a.oid=c.relam WHERE i.indrelid='jobs'::regclass ORDER BY c.relname",
        "rows": [
          {
            "relname": "jobs_meta_gin",
            "amname": "gin",
            "predicate": null,
            "bytes": 294912
          },
          {
            "relname": "jobs_open_idx",
            "amname": "btree",
            "predicate": "(status = 'open'::text)",
            "bytes": 16384
          },
          {
            "relname": "jobs_pkey",
            "amname": "btree",
            "predicate": null,
            "bytes": 466944
          }
        ],
        "status": "SELECT 3"
      }
    ],
    "checks": {
      "postgresql_18_4": true,
      "partial_predicate_selects_200_of_20000": true,
      "partial_index_used": true,
      "jsonb_gin_index_used": true,
      "jsonb_query_returns_expected_rows": true
    },
    "counts": {
      "total": 20000,
      "open": 200,
      "alert": 206
    },
    "partial_plan": {
      "Plan": {
        "Node Type": "Limit",
        "Parallel Aware": false,
        "Async Capable": false,
        "Startup Cost": 0.14,
        "Total Cost": 0.99,
        "Plan Rows": 10,
        "Plan Width": 4,
        "Actual Startup Time": 0.069,
        "Actual Total Time": 0.073,
        "Actual Rows": 10.0,
        "Actual Loops": 1,
        "Disabled": false,
        "Shared Hit Blocks": 10,
        "Shared Read Blocks": 1,
        "Shared Dirtied Blocks": 0,
        "Shared Written Blocks": 0,
        "Local Hit Blocks": 0,
        "Local Read Blocks": 0,
        "Local Dirtied Blocks": 0,
        "Local Written Blocks": 0,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0,
        "Plans": [
          {
            "Node Type": "Index Only Scan",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Async Capable": false,
            "Scan Direction": "Forward",
            "Index Name": "jobs_open_idx",
            "Relation Name": "jobs",
            "Alias": "jobs",
            "Startup Cost": 0.14,
            "Total Cost": 17.14,
            "Plan Rows": 200,
            "Plan Width": 4,
            "Actual Startup Time": 0.068,
            "Actual Total Time": 0.072,
            "Actual Rows": 10.0,
            "Actual Loops": 1,
            "Disabled": false,
            "Heap Fetches": 10,
            "Index Searches": 1,
            "Shared Hit Blocks": 10,
            "Shared Read Blocks": 1,
            "Shared Dirtied Blocks": 0,
            "Shared Written Blocks": 0,
            "Local Hit Blocks": 0,
            "Local Read Blocks": 0,
            "Local Dirtied Blocks": 0,
            "Local Written Blocks": 0,
            "Temp Read Blocks": 0,
            "Temp Written Blocks": 0
          }
        ]
      },
      "Planning": {
        "Shared Hit Blocks": 15,
        "Shared Read Blocks": 4,
        "Shared Dirtied Blocks": 0,
        "Shared Written Blocks": 0,
        "Local Hit Blocks": 0,
        "Local Read Blocks": 0,
        "Local Dirtied Blocks": 0,
        "Local Written Blocks": 0,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0
      },
      "Planning Time": 0.272,
      "Triggers": [],
      "Execution Time": 0.08
    },
    "jsonb_plan": {
      "Plan": {
        "Node Type": "Bitmap Heap Scan",
        "Parallel Aware": false,
        "Async Capable": false,
        "Relation Name": "jobs",
        "Alias": "jobs",
        "Startup Cost": 22.43,
        "Total Cost": 250.82,
        "Plan Rows": 182,
        "Plan Width": 4,
        "Actual Startup Time": 0.116,
        "Actual Total Time": 0.2,
        "Actual Rows": 206.0,
        "Actual Loops": 1,
        "Disabled": false,
        "Recheck Cond": "(meta @> '{\"kind\": \"alert\"}'::jsonb)",
        "Rows Removed by Index Recheck": 0,
        "Exact Heap Blocks": 206,
        "Lossy Heap Blocks": 0,
        "Shared Hit Blocks": 217,
        "Shared Read Blocks": 0,
        "Shared Dirtied Blocks": 0,
        "Shared Written Blocks": 0,
        "Local Hit Blocks": 0,
        "Local Read Blocks": 0,
        "Local Dirtied Blocks": 0,
        "Local Written Blocks": 0,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0,
        "Plans": [
          {
            "Node Type": "Bitmap Index Scan",
            "Parent Relationship": "Outer",
            "Parallel Aware": false,
            "Async Capable": false,
            "Index Name": "jobs_meta_gin",
            "Startup Cost": 0.0,
            "Total Cost": 22.39,
            "Plan Rows": 182,
            "Plan Width": 0,
            "Actual Startup Time": 0.096,
            "Actual Total Time": 0.096,
            "Actual Rows": 206.0,
            "Actual Loops": 1,
            "Disabled": false,
            "Index Cond": "(meta @> '{\"kind\": \"alert\"}'::jsonb)",
            "Index Searches": 1,
            "Shared Hit Blocks": 11,
            "Shared Read Blocks": 0,
            "Shared Dirtied Blocks": 0,
            "Shared Written Blocks": 0,
            "Local Hit Blocks": 0,
            "Local Read Blocks": 0,
            "Local Dirtied Blocks": 0,
            "Local Written Blocks": 0,
            "Temp Read Blocks": 0,
            "Temp Written Blocks": 0
          }
        ]
      },
      "Planning": {
        "Shared Hit Blocks": 7,
        "Shared Read Blocks": 0,
        "Shared Dirtied Blocks": 0,
        "Shared Written Blocks": 0,
        "Local Hit Blocks": 0,
        "Local Read Blocks": 0,
        "Local Dirtied Blocks": 0,
        "Local Written Blocks": 0,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0
      },
      "Planning Time": 0.068,
      "Triggers": [],
      "Execution Time": 0.213
    },
    "indexes": [
      {
        "relname": "jobs_meta_gin",
        "amname": "gin",
        "predicate": null,
        "bytes": 294912
      },
      {
        "relname": "jobs_open_idx",
        "amname": "btree",
        "predicate": "(status = 'open'::text)",
        "bytes": 16384
      },
      {
        "relname": "jobs_pkey",
        "amname": "btree",
        "predicate": null,
        "bytes": 466944
      }
    ],
    "success": true
  }
};
if(typeof module!=="undefined" && module.exports) module.exports=data;
else root.PG_DATA=data;
})(typeof window!=="undefined"?window:globalThis);
