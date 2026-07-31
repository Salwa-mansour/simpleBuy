import { getUserAddressService } from '../servises/userService.js';

/**
 * @desc   Update a specific saved address
 * @route  PUT /api/users/address/:addressId
 * @access Private
 */
export const getUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // Extracted from verifyJWT middleware

    const address = await getUserAddressService(userId);

    return res.status(200).json(
      address
    );
  } catch (error) {
    console.error('Error fetching user address:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error fetching address.',
    });
  }
};


