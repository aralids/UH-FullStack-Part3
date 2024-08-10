const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(
	morgan(":method :url :status :res[content-length] - :response-time ms :obj")
);

morgan.token("obj", function (req, res, param) {
	if (req.method === "POST") {
		return "- " + JSON.stringify(req.body);
	} else {
		return "";
	}
});

let persons = [
	{
		id: "1",
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: "2",
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: "3",
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: "4",
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

app.get("/api/persons", (request, response) => {
	response.json(persons);
});

app.get("/info", (request, response) => {
	var curr = new Date();
	var datetime =
		"Request time: " +
		curr.getDate() +
		"/" +
		(curr.getMonth() + 1) +
		"/" +
		curr.getFullYear() +
		" @ " +
		curr.getHours() +
		":" +
		curr.getMinutes() +
		":" +
		curr.getSeconds();
	response.send(
		`<h5>The phonebook contains ${persons.length} entries.</h5><h5>${datetime}</h5>`
	);
});

app.get("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	const person = persons.find((person) => person.id === id);

	if (person) {
		response.json(person);
	} else {
		response.status(404).end();
	}
});

app.delete("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	const delPerson = persons.find((person) => person.id === id);
	persons = persons.filter((person) => person.id !== id);

	response.json(delPerson);
});

const generateId = () => {
	return Math.floor(
		Math.random() * (Math.floor(100000) - Math.ceil(5)) + Math.ceil(5)
	);
};

app.post("/api/persons", (request, response) => {
	const body = request.body;

	if (!body.name) {
		return response.status(400).json({
			error: "name missing",
		});
	}

	if (!body.number) {
		return response.status(400).json({
			error: "number missing",
		});
	}

	if (persons.filter((person) => person.name === body.name).length > 0) {
		return response.status(400).json({
			error: "name must be unique",
		});
	}

	const person = {
		name: body.name,
		number: body.number,
		id: String(generateId()),
	};

	persons = persons.concat(person);

	response.json(person);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
