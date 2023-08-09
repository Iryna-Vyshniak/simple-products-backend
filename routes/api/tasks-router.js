const { Router } = require('express');
const ctrl = require('../../controllers/task-controller');
const validateBody = require('../../decorators/validateBody');
const validTask = require('../../schema/task');
const { checkAuth } = require('../../middlewares');

const router = Router();

// returns all tasks per month: GET http://localhost:5000/api/tasks?year=2023&month=8
// returns all tasks per month: GET http://localhost:5000/api/tasks?year=2023&month=8&day=1
router.get('/', checkAuth, ctrl.getAllTasks);

// add task by user: POST http://localhost:5000/api/tasks
// body raw { "rating": 4, "comment": "The current todo application ...."}
router.post('/', checkAuth, validateBody(validTask), ctrl.addTask);

// edit task by user: PATCH http://localhost:5000/api/tasks/:id
// body raw {
//   "title": "Meeting with Client",
//   "start": "14:00",
//   "end": "15:30",
//   "priority": "medium",
//   "date": "2023-08-10",
//   "category": "in-progress"
// }
router.patch('/:id', checkAuth, validateBody(validTask), ctrl.updateTask);
// body raw {
//   "title": "Meeting with Client",
//   "start": "16:00",
//   "end": "17:30",
//   "priority": "medium",
//   "date": "2023-08-11",
//   "category": "in-progress"
// }

// delete task by user: DELETE http://localhost:5000/api/tasks/:id
router.delete('/:id', checkAuth, ctrl.deleteTask);

module.exports = router;
