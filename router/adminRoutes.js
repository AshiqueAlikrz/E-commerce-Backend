const express = require('express'); 
const adminRouter = express.Router();
const controller = require('../controllers/adminController');
const tryCatch=require('../middleware/tryCatchMiddleware')
const tokenVerify = require('../middleware/adminAuthMiddleware')

adminRouter.use(express.json())

adminRouter.post('/login',tryCatch(controller.login));
adminRouter.get('/users',tokenVerify,tryCatch(controller.getAllusers))
adminRouter.get('/users/:id',tokenVerify,tryCatch(controller.getById))
adminRouter.post('/products',tokenVerify,tryCatch(controller.createProduct))
adminRouter.get('/products/category',tokenVerify,tryCatch(controller.getproductByCategory))
adminRouter.get('/products/:id',tokenVerify,tryCatch(controller.getproductById))
adminRouter.get('/products',tokenVerify,tryCatch(controller.AllProducts))
adminRouter.put('/products/:id',tokenVerify,tryCatch(controller.UpdateProduct))
adminRouter.delete('/products',tokenVerify,tryCatch(controller.DeleteProduct))
adminRouter.get("/stats",tokenVerify,tryCatch(controller.stats))


module.exports = adminRouter;




