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
  load('content/teams.json').then(function(d){
    if(!d) return;
    function setPhoto(sel, src){
      if(!src) return;
      var box = document.querySelector(sel);
      if(box) box.innerHTML = '<img src="'+esc(src)+'" alt="">';
    }
    setPhoto('.team.mens .team-photo', d.mens);
    setPhoto('.team.juniors .team-photo', d.juniors);
  });
  load('content/runs.json').then(function(d){
    if(!d) return;
    if(d.price){
      var p = document.querySelector('.book .price');
      if(p) p.innerHTML = '\u00a3'+esc(d.price)+'<small>/player</small>';
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
    if(d.email){ var a=document.querySelector('.card a.link'); if(a){ a.href='mailto:'+d.email; a.textContent='\u2709 '+d.email; } }
    if(d.instagram){ var ig=document.querySelector('.social a.chip'); if(ig){ ig.href='https://instagram.com/'+d.instagram; ig.textContent='Instagram @'+d.instagram; } }
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
