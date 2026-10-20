// Minimal JSON for flate objekter: {"nøkkel": "tekst" | tall | true/false}.
// Hendelsesloggen og HTTP-kroppene trenger ikke mer. Ingen allokering utover std::string.
#pragma once
#include <cstdint>
#include <map>
#include <string>

namespace stafett {
namespace json {

struct Val {
  enum Type { Str, Num, Bool, Null } type = Null;
  std::string s;
  int64_t n = 0;
  bool b = false;
};

using Obj = std::map<std::string, Val>;

inline Val str(const std::string& s) { Val v; v.type = Val::Str; v.s = s; return v; }
inline Val num(int64_t n) { Val v; v.type = Val::Num; v.n = n; return v; }
inline Val boolean(bool b) { Val v; v.type = Val::Bool; v.b = b; return v; }

inline std::string get_s(const Obj& o, const char* k, const std::string& def = "") {
  auto it = o.find(k);
  return (it != o.end() && it->second.type == Val::Str) ? it->second.s : def;
}
inline int64_t get_n(const Obj& o, const char* k, int64_t def = 0) {
  auto it = o.find(k);
  return (it != o.end() && it->second.type == Val::Num) ? it->second.n : def;
}
inline bool get_b(const Obj& o, const char* k, bool def = false) {
  auto it = o.find(k);
  return (it != o.end() && it->second.type == Val::Bool) ? it->second.b : def;
}

inline void utf8_append(std::string& out, uint32_t cp) {
  if (cp < 0x80) out += static_cast<char>(cp);
  else if (cp < 0x800) { out += static_cast<char>(0xC0 | (cp >> 6)); out += static_cast<char>(0x80 | (cp & 0x3F)); }
  else if (cp < 0x10000) {
    out += static_cast<char>(0xE0 | (cp >> 12));
    out += static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
    out += static_cast<char>(0x80 | (cp & 0x3F));
  } else {
    out += static_cast<char>(0xF0 | (cp >> 18));
    out += static_cast<char>(0x80 | ((cp >> 12) & 0x3F));
    out += static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
    out += static_cast<char>(0x80 | (cp & 0x3F));
  }
}

class Parser {
 public:
  explicit Parser(const std::string& s) : s_(s) {}

  bool parse(Obj& out) {
    ws();
    if (!eat('{')) return false;
    ws();
    if (eat('}')) return end();
    for (;;) {
      ws();
      std::string key;
      if (!string(key)) return false;
      ws();
      if (!eat(':')) return false;
      ws();
      Val v;
      if (!value(v)) return false;
      out[key] = v;
      ws();
      if (eat(',')) continue;
      if (eat('}')) return end();
      return false;
    }
  }

 private:
  const std::string& s_;
  size_t i_ = 0;

  bool end() { ws(); return i_ == s_.size(); }
  void ws() { while (i_ < s_.size() && (s_[i_] == ' ' || s_[i_] == '\n' || s_[i_] == '\r' || s_[i_] == '\t')) ++i_; }
  bool eat(char c) { if (i_ < s_.size() && s_[i_] == c) { ++i_; return true; } return false; }
  bool lit(const char* w) {
    size_t j = 0;
    while (w[j]) { if (i_ + j >= s_.size() || s_[i_ + j] != w[j]) return false; ++j; }
    i_ += j;
    return true;
  }
  static int hex(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
  }
  bool u4(uint32_t& cp) {
    if (i_ + 4 > s_.size()) return false;
    cp = 0;
    for (int k = 0; k < 4; ++k) { int h = hex(s_[i_++]); if (h < 0) return false; cp = cp * 16 + h; }
    return true;
  }
  bool string(std::string& out) {
    if (!eat('"')) return false;
    while (i_ < s_.size()) {
      char c = s_[i_++];
      if (c == '"') return true;
      if (static_cast<unsigned char>(c) < 0x20) return false;
      if (c != '\\') { out += c; continue; }
      if (i_ >= s_.size()) return false;
      char e = s_[i_++];
      switch (e) {
        case '"': out += '"'; break;
        case '\\': out += '\\'; break;
        case '/': out += '/'; break;
        case 'b': out += '\b'; break;
        case 'f': out += '\f'; break;
        case 'n': out += '\n'; break;
        case 'r': out += '\r'; break;
        case 't': out += '\t'; break;
        case 'u': {
          uint32_t cp;
          if (!u4(cp)) return false;
          if (cp >= 0xD800 && cp <= 0xDBFF) {
            uint32_t lo;
            if (!lit("\\u") || !u4(lo) || lo < 0xDC00 || lo > 0xDFFF) return false;
            cp = 0x10000 + ((cp - 0xD800) << 10) + (lo - 0xDC00);
          }
          utf8_append(out, cp);
          break;
        }
        default: return false;
      }
    }
    return false;
  }
  bool value(Val& v) {
    if (i_ >= s_.size()) return false;
    char c = s_[i_];
    if (c == '"') { v.type = Val::Str; return string(v.s); }
    if (lit("true")) { v.type = Val::Bool; v.b = true; return true; }
    if (lit("false")) { v.type = Val::Bool; v.b = false; return true; }
    if (lit("null")) { v.type = Val::Null; return true; }
    if (c == '-' || (c >= '0' && c <= '9')) {
      bool neg = eat('-');
      if (i_ >= s_.size() || s_[i_] < '0' || s_[i_] > '9') return false;
      int64_t n = 0;
      while (i_ < s_.size() && s_[i_] >= '0' && s_[i_] <= '9') {
        if (n > (INT64_MAX - 9) / 10) return false;
        n = n * 10 + (s_[i_++] - '0');
      }
      // Desimaler avkortes; vi bruker bare heltall (øre, ms).
      if (eat('.')) while (i_ < s_.size() && s_[i_] >= '0' && s_[i_] <= '9') ++i_;
      v.type = Val::Num;
      v.n = neg ? -n : n;
      return true;
    }
    return false;
  }
};

inline bool parse(const std::string& s, Obj& out) { out.clear(); return Parser(s).parse(out); }

inline std::string quote(const std::string& s) {
  std::string o = "\"";
  for (unsigned char c : s) {
    switch (c) {
      case '"': o += "\\\""; break;
      case '\\': o += "\\\\"; break;
      case '\n': o += "\\n"; break;
      case '\r': o += "\\r"; break;
      case '\t': o += "\\t"; break;
      default:
        if (c < 0x20) { static const char* hx = "0123456789abcdef"; o += "\\u00"; o += hx[c >> 4]; o += hx[c & 15]; }
        else o += static_cast<char>(c);
    }
  }
  return o + "\"";
}

inline std::string dump(const Obj& o) {
  std::string out = "{";
  bool first = true;
  for (const auto& kv : o) {
    if (!first) out += ",";
    first = false;
    out += quote(kv.first) + ":";
    const Val& v = kv.second;
    switch (v.type) {
      case Val::Str: out += quote(v.s); break;
      case Val::Num: out += std::to_string(v.n); break;
      case Val::Bool: out += v.b ? "true" : "false"; break;
      case Val::Null: out += "null"; break;
    }
  }
  return out + "}";
}

}  // namespace json
}  // namespace stafett
