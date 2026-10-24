"""Same-version source entry points (mysql-9.7.4 tag) for every mechanism the film shows, with line numbers."""
import hashlib
from lab_common import SOURCE, finish

SRC = SOURCE / "mysql-9.7.4-src"
POINTS = [
    ("handler: insert", "storage/myisam/ha_myisam.cc", "int ha_myisam::write_row(uchar *buf) {"),
    ("handler: index lookup", "storage/myisam/ha_myisam.cc", "int ha_myisam::index_read_map(uchar *buf, const uchar *key,"),
    ("handler: table scan", "storage/myisam/ha_myisam.cc", "int ha_myisam::rnd_next(uchar *buf) {"),
    ("write a row", "storage/myisam/mi_write.cc", "int mi_write(MI_INFO *info, uchar *record) {"),
    ("fixed row: reuse deleted slot first", "storage/myisam/mi_statrec.cc", "int _mi_write_static_record(MI_INFO *info, const uchar *record) {"),
    ("fixed row: delete mark + chain link", "storage/myisam/mi_statrec.cc", "temp[0] = '\\0'; /* Mark that record is deleted */"),
    ("fixed row: read by position", "storage/myisam/mi_statrec.cc", "int _mi_read_static_record(MI_INFO *info, my_off_t pos, uchar *record) {"),
    ("update a row", "storage/myisam/mi_update.cc", "int mi_update(MI_INFO *info, const uchar *oldrec, uchar *newrec) {"),
    ("delete a row", "storage/myisam/mi_delete.cc", "int mi_delete(MI_INFO *info, const uchar *record) {"),
    ("B-tree search", "storage/myisam/mi_search.cc", "int _mi_search(MI_INFO *info, MI_KEYDEF *keyinfo, uchar *key, uint key_len,"),
    ("child pointer = block x 1024", "storage/myisam/mi_search.cc", "my_off_t _mi_kpos(uint nod_flag, uchar *after_key) {"),
    ("row pointer = row number x record length", "storage/myisam/mi_search.cc", "my_off_t _mi_dpos(MI_INFO *info, uint nod_flag, const uchar *after_key) {"),
    ("packed key decoding", "storage/myisam/mi_search.cc", "uint _mi_get_pack_key(MI_KEYDEF *keyinfo, uint nod_flag, uchar **page_pos,"),
    ("key cache read", "mysys/mf_keycache.cc", "uchar *key_cache_read(KEY_CACHE *keycache, st_keycache_thread_var *thread_var,"),
    ("table lock", "mysys/thr_lock.cc", "enum enum_thr_lock_result thr_lock(THR_LOCK_DATA *data, THR_LOCK_INFO *owner,"),
    ("wait for table lock", "mysys/thr_lock.cc", "static enum enum_thr_lock_result wait_for_lock(struct st_lock_list *wait,"),
    ("open counter marks unclosed table", "storage/myisam/mi_locking.cc", "int _mi_mark_file_changed(MI_INFO *info) {"),
    ("CHECK: key checksum mismatch", "storage/myisam/mi_check.cc", "\"Checksum for key: %2d doesn't match checksum for records\","),
]


def main():
    out, files = [], {}
    for what, rel, needle in POINTS:
        lines = (SRC / rel).read_text(encoding="utf-8", errors="replace").splitlines()
        hits = [i + 1 for i, line in enumerate(lines) if needle in line]
        assert len(hits) == 1, (rel, needle, hits)
        out.append({"what": what, "file": rel, "line": hits[0], "text": lines[hits[0] - 1].strip()})
        files[rel] = hashlib.sha256((SRC / rel).read_bytes()).hexdigest()
    finish("08_sources", {"summary": {p["what"]: f"{p['file']}:{p['line']}" for p in out}, "points": out,
                          "file_sha256": files, "source": "github.com/mysql/mysql-server tag mysql-9.7.4"})


if __name__ == "__main__":
    main()
