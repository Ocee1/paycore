
const createBulkAirtime = async (req, res) => {
    const payload = req.body;

    try {
        // get bill array fro request body

        // destructure each array object

        res.send('Be Motivated!', payload)
        // fetch 
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    createBulkAirtime
};