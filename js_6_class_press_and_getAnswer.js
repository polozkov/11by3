//класс: нажатие мышкой
class CLASS_PRESS {
  constructor(e) {
    const svg_coord = SVG.EL.getBoundingClientRect(); //граница svg
    const svg_xy = new CLASS_XY(svg_coord.left, svg_coord.top); //координата левого верхнего угла svg элемента

    this.mouse_xy_client = new CLASS_XY(e.clientX, e.clientY); //координаты мыши в окне
    this.mouse_xy_rel = this.mouse_xy_client.f_op_subtract(svg_xy); //относительные координаты мыши

    this.cell_nxy = SVG.SETTING.f_get_pressed_cell(this.mouse_xy_rel,  true); //нажатая ячейка (с округлением)
    this.cell_real = SVG.SETTING.f_get_pressed_cell(this.mouse_xy_rel,false); //нажатая ячейка (без округления)

    this.corner_obj = null; //какой уголок нажат
    this.corner_cell_index = null; //номер клетки в нажатом уголке (для поиска слетки со стрелкой для отзеркаливания)

    this.flag_is_found = false;

    //благодаря алгоритму художника, проверяй от самых верхних до самых нижних
    for (let i of [5, 4, 3, 2, 1, 0])
      //проверяй все клетки расматриваемого уголка
      for (let t = 0; t < SVG.SETTING.arr_corners[i].arr_xy.length; t++) {
        //относительные координаты квадратика
        let i_xy = SVG.SETTING.arr_corners[i].arr_xy[t];

        //нажата именно эта клетка (совпадение объекта нажатия и клетки полиомино)
        if (!this.cell_nxy.f_is_equal_xy(i_xy)) { continue; }

        //определи объект "уголок"
        this.corner_obj = SVG.SETTING.arr_corners[i].f_get_copy();
        this.corner_cell_index = t;

        this.flag_is_found = true;
        return;
      }
  }
  f_get_copy() {
    let m = this.mouse_xy_client.f_get_copy(); //мышь с двумя координатами
    //в объекте "e" для конструктора нужны только две вещественные координаты (относительно окна)
    let e = {clientX: m.x, clientY: m.y}; 
    return new CLASS_PRESS(e);
  }

  //разность между текущей вещественной ячейкой и следующей нажатой (сколько клеток между щелчками)
  f_get_real_delta(press_next) {return this.cell_real.f_op_subtract(press_next.cell_real);}

  //перемести объект "уголок" (смести его на дельту) и верни копию
  f_get_copy_with_corner(delta_xy) {
    let COPY = this.f_get_copy();
    if (!COPY.corner_obj) {return COPY;} //если в текужем объекте уголок null, то просто копия
    COPY.corner_obj = COPY.corner_obj.f_op_add(delta_xy); //смещённый уголок
    return COPY;
  }
};


//SVG.SETTING уже инициализирован new CLASS_SETTING(); установи размеры
SVG.SETTING.f_set_svg_sizes(); //SVG.DRAW.f_final();
SVG.SETTING = new CLASS_SETTING();
//ещё раз установи размеры, чтобы решить проблему с полосой прокрутки
//SVG.SETTING.f_set_svg_sizes(); //SVG.DRAW.f_final();

//функция (смотри техзадание), которая возвращает матрицу по размерам зоны ответа с единицами и нулями
function getAnswer() {
  let setting = SVG.SETTING;
  //заполняет матрицу нужного размера нулями
  function f_fill_matrix(sizes_xy = setting.nxy_answer_sizes, default_value = 0) {
    let m = new Array(sizes_xy.y).fill([]);
    for (let i_row = 0; i_row < sizes_xy.y; i_row+=1)
      m[i_row] = new Array(sizes_xy.x).fill(default_value);
    return m;
  }

  let m = f_fill_matrix();
  //отфильтруй тольте те уголки, которые в зоне ответа
  let corners_on_answer = setting.arr_corners.filter(corner => (setting.f_is_corner_on_answer(corner.f_get_round())));
  //округли до целых (столбец и строка матрицы должны быть обозначены целым индексом)
  let corners = corners_on_answer.map(corner => corner.f_get_round());

  for (let i_corner of corners)
  for (let i_xy of i_corner.arr_xy)
    m[i_xy.y][i_xy.x] = 1;
  return m;
}