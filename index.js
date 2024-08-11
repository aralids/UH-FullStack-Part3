const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const express = require("express");
const app = express();
const Person = require("./models/person");

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
	Person.find({}).then((persons) => {
		response.json(persons);
	});
});

app.get("/info", (request, response) => {
	Person.find({}).then((persons) => {
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
});

app.get("/api/persons/:id", (request, response) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (person) {
				response.json(person);
			} else {
				response.status(404).end();
			}
		})

		.catch((error) => next(error));
});

/*
app.delete("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	const delPerson = persons.find((person) => person.id === id);
	persons = persons.filter((person) => person.id !== id);

	response.json(delPerson);
});
*/

app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then((result) => {
			response.json(result);
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body;

	if (!body.number) {
		return response.status(400).json({
			error: "number missing",
		});
	}

	const newPerson = {
		name: body.name,
		number: body.number,
		id: request.params.id,
	};

	Person.findByIdAndUpdate(request.params.id, newPerson, { new: true })
		.then((result) => {
			response.json(newPerson);
		})
		.catch((error) => next(error));
});

const generateId = () => {
	return Math.floor(
		Math.random() * (Math.floor(100000) - Math.ceil(5)) + Math.ceil(5)
	);
};

app.post("/api/persons", (request, response, next) => {
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

	/*
	if (persons.filter((person) => person.name === body.name).length > 0) {
		return response.status(400).json({
			error: "name must be unique",
		});
	}
    */

	const person = new Person({
		name: body.name,
		number: body.number,
	});

	person.save().then((savedPerson) => {
		response.json(savedPerson);
	});
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
	console.error("ERROR MESSAGE: ", error.message);

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	}

	next(error);
};

app.use(errorHandler);
