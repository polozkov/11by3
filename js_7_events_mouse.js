SVG.EVENTS.MOUSE = {
  f_down: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    if ((e3[0] != null) && (e3[2] == null))
    if (SVG.EVENTS.f_search_slot(class_my_press, e3[0])) {return}
    
    if (class_my_press.flag_is_found) {SVG.SETTING.f_change_order(class_my_press.corner_obj.arr_xy.length);}
    SVG.EVENTS.f_renew_sizes(false, null, false);
    
    SVG.EVENTS.e_down_move_up[0] = class_my_press.f_get_copy();
    SVG.EVENTS.e_down_move_up[2] = null;   
  },

  f_up: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    if ((e3[0] != null) && (e3[2] == null)) {SVG.EVENTS.e_down_move_up[2] = class_my_press.f_get_copy(); }  
    if (SVG.EVENTS.f_same_cell(e3[0],class_my_press)) {return;};

    SVG.EVENTS.f_search_slot(class_my_press, e3[0]);
  
  },

  f_move: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    let flag_is_ok = (e3[0] != null) && (e3[0].flag_is_found) && (e3[2] == null);
    if (!flag_is_ok) {return;}

    let delta_xy = class_my_press.f_get_real_delta(e3[0]);
    
    SVG.EVENTS.e_down_move_up[1] = e3[0].f_get_copy_with_corner(delta_xy);
    let obj_special_corner = SVG.EVENTS.e_down_move_up[1].corner_obj;
    SVG.EVENTS.f_renew_sizes(true, obj_special_corner, false);
  }
};

window.addEventListener("resize", (e) => SVG.EVENTS.f_renew_sizes(true, null, true));
window.addEventListener("orientationchange", (e) => SVG.EVENTS.f_renew_sizes(true, null, true));
SVG.EL.addEventListener('contextmenu', event => event.preventDefault());

const CONST_IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (CONST_IS_MOBILE) {
  SVG.EL.addEventListener('touchstart', (e) => { e.preventDefault(); SVG.EVENTS.MOUSE.f_down(e.touches[0]); });
  SVG.EL.addEventListener('pointerup', (e) =>  { e.preventDefault(); SVG.EVENTS.MOUSE.f_up(e); });
  SVG.EL.addEventListener('pointermove', (e) =>{ e.preventDefault(); SVG.EVENTS.MOUSE.f_move(e); });
} else {
  SVG.EL.addEventListener('mousedown', (e) =>  {SVG.EVENTS.MOUSE.f_down(e); });
  SVG.EL.addEventListener('mouseup', (e) =>    {SVG.EVENTS.MOUSE.f_up(e); });
  SVG.EL.addEventListener('mousemove', (e) =>  {SVG.EVENTS.MOUSE.f_move(e); });
}

window.addEventListener('load', (e) => SVG.EVENTS.f_renew_sizes());
