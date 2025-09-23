const express = require('express');
const router = express.Router();

const contestController = require('../controllers/contestController');
const { authenticate, requireTeacher, optionalAuth } = require('../middleware/auth');
const { validate, contestSchemas, querySchemas } = require('../middleware/validation');
const { loggers } = require('../middleware/activityLogger');

// Public/Optional auth routes
router.get('/', optionalAuth, validate(querySchemas.contestFilter, 'query'), contestController.getContests);
router.get('/:id', optionalAuth, contestController.getContest);

// Student routes (authenticated with activity logging)
router.post('/:id/join',
    authenticate,
    loggers.joinContest,
    contestController.joinContest
);

router.delete('/:id/leave',
    authenticate,
    loggers.leaveContest,
    contestController.leaveContest
);

// Teacher/Admin routes (with activity logging)
router.post('/',
    authenticate,
    requireTeacher,
    loggers.createContest,
    validate(contestSchemas.create),
    contestController.createContest
);

router.put('/:id',
    authenticate,
    requireTeacher,
    loggers.custom('contest_updated'),
    validate(contestSchemas.update),
    contestController.updateContest
);

router.delete('/:id',
    authenticate,
    requireTeacher,
    loggers.custom('contest_deleted'),
    contestController.deleteContest
);

module.exports = router;