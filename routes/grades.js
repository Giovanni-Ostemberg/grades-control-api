import express from "express";

import { promises as fs, read } from "fs";
import { ESRCH } from "constants";

const router = express.Router();

const { readFile, writeFile } = fs;

export default router;

//Exercício 1 - rota para criar uma nova grade
router.post("/create", async (req, res) => {
  try {
    let grade = req.body;

    console.log(grade);

    console.log(!grade.value);

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      grade.value === null ||
      !grade.value
    ) {
      throw new Error("Por favor informe todos os campos!");
    }

    const json = await readFile("./grades.json");
    const data = JSON.parse(json);

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };

    data.grades.push(grade);

    await writeFile("./grades.json", JSON.stringify(data));

    res.send(grade);
  } catch (err) {
    console.log("Não foi possível gravar a grade - " + err);
  }
});

//Exercício 2 - rota para atualizar uma grade
router.put("/update", async (req, res) => {
  try {
    let newGrade = req.body;

    const json = await readFile("./grades.json");
    const data = JSON.parse(json);

    const gradeIndex = data.grades.findIndex(
      (grade) => grade.id === newGrade.id
    );

    if (gradeIndex === -1) {
      throw new Error("Índice não encontrado");
    }

    if (newGrade.student) {
      data.grades[gradeIndex].student = newGrade.student;
    }

    if (newGrade.subject) {
      data.grades[gradeIndex].subject = newGrade.subject;
    }

    if (newGrade.type) {
      data.grades[gradeIndex].type = newGrade.type;
    }

    if (newGrade.value) {
      data.grades[gradeIndex].value = newGrade.value;
    }
    data.grades[gradeIndex].timestamp - new Date();

    await writeFile("./grades.json", JSON.stringify(data));

    res.send(data.grades[gradeIndex]);
  } catch (err) {
    console.log("Não foi possível atualizar a grade - " + err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const data = JSON.parse(await readFile("./grades.json"));

    const gradesFilter = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    if (JSON.stringify(gradesFilter) === JSON.stringify(data.grades)) {
      throw new Error("Registro não encontrado!");
    } else {
      data.grades = gradesFilter;
      await writeFile("./grades.json", JSON.stringify(data));
      res.send("Grade excluida com sucesso!");
    }
  } catch (err) {
    console.log("Não foi possível excluir a grade - " + err);
  }
});

router.get("/busca/:id", async (req, res) => {
  try {
    const data = JSON.parse(await readFile("./grades.json"));
    const grade = data.grades.filter(
      (grade) => grade.id === parseInt(req.params.id)
    );

    if (grade.length === 0) {
      throw new Error("Registro não encontrado");
    } else {
      res.send(grade);
    }
  } catch (err) {
    console.log("Não foi possível encontrar a grade - " + err);
  }
});

//Consultar nota total de um aluno [student by subject]
router.get("/totalGrades", async (req, res) => {
  try {
    let research = req.body;

    const data = JSON.parse(await readFile("./grades.json"));

    if (!research.student || !research.subject) {
      res.send("Favor informar valores válidos!");
    }

    const gradesStudent = data.grades.filter((grade) => {
      return (
        grade.student === research.student && grade.subject === research.subject
      );
    });

    console.log(gradesStudent);

    if (gradesStudent.length === 0) {
      res.send("Favor informar valores válidos!");
    }

    const sum = gradesStudent.reduce((acc, curr) => {
      return acc + curr.value;
    }, 0);

    gradesStudent.push({
      total: sum,
    });

    res.send(gradesStudent);

    //
  } catch (err) {
    console.log("Não foi possível gerar o relatório - " + err);
  }
});

// Consultar média (Subject x type)
router.get("/average", async (req, res) => {
  try {
    let research = req.body;

    const data = JSON.parse(await readFile("./grades.json"));

    if (!research.subject || !research.type) {
      res.send("Favor informar valores válidos!");
    }

    const gradesSubject = data.grades.filter((grade) => {
      return grade.type === research.type && grade.subject === research.subject;
    });

    console.log(gradesSubject);

    if (gradesSubject.length === 0) {
      res.send("Favor informar valores válidos!");
    }

    const sum = gradesSubject.reduce((acc, curr) => {
      return acc + curr.value;
    }, 0);

    gradesSubject.push({
      average: sum / gradesSubject.length,
    });

    res.send(gradesSubject);
  } catch (err) {
    console.log("Não foi possível gerar o relatório - " + err);
  }
});

//Consultar as 3 melhores grades por (Subject x type)
router.get("/top3", async (req, res) => {
  try {
    let research = req.body;

    const data = JSON.parse(await readFile("./grades.json"));

    if (!research.subject || !research.type) {
      res.send("Favor informar valores válidos!");
    }

    let gradesSubject = data.grades.filter((grade) => {
      return grade.type === research.type && grade.subject === research.subject;
    });

    if (gradesSubject.length === 0) {
      res.send("Favor informar valores válidos!");
    }

    gradesSubject = gradesSubject.sort((a, b) => b.value - a.value);

    gradesSubject = gradesSubject.slice(0, 3);

    res.send(gradesSubject);
  } catch (err) {
    console.log("Não foi possível gerar o relatório - " + err);
  }
});
