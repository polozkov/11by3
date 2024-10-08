SVG.SETTING = new CLASS_SETTING();

SVG.DRAW = {
  //рисуй прямоугольник (или клетку, когда оба размера единичные)
  f_rect: function(nxy, color_fill = "White", wh = CONST_1_1, color_stroke_border = SVG.SETTING.color_stroke) {
    let svg = '<rect ';
    svg += 'x="' + nxy.x + '" ';
    svg += 'y="' + nxy.y + '" ';
    svg += 'width="' + wh.x + '" ';
    svg += 'height="' + wh.y + '" ';
    svg += 'fill="' + color_fill + '" ';
    svg += 'stroke-width="' + SVG.SETTING.line_width + '" ';
    //цвет периметра
    svg += 'stroke="' + color_stroke_border + '" ';
    return svg + '/>';
  },

  //рисуй кружочек-подсказку
  f_circle: function(nxy, shift_xy = CONST_0_0) {
    let cxy = nxy.f_op_add_same(0.5).f_op_add(shift_xy);
    let svg = '<circle ';
    svg += 'cx="' + cxy.x + '" ';
    svg += 'cy="' + cxy.y + '" ';
    svg += 'r="' + SVG.SETTING.mark_hint.R + '" ';
    svg += 'fill="' + SVG.SETTING.mark_hint.COLOR + '" ';
    svg += 'stroke="' + SVG.SETTING.mark_hint.COLOR + '" ';
    svg += 'stroke-width="' + SVG.SETTING.line_width + '" ';
    return svg + '/>';
  },

  //шаг чтобы рисовать стрелку: рисуй отрезок между двумя точками (обе точки могут быть сдвинуты)
  f_line: function (axy, bxy, shift_xy = CONST_0_0) {
    let a = axy.f_op_add(shift_xy); //окончательная координата точки начала отрезка после сдвига
    let b = bxy.f_op_add(shift_xy);

    let svg = '<line stroke-linecap="round" '; //концы отрезков сркуглённые
    svg += 'x1="' + a.x + '" '; svg += 'y1="' + a.y + '" ';
    svg += 'x2="' + b.x + '" '; svg += 'y2="' + b.y + '" ';
    svg += 'stroke-width="' + SVG.SETTING.line_width + '" ';
    svg += 'stroke="' + SVG.SETTING.mark_hint.COLOR + '" ';
    return svg + '/>';
  },

  //рисуй стрелку в нужном направлении
  f_arrow: function(nxy, shift_xy, dir_xy) {
    let c = nxy.f_op_add_same(0.5); //стартовое положение - середина клетки, поэтому +0.5
    let c_end = c.f_op_add(dir_xy.f_op_scale_n(0.5 * SVG.SETTING.arrow.RATIO_MAIN));
    let dir_a = dir_xy.f_op_rot_degree(180 + SVG.SETTING.arrow.DEG); //указатель стрелки с таким уголом поворота
    let dir_b = dir_xy.f_op_rot_degree(180 - SVG.SETTING.arrow.DEG); //а второй указатель в другую сторону

    let a_end = c_end.f_op_add(dir_a.f_op_scale_n(0.5 * SVG.SETTING.arrow.RATIO_ENDS));
    let b_end = c_end.f_op_add(dir_b.f_op_scale_n(0.5 * SVG.SETTING.arrow.RATIO_ENDS));
    //стрелка состоит из трёх отрезков
    return SVG.DRAW.f_line(c, c_end, shift_xy) + SVG.DRAW.f_line(a_end, c_end, shift_xy) + SVG.DRAW.f_line(b_end, c_end, shift_xy);
  },

  //рисуй клетку (is_same_stroke_fill = false, значит чёрная граница, или серая)
  f_rect_cell: function(nxy, n_color_fill, shift_xy = CONST_0_0, is_gray = false) {
    let color_fill = SVG.SETTING.arr_colors_3_8[n_color_fill]
    let color_stroke_border = is_gray ? SVG.SETTING.color_gray : SVG.SETTING.color_stroke;
    return SVG.DRAW.f_rect(nxy.f_op_add(shift_xy), color_fill, CONST_1_1, color_stroke_border);
  },

  //рисуй уголок (is_same_stroke_fill значит "нужна ли чёрная обводка" или пойдёт серая)
  f_polyomino: function(i_polyomino, setting = SVG.SETTING, is_gray = false) {
    let svg_result = "";
    //в какой области рисуем (зона старта или зона игры)
    let shift_xy = new CLASS_XY(0,0); //i_polyomino.flag_is_start ? setting.xy_start_from : setting.xy_answer_from;
    for (let i_nxy of i_polyomino.arr_xy)
      svg_result += SVG.DRAW.f_rect_cell(i_nxy, i_polyomino.arr_xy.length, shift_xy, is_gray);

    if (is_gray == false) //если это не "домик-слот", то рисуй стрелки и круглые подсказки
    for (let i = 0; i < i_polyomino.arr_xy.length; i++)
    if (i_polyomino.f_is_reflex_mark_direction(i)) {
      //кружочек
      svg_result += SVG.DRAW.f_circle(i_polyomino.arr_xy[i], shift_xy);
      //а где кружочек, там обязательно и стрелка в нужном направлении
      svg_result += SVG.DRAW.f_arrow(i_polyomino.arr_xy[i], shift_xy, i_polyomino.f_is_reflex_mark_direction(i));
    }

    return svg_result;
  },

  //рисуем пустую клетчатые квадратную сетку без полиомино
  f_empty_grid: function(nxy_start, nxy_sizes) {
    let svg_result = "";
    for (let ix = nxy_start.x; ix < nxy_start.x + nxy_sizes.x; ix++)
    for (let iy = nxy_start.y; iy < nxy_start.y + nxy_sizes.y; iy++)
      svg_result += SVG.DRAW.f_rect(new CLASS_XY(ix,iy));
    return svg_result;
  },

  //в итоге рисуем всё в зависимости от настроек
  f_final: function(obj_special_corner = null, setting = SVG.SETTING) {
    let svg_corners_and_board = "";
    //пустое клетчатое поле
    svg_corners_and_board += SVG.DRAW.f_empty_grid(setting.xy_answer_from, setting.xy_answer_sizes);
   
    //все полимино (домики-слоты), рисуй всегда (алгоритм художника их закроет)
    for (let n_always_slots of [0,1,2,3,4,5]) {
      //начальное положение полиомино (по умолчанию на своём месте, но может быть повёрнуто)
      let i_polyomino = setting.f_put_n_corner_on_start(n_always_slots);
      svg_corners_and_board += SVG.DRAW.f_polyomino(i_polyomino, setting, true);
    }

    //рисуй полимино с границами (если в зоне старта, то поверх "домиков-слотов")
    for (let i_polyomino of setting.arr_corners) {
      let svg_polyomino = SVG.DRAW.f_polyomino(i_polyomino, setting, false);
      
      if ((obj_special_corner != null) && (obj_special_corner.arr_xy.length == i_polyomino.arr_xy.length)) {
        svg_polyomino = SVG.DRAW.f_polyomino(obj_special_corner, setting, false);
      }

      svg_corners_and_board += svg_polyomino;
    }

    //две рамки для двух зон для красивой границы
    svg_corners_and_board += SVG.DRAW.f_rect(setting.xy_answer_from, "none", setting.xy_answer_sizes);
    svg_corners_and_board += SVG.DRAW.f_rect(setting.xy_start_from, "none", setting.xy_start_sizes);

    //обнови элемент векторной графики после проривсовки
    SVG.EL.innerHTML = svg_corners_and_board;
    return svg_corners_and_board;
  }
}