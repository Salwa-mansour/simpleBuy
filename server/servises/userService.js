import User from '../models/User.js';

/**
 * Updates a specific saved address in a user's addresses array.
 */
export const updateUserAddressService = async ( userId, newAddressData ) => {
  const user = await User.findById(userId);
  console.log(userId)
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Update address fields dynamically and return the updated document
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { address: { ...user.address, ...newAddressData } } },
    { new: true, runValidators: true }
  );

  return updatedUser?.address;
};
// export const updateAddressService = async ({ userId, addressId, updatedAddressData }) => {
//   const user = await User.findById(userId);

//   if (!user) {
//     const error = new Error('User not found.');
//     error.statusCode = 404;
//     throw error;
//   }

//   // Find the address subdocument inside the array
//   const addressDoc = user.addresses.id(addressId);

//   if (!addressDoc) {
//     const error = new Error('Address not found in user profile.');
//     error.statusCode = 404;
//     throw error;
//   }

//   // Update fields if provided
//   const { fullName, address, city, postalCode, country, isDefault } = updatedAddressData;

//   if (fullName !== undefined) addressDoc.fullName = fullName;
//   if (address !== undefined) addressDoc.address = address;
//   if (city !== undefined) addressDoc.city = city;
//   if (postalCode !== undefined) addressDoc.postalCode = postalCode;
//   if (country !== undefined) addressDoc.country = country;

//   // Handle default address setting if requested
//   if (isDefault === true) {
//     user.addresses.forEach((addr) => {
//       addr.isDefault = addr._id.toString() === addressId;
//     });
//   }

//   await user.save();

//   return user.addresses;
// };
export const getUserAddressesService = async (userId) => {
  const user = await User.findById(userId).select('address');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user.addresses || {};
};