let SVG = {
  //главный элемент, где всё рисуется и играется
  EL: document.getElementById("id_svg_main"),
  SETTING: {}, //тут будет объект класса CLASS_SETTING
  DRAW: {} //тут будет всё, что связано с прорисовкой (графические примитивы и общая отрисовка)
};

class CLASS_SETTING {
  //положение фигур-уголков получаем извне (по умолчанию все на пустых слотах)
  constructor(arr_corners) {
    //размер окна (100%, 100%, поэтому CONST_1_1)
    this.real_xy_window_sizes = CONST_1_1.f_op_scale_window();
    //ориентация либо вертикальная, либо горизонтальная ("hory", "vert")
    this.str_ori = this.real_xy_window_sizes.f_get_vert_or_hory_string();

    //размеры стартовой зоны
    this.nxy_start_sizes = new CLASS_XY(...C.V_H_START_SIZES[this.str_ori]);
    //положение нулевой клетки стартовой зоны (на сколько она сдвинута относительно левого верхнего угла)
    this.nxy_start_from = new CLASS_XY(...C.V_H_START_FROM[this.str_ori]);
    //размеры зоны ответа (основного игровогоо поля)
    this.nxy_answer_sizes = new CLASS_XY(...C.ANSWER_SIZES);
      
    //на сколько клеток сдвинута зона ответа относительно левого верхнего угла
    this.nxy_answer_from = new CLASS_XY(...C.V_H_ANSWER_FROM[this.str_ori]);

    //при вертикально ориентации прибавь размер по вертикали; при горизонатльной - по горизонтали
    let pair_0_1 = { vert: [0, 1], hory: [1, 0] };
    //размеры зоны ответа увеличь (по одному направлению) на стартовую зону
    let sizes_extend_fo_final = this.nxy_start_sizes.f_op_scale_x_y(...pair_0_1[this.str_ori]);
    //итоговый размер общей зоны (без рамки-границы)
    this.nxy_start_and_answer_sizes = this.nxy_answer_sizes.f_op_add(sizes_extend_fo_final);

    //размер viewbox вместе с граничными линиями (рамкой), линия по 50% толщины с каждой стороны: итого по 100%
    this.real_xy_view_sizes = this.nxy_start_and_answer_sizes.f_op_add_same(C.LINE_WIDTH_FOR_CELLS);
    //svg элемент имеет такой viewbox (клетки единичного размера и ещё рамка: с кождой стороны +половина толщины линии)
    this.str_viewbox = C.F_VIEW_BOX(this.nxy_start_and_answer_sizes);
    //размер svg элемента зависит от размеров окна (svg максимально возможного размера, чтобы вписаться)
    this.real_xy_svg_maximized = this.real_xy_window_sizes.f_op_maximize(this.real_xy_view_sizes);
    //размер одной ячейки
    this.real_xy_cell_sizes = this.real_xy_svg_maximized.f_op_divide(this.real_xy_view_sizes);

    //цвета от 3 до 8 клетчатых уголков
    this.arr_colors_3_8 = C.ARR_COLORS_3_8.slice();
    //цвет рамок
    this.color_stroke = C.COLOR_STROKE;
    //цвет зоны ответа
    this.color_gray = C.COLOR_GRAY;

    this.arrow = C.ARROW; //ОБЪЕКТ с настройками стрелок
    this.mark_hint = C.MARK_HINT; //ОБЪЕКТ с настройками кружочков-подсказок

    //толщина линий рамок
    this.line_width = C.LINE_WIDTH_FOR_CELLS;

    //если углоки не заданы, то задай их их начальное положение
    this.arr_corners = arr_corners || ([3, 4, 5, 6, 7, 8].map((n, i) => C.F_CORNER_ON_START(n, this.str_ori)));
  }

  //найди номер уголка с таким числом клеток (от 3 до 8)
  f_search_n_3_8(n_3_8) {for (let i = 0; i <= 5; i++) if (this.arr_corners[i].arr_xy.length == n_3_8) return i;}

  //найди номер уголка с таким числом клеток (проверь, что данный объект не null и возьми его количество клеток)
  f_search_n_by_obj(obj) {if (!obj) {return null; } return this.f_search_n_3_8(obj.arr_xy.length); }

  //перезапиши уголок новым уголком (найти с тем же числом клеток)
  f_rewrite_corner(obj) {this.arr_corners[this.f_search_n_by_obj(obj)] = obj.f_get_copy(); }

  //положи уголок на стартовую зону (в свой домик-слот) (по УМОЛЧАНИЮ, ищи с тем же числом клеток (ТЕКУЩИЙ), уголок можно задать вручную)
  f_put_n_corner_on_start(n, obj_corner = null) {
    //положение зависит не только от номера 3..8, но и от ориентации экрана
    let i_3_8 = this.arr_corners[n].arr_xy.length;
    //домик-слот для n-ного уголка
    let i_xy_start = C.F_XY_START(i_3_8, this.str_ori);
    //передвинь уголок на нужный слот (или вручную заданный уголок)
    return (obj_corner || this.arr_corners[n]).f_op_move_to(i_xy_start).f_get_round();
  }

  //положи уголок на стартовую зону (в свой домик-слот) по количеству клеток
  f_put_n_3_8_corner_on_start(n_3_8, obj_corner = null) {
    let n = this.f_search_n_3_8(n_3_8);
    return this.f_put_n_corner_on_start(n, obj_corner);
  }

  //какая клетка нажата (по относительным координатам мыши - относительно элемента svg)
  f_get_pressed_cell(mouse_xy_rel, flag_do_floor = true) {
    let svg_m = this.real_xy_svg_maximized; //размеры SVG элемента, который вписан в окно
    //координаты view_sizes * [0..1,0..1] потому что: mouse_xy_rel внутри [0..svg_m]
    let from_0_0 = this.real_xy_view_sizes.f_op_scale_x_y(mouse_xy_rel.x / svg_m.x, mouse_xy_rel.y / svg_m.y);
    //сдвинь на половину толщины линии (рамка)
    let from_line = from_0_0.f_op_add_same(-0.5 * this.line_width);
    if (!flag_do_floor) {return from_line; }

    //для получение целочисленных координат клетки, округляй вниз
    return new CLASS_XY(Math.floor(from_line.x), Math.floor(from_line.y));
  }

  //находится ли клетка внутри зоны ответа?
  f_is_on_answer(n_xy) {return n_xy.f_is_on_area(this.xy_answer_from, this.xy_answer_sizes); }
  //находится ли уголок в зоне ответа?
  f_is_corner_on_answer(obj_corner) {return obj_corner.f_is_min_max_on_area(this.nxy_answer_from, this.nxy_answer_sizes); }
  
  //все уголки из зоны старта положи на начальное положение
  f_put_corners_on_start() {
    //перебери все уголки от 3 до 8 клеток
    for (let i = 3; i <= 8; i++)
    //положи уголок с таким числом клеток в начало
    for (let t = 0; t < this.arr_corners.length; t++)
    //работай поочерёдно с трёшкой, четвёркой, пятёркой и так до восьмёрки
    if ((this.arr_corners[t].arr_xy.length == i)&&(!this.f_is_corner_on_answer(this.arr_corners[t])))
      this.arr_corners[t] = this.f_put_n_corner_on_start(t);
  }
  
  //установи размеры SVG элементы и viewbox
  f_set_svg_sizes() {
    SVG.EL.setAttribute("width", this.real_xy_svg_maximized.x + "px");
    SVG.EL.setAttribute("height", this.real_xy_svg_maximized.y + "px");
    SVG.EL.setAttribute("viewBox", this.str_viewbox);
  }

  //поменяй порядок: для алгоритма художника (последний уголок рисуем в конце, то есть сверху)
  f_change_order(n_3_8_will_be_last) {
    //получи номер в старом массиве с таким же количеством клеток
    let n_will_be_last = this.f_search_n_3_8(n_3_8_will_be_last);

    let order = [0,1,2,3,4,5]; //все 6 уголков в начальном порядке
    order.splice(n_will_be_last, 1); //удали один номер (с найденной позиции)
    order.push(n_will_be_last); //...и добавь этот номер в конец

    //измени порядок уголков для отрисовки
    let new_arr_corners = order.map(n => this.arr_corners[n]);
    //перезапиши массив уголкок после "всплывания" наверх нажатого уголка
    this.arr_corners = new_arr_corners;
  }
}

