// 由 tools/gen_data.py 从 research/lab/ 与 research/_src/ 生成，不要手改。
window.DATA = {
 "version": {
  "pkg": "3.0.2.0",
  "kernelPkg": "6.18.40.1-1",
  "windows": "10.0.26220.9587",
  "zh": [
   "WSL 版本: 3.0.2.0",
   "内核版本: 6.18.40.1-1"
  ],
  "en": [
   "WSL version: 3.0.2.0",
   "Kernel version: 6.18.40.1-1"
  ],
  "list": {
   "header": "  NAME               STATE           VERSION",
   "row": "* Ubuntu             Stopped         2",
   "others": 3,
   "othersVersions": [
    "2",
    "2",
    "2"
   ]
  },
  "status": {
   "zh": "默认版本: 2",
   "en": "Default Version: 2"
  },
  "set3": {
   "zh": [
    "无法解析版本号。",
    "错误代码： Wsl/ERROR_VERSION_PARSE_ERROR"
   ],
   "en": [
    "A version number could not be parsed.",
    "Error code: Wsl/ERROR_VERSION_PARSE_ERROR"
   ]
  },
  "wslc": "wslc 3.0.2.0",
  "sameBinary": true,
  "exes": {
   "container.exe": {
    "bytes": 9043312,
    "ver": "3.0.2.0"
   },
   "msal.wsl.proxy.exe": {
    "bytes": 1555504,
    "ver": ""
   },
   "msrdc.exe": {
    "bytes": 3538232,
    "ver": "1.2.7391.0"
   },
   "wsl.exe": {
    "bytes": 5365064,
    "ver": "3.0.2.0"
   },
   "wslc.exe": {
    "bytes": 9043312,
    "ver": "3.0.2.0"
   },
   "wslcsession.exe": {
    "bytes": 7695728,
    "ver": "3.0.2.0"
   },
   "wslg.exe": {
    "bytes": 5365104,
    "ver": "3.0.2.0"
   },
   "wslhost.exe": {
    "bytes": 5422408,
    "ver": "3.0.2.0"
   },
   "wslrelay.exe": {
    "bytes": 5424456,
    "ver": "3.0.2.0"
   },
   "wslservice.exe": {
    "bytes": 7455048,
    "ver": "3.0.2.0"
   }
  }
 },
 "alpine": {
  "file": "alpine-minirootfs-3.24.2-x86_64.tar.gz",
  "release": "3.24.2",
  "bytes": 3701382,
  "sha256": "c5ca053cfe1d85c5b96dff8b9bc57045f7f184a30ffb6b65776409ca90388677"
 },
 "srcpkg": {
  "file": "WSL-3.0.1.tar.gz",
  "bytes": 20095141,
  "sha256": "dbb0307373599a7ff1c3610be14641fe11a47473e08056d5834b072fa85017ae"
 },
 "import": {
  "wsl1": "wsl --import ft-wsl1 C:\\ftlab\\wsl1 C:\\ftlab\\alpine-minirootfs-3.24.2-x86_64.tar.gz --version 1",
  "wsl2": "wsl --import ft-wsl2 C:\\ftlab\\wsl2 C:\\ftlab\\alpine-minirootfs-3.24.2-x86_64.tar.gz --version 2",
  "ok": {
   "zh": "操作成功完成。",
   "en": "The operation completed successfully."
  }
 },
 "labList": {
  "header": "  NAME               STATE           VERSION",
  "rows": [
   "  ft-wsl1            Stopped         1",
   "  ft-wsl2            Stopped         2"
  ]
 },
 "uname": {
  "wsl1": "4.4.0-26100-Microsoft",
  "wsl2": "6.18.40.1-microsoft-standard-WSL2",
  "wslc": "6.18.40.1-microsoft-standard-WSL2"
 },
 "procVersion": {
  "wsl1": "Linux version 4.4.0-26100-Microsoft (Microsoft@Microsoft.com) (gcc version 5.4.0 (GCC) ) #9587-Microsoft Fri Jan 01 08:00:00 PST 2016",
  "wsl2": "Linux version 6.18.40.1-microsoft-standard-WSL2 (root@71c659030f6c) (gcc (GCC) 13.2.0, GNU ld (GNU Binutils) 2.41) #1 SMP PREEMPT_DYNAMIC Fri Jul 31 22:12:15 UTC 2026",
  "wslc": "Linux version 6.18.40.1-microsoft-standard-WSL2 (root@71c659030f6c) (gcc (GCC) 13.2.0, GNU ld (GNU Binutils) 2.41) #1 SMP PREEMPT_DYNAMIC Fri Jul 31 22:12:15 UTC 2026"
 },
 "nt": {
  "ntoskrnl": "10.0.26100.9587",
  "build": "26100",
  "rev": "9587",
  "lxcore": {
   "ver": "10.0.26100.9587",
   "desc": "LX Core",
   "bytes": 1128592
  }
 },
 "probes": {
  "cmd": {
   "dmesg": "dmesg",
   "userns": "unshare -U id -u",
   "cgroup": "mount -t cgroup2 none /tmp/cg"
  },
  "wsl1": {
   "dmesg": "dmesg: klogctl: Function not implemented",
   "userns": "unshare: unshare(0x10000000): Invalid argument",
   "cgroup": "mount: mounting none on /tmp/cg failed: No such device"
  },
  "wsl2": {
   "dmesg": "[    0.000000] Linux version 6.18.40.1-microsoft-standard-WSL2 (root@71c659030f6c) (gcc (GCC) 13.2.0, GNU ld (GNU Binutils) 2.41) #1 SMP PREEMPT_DYNAMIC Fri Jul 31 22:12:15 UTC 2026",
   "userns": "65534",
   "cgroup": "cpuset cpu io memory hugetlb pids rdma"
  }
 },
 "storage": {
  "wsl1": {
   "root": "wslfs",
   "c": "drvfs",
   "files": 424,
   "dirs": 98,
   "top": [
    "bin",
    "dev",
    "etc",
    "home",
    "lib",
    "media",
    "mnt",
    "opt"
   ]
  },
  "wsl2": {
   "root": "ext4",
   "dev": "/dev/sdd",
   "c": "9p",
   "vhdx": 79691776
  }
 },
 "timing": {
  "files": 1489,
  "dirs": 221,
  "raw": {
   "wsl1_base": {
    "runs": [
     189,
     145,
     136,
     144,
     114
    ],
    "median": 144
   },
   "wsl1_linux": {
    "runs": [
     2534,
     2578,
     2935,
     2612,
     4870
    ],
    "median": 2612
   },
   "wsl1_win": {
    "runs": [
     13595,
     9684,
     7606,
     7602,
     7969
    ],
    "median": 7969
   },
   "wsl2_base": {
    "runs": [
     204,
     196,
     201,
     173,
     182
    ],
    "median": 196
   },
   "wsl2_linux": {
    "runs": [
     558,
     533,
     523,
     540,
     1001
    ],
    "median": 540
   },
   "wsl2_win": {
    "runs": [
     92194,
     86337,
     69336,
     119175,
     88228
    ],
    "median": 88228
   }
  },
  "ms": {
   "wsl1_linux": 2468,
   "wsl1_win": 7825,
   "wsl2_linux": 344,
   "wsl2_win": 88032
  },
  "native": 888,
  "ratioLinux": 7.2,
  "ratioWin": 11.3
 },
 "wslc": {
  "import": "wslc import C:\\ftlab\\alpine-minirootfs-3.24.2-x86_64.tar.gz ft-alpine:3.24.2",
  "importId": "fa6f90e9222b",
  "image": "ft-alpine:3.24.2",
  "imageSize": "8.42MB",
  "run": "wslc run --rm ft-alpine:3.24.2 uname -r",
  "owners": {
   "wslservice": "SYSTEM",
   "wslcsession": "当前用户"
  },
  "vms": [
   "vmmemCmZygote",
   "vmmemWSL",
   "vmmemwslc-cli-admin-user"
  ],
  "session": "wslc-cli-admin-user",
  "storageVhdx": 650117120,
  "swapVhdx": 37748736,
  "procs": [
   "init",
   "GnsEngine",
   "PortRelay",
   "containerd",
   "dockerd",
   "containerd-shim",
   "sleep"
  ],
  "kthreads": 258,
  "dockerd": "25.0.3",
  "containerd": "2.2.4",
  "runc": "1.3.3",
  "volume": {
   "cmd": "wslc run --rm -v C:\\ftlab\\share:/data ft-alpine:3.24.2 grep /data /proc/mounts",
   "mount": "drvfs /data virtiofs rw,relatime 0 0",
   "fs": "virtiofs"
  },
  "cgroup": "cpuset cpu io memory hugetlb pids rdma",
  "overlay": true,
  "dockerRoot": true,
  "initFlag": {
   "wsl2": "WSL_ROOT_INIT=1",
   "wslc": "WSLC_ROOT_INIT=1"
  },
  "distroStateWhileRunning": [
   "Stopped",
   "Stopped"
  ],
  "port": "127.0.0.1:18080->80/tcp",
  "portReply": "3.24.2"
 },
 "releases": {
  "rows": [
   [
    "0.47.1",
    "2021-10-12",
    0,
    0
   ],
   [
    "0.48.2",
    "2021-10-16",
    0,
    0
   ],
   [
    "0.50.2",
    "2021-11-15",
    0,
    0
   ],
   [
    "0.51.2",
    "2022-01-14",
    0,
    0
   ],
   [
    "0.51.3",
    "2022-02-09",
    0,
    0
   ],
   [
    "0.56.1",
    "2022-03-11",
    0,
    0
   ],
   [
    "0.56.2",
    "2022-03-17",
    0,
    0
   ],
   [
    "0.58.0",
    "2022-04-07",
    0,
    0
   ],
   [
    "0.58.1",
    "2022-04-14",
    0,
    0
   ],
   [
    "0.58.3",
    "2022-04-28",
    0,
    0
   ],
   [
    "0.60.0",
    "2022-06-07",
    0,
    0
   ],
   [
    "0.61.4",
    "2022-06-24",
    0,
    0
   ],
   [
    "0.61.8",
    "2022-06-29",
    0,
    0
   ],
   [
    "0.64.0",
    "2022-07-21",
    0,
    0
   ],
   [
    "0.65.1",
    "2022-08-03",
    1,
    0
   ],
   [
    "0.65.3",
    "2022-08-04",
    0,
    0
   ],
   [
    "0.66.2",
    "2022-08-19",
    0,
    0
   ],
   [
    "0.67.6",
    "2022-09-21",
    1,
    0
   ],
   [
    "0.68.2",
    "2022-09-28",
    1,
    0
   ],
   [
    "0.68.4",
    "2022-10-04",
    1,
    0
   ],
   [
    "0.70.0",
    "2022-10-11",
    0,
    0
   ],
   [
    "0.70.4",
    "2022-10-19",
    0,
    0
   ],
   [
    "0.70.5",
    "2022-10-25",
    1,
    0
   ],
   [
    "0.70.8",
    "2022-11-04",
    1,
    0
   ],
   [
    "1.0.0",
    "2022-11-15",
    0,
    1
   ],
   [
    "1.0.1",
    "2022-11-22",
    1,
    1
   ],
   [
    "1.0.3",
    "2022-12-01",
    0,
    1
   ],
   [
    "1.1.0",
    "2023-01-18",
    1,
    1
   ],
   [
    "1.1.2",
    "2023-02-02",
    1,
    1
   ],
   [
    "1.1.3",
    "2023-02-14",
    0,
    1
   ],
   [
    "1.1.5",
    "2023-03-14",
    1,
    1
   ],
   [
    "1.1.6",
    "2023-03-30",
    1,
    1
   ],
   [
    "1.1.7",
    "2023-04-04",
    1,
    1
   ],
   [
    "1.2.0",
    "2023-04-04",
    1,
    1
   ],
   [
    "1.2.1",
    "2023-04-11",
    1,
    1
   ],
   [
    "1.2.2",
    "2023-04-13",
    1,
    1
   ],
   [
    "1.2.3",
    "2023-04-15",
    1,
    1
   ],
   [
    "1.2.4",
    "2023-04-18",
    1,
    1
   ],
   [
    "1.2.5",
    "2023-04-20",
    0,
    1
   ],
   [
    "1.3.10",
    "2023-06-13",
    1,
    1
   ],
   [
    "1.3.11",
    "2023-06-14",
    1,
    1
   ],
   [
    "1.3.14",
    "2023-07-17",
    1,
    1
   ],
   [
    "1.3.15",
    "2023-08-02",
    1,
    1
   ],
   [
    "1.3.17",
    "2023-08-30",
    1,
    1
   ],
   [
    "2.0.0",
    "2023-09-18",
    1,
    2
   ],
   [
    "2.0.1",
    "2023-09-25",
    1,
    2
   ],
   [
    "2.0.2",
    "2023-09-28",
    1,
    2
   ],
   [
    "2.0.3",
    "2023-09-29",
    1,
    2
   ],
   [
    "2.0.4",
    "2023-10-04",
    1,
    2
   ],
   [
    "2.0.5",
    "2023-10-20",
    1,
    2
   ],
   [
    "2.0.6",
    "2023-10-24",
    1,
    2
   ],
   [
    "2.0.7",
    "2023-10-30",
    1,
    2
   ],
   [
    "2.0.8",
    "2023-11-10",
    1,
    2
   ],
   [
    "2.0.9",
    "2023-11-11",
    0,
    2
   ],
   [
    "2.0.11",
    "2023-11-22",
    1,
    2
   ],
   [
    "2.0.12",
    "2023-11-29",
    1,
    2
   ],
   [
    "2.0.14",
    "2023-12-01",
    0,
    2
   ],
   [
    "2.0.15",
    "2023-12-21",
    1,
    2
   ],
   [
    "2.1.0",
    "2024-01-08",
    1,
    2
   ],
   [
    "2.1.1",
    "2024-01-22",
    1,
    2
   ],
   [
    "2.1.3",
    "2024-02-20",
    1,
    2
   ],
   [
    "2.1.4",
    "2024-03-01",
    0,
    2
   ],
   [
    "2.1.5",
    "2024-03-12",
    0,
    2
   ],
   [
    "2.2.1",
    "2024-03-22",
    1,
    2
   ],
   [
    "2.2.2",
    "2024-04-05",
    1,
    2
   ],
   [
    "2.2.3",
    "2024-04-19",
    1,
    2
   ],
   [
    "2.2.4",
    "2024-04-25",
    0,
    2
   ],
   [
    "2.3.11",
    "2024-07-17",
    1,
    2
   ],
   [
    "2.3.12",
    "2024-07-23",
    1,
    2
   ],
   [
    "2.3.13",
    "2024-07-26",
    1,
    2
   ],
   [
    "2.3.14",
    "2024-08-01",
    1,
    2
   ],
   [
    "2.3.17",
    "2024-08-10",
    1,
    2
   ],
   [
    "2.3.21",
    "2024-09-16",
    1,
    2
   ],
   [
    "2.3.22",
    "2024-09-20",
    1,
    2
   ],
   [
    "2.3.24",
    "2024-09-27",
    0,
    2
   ],
   [
    "2.3.25",
    "2024-10-25",
    1,
    2
   ],
   [
    "2.3.26",
    "2024-11-10",
    0,
    2
   ],
   [
    "2.4.4",
    "2024-11-19",
    1,
    2
   ],
   [
    "2.4.5",
    "2024-12-03",
    1,
    2
   ],
   [
    "2.4.8",
    "2024-12-16",
    1,
    2
   ],
   [
    "2.4.9",
    "2025-01-30",
    1,
    2
   ],
   [
    "2.4.10",
    "2025-02-01",
    0,
    2
   ],
   [
    "2.4.11",
    "2025-02-12",
    0,
    2
   ],
   [
    "2.4.12",
    "2025-03-06",
    0,
    2
   ],
   [
    "2.5.1",
    "2025-03-12",
    1,
    2
   ],
   [
    "2.4.13",
    "2025-03-20",
    0,
    2
   ],
   [
    "2.5.4",
    "2025-03-26",
    1,
    2
   ],
   [
    "2.5.6",
    "2025-04-08",
    1,
    2
   ],
   [
    "2.5.7",
    "2025-04-24",
    0,
    2
   ],
   [
    "2.5.8",
    "2025-06-05",
    1,
    2
   ],
   [
    "2.5.9",
    "2025-06-10",
    0,
    2
   ],
   [
    "2.6.0",
    "2025-06-20",
    1,
    2
   ],
   [
    "2.5.10",
    "2025-08-06",
    0,
    2
   ],
   [
    "2.6.1",
    "2025-08-07",
    0,
    2
   ],
   [
    "2.6.2",
    "2025-10-13",
    0,
    2
   ],
   [
    "2.7.0",
    "2025-12-11",
    1,
    2
   ],
   [
    "2.6.3",
    "2025-12-12",
    0,
    2
   ],
   [
    "2.7.1",
    "2026-03-24",
    1,
    2
   ],
   [
    "2.7.3",
    "2026-04-25",
    0,
    2
   ],
   [
    "2.7.5",
    "2026-05-15",
    1,
    2
   ],
   [
    "2.7.7",
    "2026-05-19",
    1,
    2
   ],
   [
    "2.7.8",
    "2026-06-06",
    0,
    2
   ],
   [
    "2.7.9",
    "2026-06-23",
    1,
    2
   ],
   [
    "2.7.10",
    "2026-06-26",
    0,
    2
   ],
   [
    "2.9.3",
    "2026-06-29",
    1,
    2
   ],
   [
    "2.9.4",
    "2026-07-13",
    1,
    2
   ],
   [
    "2.7.11",
    "2026-07-24",
    0,
    2
   ],
   [
    "2.7.12",
    "2026-08-18",
    0,
    2
   ],
   [
    "2.9.8",
    "2026-08-24",
    1,
    2
   ],
   [
    "2.9.9",
    "2026-08-25",
    1,
    2
   ],
   [
    "2.7.13",
    "2026-09-04",
    0,
    2
   ],
   [
    "2.9.10",
    "2026-09-04",
    1,
    2
   ],
   [
    "2.9.11",
    "2026-09-08",
    1,
    2
   ],
   [
    "2.7.14",
    "2026-09-11",
    0,
    2
   ],
   [
    "2.9.12",
    "2026-09-14",
    1,
    2
   ],
   [
    "2.9.13",
    "2026-09-25",
    1,
    2
   ],
   [
    "3.0.1",
    "2026-09-29",
    0,
    3
   ],
   [
    "3.0.2",
    "2026-10-05",
    1,
    3
   ]
  ],
  "count": 118,
  "firsts": {
   "0": [
    "0.47.1",
    "2021-10-12"
   ],
   "1": [
    "1.0.0",
    "2022-11-15"
   ],
   "2": [
    "2.0.0",
    "2023-09-18"
   ],
   "3": [
    "3.0.1",
    "2026-09-29"
   ]
  },
  "preview": {
   "tag": "2.9.3",
   "date": "2026-06-29"
  }
 },
 "quotes": {
  "loewen": {
   "name": "Craig Loewen",
   "handle": "@craigaloewen",
   "bio": "Product Manager at @Microsoft, working on the Windows Subsystem for Linux #WSL #WSL2",
   "date": "2026-06-23",
   "first": "As a PSA, there is no such thing as WSL 3!",
   "second": "I've seen some articles talking about it, and it's not currently a thing.",
   "rest": "However we did just announce WSL container (Or WSLc for short which might be where the confusion is coming from) and that will be available in just a week or so!"
  },
  "r301": {
   "tag": "3.0.1",
   "date": "2026-09-29",
   "time": "17:18",
   "head": "WSLc is generally available.",
   "from": "2.9.13",
   "to": "3.0.1"
  },
  "r302": {
   "tag": "3.0.2",
   "date": "2026-10-05",
   "prerelease": true
  },
  "media": [
   {
    "site": "TechTimes",
    "date": "2026-06-02",
    "title": "WSL 3 at Build 2026: Near-Native GPU and NPU Passthrough Brings Local AI to Windows"
   },
   {
    "site": "IT-Connect",
    "date": "2026-06-04",
    "title": "WSL 3 and WSL Containers: Microsoft’s Next Windows Update"
   }
  ],
  "ga": {
   "title": "WSL containers is now generally available",
   "site": "Windows Developer Blog",
   "date": "2026-09-29",
   "wsl3Count": 0
  }
 },
 "src": {
  "tag": "3.0.1",
  "file": "src/windows/common/WslClient.cpp",
  "line": 1093,
  "fnLine": 1089,
  "fn": [
   "DWORD",
   "ParseVersionString(_In_ const std::wstring_view& versionString)",
   "{",
   "    DWORD version;",
   "    const auto result = wil::ResultFromException([&]() { version = std::stoi(std::wstring(versionString)); });",
   "    THROW_HR_IF(HRESULT_FROM_WIN32(ERROR_VERSION_PARSE_ERROR), (FAILED(result) || ((version != LXSS_WSL_VERSION_1) && (version != LXSS_WSL_VERSION_2))));",
   "",
   "    return version;",
   "}"
  ],
  "check": "THROW_HR_IF(HRESULT_FROM_WIN32(ERROR_VERSION_PARSE_ERROR), (FAILED(result) || ((version != LXSS_WSL_VERSION_1) && (version != LXSS_WSL_VERSION_2))));",
  "defines": [
   [
    "LXSS_WSL_VERSION_DEFAULT",
    0
   ],
   [
    "LXSS_WSL_VERSION_1",
    1
   ],
   [
    "LXSS_WSL_VERSION_2",
    2
   ]
  ],
  "docker": {
   "file": "src/windows/wslcsession/DockerHTTPClient.cpp",
   "sock": "/var/run/docker.sock",
   "calls": [
    "POST /containers/create",
    "POST /containers/{id}/start"
   ]
  },
  "hcs": {
   "file": "src/windows/common/hcs.cpp",
   "call": "HcsCreateComputeSystem"
  }
 }
};
