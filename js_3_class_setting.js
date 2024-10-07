//константы для настройки
const C = {
  //цвета с номерами от 3 до 8 (количество клеток в уголке)
  ARR_COLORS_3_8: ["", "", "", "Chocolate", "RoyalBlue", "Purple", "Yellow", "Red", "Green"],
  COLOR_STROKE: "Black", //цвет линий для клеток
  COLOR_GRAY: "Gray", //серые границы в зоне старта - обводка для домика "слота"
  
  //подсказка (кружочек)
  MARK_HINT: {
    COLOR: "Black", //цвет кружочка (заливка)
    R: 0.1, //радиус: 0.1 от размера клетки (клетка единичная)
  },

  //стрелочка, показывающая, где направление отражения
  ARROW: {
    RATIO_MAIN: 0.75,
    RATIO_ENDS: 0.5,
    DEG: 45,
  },
  LINE_WIDTH_FOR_CELLS: 0.0625, //толщина линии (при этом клетка - ячейка полиомино равна единице)

  //размер viewbox по количеству клеток и по толщине линии (по периметру)
  F_VIEW_BOX: (xy, l = C.LINE_WIDTH_FOR_CELLS) => "-" + (l * 0.5) + " -" + (l * 0.5) + " " + (xy.x + l) + " " + (xy.y + l),

  //положения шести уголков на стартовой зоне (0,0) - это угол стартовой зоны (положения относительны)
  V_H_ARR_START: {
    vert: [[7 + 4, 4], [4, 4], [7 + 2, 2], [2, 2], [7 + 0, 0], [0, 0]],
    hory: [[10, 1 + 3 + 3], [9, 1 + 3], [8, 1], [2, 1 + 3 + 3], [1, 1 + 3], [0, 1]]
  },

  V_H_START_SIZES: { vert: [13, 7], hory: [12, 10] },  //размеры стартовой зоны
  ANSWER_SIZES: [13, 10],//размеры зоны ответов

  V_H_START_FROM: { vert: [0, 10], hory: [13, 0] }, //откуда начинается зона старта
  V_H_ANSWER_FROM: { vert: [0, 0], hory: [0, 0] },  //откуда начинается зона ответа

  //генерирует полиомио в виде уголка из 3 или более клеток
  F_CORNER_ON_ZERO: function (n_cells = 3) {
    //масссив из пар чисел: [1,0];[2,0] и так далеее: всего n_cells - 2 раз
    let arr_xy_low_part = new Array(n_cells - 2).fill(0).map((item, i) => ([i + 1, 0]));
    //на первые два места присоедини два квадратика
    let arr_xy_final = [[0, 0], [0, 1]].concat(arr_xy_low_part);
    //верни, сгенерировав полиомино для всех квадратиков (двух изначальных и длинного хвоста)
    return new CLASS_POLYOMINO(arr_xy_final.map(value => new CLASS_XY(...value)), true);
  },

  //уголок (полиомино) на стартовой зоне (координаты минимума относительно стартовой зоны)
  F_CORNER_ON_START: function (n_cells, i, str_ori) {
    let xy_start_position = new CLASS_XY(...C.V_H_ARR_START[str_ori][i]);
    //move_to означает фиксацию минимальных координат (сдвинь на это место)
    return C.F_CORNER_ON_ZERO(n_cells).f_op_move_to(xy_start_position);
  }
};

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
    this.xy_window_sizes = CONST_1_1.f_op_scale_window();
    //ориентация либо вертикальная, либо горизонтальная ("hory", "vert")
    this.str_ori = this.xy_window_sizes.f_get_vert_or_hory_string();

    //размеры стартовой зоны
    this.xy_start_sizes = new CLASS_XY(...C.V_H_START_SIZES[this.str_ori]);
    //положение нулевой клетки стартовой зоны (на сколько она сдвинута относительно левого верхнего угла)
    this.xy_start_from = new CLASS_XY(...C.V_H_START_FROM[this.str_ori]);
    //размеры зоны ответа (основного игровогоо поля)
    this.xy_answer_sizes = new CLASS_XY(...C.ANSWER_SIZES);
    //на сколько клеток сдвинута зона ответа относительно левого верхнего угла
    this.xy_answer_from = new CLASS_XY(...C.V_H_ANSWER_FROM[this.str_ori]);

    //при вертикально ориентации прибавь размер по вертикали; при горизонатльной - по горизонтали
    let pair_0_1 = { vert: [0, 1], hory: [1, 0] };
    //размеры зоны ответа увеличь (по одному направлению) на стартовую зону
    let sizes_extend_fo_final = this.xy_start_sizes.f_op_scale_x_y(...pair_0_1[this.str_ori]);
    //итоговый размер общей зоны (без рамки-границы)
    this.xy_start_and_answer_sizes = this.xy_answer_sizes.f_op_add(sizes_extend_fo_final);

    //размер viewbox вместе с граничными линиями (рамкой), линия по 50% толщины с каждой стороны: итого по 100%
    this.xy_view_sizes = this.xy_start_and_answer_sizes.f_op_add_same(C.LINE_WIDTH_FOR_CELLS);
    //svg элемент имеет такой viewbox (клетки единичного размера и ещё рамка: с кождой стороны +половина толщины линии)
    this.str_viewbox = C.F_VIEW_BOX(this.xy_start_and_answer_sizes);
    //размер svg элемента зависит от размеров окна (svg максимально возможного размера, чтобы вписаться)
    this.xy_svg_maximized = this.xy_window_sizes.f_op_maximize(this.xy_view_sizes);
    //размер одной ячейки
    this.xy_cell_sizes = this.xy_svg_maximized.f_op_divide(this.xy_view_sizes);

    //если углоки не заданы, то задай их их начальное положение
    this.arr_corners = arr_corners || ([3, 4, 5, 6, 7, 8].map((n, i) => C.F_CORNER_ON_START(n, i, this.str_ori)));

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
  }

  //найди номер уголка с таким числом клеток
  f_search_n_3_8(n_3_8) {
    for (let i = 0; i <= 5; i++)
    if (this.arr_corners[i].arr_xy.length == n_3_8)
      return i;
  }

  //координата угла нужной зоны (либо xy_start_from, либо xy_answer_from)
  f_get_zero_nxy(n_3_8) {
    let n = this.f_search_n_3_8(n_3_8);
    let n_area = this.arr_corners[n].flag_is_start ? this.xy_start_from : this.xy_answer_from;
    return n_area;
  }

  //положи уголок на стартовую зону (в свой домик-слот) (уголок можно задать вручную)
  f_put_n_corner_on_start(n, obj_corner = null) {
    //положение зависит не только от номера 3..8, но и от ориентации экрана
    let i_3_8 = this.arr_corners[n].arr_xy.length;
    //домик-слот для n-ного уголка
    let i_xy_start = new CLASS_XY(...C.V_H_ARR_START[this.str_ori][i_3_8 - 3]);
    //передвинь уголок на нужный слот (или вручную заданный уголок)
    return (obj_corner || this.arr_corners[n]).f_op_move_to(i_xy_start).f_get_round();
  }

  //положи уголок на стартовую зону (в свой домик-слот) по количеству клеток
  f_put_n_3_8_corner_on_start(n_3_8, obj_corner = null) {
    let n = this.f_search_n_3_8(n_3_8);
    return this.f_put_n_corner_on_start(n, obj_corner);
  }

  //все уголки из зоны старта положи на начальное положение
  f_put_corners_on_start() {
    //перебери все уголки от 3 до 8 клеток
    for (let i = 3; i <= 8; i++)
    //положи уголок с таким числом клеток в начало
    for (let t = 0; t < this.arr_corners.length; t++)
    //работай поочерёдно с трёшкой, четвёркой, пятёркой и так до восьмёрки
    if ((this.arr_corners[t].arr_xy.length == i)&&(this.arr_corners[t].flag_is_start))
      this.arr_corners[t] = this.f_put_n_corner_on_start(t);
  }

  //какая клетка нажата (по относительных координатам мыши - относитель элемента svg)
  f_get_pressed_cell(mouse_xy_rel) {
    let svg_m = this.xy_svg_maximized; //размеры SVG элемента, который вписан в окно
    //координаты xy_view_sizes * [0..1,0..1] потому что: mouse_xy_rel внутри [0..svg_m]
    let from_0_0 = this.xy_view_sizes.f_op_scale_x_y(mouse_xy_rel.x / svg_m.x, mouse_xy_rel.y / svg_m.y);
    //сдвинь на половину толщины линии (рамка)
    let from_line = from_0_0.f_op_add_same(-0.5 * this.line_width);
    //для получение целочисленных координат клетки, округляй вниз
    return new CLASS_XY(Math.floor(from_line.x), Math.floor(from_line.y));
  }

  //находится ли клетка внутри стартовой зоны?
  f_is_on_start(n_xy) {return n_xy.f_is_on_area(this.xy_start_from, this.xy_start_sizes);}
  //находится ли клетка внутри зоны ответа?
  f_is_on_answer(n_xy) {return n_xy.f_is_on_area(this.xy_answer_from, this.xy_answer_sizes);}

  f_legal_slot(polyomino, flag_do_round = false) {
    let n_3_8 = polyomino.arr_xy.length;
    if (polyomino.flag_is_start) {return this.f_put_n_3_8_corner_on_start(n_3_8); }
    let new_polyomino = flag_do_round ? polyomino.f_get_round() : polyomino.f_get_copy();

    if (new_polyomino.f_is_min_max_on_area(this.xy_answer_from, this.xy_answer_sizes)) {return new_polyomino;}
    return this.f_put_n_3_8_corner_on_start(n_3_8, new_polyomino.f_op_set_flag(true));
  }

  //определи абсолютные и относительные ЦЕЛОЧИСЛЕННЫЕ координаты
  f_detect_start_or_answer(n_xy) {
    if (this.f_is_on_start(n_xy)) {return ({
      name_string: "start", 
      abs_xy: n_xy,
      rel_xy: n_xy.f_op_subtract(this.xy_start_from) });}

    if (this.f_is_on_answer(n_xy)) {return ({
      name_string: "answer", 
      abs_xy: n_xy,
      rel_xy: n_xy.f_op_subtract(this.xy_answer_from)});}
    return null;
  }

  //установи размеры SVG элементы и viewbox
  f_set_svg_sizes() {
    SVG.EL.setAttribute("width", this.xy_svg_maximized.x + "px");
    SVG.EL.setAttribute("height", this.xy_svg_maximized.y + "px");
    SVG.EL.setAttribute("viewBox", this.str_viewbox);
  }

  //поменяй порядок для алгоритма художника (последний уголок рисуем в конце, то есть сверху)
  f_change_order(n_will_be_last) {
    let order = [0,1,2,3,4,5]; //все 6 уголков в начальном порядке
    order.splice(n_will_be_last, 1); //удали один номер
    order.push(n_will_be_last); //...и добавь этот номер в конец

    //измени порядок уголков для отрисовки
    let new_arr_corners = order.map(n => this.arr_corners[n]);
    this.arr_corners = new_arr_corners;
  }
}

