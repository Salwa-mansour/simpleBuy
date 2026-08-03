import User from '../models/User.js';

/**
 * Updates a specific saved address in a user's addresses array.
 */
export const getEmailByUserId = async (userId) => {
  const user = await User.findById(userId).select('email');

  if (!user) {  
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user.email;
}
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
  console.log(updatedUser?.address)
  return updatedUser?.address;
};

export const getUserAddressService = async (userId) => {
  const user = await User.findById(userId).select('address');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user.address || {};
};
export const updateProfile = async(userId,updateData)=>{
 return   prisma.user.update({
      where: { 
        id: userId 
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
      }
    });
}