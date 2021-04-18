const cell = 15;
const padding = 5;
const columns = 51;
const rows = 51;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const mouse = createMouse(canvas);

const matrix = createMatrix(columns, rows);

testMatrix();

function testMatrix(tractors=[]) {
    tractors.push({
		x: 0,
		y: 0,
	});
	while (!isValidMaze()) {
		for (const tractor of tractors) {
			moveTractor(tractor);
		}
	}

	requestAnimationFrame(tick);
}

function createMatrix(columns, rows) {
	const matrix = [];

	for (let y = 0; y < rows; y++) {
		const row = [];

		for (let x = 0; x < columns; x++) {
			row.push(false);
		}

		matrix.push(row);
	}

	return matrix;
}

function drawMaze() {
	canvas.width = padding * 2 + columns * cell;
	canvas.height = padding * 2 + rows * cell;

	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fill();

	for (let y = 0; y < columns; y++) {
		for (let x = 0; x < rows; x++) {
			const color = matrix[y][x] ? 'white' : 'black';

			ctx.beginPath();
			ctx.rect(
				padding + x * cell,
				padding + y * cell,
				cell,
				cell
			);
			ctx.fillStyle = color;
			ctx.fill();
		}
	}
}

function moveTractor(tractor) {
	const directions = [];

	if (tractor.x > 0) {
		directions.push([-2, 0]);
	}

	if (tractor.x < columns - 1) {
		directions.push([2, 0]);
	}

	if (tractor.y > 0) {
		directions.push([0, -2]);
	}

	if (tractor.y < rows - 1) {
		directions.push([0, 2]);
	}

	const [dx, dy] = getRandomWay(directions);

	tractor.x += dx;
	tractor.y += dy;

	if (!matrix[tractor.y][tractor.x]) {
		matrix[tractor.y][tractor.x] = true;
		matrix[tractor.y - dy / 2][tractor.x - dx / 2] = true;
	}
}

function getRandomWay(array) {
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

function isValidMaze() {
	for (let y = 0; y < columns; y += 2) {
		for (let x = 0; x < rows; x += 2) {
			if (!matrix[y][x]) {
				return false;
			}
		}
	}
	return true;
}

function createMouse(element) {
	const mouse = {
		x: 0,
		y: 0,

		left: false,
		pLeft: false,

		over: false,

		update() {
			this.pLeft = this.left;
		},
	};

	element.addEventListener("mouseenter", mouseenterHandler);
	element.addEventListener("mouseleave", mouseleaveHandler);
	element.addEventListener("mousemove", mousemoveHandler);
	element.addEventListener("mousedown", mousedownHandler);
	element.addEventListener("mouseup", mouseupHandler);

	function mouseenterHandler() {
		mouse.over = true;
	}

	function mouseleaveHandler() {
		mouse.over = false;
	}

	function mousemoveHandler(e) {
		const rect = element.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}

	function mousedownHandler() {
		mouse.left = true;
	}

	function mouseupHandler() {
		mouse.left = false;
	}

	return mouse;
}

let cell1 = null;
let cell2 = null;
let path = null;

function tick() {
	requestAnimationFrame(tick);

	drawMaze();

	if (path) {
		for (const [x, y] of path) {
			ctx.fillStyle = "orange";
			ctx.fillRect(
				padding + x * cell,
				padding + y * cell,
				cell,
				cell
			);
		}
	}

	if (
		mouse.x < padding ||
		mouse.y < padding ||
		mouse.x > canvas.width - padding ||
		mouse.y > canvas.height - padding
	) {
		return;
	}

	const x = Math.floor((mouse.x - padding) / cell);
	const y = Math.floor((mouse.y - padding) / cell);

	if (mouse.left && !mouse.pLeft && matrix[y][x]) {
		if (!cell1 || cell1[0] !== x || cell1[1] !== y) {
			cell2 = cell1;
			cell1 = [x, y];
		}

		if (cell1 && cell2) {
			potentials = getPotentialsMatrix(matrix, cell1, cell2);

			let [x, y] = cell1;
			let potential = potentials[y][x];
			path = [[x, y]];

			while (potential !== 0) {
				potential--;

				if (y > 0 && potentials[y - 1][x] === potential) {
					path.push([x, y - 1]);
					y--;
					continue;
				}

				if (y < columns - 1 && potentials[y + 1][x] === potential) {
					path.push([x, y + 1]);
					y++;
					continue;
				}

				if (x > 0 && potentials[y][x - 1] === potential) {
					path.push([x - 1, y]);
					x--;
					continue;
				}

				if (x < rows - 1 && potentials[y][x + 1] === potential) {
					path.push([x + 1, y]);
					x++;
					continue;
				}
			}
		}
	}
	mouse.update();
}

function getPotentialsMatrix(matrix, [x1, y1], [x2, y2]) {
	const potentials = [];

	for (let y = 0; y < matrix.length; y++) {
		const row = [];

		for (let x = 0; x < matrix[y].length; x++) {
			row.push(null);
		}

		potentials.push(row);
	}

	for (let y = 0; y < matrix.length; y++) {
		for (let x = 0; x < matrix[y].length; x++) {
			if (matrix[y][x] === false) {
				potentials[y][x] = false;
			}
		}
	}

	potentials[y2][x2] = 0;

	while (potentials[y1][x1] === null) {
		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[y].length; x++) {
				if (potentials[y][x] === false || potentials[y][x] === null) {
					continue;
				}

				const number = potentials[y][x] + 1;

				if (y > 0 && potentials[y - 1][x] !== false) {
					if (potentials[y - 1][x] === null) {
						potentials[y - 1][x] = number;
					} else {
						potentials[y - 1][x] = Math.min(potentials[y - 1][x], number);
					}
				}

				if (y < matrix.length - 1 && potentials[y + 1][x] !== false) {
					if (potentials[y + 1][x] === null) {
						potentials[y + 1][x] = number;
					} else {
						potentials[y + 1][x] = Math.min(potentials[y + 1][x], number);
					}
				}

				if (x > 0 && potentials[y][x - 1] !== false) {
					if (potentials[y][x - 1] === null) {
						potentials[y][x - 1] = number;
					} else {
						potentials[y][x - 1] = Math.min(potentials[y][x - 1], number);
					}
				}

				if (x < matrix[0].length - 1 && potentials[y][x + 1] !== false) {
					if (potentials[y][x + 1] === null) {
						potentials[y][x + 1] = number;
					} else {
						potentials[y][x + 1] = Math.min(potentials[y][x + 1], number);
					}
				}
			}
		}
	}

	return potentials;
}

document.getElementById('btn').onclick=()=>{
	location.reload()
}