var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  btn.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){ menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
  });


/* ---- Decap CMS content: fixtures, gallery, contact (fetched at runtime) ---- */
(function () {
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fxRow(f){
    var parts = String(f.date||'').trim().split(/\s+/);
    var dateHtml = parts.length>=3
      ? esc(parts[0])+'<span>'+esc(parts[1])+'</span>'+esc(parts.slice(2).join(' '))
      : '<span>'+esc(f.date||'')+'</span>';
    var place = f.place || 'Home';
    var cls = String(place).toLowerCase()==='away' ? 'away' : 'home';
    var meta = esc(f.comp||'') + (f.time ? ' \u00b7 '+esc(f.time)+' tip-off' : '');
    return '<div class="fx-row"><div class="fx-date">'+dateHtml+'</div>'
      + '<div class="fx-match">'+esc(f.home||'')+' vs '+esc(f.away||'')+'<small>'+meta+'</small></div>'
      + '<div class="fx-where '+cls+'">'+esc(place)+'</div></div>';
  }
  function load(url){ return fetch(url,{cache:'no-store'}).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; }); }

  load('content/fixtures.json').then(function(d){
    if(d && d.items && d.items.length){
      var el = document.querySelector('.fx');
      if(el) el.innerHTML = d.items.map(fxRow).join('');
    }
  });
  load('content/gallery.json').then(function(d){
    if(d && d.items && d.items.length){
      var row = document.querySelector('.photo-row');
      if(row) row.innerHTML = d.items.slice(0,6).map(function(it){
        var src = typeof it==='string' ? it : (it && it.image) || '';
        return '<div class="photo"><img src="'+esc(src)+'" alt="South West Runs session"></div>';
      }).join('');
    }
  });
  load('content/settings.json').then(function(d){
    if(!d) return;
    if(d.email){ var a=document.querySelector('.card a.link'); if(a){ a.href='mailto:'+d.email; a.textContent='\u2709 '+d.email; } }
    if(d.instagram){ var ig=document.querySelector('.social a.chip'); if(ig){ ig.href='https://instagram.com/'+d.instagram; ig.textContent='Instagram @'+d.instagram; } }
  });
})();
