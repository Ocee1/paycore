const User = require('../models/user'); 
const { verifyToken } = require('../utils/token');


async function authorize(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    

    if (!token) {
        return res.status(403).send({ error: 'Unauthorized User' });
    }

    if (typeof token !== 'string') {
        return res.status(403).send({ error: { message: 'Invalid Authorization token' } });
    }

    try {
        const decodedToken = await verifyToken(token); 
        
        const userId = decodedToken.userId; 
        const user = await User.query().findById(userId); 
        
        if (!user) {
            return res.status(403).send({ error: { message: 'User not authorized' } });
        }

        req.user = user; 
        console.log('-------', req.user.id)
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
