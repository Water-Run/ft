// 由 tools/gen_data.py 从 research/lab 的回显生成，不要手改。
window.DATA = {
 "survey": [
  {
   "year": 2022,
   "pg": 43.59,
   "my": 46.85
  },
  {
   "year": 2023,
   "pg": 45.55,
   "my": 41.09
  },
  {
   "year": 2024,
   "pg": 48.7,
   "my": 40.3
  },
  {
   "year": 2025,
   "pg": 55.6,
   "my": 40.5
  },
  {
   "year": 2026,
   "pg": 57.9,
   "my": 35.1
  }
 ],
 "survey2026top": [
  {
   "response": "PostgreSQL",
   "percent": 57.9
  },
  {
   "response": "SQLite",
   "percent": 42.1
  },
  {
   "response": "MySQL",
   "percent": 35.1
  },
  {
   "response": "Redis",
   "percent": 28.3
  },
  {
   "response": "Microsoft SQL Server",
   "percent": 27.1
  }
 ],
 "heap": {
  "pages": 47,
  "rows": [
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   88,
   48
  ],
  "first": [
   1,
   89,
   177,
   265,
   353,
   441,
   529,
   617,
   705,
   793,
   881,
   969,
   1057,
   1145,
   1233,
   1321,
   1409,
   1497,
   1585,
   1673,
   1761,
   1849,
   1937,
   2025,
   2113,
   2201,
   2289,
   2377,
   2465,
   2553,
   2641,
   2729,
   2817,
   2905,
   2993,
   3081,
   3169,
   3257,
   3345,
   3433,
   3521,
   3609,
   3697,
   3785,
   3873,
   3961,
   4049
  ],
  "bytes": 385024
 },
 "alice": {
  "ctid": [
   23,
   26
  ],
  "xmin": 2809,
  "row_size": 82,
  "name_size": 51
 },
 "files": {
  "users": {
   "path": "base/5/16466",
   "node": 16466,
   "sizes": {
    "16466": 385024,
    "16466_fsm": 24576,
    "16466_vm": 8192
   }
  },
  "users_pkey": {
   "path": "base/5/16472",
   "node": 16472,
   "sizes": {
    "16472": 114688
   }
  },
  "idx_name": {
   "path": "base/5/16474",
   "node": 16474,
   "sizes": {
    "16474": 335872
   }
  },
  "idx_age": {
   "path": "base/5/16475",
   "node": 16475,
   "sizes": {
    "16475": 57344
   }
  }
 },
 "trees": {
  "users_pkey": {
   "root": 3,
   "pages": 14,
   "leaves": [
    1,
    2,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13
   ],
   "leafCount": 12,
   "aliceLeaf": 7,
   "aliceLeafPos": 5,
   "aliceItem": {
    "off": 221,
    "len": 16
   },
   "keys": [
    "",
    "6f 01 00 00 00 00 00 00",
    "dd 02 00 00 00 00 00 00",
    "4b 04 00 00 00 00 00 00",
    "b9 05 00 00 00 00 00 00",
    "27 07 00 00 00 00 00 00",
    "95 08 00 00 00 00 00 00",
    "03 0a 00 00 00 00 00 00",
    "71 0b 00 00 00 00 00 00",
    "df 0c 00 00 00 00 00 00",
    "4d 0e 00 00 00 00 00 00",
    "bb 0f 00 00 00 00 00 00"
   ],
   "liveItems": 4107,
   "keyInts": [
    null,
    367,
    733,
    1099,
    1465,
    1831,
    2197,
    2563,
    2929,
    3295,
    3661,
    4027
   ]
  },
  "idx_name": {
   "root": 3,
   "pages": 41,
   "leaves": [
    1,
    2,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40
   ],
   "leafCount": 39,
   "aliceLeaf": 1,
   "aliceLeafPos": 0,
   "aliceItem": {
    "off": 2,
    "len": 64
   },
   "keys": [
    "",
    "67 55 73 65 72 30 30 31 30 38 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 32 31 35 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 33 32 32 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 34 32 39 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 35 33 36 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 36 34 33 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 37 35 30 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 38 35 37 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 30 39 36 34 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 30 37 31 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 31 37 38 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 32 38 35 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 33 39 32 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 34 39 39 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 36 30 36 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 37 31 33 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 38 32 30 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 31 39 32 37 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 30 33 34 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 31 34 32 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 32 34 39 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 33 35 36 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 34 36 33 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 35 37 30 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 36 37 37 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 37 38 34 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 38 39 31 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 32 39 39 38 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 31 30 35 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 32 31 32 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 33 31 39 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 34 32 36 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 35 33 33 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 36 34 30 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 37 34 37 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 38 35 34 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 33 39 36 31 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00",
    "67 55 73 65 72 30 34 30 36 38 2d 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a 41 42 43 44 45 46 47 48 49 4a 4b 4c 4d 4e 00 00 00 00 00"
   ],
   "liveItems": 4134
  },
  "idx_age": {
   "root": 3,
   "pages": 7,
   "leaves": [
    1,
    5,
    4,
    6,
    2
   ],
   "leafCount": 5,
   "aliceLeaf": 5,
   "aliceLeafPos": 1,
   "aliceItem": {
    "off": 71,
    "len": 376
   },
   "keys": [
    "",
    "20 00 00 00 00 00 00 00",
    "2e 00 00 00 00 00 00 00",
    "3c 00 00 00 00 00 00 00",
    "4a 00 00 00 00 00 00 00"
   ],
   "liveItems": 726
  }
 },
 "agePosting": {
  "count": 60,
  "len": 376
 },
 "page23": {
  "blk": 23,
  "lower": 376,
  "upper": 448,
  "special": 8192,
  "lps": 88,
  "aliceLp": 26,
  "aliceOff": 5904,
  "aliceLen": 82,
  "headerHex": "f90a00000000000000000000000017001a00030002091800",
  "dataHex": "0208000067416c696365202020202020202020202020202020202020202020202020202020202020202020202020202020202020202020002a00",
  "flags": [
   "HEAP_HASVARWIDTH",
   "HEAP_XMIN_COMMITTED",
   "HEAP_XMAX_INVALID"
  ],
  "checksumDisk": 36525
 },
 "growth": {
  "heapNewPageRows": [
   1,
   89,
   177,
   265,
   353,
   441,
   529,
   617,
   705,
   793,
   881,
   969,
   1057,
   1145,
   1233,
   1321,
   1409,
   1497,
   1585,
   1673,
   1761,
   1849,
   1937,
   2025,
   2113,
   2201,
   2289,
   2377,
   2465,
   2553,
   2641,
   2729,
   2817,
   2905,
   2993,
   3081,
   3169,
   3257,
   3345,
   3433,
   3521,
   3609,
   3697,
   3785,
   3873,
   3961,
   4049
  ],
  "rootAtRow": {
   "idx_name": 120,
   "users_pkey": 408,
   "idx_age": 1113
  },
  "pkPageRows": [
   1,
   408,
   774,
   1140,
   1506,
   1872,
   2238,
   2604,
   2970,
   3336,
   3702,
   4068
  ],
  "pagesAtAlice": {
   "heap": 24,
   "users_pkey": 8,
   "idx_name": 22,
   "idx_age": 5
  }
 },
 "aliceAtInsert": {
  "ctid": "(23,26)",
  "xmin": "2809",
  "leaf": {
   "users_pkey": 7,
   "idx_name": 1,
   "idx_age": 1
  },
  "rightmost_leaf": {
   "users_pkey": 7,
   "idx_name": 21,
   "idx_age": 2
  },
  "heap_pages": 24
 },
 "plans": {
  "by_id": [
   "Index Scan using users_pkey on users  (cost=0.28..8.30 rows=1 width=57) (actual rows=1.00 loops=1)",
   "  Index Cond: (id = 2050)",
   "  Index Searches: 1",
   "  Buffers: shared hit=3",
   "Planning:",
   "  Buffers: shared hit=39 read=1"
  ],
  "by_name": [
   "Index Scan using idx_name on users  (cost=0.28..8.30 rows=1 width=57) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Index Searches: 1",
   "  Buffers: shared hit=3",
   "Planning:",
   "  Buffers: shared hit=6"
  ],
  "by_age": [
   "Bitmap Heap Scan on users  (cost=4.79..55.04 rows=66 width=57) (actual rows=66.00 loops=1)",
   "  Recheck Cond: (age = 42)",
   "  Heap Blocks: exact=47",
   "  Buffers: shared hit=52",
   "  ->  Bitmap Index Scan on idx_age  (cost=0.00..4.78 rows=66 width=0) (actual rows=66.00 loops=1)",
   "        Index Cond: (age = 42)",
   "        Index Searches: 1",
   "        Buffers: shared hit=5",
   "Planning:",
   "  Buffers: shared hit=5"
  ],
  "id_range": [
   "Index Scan using users_pkey on users  (cost=0.28..11.30 rows=101 width=57) (actual rows=101.00 loops=1)",
   "  Index Cond: ((id >= 2000) AND (id <= 2100))",
   "  Index Searches: 1",
   "  Buffers: shared hit=4",
   "Planning:",
   "  Buffers: shared hit=6"
  ],
  "count_all": [
   "Aggregate  (cost=98.20..98.21 rows=1 width=8) (actual rows=1.00 loops=1)",
   "  Buffers: shared hit=47",
   "  ->  Seq Scan on users  (cost=0.00..87.96 rows=4096 width=0) (actual rows=4096.00 loops=1)",
   "        Buffers: shared hit=47",
   "Planning:",
   "  Buffers: shared hit=3"
  ],
  "id_by_name": [
   "Index Scan using idx_name on users  (cost=0.28..8.30 rows=1 width=4) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Index Searches: 1",
   "  Buffers: shared hit=3"
  ],
  "name_by_name": [
   "Index Only Scan using idx_name on users  (cost=0.28..8.30 rows=1 width=51) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Heap Fetches: 1",
   "  Index Searches: 1",
   "  Buffers: shared hit=3"
  ]
 },
 "cold": {
  "by_id": [
   {
    "rel": "idx_age",
    "blocks": [
     0
    ],
    "n": 1
   },
   {
    "rel": "idx_name",
    "blocks": [
     0
    ],
    "n": 1
   },
   {
    "rel": "users",
    "blocks": [
     23
    ],
    "n": 1
   },
   {
    "rel": "users_pkey",
    "blocks": [
     0,
     3,
     7
    ],
    "n": 3
   }
  ],
  "by_name": [
   {
    "rel": "idx_age",
    "blocks": [
     0
    ],
    "n": 1
   },
   {
    "rel": "idx_name",
    "blocks": [
     0,
     1,
     3
    ],
    "n": 3
   },
   {
    "rel": "users",
    "blocks": [
     23
    ],
    "n": 1
   },
   {
    "rel": "users_pkey",
    "blocks": [
     0
    ],
    "n": 1
   }
  ],
  "count_all": [
   {
    "rel": "idx_age",
    "blocks": [
     0
    ],
    "n": 1
   },
   {
    "rel": "idx_name",
    "blocks": [
     0
    ],
    "n": 1
   },
   {
    "rel": "users",
    "blocks": null,
    "n": 47
   },
   {
    "rel": "users_pkey",
    "blocks": [
     0
    ],
    "n": 1
   }
  ]
 },
 "ios": {
  "before_vacuum": [
   "Index Only Scan using idx_name on users  (cost=0.28..8.30 rows=1 width=51) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Heap Fetches: 1",
   "  Index Searches: 1",
   "  Buffers: shared hit=1 read=2",
   "Planning:",
   "  Buffers: shared hit=96 read=1"
  ],
  "after_vacuum": [
   "Index Only Scan using idx_name on users  (cost=0.28..4.30 rows=1 width=51) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Heap Fetches: 0",
   "  Index Searches: 1",
   "  Buffers: shared hit=3",
   "Planning:",
   "  Buffers: shared hit=5"
  ],
  "id_by_name_after_vacuum": [
   "Index Scan using idx_name on users  (cost=0.28..8.30 rows=1 width=4) (actual rows=1.00 loops=1)",
   "  Index Cond: (name = 'Alice'::bpchar)",
   "  Index Searches: 1",
   "  Buffers: shared hit=3",
   "Planning:",
   "  Buffers: shared hit=3"
  ]
 },
 "update": {
  "users": {
   "old": [
    23,
    26
   ],
   "new": [
    46,
    49
   ],
   "xid": 4866,
   "freeBefore": 72,
   "samePage": false,
   "stats": {
    "n_tup_upd": 1,
    "n_tup_hot_upd": 0,
    "n_tup_newpage_upd": 1
   },
   "wal": [
    [
     "Heap",
     "LOCK",
     8179,
     8120
    ],
    [
     "Heap",
     "UPDATE",
     4605,
     4532
    ],
    [
     "Btree",
     "INSERT_LEAF",
     7453,
     7400
    ],
    [
     "Btree",
     "INSERT_LEAF",
     7573,
     7520
    ],
    [
     "Btree",
     "INSERT_LEAF",
     7113,
     7060
    ],
    [
     "Transaction",
     "COMMIT",
     34,
     0
    ]
   ],
   "index": {
    "idx_age": [
     [
      5,
      71,
      "(23,26)"
     ],
     [
      5,
      85,
      "(46,49)"
     ]
    ],
    "idx_name": [
     [
      1,
      2,
      "(23,26)"
     ],
     [
      1,
      3,
      "(46,49)"
     ]
    ],
    "users_pkey": [
     [
      7,
      221,
      "(23,26)"
     ],
     [
      7,
      222,
      "(46,49)"
     ]
    ]
   },
   "afterRead": {
    "lpFlags": 3,
    "free": 160
   }
  },
  "users_ff90": {
   "old": [
    25,
    75
   ],
   "new": [
    25,
    80
   ],
   "xid": 4867,
   "freeBefore": 900,
   "samePage": true,
   "stats": {
    "n_tup_upd": 1,
    "n_tup_hot_upd": 0,
    "n_tup_newpage_upd": 0
   },
   "wal": [
    [
     "Heap",
     "UPDATE",
     7449,
     7384
    ],
    [
     "Btree",
     "INSERT_LEAF",
     7453,
     7400
    ],
    [
     "Btree",
     "INSERT_LEAF",
     7573,
     7520
    ],
    [
     "Btree",
     "INSERT_POST",
     7113,
     7060
    ],
    [
     "Transaction",
     "COMMIT",
     34,
     0
    ]
   ],
   "index": {
    "idx_ff90_age": [
     [
      5,
      71,
      "(25,75)"
     ],
     [
      5,
      78,
      "(25,80)"
     ]
    ],
    "idx_ff90_name": [
     [
      1,
      2,
      "(25,75)"
     ],
     [
      1,
      3,
      "(25,80)"
     ]
    ],
    "users_ff90_pkey": [
     [
      7,
      221,
      "(25,75)"
     ],
     [
      7,
      222,
      "(25,80)"
     ]
    ]
   },
   "afterRead": {
    "lpFlags": 3,
    "free": 896
   }
  },
  "users_hot": {
   "old": [
    25,
    75
   ],
   "new": [
    25,
    80
   ],
   "xid": 4868,
   "freeBefore": 900,
   "samePage": true,
   "stats": {
    "n_tup_upd": 1,
    "n_tup_hot_upd": 1,
    "n_tup_newpage_upd": 0
   },
   "wal": [
    [
     "Heap",
     "HOT_UPDATE",
     7449,
     7384
    ],
    [
     "Transaction",
     "COMMIT",
     34,
     0
    ]
   ],
   "index": {
    "idx_hot_name": [
     [
      1,
      2,
      "(25,75)"
     ]
    ],
    "users_hot_pkey": [
     [
      7,
      221,
      "(25,75)"
     ]
    ]
   },
   "afterRead": {
    "lpFlags": 2,
    "free": 896
   }
  },
  "hotAfterRead": [
   {
    "lp": 75,
    "flags": 2,
    "off": 80
   },
   {
    "lp": 80,
    "flags": 1,
    "off": 1240
   }
  ]
 },
 "mvcc": {
  "xid": 4856,
  "snapshot": "4856:4856:",
  "bobReads": 42,
  "carolXid": 4857,
  "carolGot": 44,
  "bobAfter": 43,
  "bobRR": 42,
  "rrError": {
   "sqlstate": "40001",
   "message": "could not serialize access due to concurrent update"
  },
  "locks": [
   [
    "alice",
    "transactionid",
    "4856",
    "ExclusiveLock",
    true
   ],
   [
    "carol",
    "transactionid",
    "4857",
    "ExclusiveLock",
    true
   ],
   [
    "carol",
    "transactionid",
    "4856",
    "ShareLock",
    false
   ],
   [
    "carol",
    "tuple",
    null,
    "ExclusiveLock",
    true
   ]
  ],
  "wait": [
   [
    "alice",
    "Client",
    "ClientRead"
   ],
   [
    "carol",
    "Lock",
    "transactionid"
   ]
  ]
 },
 "delete": {
  "xid": 4856,
  "freeBefore": 72,
  "freeAfter": 160,
  "fsmAfter": 128,
  "dave": [
   23,
   26
  ],
  "vacuum": {
   "vacuum while bob holds snapshot": [
    "finished vacuuming \"postgres.public.users\": index scans: 0",
    "tuples: 0 removed, 4096 remain, 1 are dead but not yet removable",
    "removable cutoff: 4856, which was 1 XIDs old when operation ended",
    "index scan not needed: 0 pages from table (0.00% of total) had 0 dead item identifiers removed"
   ],
   "vacuum after bob": [
    "finished vacuuming \"postgres.public.users\": index scans: 1",
    "tuples: 1 removed, 4095 remain, 0 are dead but not yet removable",
    "removable cutoff: 4857, which was 0 XIDs old when operation ended",
    "index scan needed: 1 pages from table (2.13% of total) had 1 dead item identifiers removed"
   ]
  },
  "frozen": [
   "760",
   "4859"
  ]
 },
 "wal": {
  "flushBefore": {
   "f": "0/1A53D10",
   "i": "0/1A663A0"
  },
  "flushAfter": {
   "f": "0/1A663C8",
   "i": "0/1A663C8"
  },
  "buffer": {
   "pd_lsn": "0/1A629C8",
   "alice_xmax": 4857,
   "alice_ctid": "(46,50)"
  },
  "disk": {
   "pd_lsn": "0/1A4F478",
   "alice_xmax": 0,
   "alice_ctid": "(23,26)"
  },
  "carolFpi": [
   [
    "LOCK",
    8120
   ],
   [
    "UPDATE",
    4532
   ],
   [
    "INSERT_LEAF",
    7400
   ],
   [
    "INSERT_LEAF",
    7452
   ],
   [
    "INSERT_LEAF",
    7648
   ]
  ],
  "second": [
   [
    "LOCK",
    0
   ],
   [
    "UPDATE",
    0
   ],
   [
    "INSERT_LEAF",
    0
   ],
   [
    "INSERT_LEAF",
    0
   ],
   [
    "INSERT_LEAF",
    6952
   ],
   [
    "COMMIT",
    0
   ]
  ],
  "recovery": [
   "LOG:  database system was interrupted; last known up at 2026-10-27 09:49:05 CST",
   "LOG:  database system was not properly shut down; automatic recovery in progress",
   "LOG:  redo starts at 0/1A53C40",
   "LOG:  redo done at 0/1A6F070 system usage: CPU: user: 0.00 s, system: 0.01 s, elapsed: 0.00 s",
   "LOG:  database system is ready to accept connections"
  ],
  "after": {
   "alice": {
    "age": 43,
    "ctid": "(46,50)"
   },
   "bob": {
    "age": 51,
    "ctid": "(23,25)"
   },
   "carol_status": "aborted",
   "alice_status": "committed"
  }
 },
 "orthodox": {
  "1_ddl_rollback": {
   "columns_inside_tx": 4,
   "columns_after": 3,
   "orders_exists_after": false,
   "mallory_after": 0
  },
  "2_constraints": {
   "check": {
    "sqlstate": "23514",
    "message": "new row for relation \"users\" violates check constraint \"age_range\"",
    "detail": "Failing row contains (5001, Judy                                              , 200)."
   },
   "foreign_key": {
    "sqlstate": "23503",
    "message": "insert or update on table \"orders\" violates foreign key constraint \"orders_user_id_fkey\"",
    "detail": "Key (user_id)=(9999) is not present in table \"users\"."
   },
   "primary_key": {
    "sqlstate": "23505",
    "message": "duplicate key value violates unique constraint \"users_pkey\"",
    "detail": "Key (id)=(2050) already exists."
   },
   "not_null": {
    "sqlstate": "23502",
    "message": "null value in column \"name\" of relation \"users\" violates not-null constraint",
    "detail": "Failing row contains (5002, null, 30)."
   },
   "delete_referenced": {
    "sqlstate": "23503",
    "message": "update or delete on table \"users\" violates foreign key constraint \"orders_user_id_fkey\" on table \"orders\"",
    "detail": "Key (id)=(2050) is still referenced from table \"orders\"."
   }
  }
 }
};
