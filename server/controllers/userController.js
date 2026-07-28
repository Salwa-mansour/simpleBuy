import { updateAddressService,getUserAddressesService } from '../servises/userService.js';

/**
 * @desc   Update a specific saved address
 * @route  PUT /api/users/addresses/:addressId
 * @access Private
 */
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // Extracted from verifyJWT middleware

    const addresses = await getUserAddressesService(userId);

    return res.status(200).json({
      addresses,
    });
  } catch (error) {
    console.error('Error fetching user addresses:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error fetching addresses.',
    });
  }
};
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user; // Injected by verifyJWT middleware
    const { addressId } = req.params;
    const { fullName, address, city, postalCode, country, isDefault } = req.body;

    // Call service layer
    const updatedAddresses = await updateAddressService({
      userId,
      addressId,
      updatedAddressData: {
        fullName,
        address,
        city,
        postalCode,
        country,
        isDefault,
      },
    });

    return res.status(200).json({
      message: 'Address updated successfully.',
      addresses: updatedAddresses,
    });
  } catch (error) {
    console.error('Error updating address:', error);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || 'Server error updating address.',
    });
  }
};