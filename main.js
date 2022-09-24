const PIECE_SIZE = 4;
const PC_HEIGHT = 4;
const FIELD_HEIGHT = PIECE_SIZE + PC_HEIGHT;
const FIELD_WIDTH = 10;
const PIECE_SHAPES = 7;
const PC_PIECES = PC_HEIGHT * FIELD_WIDTH / PIECE_SIZE;

const MINO_TABLE = [
  [
    [[0, -1], [0, 0], [0, 1], [0, 2]],
    [[-1, 1], [0, 1], [1, 1], [2, 1]],
    [[1, 2], [1, 1], [1, 0], [1, -1]],
    [[2, 0], [1, 0], [0, 0], [-1, 0]]
  ],
  [
    [[-1, -1], [0, -1], [0, 0], [0, 1]],
    [[-1, 1], [-1, 0], [0, 0], [1, 0]],
    [[1, 1], [0, 1], [0, 0], [0, -1]],
    [[1, -1], [1, 0], [0, 0], [-1, 0]]
  ],
  [
    [[0, -1], [0, 0], [0, 1], [-1, 1]],
    [[-1, 0], [0, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 0], [0, -1], [1, -1]],
    [[1, 0], [0, 0], [-1, 0], [-1, -1]]
  ],
  [
    [[0, 0], [-1, 0], [-1, 1], [0, 1]],
    [[0, 0], [-1, 0], [-1, 1], [0, 1]],
    [[0, 0], [-1, 0], [-1, 1], [0, 1]],
    [[0, 0], [-1, 0], [-1, 1], [0, 1]]
  ],
  [
    [[0, -1], [0, 0], [-1, 0], [-1, 1]],
    [[-1, 0], [0, 0], [0, 1], [1, 1]],
    [[0, 1], [0, 0], [1, 0], [1, -1]],
    [[1, 0], [0, 0], [0, -1], [-1, -1]]
  ],
  [
    [[0, -1], [0, 0], [-1, 0], [0, 1]],
    [[-1, 0], [0, 0], [0, 1], [1, 0]],
    [[0, 1], [0, 0], [1, 0], [0, -1]],
    [[1, 0], [0, 0], [0, -1], [-1, 0]]
  ],
  [
    [[-1, -1], [-1, 0], [0, 0], [0, 1]],
    [[-1, 1], [0, 1], [0, 0], [1, 0]],
    [[1, 1], [1, 0], [0, 0], [0, -1]],
    [[1, -1], [0, -1], [0, 0], [-1, 0]]
  ]
];

const COLOR_TABLE = [
  "#00ffff",
  "#3040ff",
  "#ffa500",
  "#ffff00",
  "#00ee00",
  "#ff00ff",
  "#ff0000",
  "#d3d3d3",
  "#000000"
];

const GARBAGE = 7;
const EMPTY = 8;

function Piece(shape, rot, row, col) {
  this.shape = shape;
  this.rot = rot;
  this.row = row;
  this.col = col;
  
  this.get_mino = function(mino) {
    return [
      row + MINO_TABLE[this.shape][this.rot][mino][0],
      col + MINO_TABLE[this.shape][this.rot][mino][1]
    ];
  };
}

function Field(fhash=0) {
  this.grid = Array(FIELD_HEIGHT).fill().map(
    () => Array(FIELD_WIDTH).fill(EMPTY)
  );
  for (let r = FIELD_HEIGHT - 1; r >= 0; r--) {
    for (let c = FIELD_WIDTH - 1; c >= 0; c--) {
      this.grid[r][c] = ((fhash % 2) ? GARBAGE : EMPTY);
      fhash = Math.floor(fhash / 2);
    }
  }
  
  this.lines = 0;
  
  this.place = function(p) {
    for (let mino = 0; mino < PIECE_SIZE; mino++) {
      let pos = p.get_mino(mino);
      this.grid[pos[0]][pos[1]] = p.shape;
    }
  };
  
  this.clear_lines = function() {
    let num_cleared = 0;
    let flag;
    for (let r = FIELD_HEIGHT - 1; r >= (PIECE_SIZE - num_cleared); r--) {
      if (r >= PIECE_SIZE) {
        for (let c = 0; c < FIELD_WIDTH; c++) {
          flag = (this.grid[r][c] == EMPTY);
          if (flag) {
            break;
          }
        }
        if (!flag) {
          num_cleared++;
        }
        else if (num_cleared > 0) {
          for (let c = 0; c < FIELD_WIDTH; c++) {
            this.grid[r + num_cleared][c] = this.grid[r][c];
          }
        }
      }
      else if (r >= 0) {
        for (let c = 0; c < FIELD_WIDTH; c++) {
          this.grid[r + num_cleared][c] = this.grid[r][c];
        }
      }
      else {
        for (let c = 0; c < FIELD_WIDTH; c++) {
          this.grid[r + num_cleared][c] = EMPTY;
        }
      }
    }
    for (let r = 0; r < FIELD_HEIGHT; r++) {
      for (let c = 0; c < FIELD_WIDTH; c++) {
        if (this.grid[r][c] != EMPTY) {
          this.grid[r][c] = GARBAGE;
        }
      }
    }
    this.lines += num_cleared;
  };
  
  this.disp = function(onclick="") {
    return `<table class="field" cellspacing="0">` +
             this.grid.slice(PIECE_SIZE).map(
               row => `<tr>` + row.map(
                 sq => `<td style="background:${COLOR_TABLE[sq]}"` +
                       ` onclick="${onclick}"></td>`
               ).join("") + `</tr>`
             ).join("") +
           `</table>`;
  };
  
  this.hash = function() {
    let h = 0;
    for (let r = PIECE_SIZE + this.lines; r < FIELD_HEIGHT; r++) {
      for (let c = 0; c < FIELD_WIDTH; c++) {
        h *= 2;
        h += (this.grid[r][c] != EMPTY);
      }
    }
    h *= Math.pow(2, FIELD_WIDTH * this.lines);
    h += Math.pow(2, FIELD_WIDTH * this.lines) - 1;
    return h;
  }
}

function disp_options(fhash) {
  let f = new Field(fhash);
  let len = f.grid.reduce(
    (s, a) => s + a.reduce((z, x) => z + (x != EMPTY), 0),
    0
  ) / PIECE_SIZE;
  f.clear_lines();
  let dptr = data[fhash];
  let fields = [];
  
  for (let shape = 0; shape < PIECE_SHAPES; shape++) {
    if (dptr[shape + 1] == 0) {
      fields.push(
        `<div style="text-align:center">` +
          `${f.disp()}` +
          `<p>0/${PIECE_SHAPES}^${PC_PIECES - 1 - len} (0%)</p>` +
        `</div>`
      );
      continue;
    }
    
    let f2 = new Field(f.hash());
    f2.clear_lines();
    let rot = Math.floor(dptr[shape + 1] / 44);
    let row = Math.floor(dptr[shape + 1] % 44 / 11) + 4;
    let col = dptr[shape + 1] % 11 - 1;
    f2.place(new Piece(shape, rot, row, col));
    let f3 = new Field(f2.hash());
    f3.clear_lines();
    
    let count = data[f3.hash()][0];
    if (count == Math.pow(PIECE_SHAPES, PC_PIECES - 1 - len)) {
      fields.push(
        `<div style="text-align:center">` +
          `${f2.disp()}` +
          `<p>${count}/${PIECE_SHAPES}^${PC_PIECES - 1 - len} (100%)</p>` +
        `</div>`
      );
      continue;
    }
    
    let onclickstr = `disp_options(${f3.hash()})`;
    let pct = Math.round(
      count / Math.pow(PIECE_SHAPES, PC_PIECES - 1 - len) * 100000
    ) / 1000;
    fields.push(
      `<div style="text-align:center">` +
        `${f2.disp(onclickstr)}` +
        `<p>${count}/${PIECE_SHAPES}^${PC_PIECES - 1 - len} (${pct}%)</p>` +
      `</div>`
    );
  }
  
  let total_pct = Math.round(
    dptr[0] / Math.pow(PIECE_SHAPES, PC_PIECES - len) * 100000
  ) / 1000;
  document.getElementById("results").innerHTML = (
    `${f.disp()}` +
    `<p>${dptr[0]}/${PIECE_SHAPES}^${PC_PIECES - len} (${total_pct}%)</p><br>` +
    `<div class="grid">${fields.join("")}</div>`
  );
}