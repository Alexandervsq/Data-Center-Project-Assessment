/* Language handling — English or 简体中文 (single-language interface).
 * L(en, zh) / Li(en, zh) -> escaped HTML for the active language · Lt(en, zh) -> plain text
 * Lp([en, zh]) -> pair helper. */
(function (g) {
  'use strict';
  var KEY = 'dcpa_lang';
  var LANG = (function () { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } })();
  if (LANG !== 'en' && LANG !== 'zh') LANG = 'en';

  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function Lt(en, zh) { return LANG === 'zh' && zh ? String(zh) : String(en === undefined || en === null ? '' : en); }
  function L(en, zh) { return esc(Lt(en, zh)); }
  function Lp(pair) { return pair ? L(pair[0], pair[1]) : ''; }
  function Lpt(pair) { return pair ? Lt(pair[0], pair[1]) : ''; }

  var STAR = '0,-3 0.674,-0.927 2.853,-0.927 1.090,0.354 1.764,2.427 0,1.146 -1.764,2.427 -1.090,0.354 -2.853,-0.927 -0.674,-0.927';
  var FLAG = {
    en: '<svg viewBox="0 0 60 30" width="22" height="12" aria-hidden="true"><clipPath id="ukc"><rect width="60" height="30"/></clipPath><g clip-path="url(#ukc)"><rect width="60" height="30" fill="#012169"/><path d="M0,0 60,30M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30M60,0 0,30" stroke="#C8102E" stroke-width="3"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
    zh: '<svg viewBox="0 0 30 20" width="20" height="13" aria-hidden="true"><rect width="30" height="20" fill="#de2910"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(5,5)"/><polygon points="' + STAR + '" fill="#ffde00" transform="translate(10,2) scale(0.34)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(12,4) scale(0.34)"/><polygon points="' + STAR + '" fill="#ffde00" transform="translate(12,7) scale(0.34)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(10,9) scale(0.34)"/></svg>'
  };
  g.I18N = {
    lang: function () { return LANG; },
    set: function (l) { LANG = l === 'zh' ? 'zh' : 'en'; try { localStorage.setItem(KEY, LANG); } catch (e) { } },
    switcher: function () {
      return [['en', FLAG.en + '<span>EN</span>', 'English'], ['zh', FLAG.zh + '<span>中文</span>', '简体中文']].map(function (o) {
        return '<button class="lang' + (LANG === o[0] ? ' on' : '') + '" data-lang="' + o[0] + '" title="' + o[2] + '">' + o[1] + '</button>'; }).join('');
    }
  };
  g.L = L; g.Li = L; g.Lt = Lt; g.Lp = Lp; g.Lpt = Lpt; g.esc = esc;
})(window);
