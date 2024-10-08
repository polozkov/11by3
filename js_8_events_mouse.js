//события для мыши (аналогично работают с сенсорным экраном)
SVG.EVENTS.MOUSE = {
  //мышь нажата
  f_down: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    //имитируй отпускание мыши, когда вышел за границу и нажал при возвращении
    if ((e3[0] != null) && (e3[2] == null)) {
      //ищи слот, и, если найдёшь, то заканцивай ход и обновляйся
      if (SVG.EVENTS.f_search_slot(class_my_press, e3[0])) {return;}
    }
    
    //нажатый элемент поставь на передний план
    if (class_my_press.flag_is_found) {
      SVG.SETTING.f_change_order(class_my_press.corner_obj.arr_xy.length);
    }

    SVG.EVENTS.f_renew_with_resizing_setting_class(false, null);
    
    //объект нажатия мыши запомни
    SVG.EVENTS.e_down_move_up[0] = class_my_press.f_get_copy();
    //отпускание мыши сотри
    SVG.EVENTS.e_down_move_up[2] = null;   
  },

  //мышь отпущена
  f_up: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    //запиши в объект отпускания текущий мыжиный объект
    if ((e3[0] != null) && (e3[2] == null)) {
      SVG.EVENTS.e_down_move_up[2] = class_my_press.f_get_copy(); 
    }  

    //отпущена и нажата та же клетка?, тогда ход закончен
    if (SVG.EVENTS.f_try_reflec_because_same_cell(e3[0],class_my_press)) {return;};

    //пробуй закончить ход
    SVG.EVENTS.f_search_slot(class_my_press, e3[0]);
  },

  //мышь двигается (на важно, нажата или отпущена)
  f_move: function (e) {
    let e3 = SVG.EVENTS.f_copy_e3();
    let class_my_press = new CLASS_PRESS(e);

    //взялся на уголок и он в процессе. Тогда флаг работы = истина
    let flag_is_ok = (e3[0] != null) && (e3[0].flag_is_found) && (e3[2] == null);
    if (!flag_is_ok) {return;}

    //сдвиг относительно изначально нажатого элемента
    let delta_xy = class_my_press.f_get_real_delta(e3[0]);
    //запиши в мышиный объект "движение" текущую дельту (сдвиг)
    SVG.EVENTS.e_down_move_up[1] = e3[0].f_get_copy_with_corner(delta_xy);
    //получи особый уголок (с вещественными, а не целыми координатами)
    let obj_special_corner = SVG.EVENTS.e_down_move_up[1].corner_obj;

    //прорисуй "особый" уголок в промежуточном положении
    SVG.EVENTS.f_renew_with_resizing_setting_class(true, obj_special_corner);
  }
};

//регулярное выражение с флагом: i - Регистронезависимый поиск (для определения, что это мобильое устройство)
const CONST_IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//отдельные события для мобильных и десктопных устройств
//в объекте "е" нужны только клиентские координаты (e.clientX,e.clientY)
if (CONST_IS_MOBILE) {
  //только для мобильных устройств
  //начало касания - как нулевой элемент массива касаний.
  let options_for_mouse_down = {capture: false, once: false, passive: false};
  SVG.EL.addEventListener('touchstart', (e) => { e.preventDefault(); SVG.EVENTS.MOUSE.f_down(e.touches[0]);},  options_for_mouse_down);
  SVG.EL.addEventListener('pointerup', (e) =>  { e.preventDefault(); SVG.EVENTS.MOUSE.f_up(e); });
  SVG.EL.addEventListener('pointermove', (e) => { e.preventDefault(); SVG.EVENTS.MOUSE.f_move(e); });
} else {
  //только для десктопных устройтсв
  SVG.EL.addEventListener('mousedown', (e) =>  {SVG.EVENTS.MOUSE.f_down(e); });
  SVG.EL.addEventListener('mouseup', (e) =>    {SVG.EVENTS.MOUSE.f_up(e); });
  SVG.EL.addEventListener('mousemove', (e) =>  {SVG.EVENTS.MOUSE.f_move(e); });
}

//чтобы не вызывать контекстное меню, запрети стандартную обработку
SVG.EL.addEventListener('contextmenu', e => e.preventDefault());
//для изменения размеров и смены ориентации одно событие
window.addEventListener("resize", (e) => SVG.EVENTS.f_renew_with_resizing_setting_class(true, null, 2));
window.addEventListener("orientationchange", (e) => SVG.EVENTS.f_renew_with_resizing_setting_class(true, null, 2));

//когда всё загрузится, перерисуй
window.addEventListener('load', (e) => SVG.EVENTS.f_renew_with_resizing_setting_class(true, null, 1));
