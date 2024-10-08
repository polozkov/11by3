SVG.EVENTS = {
  //информация о мышином событии (нижатие, движение и подъём мыши)
  e_down_move_up: [null, null, null],

  //копия информации о мышином событии
  f_copy_e3: function () {
    let e3 = SVG.EVENTS.e_down_move_up; //короткая запись
    //функция для одного из трёх событий (для копирования)
    function f012(n) {if (e3[n] == null) {return null;} return e3[n].f_get_copy();}
    return [f012(0), f012(1), f012(2)];
  },

  //прочисть информацию о мышином событии
  f_only_clear_e3: function () {SVG.EVENTS.e_down_move_up = [null, null, null]},
  //прочисть информацию о мышином событии и обнови размер SVG-элемента (сделай resize)
  f_resize_and_clear_e3: function () {SVG.EVENTS.f_only_clear_e3(); SVG.SETTING.f_set_svg_sizes(); SVG.DRAW.f_final(); },

  //обнови размеры окна с нужными флагами, но при этом ещё впиши размеры
  f_renew_with_resizing_setting_class(flag_put_on_start = true, obj_special_corner = null, n_times_resize = 0) {
    //обнови настройки, но сохрани уголки
    SVG.SETTING = new CLASS_SETTING(SVG.SETTING.arr_corners);
    SVG.SETTING.f_put_corners_on_start(flag_put_on_start);

    //делай столько перерисовку, чтобы не было проблем с полосой прокрутки делай дважды
    for (; n_times_resize>0; n_times_resize-=1) {SVG.EVENTS.f_resize_and_clear_e3(); }
    SVG.DRAW.f_final(obj_special_corner);
  },

  //отпущена та же самая клетка, что и нажата
  f_try_reflec_because_same_cell: function (e_old, e_new) {
    if ((e_old == null) || (e_new == null)) {return false; }
    if ((!e_old.flag_is_found) || (!e_new.flag_is_found)) {return false;}
    //если не та же самая клетка, то ничего не делай
    if (!(e_old.cell_nxy.f_is_equal_xy(e_new.cell_nxy))) {return false; }

    let OLD_CORNER = e_old.corner_obj.f_get_round();
    //отзеркаль уголок по стрелке (если нажата не стрелка, то отзеркалинвания не будет - вернёт копию)
    let NEW_CORNER = OLD_CORNER.f_op_reflex_event(e_old.corner_cell_index);

    SVG.EVENTS.f_resize_and_clear_e3();
    SVG.SETTING.f_rewrite_corner(NEW_CORNER);
    SVG.EVENTS.f_renew_with_resizing_setting_class(true, null);

    if (OLD_CORNER.f_is_reflex_mark_direction(e_old.corner_cell_index))
      console.log("f_try_reflec_because_same_cell; function getAnswer() return", getAnswer());
    return true;
  },

  //закончи ход уголком на зону ответа (если это возможно). NEW_CORNER может быть не целым (промежуточное положение при перемещении)
  f_change_corner: function (NEW_CORNER) {
    //попадает ли новый уголок на зону ответа
    let flag_is_answer = SVG.SETTING.f_is_corner_on_answer(NEW_CORNER.f_get_round());
    //индекс этого уголка в массиве уголков (целое число от 0 до 5)
    let n = SVG.SETTING.f_search_n_by_obj(NEW_CORNER);

    if (!flag_is_answer) {
      //если промахнулись мимо зоны ответа, то верни уголок на старт
      SVG.SETTING.arr_corners[n] = SVG.SETTING.f_put_n_corner_on_start(n);
      //а потом всё сотри (прерви ход и обновись)
      SVG.EVENTS.f_renew_with_resizing_setting_class(true, null); return;
    }

    //положи уголок в зону ответа - ход успешный
    SVG.SETTING.arr_corners[n] = NEW_CORNER.f_get_round();
    SVG.EVENTS.f_renew_with_resizing_setting_class(true, NEW_CORNER.f_get_round());
    SVG.EVENTS.f_resize_and_clear_e3();

    console.log("f_change_corner; function getAnswer() return", getAnswer());
  },

  //верни истина, если нашёл слот, где закончить ход (не обязательно целочисленный: можно и вещественный - промежуточный)
  f_search_slot: function (class_my_press, e_old) {
    if (!class_my_press || !e_old) {return false;}
    let delta_xy = class_my_press.f_get_real_delta(e_old);

    //новое место, куда перемещаем уголок (вещественные, а не целые координаты)
    let NEW_CORNER = e_old.f_get_copy_with_corner(delta_xy).corner_obj;

    //это объект, а не null, 
    if (NEW_CORNER) {
      SVG.EVENTS.f_change_corner(NEW_CORNER);
      return true;
    }
    return false;
  },

  //тут будут функции для событий мыши (нажатие, отпускание, перемещение)
  MOUSE: {}
};