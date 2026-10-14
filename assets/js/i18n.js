/* Language handling: English, 简体中文, or bilingual (both, like the companion PPT / Word).
 * L(en, zh)        -> HTML for the active mode (block layout in bilingual mode)
 * Li(en, zh)       -> inline variant ("English 中文") for buttons / chips / table heads
 * Lt(en, zh)       -> plain text (attributes, CSV, placeholders) */
(function (g) {
  'use strict';
  var KEY = 'dcpa_lang';
  var LANG = (function () { try { return localStorage.getItem(KEY) || 'bi'; } catch (e) { return 'bi'; } })();
  if (['en', 'zh', 'bi'].indexOf(LANG) < 0) LANG = 'bi';

  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function L(en, zh) {
    if (zh === undefined || zh === null || zh === '') return esc(en);
    if (LANG === 'en') return esc(en);
    if (LANG === 'zh') return '<span class="zh-only">' + esc(zh) + '</span>';
    return esc(en) + '<span class="zh blk">' + esc(zh) + '</span>';
  }
  function Li(en, zh) {
    if (zh === undefined || zh === null || zh === '') return esc(en);
    if (LANG === 'en') return esc(en);
    if (LANG === 'zh') return esc(zh);
    return esc(en) + ' <span class="zh">' + esc(zh) + '</span>';
  }
  function Lt(en, zh) {
    if (!zh) return String(en);
    return LANG === 'en' ? String(en) : (LANG === 'zh' ? String(zh) : en + ' / ' + zh);
  }
  function Lp(pair, inline) { return pair ? (inline ? Li(pair[0], pair[1]) : L(pair[0], pair[1])) : ''; }

  var STAR = '0,-3 0.674,-0.927 2.853,-0.927 1.090,0.354 1.764,2.427 0,1.146 -1.764,2.427 -1.090,0.354 -2.853,-0.927 -0.674,-0.927';
  var FLAG = {
    en: '<svg viewBox="0 0 60 30" width="22" height="12" aria-hidden="true"><clipPath id="ukc"><rect width="60" height="30"/></clipPath><g clip-path="url(#ukc)"><rect width="60" height="30" fill="#012169"/><path d="M0,0 60,30M60,0 0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 60,30M60,0 0,30" stroke="#C8102E" stroke-width="3"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
    zh: '<svg viewBox="0 0 30 20" width="20" height="13" aria-hidden="true"><rect width="30" height="20" fill="#de2910"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(5,5)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(10,2) scale(0.34)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(12,4) scale(0.34)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(12,7) scale(0.34)"/>' +
        '<polygon points="' + STAR + '" fill="#ffde00" transform="translate(10,9) scale(0.34)"/></svg>'
  };

  var I18N = {
    lang: function () { return LANG; },
    set: function (l) { LANG = l; try { localStorage.setItem(KEY, l); } catch (e) { } },
    switcher: function () {
      var opts = [['en', FLAG.en + '<span>EN</span>', 'English'], ['zh', FLAG.zh + '<span>中文</span>', '简体中文'], ['bi', FLAG.en + FLAG.zh + '<span>EN·中</span>', 'Bilingual / 双语']];
      return opts.map(function (o) { return '<button class="lang' + (LANG === o[0] ? ' on' : '') + '" data-lang="' + o[0] + '" title="' + o[2] + '">' + o[1] + '</button>'; }).join('');
    }
  };
  g.I18N = I18N; g.L = L; g.Li = Li; g.Lt = Lt; g.Lp = Lp; g.esc = esc;
})(window);
