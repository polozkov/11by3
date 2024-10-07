//SVG.SETTING уже инициализирован new CLASS_SETTING(); установи размеры
SVG.SETTING.f_set_svg_sizes(); SVG.DRAW.f_final();
SVG.SETTING = new CLASS_SETTING();
//ещё раз установи размеры, чтобы решить проблему с полосой прокрутки
SVG.SETTING.f_set_svg_sizes(); SVG.DRAW.f_final();

//функция (смотри техзадание), которая возвращает матрицу по размерам зоны ответа с единицами и нулями
function getAnswer(setting = SVG.SETTING) {
  //заполняет матрицу нужного размера нулями
  function f_fill_matrix(sizes_xy = setting.xy_answer_sizes, default_value = 0) {
    let m = new Array(sizes_xy.y).fill([]);
    for (let i_row = 0; i_row < sizes_xy.y; i_row+=1)
      m[i_row] = new Array(sizes_xy.x).fill(0);
    return m;
  }

  let m = f_fill_matrix();
  //отфильтруй тольте те уголки, которые в зоне ответа
  let corners_on_answer = setting.arr_corners.filter(corner => (corner.flag_is_start == false));
  let corners = corners_on_answer.map(corner => corner.f_get_round());

  for (let i_corner of corners)
  for (let i_xy of i_corner.arr_xy)
    m[i_xy.y][i_xy.x] = 1;
  return m;
}

SVG.EVENTS = {
  //информация о предыдущем нажатии мыши
  e_press_down: null,
  e_press_array: [],

  //обнови размеры окна
  f_renew_sizes: function(flag_is_redraw) {
    //обнови настройки, но сохрани уголки
    SVG.SETTING = new CLASS_SETTING(SVG.SETTING.arr_corners);
    //гуляющий уголок (который сейчас могли перетаскивать мышью) верни в зону старта
    SVG.SETTING.f_put_corners_on_start();
    //прочисть информацию о нажатии мыши
    SVG.EVENTS.e_press_down = null;

    //перерисуй дважды, чтобы не было проблем с полосой прокрутки
    SVG.SETTING.f_set_svg_sizes(); SVG.DRAW.f_final();
    SVG.SETTING.f_set_svg_sizes(); SVG.DRAW.f_final();
  },

  //подробности нажатия (сама клетка обязательно) + опционально объект полиоимино "уголок" под мышью
  f_get_info_press: function(cell_nxy, mouse_xy_rel, flag_is_only_cell = false) {
    //минимальная информация: нажата клетка
    let obj_rel = SVG.SETTING.f_detect_start_or_answer(cell_nxy);
    //если нажатие ни в зоне ответа, ни в зоне старта, то выйди
    if (obj_rel == null) {return null; };

    //минимальная информация получена, запиши её в cell_object
    let cell_object = ({
      name_string: obj_rel.name_string,
      mouse_xy_rel: mouse_xy_rel,
      n_cell_xy: cell_nxy, 
      n_cell_xy_rel: obj_rel.rel_xy,
      obj_corner: null, n_corner: null, n_cell: null});
    
    //отсавляем три поля с null, и возвращаем как есть (так определил флаг) 
    if (flag_is_only_cell) {return cell_object; }

    //благодаря алгоритму художника, проверяй от самых верхних до самых нижних
    for (let i of [5,4,3,2,1,0])
    //проверяй все клетки расматриваемого уголка
    for (let t = 0; t < SVG.SETTING.arr_corners[i].arr_xy.length; t++) {
      //отсносительные координаты квадратика
      let i_xy = SVG.SETTING.arr_corners[i].arr_xy[t];
      //f_get_zero_nxy(n_3_8) показывает относительно чего считать, так мы узнаем абсолютные координаты клетки 
      let i_xy_abs = SVG.SETTING.f_get_zero_nxy(SVG.SETTING.arr_corners[i].arr_xy.length).f_op_add(i_xy);
      //нажата именно эта клетка (совпадение объекта нажатия и клетки полиомино)
      if (obj_rel.abs_xy.f_is_equal_xy(i_xy_abs)) {
        //обредели объект "уголок"
        cell_object.obj_corner = SVG.SETTING.arr_corners[i].f_get_copy();
        cell_object.n_corner = i; //номер уголка
        cell_object.n_cell = t; //номер нажатой клетки в уголке
        return cell_object;
      }
    }
    return null;
  },

  //мышь относительно окна браузера - получи объект с информацией: куда нажали
  f_get_info_press_by_xy_rel(mouse_xy_client, flag_is_only_cell = false) {
    const svg_coord = SVG.EL.getBoundingClientRect(); //граница svg
    const svg_xy = new CLASS_XY(svg_coord.left, svg_coord.top); //координата левого верхнего угла svg элемента
    const mouse_xy_rel = mouse_xy_client.f_op_subtract(svg_xy); //относительные координаты мыши
    const cell_nxy = SVG.SETTING.f_get_pressed_cell(mouse_xy_rel); //нажатая ячейка

    //верни подробную информацию про нажатую ячейку (с координатами мыши)
    return SVG.EVENTS.f_get_info_press(cell_nxy, mouse_xy_rel, flag_is_only_cell);
  },

  //обнови информацию с перезаписью элемента
  f_renew_element: function(new_corner, flag_is_renew_sizes = false) {
    //найди элемент с тем же числом клеток (число клеток уникально для всех уголков)
    let index_corner = SVG.SETTING.f_search_n_3_8(new_corner.arr_xy.length);
    SVG.SETTING.arr_corners[index_corner] = new_corner; //перезапиши
    SVG.DRAW.f_final(); //перерисуй
    SVG.EVENTS.e_press_down = null; //прочист информацию про нажатие мыши
    if (flag_is_renew_sizes) {SVG.EVENTS.f_renew_sizes(); }
  },

  f_do_correction: function() {
    if(SVG.EVENTS.e_press_array.length) {
      let n_3_8 = SVG.EVENTS.e_press_array.at(-1);
      let n = SVG.SETTING.f_search_n_3_8(n_3_8);
      SVG.SETTING.arr_corners[n] = SVG.SETTING.f_legal_slot(SVG.SETTING.arr_corners[n]);
    }
  },

  //тут будут функции для событий мыши (нажатие, отпускание, перемещение)
  MOUSE: {}
};