/* Why #u differs: u[1], u[2], u[4] set one by one; print the array part size,
 * the length hint (5.5) or alimit (5.4), and #u. Uses internal headers on purpose:
 * this is a version-bound probe, not host code. Built and run by 15_table_length.py.
 */
#include <stdio.h>
#include "lua.h"
#include "lauxlib.h"
#include "lualib.h"
#include "lstate.h"
#include "lobject.h"
#include "ltable.h"

int main(void) {
  lua_State *L = luaL_newstate();
  Table *t;
  luaL_openlibs(L);
  if (luaL_dostring(L, "local u = {}; u[1] = 1; u[2] = 2; u[4] = 4; return u") != LUA_OK)
    return 1;
  t = hvalue(s2v(L->top.p - 1));
#if LUA_VERSION_NUM >= 505
  printf("%s asize=%u lenhint_before=%u", LUA_RELEASE, t->asize, *lenhint(t));
  printf(" len=%u", (unsigned)lua_rawlen(L, -1));
  printf(" lenhint_after=%u\n", *lenhint(t));
#else
  printf("%s realasize=%u alimit_before=%u", LUA_RELEASE, luaH_realasize(t), t->alimit);
  printf(" len=%u", (unsigned)lua_rawlen(L, -1));
  printf(" alimit_after=%u\n", t->alimit);
#endif
  lua_close(L);
  return 0;
}
