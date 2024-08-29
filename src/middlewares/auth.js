const User = require('../models/user'); 
const { verifyToken } = require('../utils/token');


async function authorize(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    

    if (!token) {
        return res.status(403).send({ error: 'Unauthorized User' });
    }

    if (typeof token !== 'string') {
        return res.status(403).send({ error: { message: 'Authorization token must be a string' } });
    }

    try {
        const decodedToken = await verifyToken(token); 
        if (!decodedToken) {
            return res.status(403).json({ error: { message: 'Invalid Auth Token' } });
        }
        const userId = decodedToken.userId; 
        const user = await User.query().findById(userId); 
        

        if (!user) {
            return res.status(403).send({ error: { message: 'User not authorized' } });
        }

        req.user = user; 
        next();

    } catch (e) {
        const errors = ['TokenExpiredError', 'NotBeforeError', 'JsonWebTokenError'];
        if (errors.includes(e?.name)) {
            return res.status(403).send({ error: e.message });
        }
        console.log({error: e })
        return res.status(403).json({ error: 'User unauthorized!!!' });
    }
}

module.exports = {
    authorize
};
