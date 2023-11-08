

const trycatchmiddleware = (trycatchhandler) => {
  return async (req, res, next) => {
    try {
      await trycatchhandler(req, res, next);
    } catch (error) {
      console.log(error)
      res.status(500).json({
        status:"failure",
        
        message:"error",
        error_message:error.message
      })
      next();
      
    }
  };
};
module.exports = trycatchmiddleware;
