SVG.EVENTS.MOUSE = {
  f_down: function (e) {
    //получи и нформацию про нажатие
    let info_press = SVG.EVENTS.f_get_info_press_by_xy_rel(new CLASS_XY(e.clientX, e.clientY));
    //нажали в пустоту
    if (info_press == null) { return; }
    //нажатие мимо уголка
    if (info_press.n_corner == null) { return; }

    SVG.EVENTS.e_press_down = info_press; //запиши информацию про текущее нажатие
    SVG.SETTING.f_change_order(info_press.n_corner); //поменяй порядок уголков
    SVG.DRAW.f_final(); //перерисуй
  },

  f_up: function (e) {
    //где ты отпустил мышь
    let info_press = SVG.EVENTS.f_get_info_press_by_xy_rel(new CLASS_XY(e.clientX, e.clientY), true);

    if (info_press == null) { return; }
    if (SVG.EVENTS.e_press_down == null) { return; }
    //если раньше не был нажат уголок, то ничего не делай
    if (SVG.EVENTS.e_press_down.n_corner == null) { return; }

    let OLD_CORNER = SVG.EVENTS.e_press_down.obj_corner;

    //отпущена та же самая клетка, что и нажата
    if (SVG.EVENTS.e_press_down.n_cell_xy.f_is_equal_xy(info_press.n_cell_xy)) {
      //отрази уголок
      let NEW_CORNER = OLD_CORNER.f_op_reflex_event(SVG.EVENTS.e_press_down.n_cell);
      //проверь, остался ли уголок в зоне ответа после отражения
      let on_board = SVG.SETTING.f_is_on_answer(NEW_CORNER.f_get_min()) && SVG.SETTING.f_is_on_answer(NEW_CORNER.f_get_max());

      //поставь уголок в зону старта, если он вне доски (и поставь флаг, что на зоне старта)
      if (!on_board) { NEW_CORNER = SVG.SETTING.f_put_n_3_8_corner_on_start(NEW_CORNER.arr_xy.length, NEW_CORNER).f_op_set_flag(true); }
      SVG.EVENTS.f_renew_element(NEW_CORNER);
      return;
    }

    //разница между положением поднятой мыши и нажатой мыши
    let delta_coord = info_press.mouse_xy_rel.f_op_subtract(SVG.EVENTS.e_press_down.mouse_xy_rel);
    //разница между поднятой и нажатой мышами, измеренная в клетках 
    let delta_cell = delta_coord.f_op_divide(SVG.SETTING.xy_cell_sizes);

    //начало области (для нажатого уголка)
    let zero_from = SVG.SETTING.f_get_zero_nxy(OLD_CORNER.arr_xy.length);
    //минимальная координата старого уголка
    let old_min_xy_absolute = OLD_CORNER.f_get_min().f_op_add(zero_from);

    //новая координата нажатого уголка (с ущётом разницы между двумя событиями мыши: поднятием и нажатием)
    let new_min_xy_absolute = old_min_xy_absolute.f_op_add(delta_cell).f_get_round();
    let new_max_xy_absolute = new_min_xy_absolute.f_op_add(OLD_CORNER.f_get_sizes()).f_op_add_same(-1);
    //новое положение уголка будет челиком на доске (не выходя за границу)
    let flag_is_on_answer_board = SVG.SETTING.f_is_on_answer(new_min_xy_absolute) && SVG.SETTING.f_is_on_answer(new_max_xy_absolute);

    if (flag_is_on_answer_board) {
      //относительное положение в зоне ответа
      let new_min_relative = new_min_xy_absolute.f_op_subtract(SVG.SETTING.xy_answer_from);
      //новый уголок со флагом в зоне ответа и на нужном положении
      let NEW_CORNER = (new CLASS_POLYOMINO(OLD_CORNER.arr_xy, false)).f_op_move_to(new_min_relative).f_get_round();
      SVG.EVENTS.f_renew_element(NEW_CORNER);
      return;
    }

    //уголок выходит за границу зоны ответа
    if (!flag_is_on_answer_board) {
      //верни нажаты уголок в зону старта
      let NEW_CORNER = SVG.SETTING.f_put_n_3_8_corner_on_start(OLD_CORNER.arr_xy.length).f_op_set_flag(true);
      SVG.EVENTS.f_renew_element(NEW_CORNER);
      return;
    }

  },

  f_move: function (e) {

    let info_press = SVG.EVENTS.f_get_info_press_by_xy_rel(new CLASS_XY(e.clientX, e.clientY), true);
    if (info_press == null) { return; }
    if (SVG.EVENTS.e_press_down == null) { return; }
    if (SVG.EVENTS.e_press_down.n_corner == null) { return; }

    //число клеток в перемещаемом уголке
    let n_corner_was_3_8 = SVG.EVENTS.e_press_down.obj_corner.arr_xy.length;

    //на сколько сдвинулась мышь
    let delta_coord = info_press.mouse_xy_rel.f_op_subtract(SVG.EVENTS.e_press_down.mouse_xy_rel);
    //на сколько сдвинулась мышь, измеренная в клетках
    let delta_cell = delta_coord.f_op_divide(SVG.SETTING.xy_cell_sizes);
    //положение перемещаемого элемента
    let NEW_CORNER = SVG.EVENTS.e_press_down.obj_corner.f_op_add(delta_cell);

    //переммести элемент-уголок
    SVG.SETTING.arr_corners[SVG.SETTING.f_search_n_3_8(n_corner_was_3_8)] = NEW_CORNER;
    //перерисуй
    SVG.DRAW.f_final();
  }
};

window.addEventListener("resize", (e) => SVG.EVENTS.f_renew_sizes());
window.addEventListener("orientationchange", (e) => SVG.EVENTS.f_renew_sizes());

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
