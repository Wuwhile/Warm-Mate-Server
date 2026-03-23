const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * 保存预约申请
 * POST /alibaba-ai/v1/appointment/saveAppointment
 */
router.post('/appointment/saveAppointment', appointmentController.saveAppointment);

/**
 * 获取预约列表
 * GET /alibaba-ai/v1/appointment/list
 */
router.get('/appointment/list', appointmentController.getAppointmentList);

/**
 * 获取医生的预约列表
 * GET /alibaba-ai/v1/appointment/listByDoctorId/:doctorId
 */
router.get('/appointment/listByDoctorId/:doctorId', appointmentController.getAppointmentByDoctorId);

/**
 * 获取患者的预约列表
 * GET /alibaba-ai/v1/appointment/listByPatientPhone/:patientPhone
 */
router.get('/appointment/listByPatientPhone/:patientPhone', appointmentController.getAppointmentByPatientPhone);

/**
 * 获取预约详情
 * GET /alibaba-ai/v1/appointment/:id
 */
router.get('/appointment/:id', appointmentController.getAppointmentDetail);

/**
 * 更新预约申请
 * PUT /alibaba-ai/v1/appointment
 */
router.put('/appointment', appointmentController.updateAppointment);

/**
 * 删除预约申请
 * DELETE /alibaba-ai/v1/appointment/:id
 */
router.delete('/appointment/:id', appointmentController.deleteAppointment);

/**
 * 批量删除预约申请
 * DELETE /alibaba-ai/v1/appointment/batch
 */
router.delete('/appointment/batch', appointmentController.batchDeleteAppointment);

/**
 * 获取预约统计
 * GET /alibaba-ai/v1/appointment/count
 */
router.get('/appointment/count', appointmentController.getAppointmentCount);

module.exports = router;
