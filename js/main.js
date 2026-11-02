var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  btn.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
  });


/* ---- Shared helpers ---- */
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* Resize photos with Netlify's image CDN on the live site (big phone photos
   load much faster). Falls back to the original file anywhere else, or if the
   resize fails (see the onerror handler on each img). */
var USE_IMG_CDN = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
function imgUrl(src, w){
  if(!src) return '';
  if(!USE_IMG_CDN || /^(https?:)?\/\//.test(src) || /^data:/.test(src)) return src;
  var path = src.charAt(0)==='/' ? src : '/'+src;
  return '/.netlify/images?url='+encodeURIComponent(path)+'&w='+w+'&q=80';
}
/* <img> for a zoomable photo. data-full = large version for the lightbox. */
function zoomImg(src, alt, group, thumbW, extra){
  return '<img src="'+esc(imgUrl(src, thumbW||900))+'" data-orig="'+esc(src)+'" data-full="'+esc(imgUrl(src, 2000))+'"'
    + ' alt="'+esc(alt||'')+'" data-zoom data-group="'+esc(group)+'" loading="lazy" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=this.dataset.orig;this.dataset.full=this.dataset.orig;}"'
    + (extra||'') + '>';
}
function load(url){ return fetch(url,{cache:'no-store'}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }


/* ---- Fixtures & results ---- */
var MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
/* Understands "27 September 26", "01 November 2026", "Sat 27 Sep" etc. */
function parseDate(str){
  var t = String(str||'').toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g,'$1').split(/[\s\/,.-]+/).filter(Boolean);
  var day=null, mon=null, yr=null;
  for(var i=0;i<t.length;i++){
    var w=t[i];
    if(mon===null && /^[a-z]{3,}$/.test(w) && MONTHS.indexOf(w.slice(0,3))>-1){ mon = MONTHS.indexOf(w.slice(0,3)); continue; }
    if(/^\d+$/.test(w)){
      var n=parseInt(w,10);
      if(day===null && n>=1 && n<=31){ day=n; continue; }
      if(mon!==null && yr===null){ yr = n<100 ? 2000+n : n; }
    }
  }
  if(day===null || mon===null) return null;
  if(yr===null){
    var now=new Date(); yr=now.getFullYear();
    // season runs Sep to May: a Jan-Jul date seen in the autumn is next year
    if(now.getMonth()>=7 && mon<7) yr++;
  }
  return new Date(yr, mon, day);
}
/* Pull a score out of an old-style name like "SWR Men's - 73" */
function splitScore(name){
  var m = String(name||'').match(/^(.*?)\s*[-–]\s*(\d{1,3})\s*$/);
  return m ? { name:m[1].trim(), score:m[2] } : { name:String(name||'').trim(), score:'' };
}
function normGame(f){
  var h = splitScore(f.home), a = splitScore(f.away);
  var hs = String(f.homeScore==null?'':f.homeScore).trim() || h.score;
  var as = String(f.awayScore==null?'':f.awayScore).trim() || a.score;
  return { raw:f, home:h.name, away:a.name, hs:hs, as:as, played: hs!=='' && as!=='',
           date:parseDate(f.date), comp:f.comp||'', time:String(f.time||'').trim(), place:f.place||'Home' };
}
function isUs(name){ return /\bSWR\b|south west rise/i.test(name); }
function dateHtml(g){
  if(g.date){
    var d=g.date, yy=String(d.getFullYear()).slice(2);
    return DAYS[d.getDay()]+'<span>'+d.getDate()+'</span>'+MONTHS[d.getMonth()].toUpperCase()+' '+yy;
  }
  var parts = String(g.raw.date||'').trim().split(/\s+/);
  return parts.length>=3 ? esc(parts[0])+'<span>'+esc(parts[1])+'</span>'+esc(parts.slice(2).join(' ')) : '<span>'+esc(g.raw.date||'')+'</span>';
}
function metaHtml(g){ return esc(g.comp) + (g.time ? ' · '+esc(g.time)+' tip-off' : ''); }
function fixtureRow(g){
  var cls = String(g.place).toLowerCase()==='away' ? 'away' : 'home';
  return '<div class="fx-row"><div class="fx-date">'+dateHtml(g)+'</div>'
    + '<div class="fx-match">'+esc(g.home)+' vs '+esc(g.away)+'<small>'+metaHtml(g)+'</small></div>'
    + '<div class="fx-where '+cls+'">'+esc(g.place)+'</div></div>';
}
function resultRow(g){
  var badge = '<div class="fx-where tbc">TBC</div>';
  var score = '<span class="fx-vs">vs</span>';
  if(g.played){
    var h=parseInt(g.hs,10), a=parseInt(g.as,10);
    var hw = h>a, aw = a>h;
    score = '<span class="fx-score"><b class="'+(hw?'win':'')+'">'+esc(g.hs)+'</b><i>–</i><b class="'+(aw?'win':'')+'">'+esc(g.as)+'</b></span>';
    var usH=isUs(g.home), usA=isUs(g.away);
    if(usH!==usA && h!==a){
      var won = usH ? hw : aw;
      badge = '<div class="fx-where '+(won?'win':'loss')+'">'+(won?'Win':'Loss')+'</div>';
    } else badge = '<div class="fx-where ft">FT</div>';
  }
  return '<div class="fx-row"><div class="fx-date">'+dateHtml(g)+'</div>'
    + '<div class="fx-match fx-res"><span class="fx-teams"><span class="t">'+esc(g.home)+'</span>'+score+'<span class="t">'+esc(g.away)+'</span></span><small>'+metaHtml(g)+'</small></div>'
    + badge+'</div>';
}

load('content/fixtures.json').then(function(d){
  var fxEl = document.getElementById('fxList');
  var resSec = document.getElementById('results'), resEl = document.getElementById('resList'), more = document.getElementById('resMore');
  if(!d || !d.items){ if(fxEl) fxEl.innerHTML = '<div class="fx-empty">Fixtures coming soon.</div>'; return; }
  var games = d.items.map(normGame);
  var today = new Date(); today.setHours(0,0,0,0);
  var grace = new Date(today); grace.setDate(grace.getDate()-1); // keep yesterday's game as a fixture for a day
  var upcoming=[], results=[];
  games.forEach(function(g){
    if(g.played) results.push(g);
    else if(g.date && g.date < grace) results.push(g);   // played but score not in yet
    else upcoming.push(g);
  });
  var t = function(g){ return g.date ? g.date.getTime() : 0; };
  upcoming.sort(function(a,b){ return t(a)-t(b); });
  results.sort(function(a,b){ return t(b)-t(a); });

  if(fxEl) fxEl.innerHTML = upcoming.length ? upcoming.map(fixtureRow).join('') : '<div class="fx-empty">No upcoming games right now. Check back soon.</div>';

  if(results.length && resSec && resEl){
    var SHOW = 6;
    resEl.innerHTML = results.map(function(g,i){ return resultRow(g).replace('class="fx-row"', 'class="fx-row'+(i>=SHOW?' fx-extra':'')+'"'); }).join('');
    resSec.hidden = false;
    var nav = document.getElementById('navResults'); if(nav) nav.hidden = false;
    if(results.length > SHOW && more){
      more.hidden = false;
      more.addEventListener('click', function(){
        var open = resEl.classList.toggle('show-all');
        more.textContent = open ? 'Show fewer' : 'Show all results';
      });
    }
  }
});


/* ---- Photos (gallery + team photos) ---- */
load('content/gallery.json').then(function(d){
  if(d && d.items && d.items.length){
    var row = document.querySelector('.photo-row');
    if(row) row.innerHTML = d.items.slice(0,6).map(function(it){
      var src = typeof it==='string' ? it : (it && it.image) || '';
      var cap = (it && it.caption) || 'South West Runs session';
      return '<div class="photo">'+zoomImg(src, cap, 'runs', 900)+'</div>';
    }).join('');
  }
});
load('content/teams.json').then(function(d){
  if(!d) return;
  function setPhoto(sel, src, alt){
    if(!src) return;
    var box = document.querySelector(sel);
    if(box) box.innerHTML = zoomImg(src, alt, 'teams', 1200);
  }
  setPhoto('.team.mens .team-photo', d.mens, "South West Rise men's team");
  setPhoto('.team.juniors .team-photo', d.juniors, 'South West Rise juniors');
});


/* ---- Run details + contact ---- */
load('content/runs.json').then(function(d){
  if(!d) return;
  if(d.price){
    var p = document.querySelector('.book .price');
    if(p) p.innerHTML = '£'+esc(d.price)+'<small>/player</small>';
  }
  var v = document.querySelector('.book .book-venue');
  if(v){
    if(d.location){ v.textContent = d.location; v.hidden = false; }
    else { v.hidden = true; }
  }
  if(d.minimum){
    var w = document.querySelector('.book .book-where');
    if(w) w.textContent = 'Minimum '+esc(d.minimum)+' players to run';
    var step = document.querySelector('.run-list li:nth-child(3)');
    if(step) step.innerHTML = '<span class="dot">3</span>We need a minimum of '+esc(d.minimum)+" players. If a run doesn't go ahead, everyone who booked receives a refund.";
  }
});
load('content/settings.json').then(function(d){
  if(!d) return;
  if(d.email){ var a=document.querySelector('.card a.link'); if(a){ a.href='mailto:'+d.email; a.textContent='✉ '+d.email; } }
  if(d.instagram){ var ig=document.querySelector('.social a.chip'); if(ig){ ig.href='https://instagram.com/'+d.instagram; ig.textContent='Instagram @'+d.instagram; } }
});


/* ---- Shop ---- */
function safeLink(u){ u = String(u||'').trim(); return /^https:\/\//i.test(u) ? u : ''; }
function fmtPrice(p){ p = String(p||'').replace(/^\s*£\s*/,'').trim(); return p ? '£'+p : ''; }

load('content/shop.json').then(function(d){
  if(!d || !d.items || !d.items.length) return;
  var sec = document.getElementById('shop'), grid = document.getElementById('shopGrid');
  if(!sec || !grid) return;
  if(d.intro) document.getElementById('shopIntro').textContent = d.intro;
  if(d.note){ var n=document.getElementById('shopNote'); n.textContent = d.note; n.hidden = false; }

  grid.innerHTML = d.items.map(function(p, i){
    var imgs = (p.images||[]).map(function(x){ return typeof x==='string' ? x : (x && x.image) || ''; }).filter(Boolean);
    var group = 'shop-'+i;
    var main = imgs.length
      ? '<div class="prod-img">'+zoomImg(imgs[0], p.name, group, 800)+'</div>'
      : '<div class="prod-img prod-noimg"><span>Photo coming soon</span></div>';
    var thumbs = imgs.length>1
      ? '<div class="prod-thumbs">'+imgs.slice(1).map(function(src){ return zoomImg(src, p.name, group, 200); }).join('')+'</div>' : '';
    var sizes = (p.sizes||[]).filter(function(s){ return s && s.size; });
    var allOut = !!p.soldout || (sizes.length && sizes.every(function(s){ return s.soldout; }));
    var select = '';
    if(sizes.length){
      select = '<label class="prod-size"><span>Size</span><select data-prod="'+i+'">'
        + '<option value="">Choose size</option>'
        + sizes.map(function(s, j){ return '<option value="'+j+'"'+(s.soldout?' disabled':'')+'>'+esc(s.size)+(s.soldout?' (sold out)':'')+'</option>'; }).join('')
        + '</select></label>';
    }
    return '<article class="prod" data-i="'+i+'">'+main+thumbs
      + '<div class="prod-body"><div class="prod-h"><h3>'+esc(p.name)+'</h3><span class="prod-price">'+esc(fmtPrice(p.price))+'</span></div>'
      + (p.description ? '<p>'+esc(p.description)+'</p>' : '')
      + select
      + '<a class="btn btn-primary prod-buy" target="_blank" rel="noopener" data-prod="'+i+'"></a>'
      + '</div></article>';
  }).join('');

  function update(i){
    var p = d.items[i], card = grid.querySelector('.prod[data-i="'+i+'"]');
    var buy = card.querySelector('.prod-buy'), sel = card.querySelector('select');
    var sizes = (p.sizes||[]).filter(function(s){ return s && s.size; });
    var allOut = !!p.soldout || (sizes.length && sizes.every(function(s){ return s.soldout; }));
    var link = '', label = 'Buy now', ok = false;
    if(allOut){ label = 'Sold out'; if(sel) sel.disabled = true; }
    else if(sizes.length){
      var j = sel ? parseInt(sel.value,10) : -1;
      if(!(j>=0 && sizes[j])){ label = 'Choose a size'; }
      else { link = safeLink(sizes[j].link) || safeLink(p.link); ok = !!link; label = ok ? 'Buy now · '+sizes[j].size : 'Coming soon'; }
    } else { link = safeLink(p.link); ok = !!link; label = ok ? 'Buy now' : 'Coming soon'; }
    buy.textContent = label;
    if(ok){ buy.href = link; buy.removeAttribute('aria-disabled'); buy.classList.remove('is-off'); }
    else { buy.removeAttribute('href'); buy.setAttribute('aria-disabled','true'); buy.classList.add('is-off'); }
  }
  d.items.forEach(function(_, i){ update(i); });
  grid.addEventListener('change', function(e){ if(e.target.tagName==='SELECT') update(parseInt(e.target.getAttribute('data-prod'),10)); });

  sec.hidden = false;
  var nav = document.getElementById('navShop'); if(nav) nav.hidden = false;
});


/* ---- Photo lightbox: click any photo to see it large ---- */
(function(){
  var lb = document.getElementById('lightbox');
  if(!lb) return;
  var img = lb.querySelector('.lb-img'), cap = lb.querySelector('.lb-cap');
  var prev = lb.querySelector('.lb-prev'), next = lb.querySelector('.lb-next');
  var list = [], idx = 0, lastFocus = null;

  function show(){
    var el = list[idx];
    img.classList.remove('ready');
    img.onload = function(){ img.classList.add('ready'); };
    img.onerror = function(){ if(el.dataset.orig && img.src.indexOf(el.dataset.orig)===-1) img.src = el.dataset.orig; };
    img.src = el.dataset.full || el.currentSrc || el.src;
    img.alt = el.alt || '';
    var c = el.alt && !/^South West Runs session$/.test(el.alt) ? el.alt : '';
    cap.textContent = c + (list.length>1 ? (c?'  ·  ':'') + (idx+1)+' / '+list.length : '');
    prev.hidden = next.hidden = list.length < 2;
  }
  function open(el){
    var g = el.getAttribute('data-group');
    list = g ? Array.prototype.slice.call(document.querySelectorAll('img[data-zoom][data-group="'+g+'"]')) : [el];
    idx = Math.max(0, list.indexOf(el));
    lastFocus = document.activeElement;
    show();
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close(){
    lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if(lastFocus) lastFocus.focus();
  }
  function step(n){ if(list.length<2) return; idx = (idx + n + list.length) % list.length; show(); }

  // make every zoomable photo keyboard-accessible
  function prep(root){
    (root||document).querySelectorAll('img[data-zoom]:not([tabindex])').forEach(function(el){
      el.setAttribute('tabindex','0'); el.setAttribute('role','button');
      el.setAttribute('aria-label', 'View larger: '+(el.alt||'photo'));
    });
  }
  prep();
  new MutationObserver(function(){ prep(); }).observe(document.querySelector('main'), { childList:true, subtree:true });

  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('img[data-zoom]');
    if(el){ e.preventDefault(); open(el); }
  });
  document.addEventListener('keydown', function(e){
    if(lb.classList.contains('open')){
      if(e.key==='Escape') close();
      else if(e.key==='ArrowLeft') step(-1);
      else if(e.key==='ArrowRight') step(1);
      return;
    }
    if((e.key==='Enter' || e.key===' ') && e.target.matches && e.target.matches('img[data-zoom]')){ e.preventDefault(); open(e.target); }
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  prev.addEventListener('click', function(e){ e.stopPropagation(); step(-1); });
  next.addEventListener('click', function(e){ e.stopPropagation(); step(1); });
  lb.addEventListener('click', function(e){ if(e.target===lb || e.target.classList.contains('lb-fig')) close(); });

  // swipe on phones
  var sx = null;
  lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive:true });
  lb.addEventListener('touchend', function(e){
    if(sx===null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if(Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });
})();


/* ---- Booking pop-up (SimplyBook widget in an overlay) ---- */
(function(){
  var btn = document.getElementById('sbBookBtn');
  var modal = document.getElementById('sbModal');
  if(!btn || !modal) return;
  var loaded = false;
  function loadWidget(){
    var s = document.createElement('script');
    s.async = true;
    s.src = '//widget.simplybook.it/v2/widget/widget.js';
    s.onload = function(){
      new SimplybookWidget({"widget_type":"iframe","url":"https://swrbasketball.simplybook.it","theme":"concise","theme_settings":{"timeline_hide_unavailable":"1","hide_past_days":"0","timeline_show_end_time":"0","timeline_modern_display":"as_slots","light_font_color":"#f27f2b","sb_secondary_base":"#050405","sb_base_color":"#f27f2b","display_item_mode":"block","booking_nav_bg_color":"#050405","sb_review_image":"","dark_font_color":"#eef1f7","btn_color_1":"#f27f2b","sb_company_label_color":"#f27f2b","hide_img_mode":"1","show_sidebar":"1","sb_busy":"#c7b3b3","sb_available":"#d6ebff"},"timeline":"modern","datepicker":"top_calendar","is_rtl":false,"app_config":{"clear_session":0,"allow_switch_to_ada":0,"predefined":[]},"container_id":"sbw_o35q1w"});
    };
    document.head.appendChild(s);
  }
  function open(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; if(!loaded){ loaded=true; loadWidget(); } }
  function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  btn.addEventListener('click', open);
  modal.addEventListener('click', function(e){ if(e.target.hasAttribute('data-sb-close')) close(); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && modal.classList.contains('open')) close(); });
})();
