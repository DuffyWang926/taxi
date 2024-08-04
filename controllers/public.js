const model = require('../model');
const computePoints = async (id) => {
    let userModel = model.user
    
    let users = await  userModel.findAll({
        where: {
            userId:id
        }
    })
    if(users && users.length > 0){
        let user = users[0]
        const { points } = user
        let nextPoint = +points + 10 + ''
        await userModel.update(
            {
                ...user,
                points:nextPoint
            },
            {
                where: { id:id },
            }
        );
    }
}
module.exports = {
    computePoints
};
