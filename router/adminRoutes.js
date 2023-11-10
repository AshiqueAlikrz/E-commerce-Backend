const express = require('express'); 
const adminRouter = express.Router();
const controller = require('../controllers/adminController');
const tryCatch=require('../middleware/tryCatchMiddleware')
const tokenVerify = require('../middleware/adminAuthMiddleware')
const upload =require('../middleware/multer')


adminRouter.use(express.json())

adminRouter.post('/login',tryCatch(controller.login));
adminRouter.get('/users',tryCatch(controller.getAllusers));
adminRouter.get('/users/:id',tokenVerify,tryCatch(controller.getById))
adminRouter.post('/products',tryCatch(controller.createProduct))
adminRouter.get('/products/category',tokenVerify,tryCatch(controller.getproductByCategory))
adminRouter.get('/products/:id',tokenVerify,tryCatch(controller.getproductById))
adminRouter.get('/products',tryCatch(controller.AllProducts))
adminRouter.put('/products',tryCatch(controller.UpdateProduct))
adminRouter.delete('/products/:id',tryCatch(controller.DeleteProduct))
adminRouter.get("/stats",tryCatch(controller.stats))
adminRouter.get("/orders",tryCatch(controller.AdminShowOrders))


module.exports = adminRouter;




