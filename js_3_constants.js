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

  F_XY_START: function(n_3_8, str_ori) {
    let xy_start_position = new CLASS_XY(...C.V_H_ARR_START[str_ori][n_3_8 - 3]);
    let xy_start_from = new CLASS_XY(...C.V_H_START_FROM[str_ori]);
    return xy_start_position.f_op_add(xy_start_from);
  },

  //уголок (полиомино) на стартовой зоне (координаты минимума относительно стартовой зоны)
  F_CORNER_ON_START: function (n_3_8, str_ori) {
    //move_to означает фиксацию минимальных координат (сдвинь на это место)
    return C.F_CORNER_ON_ZERO(n_3_8).f_op_move_to(C.F_XY_START(n_3_8, str_ori));
  }
};