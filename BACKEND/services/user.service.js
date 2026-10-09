// Business logic layer — sits between controllers and models.
// Replace the stubs with real DB calls once your model is set up.

export const getAllUsers = async () => {
  // TODO: return User.find();
  return [];
};

export const getUserById = async (id) => {
  // TODO: return User.findById(id);
  return null;
};

export const createUser = async (data) => {
  // TODO: return User.create(data);
  return data;
};

export const updateUser = async (id, data) => {
  // TODO: return User.findByIdAndUpdate(id, data, { new: true });
  return null;
};

export const deleteUser = async (id) => {
  // TODO: return User.findByIdAndDelete(id);
  return null;
};
