/* Lua 5.5.1 internal-layout probes for the production of this film.
 * Uses private headers on purpose: it reads the same structures the video
 * draws (instruction words, stack slots, CallInfo, UpVal, hash nodes,
 * interned strings). Not portable embedding code; results apply only to
 * the unmodified 5.5.1 release built as in 07_build_and_run.py.
 */
#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"
#include "lobject.h"
#include "lstate.h"
#include "lstring.h"
#include "ltable.h"
#include "lfunc.h"
#include "ldebug.h"
#include "lopcodes.h"
#include "lopnames.h"

static const char *const modes[] = {"iABC", "ivABC", "iABx", "iAsBx", "iAx", "isJ"};

static void dump_code(const char *label, Proto *p) {
  int pc;
  printf("[code] %s lines %d-%d, %d instructions, maxstack=%d\n",
         label, p->linedefined, p->lastlinedefined, p->sizecode, p->maxstacksize);
  for (pc = 0; pc < p->sizecode; pc++) {
    Instruction i = p->code[pc];
    OpCode op = GET_OPCODE(i);
    int m = getOpMode(op);
    printf("  pc=%d word=0x%08X op=%d %s mode=%s A=%d k=%d B=%d C=%d Bx=%d\n",
           pc + 1, (unsigned)i, (int)op, opnames[op], modes[m], GETARG_A(i),
           GETARG_k(i), GETARG_B(i), GETARG_C(i), GETARG_Bx(i));
  }
}

static void show_value(const TValue *o) {
  switch (ttypetag(o)) {
    case LUA_VNIL: printf("nil"); break;
    case LUA_VFALSE: printf("false"); break;
    case LUA_VTRUE: printf("true"); break;
    case LUA_VNUMINT: printf("integer %lld", (long long)ivalue(o)); break;
    case LUA_VNUMFLT: printf("float %g", fltvalue(o)); break;
    case LUA_VSHRSTR: case LUA_VLNGSTR: printf("string \"%s\"", getstr(tsvalue(o))); break;
    case LUA_VTABLE: printf("table"); break;
    case LUA_VLCL: printf("Lua closure (proto lines %d-%d)", clLvalue(o)->p->linedefined,
                          clLvalue(o)->p->lastlinedefined); break;
    case LUA_VLCF: printf("light C function"); break;
    case LUA_VCCL: printf("C closure"); break;
    default: printf("tag %d", ttypetag(o)); break;
  }
}

/* stack snapshot taken from a count hook inside the counter closure */
static int snapshots = 0;
static void snapshot(lua_State *L, int pcrel) {
  CallInfo *ci;
  StkId s;
  int depth = 0;
  printf("[stack] inner closure, about to run pc=%d (%s)\n", pcrel + 1,
         opnames[GET_OPCODE(ci_func(L->ci)->p->code[pcrel])]);
  for (ci = L->ci; ci != NULL; ci = ci->previous) depth++;
  printf("  CallInfo chain length=%d (current first)\n", depth);
  for (ci = L->ci; ci != NULL; ci = ci->previous) {
    int func = (int)(ci->func.p - L->stack.p);
    /* ci->top is raised by luaD_hook while a hook runs; report the frame end
       that luaD_precall set: func + 1 + maxstacksize */
    if (ci == &L->base_ci) printf("  ci base_ci (host C level) func=slot %d\n", func);
    else if (isLua(ci))
      printf("  ci Lua func=slot %d base=slot %d frame-end=slot %d proto lines %d-%d\n", func,
             func + 1, func + 1 + ci_func(ci)->p->maxstacksize, ci_func(ci)->p->linedefined,
             ci_func(ci)->p->lastlinedefined);
    else printf("  ci C func=slot %d\n", func);
  }
  /* main chunk frame and the callee frame, up to the callee's last argument
     or computed register (later slots of the frame hold stale data) */
  {
    CallInfo *cur = L->ci, *main = cur->previous;
    int mainbase = (int)(main->func.p - L->stack.p) + 1;
    int curbase = (int)(cur->func.p - L->stack.p) + 1;
    int last = curbase + (pcrel == 0 ? 0 : 1);
    for (s = main->func.p; s < L->stack.p + last + 1; s++) {
      int slot = (int)(s - L->stack.p);
      if (slot >= mainbase && slot < curbase - 1)
        printf("  slot %d main R%d = ", slot, slot - mainbase);
      else if (slot == curbase - 1) printf("  slot %d callee function = ", slot);
      else if (slot >= curbase) printf("  slot %d inner R%d = ", slot, slot - curbase);
      else printf("  slot %d main function = ", slot);
      show_value(s2v(s));
      printf("\n");
    }
  }
  {
    LClosure *cl = ci_func(L->ci);
    UpVal *uv = cl->upvals[0];
    printf("  upvalue[0] closed=%d open-list-empty=%d value=", uv->v.p == &uv->u.value,
           L->openupval == NULL);
    show_value(uv->v.p);
    printf("\n");
  }
  snapshots++;
}

/* how many times each instruction of the inner closure is about to run
   (coroutines inherit the hook from the main thread: lstate.c lua_newthread) */
static int executed[16];

static void hook(lua_State *L, lua_Debug *ar) {
  CallInfo *ci = L->ci;
  (void)ar;
  if (!isLua(ci)) return;
  {
    Proto *p = ci_func(ci)->p;
    int pcrel = (int)(ci->u.l.savedpc - p->code) - 1;
    if (p->linedefined != 4) return;
    if (pcrel >= 0 && pcrel < 16) executed[pcrel]++;
    if (snapshots < 2 && (pcrel == 0 || pcrel == 5)) snapshot(L, pcrel);
  }
}

static void dump_nodes(const char *label, lua_State *L, Table *t) {
  unsigned i, n = sizenode(t);
  printf("[hash] %s asize=%u nodes=%u\n", label, t->asize, isdummy(t) ? 0u : n);
  if (t->asize > 0) {
    printf("  array keys present:");
    for (i = 0; i < t->asize; i++)
      if (!tagisempty(*getArrTag(t, i))) printf(" %u", i + 1);
    printf("\n");
  }
  if (isdummy(t)) return;
  for (i = 0; i < n; i++) {
    Node *nd = gnode(t, i);
    if (keyisnil(nd)) printf("  node %u empty next=%d\n", i, gnext(nd));
    else if (keyisinteger(nd)) {
      lua_Integer k = keyival(nd);
      printf("  node %u key=%lld main=%u next=%d\n", i, (long long)k,
             (unsigned)((lua_Unsigned)k % ((n - 1u) | 1u)), gnext(nd));
    }
    else printf("  node %u key(type %d) next=%d\n", i, keytt(nd), gnext(nd));
  }
  (void)L;
}

int main(void) {
  lua_State *L = luaL_newstate();
  assert(L != NULL);
  luaL_openlibs(L);
  printf("%s\n", LUA_RELEASE);
  printf("LUA_COMPAT_GLOBAL=%d LUAI_MAXSHORTLEN=%d TM_N=%d sizeof Instruction=%zu\n",
         LUA_COMPAT_GLOBAL, LUAI_MAXSHORTLEN, (int)TM_N, sizeof(Instruction));
  /* lvm.c:39-45 selects the jump table when __GNUC__ is defined */
#if defined(__GNUC__)
  printf("__GNUC__=%d (lvm.c selects LUA_USE_JUMPTABLE=1)\n", __GNUC__);
#else
  printf("__GNUC__ undefined (lvm.c selects switch dispatch)\n");
#endif

  /* 1. instruction words of the counter */
  printf("[host] stack items before loading=%d\n", lua_gettop(L));
  assert(luaL_loadfile(L, "02_counter.lua") == LUA_OK);
  {
    Proto *mainp = clLvalue(s2v(L->top.p - 1))->p;
    Proto *factory = mainp->p[0];
    Proto *inner = factory->p[0];
    printf("[proto] main sizep=%d factory sizep=%d inner upvalues=%d\n", mainp->sizep,
           factory->sizep, inner->sizeupvalues);
    printf("[upvaldesc] inner[0] name=%s instack=%d idx=%d\n",
           getstr(inner->upvalues[0].name), inner->upvalues[0].instack, inner->upvalues[0].idx);
    dump_code("factory make_counter", factory);
    dump_code("inner closure", inner);
  }
  /* 2. run it with a count hook to photograph the stack */
  lua_sethook(L, hook, LUA_MASKCOUNT, 1);
  assert(lua_pcall(L, 0, 0, 0) == LUA_OK);
  lua_sethook(L, NULL, 0, 0);
  assert(snapshots == 2);
  {
    int pc;
    printf("[trace] inner closure, times each pc ran over the whole program:");
    for (pc = 0; pc < 7; pc++) printf(" pc%d=%d", pc + 1, executed[pc]);
    printf("\n");
  }

  /* 3. short strings are interned, long strings are not */
  {
    /* two separate buffers and lua_pushlstring: lua_pushstring would hit the
       API cache keyed by the C pointer (lstring.c luaS_new) */
    TString *a, *b, *c, *d, *w;
    char s1[8], s2[8], long1[42], long2[42];
    strcpy(s1, "label"); strcpy(s2, "label");
    memset(long1, 'x', 41); long1[41] = '\0';
    memset(long2, 'x', 41); long2[41] = '\0';
    lua_pushlstring(L, s1, 5); a = tsvalue(s2v(L->top.p - 1));
    lua_pushlstring(L, s2, 5); b = tsvalue(s2v(L->top.p - 1));
    lua_pushlstring(L, long1, 41); c = tsvalue(s2v(L->top.p - 1));
    lua_pushlstring(L, long2, 41); d = tsvalue(s2v(L->top.p - 1));
    lua_pushstring(L, "while"); w = tsvalue(s2v(L->top.p - 1));
    printf("[string] short \"label\" twice same-object=%d short=%d\n", a == b, strisshr(a));
    printf("[string] 41-byte string twice same-object=%d short=%d\n", c == d, strisshr(c));
    printf("[string] reserved \"while\" extra=%d (index %d in reserved list)\n", w->extra,
           w->extra - 1);
    lua_pushstring(L, "global");
    printf("[string] \"global\" extra=%d\n", tsvalue(s2v(L->top.p - 1))->extra);
    lua_settop(L, 0);
  }

  /* 4. collisions in a hash part with 8 nodes, integer keys */
  {
    static const lua_Integer keys[] = {3, 10, 0, 7, 6};
    Table *t;
    int i;
    lua_createtable(L, 0, 8);
    t = hvalue(s2v(L->top.p - 1));
    for (i = 0; i < 5; i++) {
      char label[64];
      lua_pushboolean(L, 1);
      lua_rawseti(L, -2, keys[i]);
      snprintf(label, sizeof label, "after inserting %lld", (long long)keys[i]);
      dump_nodes(label, L, t);
    }
    lua_pushboolean(L, 1); lua_rawseti(L, -2, 1);
    lua_pushboolean(L, 1); lua_rawseti(L, -2, 2);
    lua_pushboolean(L, 1); lua_rawseti(L, -2, 4);
    dump_nodes("after inserting 1, 2, 4 (table full)", L, t);
    lua_pushboolean(L, 1); lua_rawseti(L, -2, 5);
    dump_nodes("after inserting 5 (no free node: rehash)", L, t);
    lua_settop(L, 0);
  }

  /* 5. the counter's state table: one hash node, no array part */
  assert(luaL_dostring(L, "local s = {value = 40}; return s") == LUA_OK);
  {
    Table *t = hvalue(s2v(L->top.p - 1));
    printf("[state] asize=%u nodes=%u lsizenode=%d\n", t->asize, isdummy(t) ? 0u : sizenode(t),
           t->lsizenode);
  }
  lua_close(L);
  return 0;
}
