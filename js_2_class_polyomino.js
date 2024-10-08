//полиомино из (фигура квадратных клеток), например уголок
class CLASS_POLYOMINO {
  //квадраты описываются двумя координатами, флаг показывает: находитя ли уголок в стартовой зоне или в зоне ответов
  constructor(arr_xy) {
    //встроенный метод массива map - отображение - мы копируем объекты "точка"
    this.arr_xy = arr_xy.map(value => new CLASS_XY(value.x, value.y));
  }

  //глубокое копирование объекта "полиомино"
  f_get_copy() {return new CLASS_POLYOMINO(this.arr_xy, this.flag_is_start); }
  //минимальные координаты клеток полиомино (встроенный метод массива reduce - начальное значение бесконечность)
  f_get_min() {return this.arr_xy.reduce((acc, xy) => acc.f_op_min(xy), CONST_MAX_MAX);}
  f_get_max() {return this.arr_xy.reduce((acc, xy) => acc.f_op_max(xy), CONST_MIN_MIN);}
  //размер - это разность между максимальной и минимальной координатой плюс один (по обеим координатам)
  f_get_sizes() {return this.f_get_max().f_op_subtract(this.f_get_min()).f_op_add(CONST_1_1);}

  //применяем метод класса CLASS_XY с данным именем (с данными параметрами) для каждой точки в arr_xy - тое есть преобразуем все квадраты
  f_do_foreach_xy(f_xy_name, arr_parameters = []) {
    //параметры пишем в массиве и оператором ...spread превращаем его в отдельные параметры
    return new CLASS_POLYOMINO(this.arr_xy.map(xy => xy[f_xy_name](...arr_parameters)), this.flag_is_start); } 
  //прибавляем ко всем квадратам какой-то вектор (f_do_foreach_xy "f_op_add")
  f_op_add(p=CONST_0_0) {return this.f_do_foreach_xy("f_op_add", [p]);}
  //отражаем все точки относительно х (если х = 0, то просто меняем знак х-координаты)
  f_op_reflex_x(x=0) {return this.f_do_foreach_xy("f_op_reflex_x", [x]);}
  f_op_reflex_y(y=0) {return this.f_do_foreach_xy("f_op_reflex_y", [y]);}
  //поворот относительно центра на 0,90,180 или 270 градусов (0,1,2 или 3 шага)
  f_op_90_n03_center(n_03=0, c=CONST_0_0) {return this.f_do_foreach_xy(" f_op_90_n03_center", [n_03, c]);}
  //отражение по диагонали (если центр (0,0), как по умолчанию, то центр (0,0) на месте как и диагональ)
  f_op_swap_xy(center=CONST_0_0) {return this.f_do_foreach_xy("f_op_swap_xy", [center]);}
  //передвинь полиомино в заданное положеие (не зависимо от того, где оно было изначально)
  f_op_move_to(center=CONST_0_0) {return this.f_op_add(center.f_op_subtract(this.f_get_min()));}
  
  //округли все координаты квадратиков
  f_get_round(flag_do = true) {return (flag_do ? this.f_do_foreach_xy("f_get_round", []): this.f_get_copy());}

  //имеют ли два полиомино общий квадрат? (пересечение)
  f_is_intersect(other_polyomino) {
    for (let xy_old of this.arr_xy)
    for (let xy_new of other_polyomino.arr_xy)
      if (xy_old.f_is_equal_xy(xy_new)) return true;
    return false;}

  //только для уголков с нужным порядком клеток (получи направление по длинной и по короткой стороне)
  f_get_dir_short() {return this.arr_xy[1].f_op_subtract(this.arr_xy[0])} 
  f_get_dir_long() {return this.arr_xy[2].f_op_subtract(this.arr_xy[0])}

  //при нажатии на квадрат со стрелкой отзеркаль уголок нужным способом (кроме особой стрелки на четвёрке)
  f_op_reflex_when_hori(n_cell) {
    let my_min = this.f_get_min();
    if (n_cell == 1) {return this.f_op_reflex_x().f_op_move_to(my_min);}
    if (n_cell == (this.arr_xy.length - 1)) {return this.f_op_reflex_y().f_op_move_to(my_min);}
    return this;
  }

  //особая стелка на четвёрке (которая меняет горизонталь и вертикаль, то есть ориентацию)
  f_op_rexlex_tetra_corner_by_2() {
    let p_min = this.f_get_min();
    let p0 = this.arr_xy[0].f_get_copy();
    let p1 = this.arr_xy[2].f_get_copy();
    let p2 = this.arr_xy[1].f_get_copy();
    let p3 = p2.f_op_subtract(p0).f_op_add(p2);
    //сохраняем нулевую клетку (при ирге на поле)
    let p_new_with_same_0 = new CLASS_POLYOMINO([p0,p1,p2,p3], this.flag_is_start);
    //созраняем минимальные координаты
    let p_new_with_same_min = p_new_with_same_0.f_op_move_to(p_min);
    //в стартовой зоне сохраням минимумы, а в зоне ответа сохраняем нулевую клетку
    return this.flag_is_start ? p_new_with_same_min : p_new_with_same_0;
  }

  //меняем ориентацию уголка в зависимости от нажатой стрелки
  f_op_reflex_event(n_cell) {
    //особый случай, когда инвертируется четвёрка со сменой ориентации
    if ((this.arr_xy.length == 4) && (n_cell == 2)) {return this.f_op_rexlex_tetra_corner_by_2() }

    //когда ориентация горизонтальная, делаем стандартное отражение
    if (this.f_get_sizes().x >= this.f_get_sizes().y) {return this.f_op_reflex_when_hori(n_cell); }
    
    //вертикально может быть ориентирована только "четвёрка"
    let my_min = this.f_get_min();
    //сохраняем минимум при вертикальном отражении
    if (n_cell == 1) {return this.f_op_reflex_y().f_op_move_to(my_min);}
    if (n_cell == 3) {return this.f_op_reflex_x().f_op_move_to(my_min);}
    return this;
  }

  //направление стрелок в зависимости от клетки на уголке
  f_is_reflex_mark_direction(n_cell) {
    //клетка номер один находится на короткой стороне "кочерги" на уголке; отражение по длинной стороне 
    if (n_cell == 1) {return this.f_get_dir_long();}
    //последняя клетка - длинный хвост "кочерги" - отражение по короткой стороне (перекатываемся близко)
    if (n_cell == (this.arr_xy.length - 1)) {return this.f_get_dir_short();}

    //особый случай - клетка, меняющая ориентацию (направление вычисляется по длинному и короткомуу направлению)
    if ((this.arr_xy.length == 4) && (n_cell == 2)) {return this.f_get_dir_short().f_op_subtract(this.f_get_dir_long()); }
    return null;
  }

  //облась задана началом и размерами. Помещается ли полимино на этой области?
  f_is_min_max_on_area(start_xy, sizes_xy) {
    let min_ok = this.f_get_min().f_is_on_area(start_xy, sizes_xy);
    let max_ok = this.f_get_max().f_is_on_area(start_xy, sizes_xy);
    return min_ok && max_ok;
  }
};