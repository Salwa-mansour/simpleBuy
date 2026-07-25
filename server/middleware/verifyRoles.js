import ROLES_LIST from '../config/rolesList.js';

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Get the user's roles from the JWT (passed by authMiddleware)
        // Expected format in JWT: roles: ["USER", "ADMIN"]
        const userRoles = req.user?.userRoles; 

        if (!userRoles) return res.sendStatus(401);

        // 2. Map the user's String Enums to your Numeric Codes
        const userRoleCodes = userRoles.map(role => ROLES_LIST[role]);

        // 3. Check if at least one user code is in the allowedRoles list
        const hasPermission = userRoleCodes.some(code => allowedRoles.includes(code));

        if (!hasPermission) {
            return res.status(403).json({ message: "Access Denied: You do not have the required role." });
        }

        next();
    };
};

export default verifyRoles;