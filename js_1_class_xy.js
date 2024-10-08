//класс - двумерная точка на декартовой плоскости (не важно, целая или вещественная)
class CLASS_XY {
  //конструктор по умолчанию записывает начало ккординат (целые нули)
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  //глубокая копия объекта-точки
  f_get_copy() { return new CLASS_XY(this.x, this.y); }
  //симметрия по диагонали - обмен координат ху - ух
  f_get_swap_xy() {return new CLASS_XY(this.y, this.x);}
  //ориентация, если квадратное поле или вытянутое альбомно, то "hory", если вытянуто вверх, то "vert"
  f_get_vert_or_hory_string() {return ((this.x >= this.y) ? "hory" : "vert"); }
  //верни округлённые числа по обеим координатам (10000 нужно, чтобы не было проблем с отрицательными числами типа -1.5 и -0.5)
  f_get_round() {return new CLASS_XY(Math.round(this.x + 10000) - 10000, Math.round(this.y + 10000) - 10000); }

  //минимальные координаты по обеим осям (минимум по х независимо от минимума по у)
  f_op_min(p) { return new CLASS_XY(Math.min(this.x, p.x), Math.min(this.y, p.y)); }
  //максиимальные координаты по обеим осям (максимум по х независимо от минимума по у)
  f_op_max(p) { return new CLASS_XY(Math.max(this.x, p.x), Math.max(this.y, p.y)); }
  //сложи координаты двух точек (как сумма векторов либо как сумма комплексных чисел)
  f_op_add(p) { return new CLASS_XY(this.x + p.x, this.y + p.y); }
  //прибавь к координате х и координате у вещественные числа (а не объект "точка")
  f_op_add_x_y(x,y) { return new CLASS_XY(this.x + x, this.y + y); }
  //прибавь к точке одно и то же число для обеих координат (сдвиг под 45 градусов - для расширения рамкой)
  f_op_add_same(n) { return new CLASS_XY(this.x + n, this.y + n); }
  //разность координат двух точек
  f_op_subtract(p) { return new CLASS_XY(this.x - p.x, this.y - p.y); }
  //пропорциональное растяжение (вектор ху растяни в n раз)
  f_op_scale_n(n) { return new CLASS_XY(this.x * n, this.y * n); }
  //растяжение путём путём домножение на два числа (независимо)
  f_op_scale_x_y(x,y) { return new CLASS_XY(this.x * x, this.y * y); }
  //раздели this на p по обеим коодинатам независимо
  f_op_divide(p) { return new CLASS_XY(this.x * 1.0 / p.x, this.y * 1.0 / p.y);}

  //верни окно, растянутое в (this.x,this.y) раз
  f_op_scale_window() { let d = document.documentElement; return this.f_op_add_x_y(d.clientWidth, d.clientHeight); }
  //this.x,this.y - это размеры окна. nxy - размеры SVG элемента. Один из размеров надо вписать на 100%
  f_op_maximize(nxy) {
    let xy_full_w = new CLASS_XY(this.x, this.x * nxy.y / nxy.x); //ширина 100%
    let xy_full_h = new CLASS_XY(this.y * nxy.x / nxy.y, this.y); //высота 100%
    //вписывай либо по ширине, либо по высоте: что поместится
    return xy_full_h.f_op_min(xy_full_w) }

  //отражение право-лево (меняем координату х)
  f_op_reflex_x(x = 0) { return new CLASS_XY(x+x-this.x, this.y); }
  //отражение, меняющее верх и ниж (координата у)
  f_op_reflex_y(y = 0) { return new CLASS_XY(this.x, y-y-this.y); }
  //центральная симметрия относительно точки (по умолчанию 0,0 - просто меняем знак, то есть умножаем на -1)
  f_op_reflex_both(x = 0, y = 0) { return new CLASS_XY(x+x-this.x, y+y-this.y); }
  //диагональное отражение - обмен координат х,у; начало координат в center неподвижно
  f_op_swap_xy(center = new CLASS_XY()) {return this.f_op_subtract(center).f_get_swap_xy().f_op_add(center);}

  //поворот точни на плоскости на угол в градусах. Формула из статьи в википедии: https://ru.wikipedia.org/wiki/Матрица_поворота
  f_op_rot_degree(deg) {let sin = Math.sin(Math.PI * deg / 180.0); let cos = Math.cos(Math.PI * deg / 180.0); 
    return new CLASS_XY(this.x*cos - this.y * sin, this.x*sin + this.y * cos); }

  //поворот на 90 градусов
  f_get_90() { return new CLASS_XY(-this.y, this.x); }
  //поворот на 90 градусов 0,1,2 или 3 раза
  f_op_90_n03(n03) {let t = this.f_get_copy(); for (let i = 0; i < n03; i++) {t = t.f_get_90();} return t;}
  //поворот на 90 градусов 0,1,2 или 3 раза относительно центра
  f_op_90_n03_center(n03, c) {return this.f_op_subtract(c).f_op_90_n03(n03).f_op_add(c); }

  //координаты mx, my не выходят за границу this.x this.y 
  f_is_on_rect(mx, my) {return ((0 <= this.x) && (this.x < mx) && (0 <= this.y) && (this.y < my)); }
  //small_p не выходит за границу this.x this.y (хотя может быть отричательным)
  f_is_small_inside(small_p) { return ((this.x >= small_p.x) && (this.y >= small_p.y)); }
  //двк точки равны (путём сравнения координат x,y)
  f_is_equal_xy(p) {return ((this.x == p.x) && (this.y == p.y));}
  //точкла не выходит за границы [min, max]
  f_is_between(min, max) {return (min.x <= this.x) && (this.x <= max.x) && (min.y <= this.y) && (this.y <= max.y);}
  //точка лежит внутри или на границе области с данными размерами
  f_is_on_area(start_xy, sizes_xy) {return this.f_is_between(start_xy, start_xy.f_op_add(sizes_xy).f_op_add_same(-1));}
}

//точка (0,0)
const CONST_0_0 = new CLASS_XY();
//точка (1,1)
const CONST_1_1 = new CLASS_XY(1,1);
//положительная бесконечная точка (обе координаты плюс бесконечность)
const CONST_MAX_MAX = new CLASS_XY(Infinity, Infinity);
//отрицательная бесконечная точка (обе координаты минус бесконечность)
const CONST_MIN_MIN = new CLASS_XY(-Infinity, -Infinity);

