const express = require('express');
const User = require('../models').User;
const Class = require('../models').Class;
const Source = require('../models').Source;
const utils = require('../models/utils')(require('../models'));
const router = express.Router();

/**
 * Set current class.
 * @name POST/api/classes/current
 * @param id: id of class
 */
router.post('/current', (req, res) => {
  req.session.classId = req.body.id;
  res.status(200).json(req.body.id);
});

/**
 * Get current class.
 * @name GET/api/classes/current
 */
router.get('/current', (req, res) => {
  if(!req.session.classId){
    res.status(200).json(null);
  }
  else{
    Class.findByPk(req.session.classId).then(nb_class => {
      res.status(200).json(nb_class);
    });
  }

});

/**
 * Create a new class.
 * @name POST/api/classes/create
 * @param name: name of class
 */
router.post('/create', (req, res) => {
  const name = req.body.name;
  if (!name){
    res.status(400).json({msg: "bad name"});
  }
  utils.createClass(name, req.session.userId)
  .then((nb_class) =>{
    res.status(200).json(nb_class);
  });
});

/**
 * Edit class.
 * @name POST/api/classes/edit
 * @param id: id of class
 */
router.post('/edit', (req, res) => {
  const id = req.body.course ? req.body.course.id : undefined;
  if (!id){
    res.status(400).json({msg: "bad id"});
    return;
  }
  utils.editClass(id, req.body.course).then(() => {
    res.status(200).json({})
  });
});

/**
 * Get all classes for which current user is an instructor.
 * @name GET/api/classes/create
 */
router.get('/instructor',(req,res) =>{
  User.findByPk(req.session.userId).then((user) =>
    user.getInstructorClasses()
  ).then((classes) => {
    res.status(200).json(classes);
  });
});

/**
 * Get all classes for which current user is a student.
 * @name GET/api/classes/student
 */
router.get('/student', (req,res) =>{
  User.findByPk(req.session.userId).then((user) =>
    user.getMemberSections({raw: true})
  ).then((sections) => {
    return Promise.all(sections.map((section) => Class.findByPk(section.class_id)));
  }
  ).then(classes => {
    const classesIDs = classes.map(classObj => classObj["id"])
    res.status(200).json(classes.filter((value, index) => {
        return classesIDs.indexOf(value["id"]) === index
    }));
  });
});

/**
 * Get all instructors for a given class
 * @name GET/api/classes/studentList/:id
 * @param id: id of the class
 */
router.get('/instructorList/:id', (req,res) =>{
  Class.findByPk(req.params.id,
    {include:[{association: 'Instructors', attributes:['id','username','first_name','last_name','email']}]})
    .then((nb_class) =>{
      if(nb_class.Instructors.filter(instructor => instructor.id == req.session.userId).length < 1){
        res.status(401).json(null);
      }
      else{
        res.status(200).json(nb_class.Instructors);
      }
    });
});

/**
 * Get all students for a given class
 * @name GET/api/classes/studentList/:id
 * @param id: id of the class
 */
router.get('/studentList/:id', (req,res) =>{
  Class.findByPk(req.params.id, {include:[
    {association: 'GlobalSection',
    include: [{association:'MemberStudents', 
      attributes:['id','username','first_name','last_name','email']}
    ]},
    {association: 'Instructors',
    required: true,
    where:{id: req.session.userId}}
  ]})
    .then((nb_class) =>{
      if(nb_class){
        res.status(200).json(nb_class.GlobalSection.MemberStudents);
      }
      else{
        res.status(401).json(null);
      }
    });
});

/**
 * Add an instructor to a given class
 * @name POST/api/classes/instructor/:id
 * @param id: id of the class
 */
router.post('/instructor/:id', (req, res) => {
  Class.findByPk(req.params.id, {include:[
    {association: 'Instructors', required:true, where:{id: req.session.userId}}]})
  .then(nb_class => {
    if (!nb_class){
      res.status(401).json(null);
    }
    else{
      User.findByPk(req.body.id).then(user =>
        nb_class.addInstructor(user)
      ).then(() => res.status(200).json(null));
    }
  });
});

/**
 * Add a student to a given class
 * @name DELETE/api/classes/instructor/:courseid/:userid
 * @param courseid: id of the class
 * @param userid: id of the user to remove
 */
router.delete('/instructor/:courseid/:userid', (req, res) => {
  Class.findByPk(req.params.courseid, {include:[
    {association: 'Instructors', required:true, where:{id: req.session.userId}}]})
  .then(nb_class => {
    if (!nb_class){
      res.status(401).json(null);
    }
    else{
      User.findByPk(req.params.userid).then(user =>
        nb_class.removeInstructor(user)
      ).then(() => res.status(200).json(null));
    }
  });
});

/**
 * Add a student to a given class
 * @name POST/api/classes/student/:id
 * @param id: id of the class
 */
router.post('/student/:id', (req, res) => {
  Class.findByPk(req.params.id, {include:[
    {association: 'Instructors', required:true, where:{id: req.session.userId}}]})
  .then(nb_class => {
    if (!nb_class){
      res.status(401).json(null);
    }
    else{
      utils.addStudent(req.params.id, req.body.id)
      .then(() => res.status(200).json(null));
    }
  });
});

/**
 * Add a student to a given class
 * @name DELETE/api/classes/student/:courseid/:userid
 * @param courseid: id of the class
 * @param userid: id of the user to remove 
 * */
router.delete('/student/:courseid/:userid', (req, res) => {
  Class.findByPk(req.params.courseid, {include:[
    {association: 'Instructors', required:true, where:{id: req.session.userId}}]})
  .then(nb_class => {
    if (!nb_class){
      res.status(401).json(null);
    }
    else{
      utils.removeStudent(req.params.courseid, req.params.userid)
      .then(() => res.status(200).json(null));
    }
  });
});

/**
 * Get all sources for current class
 * @name GET/api/classes/sourceList
 */
router.get('/sourceList', (req, res) => {
  Source.findAll({where:{class_id: req.session.classId}})
    .then(sources => res.status(200).json(sources));
});

module.exports = router;
