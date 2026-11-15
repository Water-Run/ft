/* Public C API demonstration plus explicitly private, version-bound layout probe.
 * Only the sizeof/Table inspection uses internal headers. Do not present that
 * part as portable host embedding code. Windows x64 sizes are observations.
 */
#include <assert.h>
#include <stdio.h>
#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"
#include "lobject.h"
#include "lstate.h"
#include "ltable.h"
#include "lopcodes.h"

static int c_add(lua_State *L) {
  lua_Integer a = luaL_checkinteger(L, 1);
  lua_Integer b = luaL_checkinteger(L, 2);
  printf("c-entry top=%d arg1=%lld arg2=%lld\n", lua_gettop(L), (long long)a, (long long)b);
  lua_pushinteger(L, a + b);
  return 1;
}

static unsigned array_capacity(Table *t) {
#if LUA_VERSION_NUM >= 505
  return t->asize;
#else
  return luaH_realasize(t);
#endif
}

static size_t gc_bytes(lua_State *L) {
  return (size_t)lua_gc(L, LUA_GCCOUNT) * 1024 + lua_gc(L, LUA_GCCOUNTB);
}

int main(void) {
  lua_State *L = luaL_newstate();
  assert(L != NULL);
  printf("%s\n", LUA_RELEASE);
  printf("sizeof Value=%zu TValue=%zu Node=%zu Table=%zu UpVal=%zu CallInfo=%zu\n",
         sizeof(Value), sizeof(TValue), sizeof(Node), sizeof(Table), sizeof(UpVal), sizeof(CallInfo));
  printf("sizeof lua_Integer=%zu lua_Number=%zu Instruction=%zu\n",
         sizeof(lua_Integer), sizeof(lua_Number), sizeof(Instruction));
  printf("NUM_OPCODES=%d\n", NUM_OPCODES);
  luaL_openlibs(L);
  printf("host-before top=%d\n", lua_gettop(L));
  lua_pushcfunction(L, c_add);
  lua_setglobal(L, "c_add");
  assert(luaL_loadstring(L, "return c_add(19, 23)") == LUA_OK);
  printf("host-loaded top=%d type=%s\n", lua_gettop(L), lua_typename(L, lua_type(L, -1)));
  assert(lua_pcall(L, 0, 1, 0) == LUA_OK);
  assert(lua_tointeger(L, -1) == 42);
  printf("host-result top=%d value=%lld\n", lua_gettop(L), (long long)lua_tointeger(L, -1));
  lua_settop(L, 0);

  lua_gc(L, LUA_GCSTOP);
  {
    size_t before = gc_bytes(L);
    lua_createtable(L, 1024, 0);
    size_t delta = gc_bytes(L) - before;
    Table *t = hvalue(s2v(L->top.p - 1));
    unsigned capacity = array_capacity(t);
#if LUA_VERSION_NUM >= 505
    size_t payload = capacity * (sizeof(Value) + sizeof(lu_byte)) + sizeof(unsigned);
#else
    size_t payload = capacity * sizeof(TValue);
#endif
    printf("array capacity=%u allocated_payload_formula=%zu empty_length=%zu\n",
           capacity, payload, lua_rawlen(L, -1));
    printf("table-plus-array observed_gc_bytes_delta=%zu formula_total=%zu\n",
           delta, sizeof(Table) + payload);
    assert(delta == sizeof(Table) + payload);
    assert(capacity == 1024 && lua_rawlen(L, -1) == 0);
  }
  lua_pop(L, 1);
  lua_newtable(L);
  lua_pushboolean(L, 1); lua_rawseti(L, -2, 1);
  lua_pushboolean(L, 1); lua_rawseti(L, -2, 4);
  lua_pushboolean(L, 1); lua_rawseti(L, -2, 8);
  printf("sparse-keys 1,4,8 array_capacity=%u\n", array_capacity(hvalue(s2v(L->top.p - 1))));
  lua_pop(L, 1);
  assert(luaL_loadstring(L, "error('C-caught', 0)") == LUA_OK);
  {
    int status = lua_pcall(L, 0, 0, 0);
    assert(status == LUA_ERRRUN);
    printf("host-protected runtime-error=%d top=%d message=%s\n",
           status == LUA_ERRRUN, lua_gettop(L), lua_tostring(L, -1));
  }
  lua_close(L);
  return 0;
}
