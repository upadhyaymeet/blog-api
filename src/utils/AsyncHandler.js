
const asynHandler = (requesHandler) => {
    return (req, res, next) => {
        Promise.resolve(requesHandler(req, res))
        .catch((err)=> next(err))
    }
}

export {asynHandler}