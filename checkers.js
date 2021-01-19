var fieldsPerSide = 8;
var boardMargin = 16;
var boardDimension = getDimension();

drawCheckboard();



function drawCheckboard() {
	let board = createBoard(boardDimension);

	let fields = [];

	for (let i = 0; i < fieldsPerSide; i++) {
		// create row
		let row = [];

		for (let j = 0; j < fieldsPerSide; j++) {
			// create field     // i == rowIndex, j == columnIndex
			let field = createField(j + i, boardDimension / fieldsPerSide);

			row.push(field);
		}
		fields.push(row);
	}

	fields.forEach(function (row) {
		row.forEach(function (field) {

			board.appendChild(field);
		})
	})


	

	document.getElementById("container").appendChild(board);
}

function removeBoard() {
	document.getElementById("container").innerHTML = "";
}

function createBoard(boardDimension) {
	let board = document.createElement("div");
	board.id = "checkBoard";
	board.style.height = boardDimension + "px";
	board.style.width = boardDimension + "px";
	board.style.margin = boardMargin + "px";
	board.style.backgroundColor = "peru";

	return board;
}

function createField(index, dimen) {
	let field = document.createElement("div");
	// field.id = "field";
	field.className = "field";
	field.style.minHeight = dimen + "px";
	field.style.minWidth = dimen + "px";
	field.style.maxHeight = dimen + "px";
	field.style.maxWidth = dimen + "px";
	field.style.position = "relative";
	field.style.backgroundColor = index % 2 == 0 ? "white" : "black";

	let child = document.createElement("div");
	child.className = "fieldChild";
	child.innerHTML = index;

	field.appendChild(child);

	return field;
}

function getDimension() {
		return Math.min(window.innerHeight, window.innerWidth) - 2 * boardMargin - 2 * 10;
}